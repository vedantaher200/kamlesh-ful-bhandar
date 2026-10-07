import { Router } from 'express';
import {
  getPublishedCarDecorations,
  getAllCarDecorationsAdmin,
  getCarDecorationById,
  createCarDecoration,
  updateCarDecoration,
  toggleCarDecorationStatus,
  deleteCarDecoration
} from '../controllers/carDecorationController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes:
router.get('/', getPublishedCarDecorations);
router.get('/:id', getCarDecorationById);

// Admin routes (supports both /admin and standard REST paths):
router.get('/admin/all', authenticateAdmin, getAllCarDecorationsAdmin);
router.get('/admin', authenticateAdmin, getAllCarDecorationsAdmin);

router.post('/admin', authenticateAdmin, upload.single('image'), createCarDecoration);
router.post('/', authenticateAdmin, upload.single('image'), createCarDecoration);

router.put('/admin/:id', authenticateAdmin, upload.single('image'), updateCarDecoration);
router.put('/:id', authenticateAdmin, upload.single('image'), updateCarDecoration);

router.patch('/admin/:id/status', authenticateAdmin, toggleCarDecorationStatus);
router.patch('/:id/toggle-status', authenticateAdmin, toggleCarDecorationStatus);
router.patch('/:id/status', authenticateAdmin, toggleCarDecorationStatus);

router.delete('/admin/:id', authenticateAdmin, deleteCarDecoration);
router.delete('/:id', authenticateAdmin, deleteCarDecoration);

export default router;
