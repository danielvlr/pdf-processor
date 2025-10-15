import { PDFDocument, PageSizes } from 'pdf-lib';
import sharp from 'sharp';

export async function convertImageToPDF(
  imageBuffer: Buffer,
  mimeType: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Default to A4 size (595.28 x 841.89 points)
  const [pageWidth, pageHeight] = PageSizes.A4;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  let imageBytes: Uint8Array;
  let embedImage: any;

  if (mimeType === 'image/svg+xml') {
    // Convert SVG to PNG first
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    imageBytes = new Uint8Array(pngBuffer);
    embedImage = await pdfDoc.embedPng(imageBytes);
  } else if (mimeType === 'image/png') {
    imageBytes = new Uint8Array(imageBuffer);
    embedImage = await pdfDoc.embedPng(imageBytes);
  } else {
    // JPEG
    imageBytes = new Uint8Array(imageBuffer);
    embedImage = await pdfDoc.embedJpg(imageBytes);
  }

  // Get image dimensions
  const imgWidth = embedImage.width;
  const imgHeight = embedImage.height;

  // Calculate scaling to fit page while maintaining aspect ratio
  const scaleX = pageWidth / imgWidth;
  const scaleY = pageHeight / imgHeight;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  // Center the image on the page
  const x = (pageWidth - scaledWidth) / 2;
  const y = (pageHeight - scaledHeight) / 2;

  page.drawImage(embedImage, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight,
  });

  return await pdfDoc.save();
}
