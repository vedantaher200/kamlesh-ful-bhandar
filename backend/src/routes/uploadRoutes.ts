import { Router } from 'express';
import { handleImageUpload, handleBlobUploadToken } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

const handleMultipartUpload = (req: any, res: any, next: any) => {
  upload.single('image')(req, res, (error: any) => {
    if (error) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge ? 'Image must be 5 MB or smaller.' : error.message || 'Invalid image upload.'
      });
      return;
    }
    next();
  });
};

// Vercel Blob client-upload token generation endpoints (Admin authenticated)
router.post('/token', authenticateAdmin, handleBlobUploadToken);
router.post('/blob-token', authenticateAdmin, handleBlobUploadToken);

// Direct multipart file upload endpoints (Admin authenticated)
router.post('/', authenticateAdmin, handleMultipartUpload, handleImageUpload);
router.post('/image', authenticateAdmin, handleMultipartUpload, handleImageUpload);

export default router;
