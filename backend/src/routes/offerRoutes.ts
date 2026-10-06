import { Router } from 'express';
import {
  getActiveOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer
} from '../controllers/offerController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/active', getActiveOffers);
router.get('/', authenticateAdmin, getAllOffers);
router.post('/', authenticateAdmin, createOffer);
router.put('/:id', authenticateAdmin, updateOffer);
router.delete('/:id', authenticateAdmin, deleteOffer);

export default router;
