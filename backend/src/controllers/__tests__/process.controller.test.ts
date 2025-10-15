import request from 'supertest';
import { app } from '../../index';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import sharp from 'sharp';

describe('Process Controller', () => {
  let testZipBuffer: Buffer;
  let coverPdfBuffer: Buffer;
  let coverImageBuffer: Buffer;

  beforeAll(async () => {
    // Create test PDFs
    const pdf1 = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      pdf1.addPage([595, 842]);
    }
    const pdf1Bytes = await pdf1.save();

    const pdf2 = await PDFDocument.create();
    for (let i = 0; i < 3; i++) {
      pdf2.addPage([595, 842]);
    }
    const pdf2Bytes = await pdf2.save();

    // Create ZIP with test PDFs
    const zip = new JSZip();
    zip.file('test1.pdf', pdf1Bytes);
    zip.file('test2.pdf', pdf2Bytes);
    zip.file('readme.txt', 'This should be ignored');
    testZipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Create cover PDF
    const coverDoc = await PDFDocument.create();
    coverDoc.addPage([595, 842]);
    coverPdfBuffer = Buffer.from(await coverDoc.save());

    // Create cover image
    coverImageBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('POST /api/process', () => {
    it('should process PDFs with PDF cover successfully', async () => {
      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', testZipBuffer, 'test.zip')
        .attach('cover', coverPdfBuffer, 'cover.pdf')
        .field('footerHeightPx', '10')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/zip');
      expect(response.headers['content-disposition']).toContain('processed-pdfs.zip');
      expect(response.headers['x-process-report']).toBeDefined();

      const report = JSON.parse(response.headers['x-process-report']);
      expect(report).toHaveLength(2);
      expect(report[0].success).toBe(true);
      expect(report[1].success).toBe(true);
      expect(report[0].name).toBe('test1.pdf');
      expect(report[1].name).toBe('test2.pdf');

      // Verify ZIP contents
      const zip = new JSZip();
      await zip.loadAsync(response.body);
      const files = Object.keys(zip.files);
      expect(files).toContain('test1.pdf');
      expect(files).toContain('test2.pdf');
    }, 30000);

    it('should process PDFs with image cover successfully', async () => {
      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', testZipBuffer, 'test.zip')
        .attach('cover', coverImageBuffer, 'cover.png')
        .field('footerHeightPx', '15')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/zip');

      const report = JSON.parse(response.headers['x-process-report']);
      expect(report).toHaveLength(2);
      expect(report[0].success).toBe(true);
    }, 30000);

    it('should return 400 if filesZip is missing', async () => {
      const response = await request(app)
        .post('/api/process')
        .attach('cover', coverPdfBuffer, 'cover.pdf')
        .expect(400);

      expect(response.body.error).toContain('Missing required files');
    });

    it('should return 400 if cover is missing', async () => {
      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', testZipBuffer, 'test.zip')
        .expect(400);

      expect(response.body.error).toContain('Missing required files');
    });

    it('should return 400 if ZIP contains no PDFs', async () => {
      const emptyZip = new JSZip();
      emptyZip.file('readme.txt', 'No PDFs here');
      const emptyZipBuffer = await emptyZip.generateAsync({ type: 'nodebuffer' });

      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', emptyZipBuffer, 'empty.zip')
        .attach('cover', coverPdfBuffer, 'cover.pdf')
        .expect(400);

      expect(response.body.error).toContain('No PDF files found');
    });

    it('should return 400 for invalid cover file type', async () => {
      const textBuffer = Buffer.from('This is not an image or PDF');

      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', testZipBuffer, 'test.zip')
        .attach('cover', textBuffer, 'cover.txt')
        .expect(400);

      expect(response.body.error).toContain('Cover file must be PDF or image');
    });

    it('should use default footer height if not provided', async () => {
      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', testZipBuffer, 'test.zip')
        .attach('cover', coverPdfBuffer, 'cover.pdf')
        .expect(200);

      expect(response.headers['x-process-report']).toBeDefined();
    }, 30000);

    it('should handle processing errors gracefully', async () => {
      const corruptedZip = new JSZip();
      corruptedZip.file('corrupt.pdf', 'This is not a valid PDF');
      const corruptedZipBuffer = await corruptedZip.generateAsync({ type: 'nodebuffer' });

      const response = await request(app)
        .post('/api/process')
        .attach('filesZip', corruptedZipBuffer, 'corrupt.zip')
        .attach('cover', coverPdfBuffer, 'cover.pdf')
        .expect(200);

      const report = JSON.parse(response.headers['x-process-report']);
      expect(report).toHaveLength(1);
      expect(report[0].success).toBe(false);
      expect(report[0].error).toBeDefined();
    }, 30000);
  });
});
