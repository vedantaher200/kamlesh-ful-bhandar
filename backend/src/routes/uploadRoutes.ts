import { Router } from 'express';
import { handleImageUpload } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

const handleUpload = (req: any, res: any, next: any) => {
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

// Admin protected file upload (supports both / and /image)
router.post('/', authenticateAdmin, handleUpload, handleImageUpload);
router.post('/image', authenticateAdmin, handleUpload, handleImageUpload);

export default router;
