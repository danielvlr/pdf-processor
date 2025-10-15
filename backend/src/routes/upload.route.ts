import { Router } from 'express';
import multer from 'multer';
import { uploadChunk, uploadSingle } from '../controllers/upload.controller';

const router = Router();

// Configure multer for chunk uploads (35MB to allow overhead + 30MB chunk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 35 * 1024 * 1024, // 35MB (30MB chunk + 5MB multipart overhead)
    fieldSize: 35 * 1024 * 1024, // 35MB for field size
  },
});

// Upload a single chunk
router.post('/upload-chunk', upload.fields([{ name: 'chunk', maxCount: 1 }]), uploadChunk);

// Upload a single small file (no chunking)
router.post('/upload-single', upload.fields([{ name: 'file', maxCount: 1 }]), uploadSingle);

export { router as uploadRouter };
