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

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = generateSlug(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] }
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'Category with this name already exists.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
        image: image ? image.trim() : null
      }
    });

    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create category.', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const dataToUpdate: any = {};
    if (name) {
      dataToUpdate.name = name.trim();
      dataToUpdate.slug = generateSlug(name);
    }
    if (description !== undefined) dataToUpdate.description = description;
    if (image !== undefined) dataToUpdate.image = image;

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Category updated.', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update category.', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete category.', error: error.message });
  }
};
