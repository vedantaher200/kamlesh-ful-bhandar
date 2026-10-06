import { Router } from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
} from '../controllers/enquiryController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createEnquiry);
router.get('/', authenticateAdmin, getEnquiries);
router.put('/:id/status', authenticateAdmin, updateEnquiryStatus);
router.delete('/:id', authenticateAdmin, deleteEnquiry);

export default router;
