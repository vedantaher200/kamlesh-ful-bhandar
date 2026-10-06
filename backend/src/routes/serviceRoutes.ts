import { Router } from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getServices);
router.post('/', authenticateAdmin, createService);
router.put('/:id', authenticateAdmin, updateService);
router.delete('/:id', authenticateAdmin, deleteService);

export default router;
