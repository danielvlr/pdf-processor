import { Router } from 'express';
import multer from 'multer';
import { processFiles } from '../controllers/process.controller';
import { processUploadedFiles } from '../controllers/process-uploaded.controller';
import { processChunk } from '../controllers/process-chunk.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB por arquivo
    fieldSize: 500 * 1024 * 1024, // 500MB para campos
  },
});

// Original endpoint (for backward compatibility)
router.post(
  '/process',
  upload.fields([
    { name: 'filesZip', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  processFiles
);

// New endpoint for chunked uploads
router.post('/process-uploaded', processUploadedFiles);

// Process chunk and return results immediately (no merge on server)
router.post(
  '/process-chunk',
  upload.fields([
    { name: 'zipChunk', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  processChunk
);

export { router as processRouter };
