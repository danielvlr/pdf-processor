import { Router } from 'express';
import multer from 'multer';
import { uploadChunk, uploadSingle } from '../controllers/upload.controller';

const router = Router();

// Configure multer for chunk uploads (30MB max per chunk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB per chunk
  },
});

// Upload a single chunk
router.post('/upload-chunk', upload.fields([{ name: 'chunk', maxCount: 1 }]), uploadChunk);

// Upload a single small file (no chunking)
router.post('/upload-single', upload.fields([{ name: 'file', maxCount: 1 }]), uploadSingle);

export { router as uploadRouter };
