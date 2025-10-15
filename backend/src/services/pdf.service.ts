import { PDFDocument, rgb, PageSizes } from 'pdf-lib';

interface ProcessResult {
  processedPdf: Uint8Array;
  originalPages: number;
  finalPages: number;
}

// Cache for the loaded cover document to avoid reloading for each PDF
let cachedCoverDoc: PDFDocument | null = null;
let cachedCoverBytes: Uint8Array | null = null;

export async function processPDF(
  pdfBytes: Buffer,
  coverPdfBytes: Uint8Array,
  footerHeightPx: number,
  headerHeightPx: number = 0
): Promise<ProcessResult> {
  // Load the original PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const originalPages = pdfDoc.getPageCount();

  // Load cover document once and cache it
  if (!cachedCoverDoc || cachedCoverBytes !== coverPdfBytes) {
    cachedCoverDoc = await PDFDocument.load(coverPdfBytes);
    cachedCoverBytes = coverPdfBytes;
  }

  // Handle edge case: PDF with only 1 page
  if (originalPages === 1) {
    const newDoc = await PDFDocument.create();
    const [coverPage] = await newDoc.copyPages(cachedCoverDoc, [0]);

    // Get original page dimensions
    const originalPage = pdfDoc.getPage(0);
    const { width, height } = originalPage.getSize();

    // Scale cover to match original dimensions
    coverPage.setSize(width, height);
    newDoc.addPage(coverPage);

    const processedBytes = await newDoc.save({ useObjectStreams: false });
    return {
      processedPdf: processedBytes,
      originalPages: 1,
      finalPages: 1,
    };
  }

  // Create new PDF document
  const newDoc = await PDFDocument.create();

  // 1. Add cover as first page
  const [coverPage] = await newDoc.copyPages(cachedCoverDoc, [0]);

  // Get first page dimensions from original
  const firstPage = pdfDoc.getPage(0);
  const { width: targetWidth, height: targetHeight } = firstPage.getSize();

  // Scale cover to match original first page dimensions
  coverPage.setSize(targetWidth, targetHeight);
  newDoc.addPage(coverPage);

  // 2. Process middle pages (page 2 to second-to-last) - remove footer
  const middlePageCount = originalPages - 2;

  if (middlePageCount > 0) {
    // Copy all middle pages at once for better performance
    const middlePageIndices = Array.from({ length: middlePageCount }, (_, i) => i + 1);
    const copiedPages = await newDoc.copyPages(pdfDoc, middlePageIndices);

    // Process each copied page
    for (const copiedPage of copiedPages) {
      const { width, height } = copiedPage.getSize();

      // Draw white rectangle at bottom to cover footer
      if (footerHeightPx > 0) {
        copiedPage.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: footerHeightPx,
          color: rgb(1, 1, 1), // White
        });
      }

      // Draw white rectangle at top to cover header
      if (headerHeightPx > 0) {
        copiedPage.drawRectangle({
          x: 0,
          y: height - headerHeightPx,
          width: width,
          height: headerHeightPx,
          color: rgb(1, 1, 1), // White
        });
      }

      newDoc.addPage(copiedPage);
    }
  }

  // 3. Skip the last page (effectively removing it)
  // If original has 2 pages, we only have cover + no middle pages + skip last = 1 final page

  // Save with optimizations: disable object streams for faster generation
  const processedBytes = await newDoc.save({ useObjectStreams: false });
  const finalPages = newDoc.getPageCount();

  return {
    processedPdf: processedBytes,
    originalPages,
    finalPages,
  };
}

// Clear cache function (optional, can be called between batches)
export function clearCoverCache(): void {
  cachedCoverDoc = null;
  cachedCoverBytes = null;
}
