import { Router } from 'express';
import {
  getActiveLocations,
  getAllLocationsAdmin,
  createLocation,
  updateLocation,
  toggleLocationStatus,
  deleteLocation
} from '../controllers/locationController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getActiveLocations);

// Admin protected routes
router.get('/admin', authenticateAdmin, getAllLocationsAdmin);
router.post('/', authenticateAdmin, createLocation);
router.put('/:id', authenticateAdmin, updateLocation);
router.patch('/:id/toggle', authenticateAdmin, toggleLocationStatus);
router.delete('/:id', authenticateAdmin, deleteLocation);

export default router;
