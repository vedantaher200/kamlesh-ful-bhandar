import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.businessSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings } = req.body; // e.g. { phone_primary: '9921972936', address: '...' }

    if (!settings || typeof settings !== 'object') {
      res.status(400).json({ success: false, message: 'Settings object is required.' });
      return;
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.businessSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update settings.', error: error.message });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProducts,
      availableProducts,
      totalEnquiries,
      pendingEnquiries,
      upcomingBookings,
      galleryImages,
      activeOffers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { availability: 'AVAILABLE' } }),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.booking.count({
        where: {
          eventDate: { gte: new Date() },
          status: { in: ['NEW', 'CONFIRMED'] }
        }
      }),
      prisma.galleryImage.count(),
      prisma.offer.count({ where: { isActive: true } })
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        availableProducts,
        totalEnquiries,
        pendingEnquiries,
        upcomingBookings,
        galleryImages,
        activeOffers
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.', error: error.message });
  }
};
