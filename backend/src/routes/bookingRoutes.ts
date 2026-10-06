import { Router } from 'express';
import {
  getBlockedAndBookedDates,
  getBookings,
  createBooking,
  blockDate,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public: check calendar availability
router.get('/calendar-dates', getBlockedAndBookedDates);
router.get('/blocked-dates', getBlockedAndBookedDates);
router.post('/', createBooking);

// Admin routes
router.get('/', authenticateAdmin, getBookings);
router.post('/block-date', authenticateAdmin, blockDate);
router.put('/:id', authenticateAdmin, updateBookingStatus);
router.delete('/:id', authenticateAdmin, deleteBooking);

export default router;
