import { Router } from 'express';
import {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../controllers/galleryController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getGalleryImages);
router.post('/', authenticateAdmin, createGalleryImage);
router.put('/:id', authenticateAdmin, updateGalleryImage);
router.delete('/:id', authenticateAdmin, deleteGalleryImage);

export default router;
