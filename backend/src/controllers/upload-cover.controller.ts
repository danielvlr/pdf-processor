import { Request, Response, NextFunction } from 'express';

// Store the uploaded cover in memory (will be used during processing)
let uploadedCover: Express.Multer.File | null = null;

export function getUploadedCover(): Express.Multer.File | null {
  return uploadedCover;
}

export async function uploadCover(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const cover = files?.cover?.[0];

    if (!cover) {
      res.status(400).json({ error: 'No cover file provided' });
      return;
    }

    // Store cover in memory for future processing
    uploadedCover = cover;

    console.log(`Cover uploaded: ${cover.originalname}, size: ${cover.size} bytes`);

    res.json({
      success: true,
      message: 'Cover uploaded successfully',
      filename: cover.originalname,
      size: cover.size,
    });
  } catch (error: any) {
    console.error('Error uploading cover:', error);
    res.status(500).json({ error: error.message || 'Error uploading cover' });
  }
}
