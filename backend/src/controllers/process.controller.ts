import { Request, Response, NextFunction } from 'express';
import JSZip from 'jszip';
import { processPDF, clearCoverCache } from '../services/pdf.service';
import { convertImageToPDF } from '../services/image.service';

interface ProcessedFile {
  name: string;
  originalPages: number;
  finalPages: number;
  success: boolean;
  error?: string;
}

export async function processFiles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.filesZip || !files?.cover) {
      res.status(400).json({ error: 'Missing required files: filesZip and cover' });
      return;
    }

    const zipFile = files.filesZip[0];
    const coverFile = files.cover[0];
    const footerHeightPx = parseInt(req.body.footerHeightPx || '10', 10);
    const headerHeightPx = parseInt(req.body.headerHeightPx || '0', 10);

    // Extract PDFs from ZIP in parallel for better performance
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile.buffer);

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

    // Process cover file
    let coverPdfBytes: Uint8Array;

    if (coverFile.mimetype === 'application/pdf') {
      coverPdfBytes = new Uint8Array(coverFile.buffer);
    } else if (['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(coverFile.mimetype)) {
      coverPdfBytes = await convertImageToPDF(coverFile.buffer, coverFile.mimetype);
    } else {
      res.status(400).json({ error: 'Cover file must be PDF or image (PNG/JPG/SVG)' });
      return;
    }

    // Process each PDF in parallel for better performance
    const results: ProcessedFile[] = [];
    const outputZip = new JSZip();

    const processingPromises = pdfFiles.map(async (pdfFile) => {
      try {
        const { processedPdf, originalPages, finalPages } = await processPDF(
          pdfFile.data,
          coverPdfBytes,
          footerHeightPx,
          headerHeightPx
        );

        return {
          name: pdfFile.name,
          processedPdf,
          originalPages,
          finalPages,
          success: true as const,
        };
      } catch (error) {
        return {
          name: pdfFile.name,
          processedPdf: null,
          originalPages: 0,
          finalPages: 0,
          success: false as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const processedResults = await Promise.all(processingPromises);

    // Add all processed files to output ZIP and build results
    for (const result of processedResults) {
      if (result.success && result.processedPdf) {
        outputZip.file(result.name, result.processedPdf);
        results.push({
          name: result.name,
          originalPages: result.originalPages,
          finalPages: result.finalPages,
          success: true,
        });
      } else {
        results.push({
          name: result.name,
          originalPages: result.originalPages,
          finalPages: result.finalPages,
          success: false,
          error: result.error,
        });
      }
    }

    // Generate output ZIP with fast compression for better performance
    const outputZipBuffer = await outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 1 }, // Level 1 = fastest compression
    });

    // Send response with ZIP and report
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="processed-pdfs.zip"');
    res.setHeader('X-Process-Report', JSON.stringify(results));
    res.send(outputZipBuffer);

    // Clear cache after processing to free memory
    clearCoverCache();

  } catch (error) {
    // Clear cache on error as well
    clearCoverCache();
    next(error);
  }
}
