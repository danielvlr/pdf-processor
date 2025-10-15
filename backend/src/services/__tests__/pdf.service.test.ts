import { PDFDocument, rgb } from 'pdf-lib';
import { processPDF } from '../pdf.service';

describe('PDF Service', () => {
  let samplePdfBytes: Uint8Array;
  let coverPdfBytes: Uint8Array;

  beforeAll(async () => {
    // Create a sample PDF with 5 pages
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      const page = pdfDoc.addPage([595, 842]); // A4 size
      page.drawText(`Page ${i + 1}`, { x: 50, y: 800 });
    }
    samplePdfBytes = await pdfDoc.save();

    // Create a cover PDF
    const coverDoc = await PDFDocument.create();
    const coverPage = coverDoc.addPage([595, 842]);
    coverPage.drawText('Cover Page', { x: 50, y: 800 });
    coverPdfBytes = await coverDoc.save();
  });

  describe('processPDF', () => {
    it('should replace first page and remove last page from multi-page PDF', async () => {
      const result = await processPDF(
        Buffer.from(samplePdfBytes),
        coverPdfBytes,
        10
      );

      expect(result.originalPages).toBe(5);
      expect(result.finalPages).toBe(4); // cover + 3 middle pages (removed last)
      expect(result.processedPdf).toBeInstanceOf(Uint8Array);

      // Verify the PDF is valid
      const processedDoc = await PDFDocument.load(result.processedPdf);
      expect(processedDoc.getPageCount()).toBe(4);
    });

    it('should handle single-page PDF correctly', async () => {
      // Create a 1-page PDF
      const singlePageDoc = await PDFDocument.create();
      singlePageDoc.addPage([595, 842]);
      const singlePageBytes = await singlePageDoc.save();

      const result = await processPDF(
        Buffer.from(singlePageBytes),
        coverPdfBytes,
        10
      );

      expect(result.originalPages).toBe(1);
      expect(result.finalPages).toBe(1); // Only cover
      expect(result.processedPdf).toBeInstanceOf(Uint8Array);

      const processedDoc = await PDFDocument.load(result.processedPdf);
      expect(processedDoc.getPageCount()).toBe(1);
    });

    it('should handle two-page PDF correctly', async () => {
      // Create a 2-page PDF
      const twoPageDoc = await PDFDocument.create();
      twoPageDoc.addPage([595, 842]);
      twoPageDoc.addPage([595, 842]);
      const twoPageBytes = await twoPageDoc.save();

      const result = await processPDF(
        Buffer.from(twoPageBytes),
        coverPdfBytes,
        10
      );

      expect(result.originalPages).toBe(2);
      expect(result.finalPages).toBe(1); // Only cover (removed last page)

      const processedDoc = await PDFDocument.load(result.processedPdf);
      expect(processedDoc.getPageCount()).toBe(1);
    });

    it('should apply footer removal with custom height', async () => {
      const footerHeight = 20;
      const result = await processPDF(
        Buffer.from(samplePdfBytes),
        coverPdfBytes,
        footerHeight
      );

      expect(result.processedPdf).toBeInstanceOf(Uint8Array);
      expect(result.finalPages).toBeGreaterThan(0);
    });

    it('should apply header removal with custom height', async () => {
      const footerHeight = 10;
      const headerHeight = 25;
      const result = await processPDF(
        Buffer.from(samplePdfBytes),
        coverPdfBytes,
        footerHeight,
        headerHeight
      );

      expect(result.processedPdf).toBeInstanceOf(Uint8Array);
      expect(result.finalPages).toBeGreaterThan(0);
      expect(result.originalPages).toBe(5);
      expect(result.finalPages).toBe(4);
    });

    it('should handle header removal without footer removal', async () => {
      const footerHeight = 0; // No footer removal
      const headerHeight = 30;
      const result = await processPDF(
        Buffer.from(samplePdfBytes),
        coverPdfBytes,
        footerHeight,
        headerHeight
      );

      expect(result.processedPdf).toBeInstanceOf(Uint8Array);
      expect(result.finalPages).toBe(4);
    });

    it('should handle both header and footer removal', async () => {
      const footerHeight = 15;
      const headerHeight = 20;
      const result = await processPDF(
        Buffer.from(samplePdfBytes),
        coverPdfBytes,
        footerHeight,
        headerHeight
      );

      expect(result.processedPdf).toBeInstanceOf(Uint8Array);
      expect(result.originalPages).toBe(5);
      expect(result.finalPages).toBe(4);
    });

    it('should preserve page dimensions', async () => {
      // Create a PDF with custom page size
      const customPdf = await PDFDocument.create();
      const customWidth = 500;
      const customHeight = 700;
      customPdf.addPage([customWidth, customHeight]);
      customPdf.addPage([customWidth, customHeight]);
      customPdf.addPage([customWidth, customHeight]);
      const customBytes = await customPdf.save();

      const result = await processPDF(
        Buffer.from(customBytes),
        coverPdfBytes,
        10
      );

      const processedDoc = await PDFDocument.load(result.processedPdf);
      const firstPage = processedDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      // First page should match original dimensions
      expect(width).toBe(customWidth);
      expect(height).toBe(customHeight);
    });

    it('should throw error for invalid PDF', async () => {
      const invalidPdf = Buffer.from('not a pdf');

      await expect(
        processPDF(invalidPdf, coverPdfBytes, 10)
      ).rejects.toThrow();
    });
  });
});
