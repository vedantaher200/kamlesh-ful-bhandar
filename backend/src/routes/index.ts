import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import offerRoutes from './offerRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/gallery', galleryRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/offers', offerRoutes);
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);

export default router;
