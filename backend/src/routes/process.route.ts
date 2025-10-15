import { Router } from 'express';
import multer from 'multer';
import { processFiles } from '../controllers/process.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

router.post(
  '/process',
  upload.fields([
    { name: 'filesZip', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  processFiles
);

export { router as processRouter };
