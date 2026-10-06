import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getActiveOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: offers.length, offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch offers.', error: error.message });
  }
};

export const getAllOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: offers.length, offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch offers.', error: error.message });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, image, startDate, endDate, isActive } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required.' });
      return;
    }

    const offer = await prisma.offer.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        image: image ? image.trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    res.status(201).json({ success: true, message: 'Offer created.', offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create offer.', error: error.message });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, image, startDate, endDate, isActive } = req.body;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title.trim();
    if (description) dataToUpdate.description = description.trim();
    if (image !== undefined) dataToUpdate.image = image;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const updated = await prisma.offer.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Offer updated.', offer: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update offer.', error: error.message });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    res.json({ success: true, message: 'Offer deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete offer.', error: error.message });
  }
};
