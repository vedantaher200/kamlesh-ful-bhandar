import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, featured } = req.query;
    const whereClause: any = {};

    if (category && category !== 'All') {
      whereClause.category = String(category);
    }
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, count: services.length, services });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch services.', error: error.message });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, highlight, image, category, isAvailable, isFeatured } = req.body;

    if (!title || !description || !image) {
      res.status(400).json({ success: false, message: 'Title, description, and image are required.' });
      return;
    }

    let baseSlug = generateSlug(title);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.service.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        highlight: highlight ? highlight.trim() : null,
        image: image.trim(),
        category: category || 'Decoration',
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        isFeatured: Boolean(isFeatured)
      }
    });

    res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create service.', error: error.message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, highlight, image, category, isAvailable, isFeatured } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title.trim();
    if (description) dataToUpdate.description = description.trim();
    if (highlight !== undefined) dataToUpdate.highlight = highlight ? highlight.trim() : null;
    if (image) dataToUpdate.image = image.trim();
    if (category) dataToUpdate.category = category;
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);

    const updated = await prisma.service.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Service updated successfully.', service: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update service.', error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete service.', error: error.message });
  }
};
