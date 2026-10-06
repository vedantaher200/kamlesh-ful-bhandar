import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getGalleryImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, includeUnpublished } = req.query;

    const whereClause: any = {};
    if (includeUnpublished !== 'true') {
      whereClause.isPublished = true;
    }
    if (category && category !== 'All' && category !== 'all') {
      whereClause.category = String(category);
    }

    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: images.length, images });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch gallery images.', error: error.message });
  }
};

export const createGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, categoryName, image, imagePublicId, description, isPublished } = req.body;

    if (!title || !category || !image) {
      res.status(400).json({ success: false, message: 'Title, category, and image are required.' });
      return;
    }

    const galleryImage = await prisma.galleryImage.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        categoryName: categoryName || `${category} Decorations`,
        image: image.trim(),
        imagePublicId: imagePublicId || null,
        description: description ? description.trim() : null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true
      }
    });

    res.status(201).json({ success: true, message: 'Image added to gallery.', galleryImage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add gallery image.', error: error.message });
  }
};

export const updateGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, categoryName, image, imagePublicId, description, isPublished } = req.body;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title.trim();
    if (category) dataToUpdate.category = category.trim();
    if (categoryName) dataToUpdate.categoryName = categoryName;
    if (image) dataToUpdate.image = image.trim();
    if (imagePublicId !== undefined) dataToUpdate.imagePublicId = imagePublicId;
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
    if (isPublished !== undefined) dataToUpdate.isPublished = Boolean(isPublished);

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Gallery image updated.', galleryImage: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update gallery image.', error: error.message });
  }
};

export const deleteGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.galleryImage.delete({ where: { id } });
    res.json({ success: true, message: 'Gallery image deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery image.', error: error.message });
  }
};
