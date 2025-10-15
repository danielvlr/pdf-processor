import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Store chunks temporarily
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const CHUNKS_DIR = path.join(UPLOAD_DIR, 'chunks');

// Ensure upload directories exist
async function ensureUploadDirs() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(CHUNKS_DIR, { recursive: true });
}

// Upload a single chunk
export async function uploadChunk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await ensureUploadDirs();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const chunk = files?.chunk?.[0];

    if (!chunk) {
      res.status(400).json({ error: 'No chunk provided' });
      return;
    }

    const { fileId, chunkIndex, totalChunks, fieldName, originalName } = req.body;

    if (!fileId || chunkIndex === undefined || !totalChunks || !fieldName) {
      res.status(400).json({ error: 'Missing required metadata' });
      return;
    }

    // Save chunk to disk
    const chunkPath = path.join(CHUNKS_DIR, `${fileId}-chunk-${chunkIndex}`);
    await fs.writeFile(chunkPath, chunk.buffer);

    console.log(`✓ Chunk saved: ${fileId}-chunk-${chunkIndex} (${chunk.size} bytes) - ${parseInt(chunkIndex) + 1}/${totalChunks}`);

    // Check if this is the last chunk
    const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;
    let allChunksUploaded = false;

    if (isLastChunk) {
      // Last chunk received, check if all are present
      console.log(`Last chunk received for ${fileId}, checking all chunks...`);
      allChunksUploaded = await checkAllChunksUploaded(fileId, parseInt(totalChunks));

      if (allChunksUploaded) {
        // Merge chunks
        console.log(`All chunks present for ${fileId}, starting merge...`);
        await mergeChunks(fileId, parseInt(totalChunks), fieldName, originalName);
      } else {
        console.error(`Missing chunks for ${fileId}, expected ${totalChunks}`);
      }
    }

    res.json({
      success: true,
      fileId,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
      allChunksUploaded,
    });

  } catch (error) {
    console.error('Error in uploadChunk:', error);
    next(error);
  }
}

// Upload a single small file (no chunking needed)
export async function uploadSingle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await ensureUploadDirs();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files?.file?.[0];

    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { fieldName, originalName } = req.body;
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Save file directly
    const filePath = path.join(UPLOAD_DIR, `${fileId}-${fieldName}`);
    await fs.writeFile(filePath, file.buffer);

    // Save metadata
    const metadataPath = path.join(UPLOAD_DIR, `${fileId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify({
      fileId,
      fieldName,
      originalName: originalName || file.originalname,
      size: file.size,
    }));

    console.log(`Single file uploaded: ${fileId}`);

    res.json({
      success: true,
      fileId,
    });

  } catch (error) {
    next(error);
  }
}

// Check if all chunks are uploaded
async function checkAllChunksUploaded(fileId: string, totalChunks: number): Promise<boolean> {
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(CHUNKS_DIR, `${fileId}-chunk-${i}`);
    try {
      await fs.access(chunkPath);
    } catch {
      return false; // Chunk missing
    }
  }
  return true; // All chunks present
}

// Merge chunks into a single file
async function mergeChunks(
  fileId: string,
  totalChunks: number,
  fieldName: string,
  originalName: string
): Promise<void> {
  const outputPath = path.join(UPLOAD_DIR, `${fileId}-${fieldName}`);

  // Collect all chunks in memory first
  const chunks: Buffer[] = [];

  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(CHUNKS_DIR, `${fileId}-chunk-${i}`);
      const chunkData = await fs.readFile(chunkPath);
      chunks.push(chunkData);

      // Delete chunk after reading
      await fs.unlink(chunkPath).catch(() => {});
    }

    // Merge all chunks into one buffer and write
    const mergedBuffer = Buffer.concat(chunks);
    await fs.writeFile(outputPath, mergedBuffer);

    // Save metadata
    const stats = await fs.stat(outputPath);
    const metadataPath = path.join(UPLOAD_DIR, `${fileId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify({
      fileId,
      fieldName,
      originalName,
      size: stats.size,
    }));

    console.log(`File merged successfully: ${fileId} (${stats.size} bytes)`);

  } catch (error) {
    console.error(`Error merging chunks for ${fileId}:`, error);
    throw error;
  }
}

// Get uploaded file
export async function getUploadedFile(fileId: string, fieldName: string): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, `${fileId}-${fieldName}`);
  return await fs.readFile(filePath);
}

// Clean up uploaded file
export async function cleanupUploadedFile(fileId: string): Promise<void> {
  try {
    const metadataPath = path.join(UPLOAD_DIR, `${fileId}.json`);
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const filePath = path.join(UPLOAD_DIR, `${fileId}-${metadata.fieldName}`);
    await fs.unlink(filePath).catch(() => {});
    await fs.unlink(metadataPath).catch(() => {});

    console.log(`Cleaned up file: ${fileId}`);
  } catch (error) {
    // Ignore cleanup errors
  }
}
