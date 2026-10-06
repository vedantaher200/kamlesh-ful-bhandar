import { Router } from 'express';
import { handleImageUpload } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Admin protected file upload (supports both / and /image)
router.post('/', authenticateAdmin, upload.single('image'), handleImageUpload);
router.post('/image', authenticateAdmin, upload.single('image'), handleImageUpload);

export default router;
