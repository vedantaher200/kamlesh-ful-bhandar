import { Router } from 'express';
import {
  getApprovedReviews,
  getAllReviews,
  submitReview,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/approved', getApprovedReviews);
router.post('/', submitReview);

router.get('/all', authenticateAdmin, getAllReviews);
router.put('/:id', authenticateAdmin, updateReviewStatus);
router.put('/:id/status', authenticateAdmin, updateReviewStatus);
router.delete('/:id', authenticateAdmin, deleteReview);

export default router;
