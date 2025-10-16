import { Request, Response, NextFunction } from 'express';
import JSZip from 'jszip';
import { processPDF } from '../services/pdf.service';

interface ProcessedFileResult {
  name: string;
  data: string; // Base64 encoded PDF
  originalPages: number;
  finalPages: number;
  success: boolean;
  error?: string;
}

export async function processChunk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const zipChunk = files?.zipChunk?.[0];
    const cover = files?.cover?.[0];

    if (!zipChunk) {
      res.status(400).json({ error: 'Missing zipChunk file' });
      return;
    }

    const footerHeightPx = parseInt(req.body.footerHeightPx || '10', 10);
    const headerHeightPx = parseInt(req.body.headerHeightPx || '0', 10);
    const chunkIndex = parseInt(req.body.chunkIndex || '0', 10);

    console.log(`Processing chunk ${chunkIndex}, size: ${zipChunk.size} bytes, cover: ${cover ? 'yes' : 'no'}`);

    // Extract PDFs from this chunk
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipChunk.buffer);

    const pdfFilePromises = Object.entries(zipContent.files)
      .filter(([filename, file]) => !file.dir && filename.toLowerCase().endsWith('.pdf'))
      .map(async ([filename, file]) => ({
        name: filename,
        data: await file.async('nodebuffer'),
      }));

    const pdfFiles = await Promise.all(pdfFilePromises);

    if (pdfFiles.length === 0) {
      res.status(400).json({ error: 'No PDF files found in this chunk' });
      return;
    }

    // Process cover file if provided (assume PDF for now)
    const coverPdfBytes = cover ? new Uint8Array(cover.buffer) : undefined;

    // Process each PDF in this chunk sequentially
    const results: ProcessedFileResult[] = [];

    console.log(`Processing ${pdfFiles.length} PDFs in chunk ${chunkIndex}...`);
    const startTime = Date.now();

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      const fileStartTime = Date.now();

      console.log(`  [${i + 1}/${pdfFiles.length}] Processing: ${pdfFile.name}`);

      try {
        const { processedPdf, originalPages, finalPages } = await processPDF(
          pdfFile.data,
          coverPdfBytes,
          footerHeightPx,
          headerHeightPx
        );

        const elapsed = Date.now() - fileStartTime;
        console.log(`    ✓ ${pdfFile.name} (${originalPages}→${finalPages} pages, ${elapsed}ms)`);

        // Convert to base64 for JSON response
        const base64Pdf = Buffer.from(processedPdf).toString('base64');

        results.push({
          name: pdfFile.name,
          data: base64Pdf,
          originalPages,
          finalPages,
          success: true,
        });

      } catch (error) {
        const elapsed = Date.now() - fileStartTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.log(`    ✗ ${pdfFile.name} - Error: ${errorMsg} (${elapsed}ms)`);

        results.push({
          name: pdfFile.name,
          data: '',
          originalPages: 0,
          finalPages: 0,
          success: false,
          error: errorMsg,
        });
      }

      // Force garbage collection after each PDF
      if (global.gc) {
        global.gc();
      }
    }

    const totalElapsed = Date.now() - startTime;
    console.log(`Chunk ${chunkIndex} completed: ${pdfFiles.length} PDFs in ${totalElapsed}ms`);
    console.log(`  Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);

    // Create output ZIP with processed PDFs
    const outputZip = new JSZip();

    for (const result of results) {
      if (result.success && result.data) {
        // Convert base64 back to buffer
        const pdfBuffer = Buffer.from(result.data, 'base64');
        outputZip.file(result.name, pdfBuffer);
      }
    }

    // Generate ZIP buffer
    const outputZipBuffer = await outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 1 },
    });

    // Create summary for header
    const summary = results.map(r => ({
      name: r.name,
      originalPages: r.originalPages,
      finalPages: r.finalPages,
      success: r.success,
      error: r.error,
    }));

    // Return ZIP with metadata in header
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="batch-${chunkIndex}.zip"`);
    res.setHeader('X-Process-Report', JSON.stringify(summary));
    res.send(outputZipBuffer);

  } catch (error) {
    console.error('Error in processChunk:', error);
    next(error);
  }
}
