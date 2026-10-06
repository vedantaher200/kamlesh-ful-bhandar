import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getDashboardStats
} from '../controllers/settingsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings);
router.get('/public', getSettings);
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);
router.put('/', authenticateAdmin, updateSettings);

export default router;
