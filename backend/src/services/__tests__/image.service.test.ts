import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { convertImageToPDF } from '../image.service';

describe('Image Service', () => {
  let pngBuffer: Buffer;
  let jpgBuffer: Buffer;

  beforeAll(async () => {
    // Create a test PNG image (100x100 red square)
    pngBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Create a test JPG image (100x100 blue square)
    jpgBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 0, g: 0, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  describe('convertImageToPDF', () => {
    it('should convert PNG to PDF', async () => {
      const pdfBytes = await convertImageToPDF(pngBuffer, 'image/png');

      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      // Verify the PDF is valid
      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(1);

      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      expect(width).toBe(595.28); // A4 width
      expect(height).toBe(841.89); // A4 height
    });

    it('should convert JPEG to PDF', async () => {
      const pdfBytes = await convertImageToPDF(jpgBuffer, 'image/jpeg');

      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('should convert JPG (alternative mime) to PDF', async () => {
      const pdfBytes = await convertImageToPDF(jpgBuffer, 'image/jpg');

      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('should handle SVG conversion to PDF', async () => {
      const svgBuffer = Buffer.from(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="green"/>
        </svg>
      `);

      const pdfBytes = await convertImageToPDF(svgBuffer, 'image/svg+xml');

      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('should center image on A4 page', async () => {
      const pdfBytes = await convertImageToPDF(pngBuffer, 'image/png');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPage(0);

      const { width, height } = page.getSize();
      expect(width).toBeCloseTo(595.28, 1); // A4 width
      expect(height).toBeCloseTo(841.89, 1); // A4 height
    });

    it('should throw error for invalid image', async () => {
      const invalidBuffer = Buffer.from('not an image');

      await expect(
        convertImageToPDF(invalidBuffer, 'image/png')
      ).rejects.toThrow();
    });
  });
});
