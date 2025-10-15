import { Request, Response, NextFunction } from 'express';
import JSZip from 'jszip';
import { processPDF, clearCoverCache } from '../services/pdf.service';
import { convertImageToPDF } from '../services/image.service';
import { getUploadedFile, cleanupUploadedFile } from './upload.controller';

interface ProcessedFile {
  name: string;
  originalPages: number;
  finalPages: number;
  success: boolean;
  error?: string;
}

export async function processUploadedFiles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let zipFileId: string | undefined;
  let coverFileId: string | undefined;

  try {
    const { zipFileId: zId, coverFileId: cId, footerHeightPx, headerHeightPx } = req.body;

    zipFileId = zId;
    coverFileId = cId;

    if (!zipFileId || !coverFileId) {
      res.status(400).json({ error: 'Missing file IDs' });
      return;
    }

    const footerHeight = parseInt(footerHeightPx || '10', 10);
    const headerHeight = parseInt(headerHeightPx || '0', 10);

    console.log(`Processing uploaded files: ZIP=${zipFileId}, Cover=${coverFileId}`);

    // Get uploaded files
    const zipBuffer = await getUploadedFile(zipFileId, 'filesZip');
    const coverBuffer = await getUploadedFile(coverFileId, 'cover');

    // Extract PDFs from ZIP
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);

    const pdfFilePromises = Object.entries(zipContent.files)
      .filter(([filename, file]) => !file.dir && filename.toLowerCase().endsWith('.pdf'))
      .map(async ([filename, file]) => ({
        name: filename,
        data: await file.async('nodebuffer'),
      }));

    const pdfFiles = await Promise.all(pdfFilePromises);

    if (pdfFiles.length === 0) {
      res.status(400).json({ error: 'No PDF files found in ZIP' });
      return;
    }

    // Process cover file (assume it's a PDF for now, can add image support later)
    const coverPdfBytes = new Uint8Array(coverBuffer);

    // Process each PDF SEQUENTIALLY
    const results: ProcessedFile[] = [];
    const outputZip = new JSZip();

    console.log(`Starting sequential processing of ${pdfFiles.length} PDFs...`);
    const startTime = Date.now();

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      const fileStartTime = Date.now();

      console.log(`[${i + 1}/${pdfFiles.length}] Processing: ${pdfFile.name}`);

      try {
        const { processedPdf, originalPages, finalPages } = await processPDF(
          pdfFile.data,
          coverPdfBytes,
          footerHeight,
          headerHeight
        );

        const elapsed = Date.now() - fileStartTime;
        console.log(`  ✓ ${pdfFile.name} (${originalPages}→${finalPages} pages, ${elapsed}ms)`);

        outputZip.file(pdfFile.name, processedPdf);

        results.push({
          name: pdfFile.name,
          originalPages,
          finalPages,
          success: true,
        });

      } catch (error) {
        const elapsed = Date.now() - fileStartTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ✗ ${pdfFile.name} - Error: ${errorMsg} (${elapsed}ms)`);

        results.push({
          name: pdfFile.name,
          originalPages: 0,
          finalPages: 0,
          success: false,
          error: errorMsg,
        });
      }

      // Force garbage collection after each PDF (if available)
      if (global.gc) {
        global.gc();
      }
    }

    const totalElapsed = Date.now() - startTime;
    console.log(`Completed processing ${pdfFiles.length} PDFs in ${totalElapsed}ms (avg: ${Math.round(totalElapsed / pdfFiles.length)}ms per file)`);
    console.log(`Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);

    // Generate output ZIP
    const outputZipBuffer = await outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 1 },
    });

    // Send response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="processed-pdfs.zip"');
    res.setHeader('X-Process-Report', JSON.stringify(results));
    res.send(outputZipBuffer);

    // Cleanup uploaded files
    await cleanupUploadedFile(zipFileId);
    await cleanupUploadedFile(coverFileId);

    // Clear cache after processing
    clearCoverCache();

  } catch (error) {
    // Cleanup on error
    if (zipFileId) await cleanupUploadedFile(zipFileId).catch(() => {});
    if (coverFileId) await cleanupUploadedFile(coverFileId).catch(() => {});
    clearCoverCache();
    next(error);
  }
}
