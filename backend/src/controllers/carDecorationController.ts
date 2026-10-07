import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// 1. Public: Get only PUBLISHED Car Decoration posts
export const getPublishedCarDecorations = async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.carDecorationPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error: any) {
    console.error('Error fetching published car decorations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch car decorations' });
  }
};

// 2. Admin: Get all Car Decoration posts (Published + Unpublished)
export const getAllCarDecorationsAdmin = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const whereClause: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    const posts = await prisma.carDecorationPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const publishedCount = await prisma.carDecorationPost.count({ where: { status: 'PUBLISHED' } });
    const unpublishedCount = await prisma.carDecorationPost.count({ where: { status: 'UNPUBLISHED' } });

    res.json({
      success: true,
      count: posts.length,
      stats: {
        total: posts.length,
        published: publishedCount,
        unpublished: unpublishedCount
      },
      posts
    });
  } catch (error: any) {
    console.error('Error fetching admin car decorations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch car decorations' });
  }
};

// 3. Get single Car Decoration by ID
export const getCarDecorationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.carDecorationPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Car decoration post not found' });
    }

    res.json({ success: true, post });
  } catch (error: any) {
    console.error('Error fetching car decoration by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch car decoration' });
  }
};

// 4. Admin: Create new Car Decoration post
export const createCarDecoration = async (req: Request, res: Response) => {
  try {
    const { title, description, price, priceText, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let imageUrl = req.body.image;
    let imagePublicId = req.body.imagePublicId;

    if (req.file) {
      imageUrl = (req.file as any).path || `/uploads/${req.file.filename}`;
      imagePublicId = (req.file as any).filename;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required for car decoration post' });
    }

    const parsedPrice = price !== undefined && price !== '' && !isNaN(Number(price)) ? Number(price) : null;
    const postStatus = status === 'UNPUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';

    const post = await prisma.carDecorationPost.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        priceText: priceText || (parsedPrice ? `₹${parsedPrice.toLocaleString('en-IN')}` : 'Price on Request'),
        image: imageUrl,
        imagePublicId,
        status: postStatus
      }
    });

    res.status(201).json({
      success: true,
      message: 'Car decoration post created successfully',
      post
    });
  } catch (error: any) {
    console.error('Error creating car decoration:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create car decoration' });
  }
};

// 5. Admin: Update existing Car Decoration post (CRITICAL: SAME RECORD ID, NO DUPLICATE)
export const updateCarDecoration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, priceText, status } = req.body;

    const existing = await prisma.carDecorationPost.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Car decoration post not found' });
    }

    let imageUrl = existing.image;
    let imagePublicId = existing.imagePublicId;

    if (req.file) {
      imageUrl = (req.file as any).path || `/uploads/${req.file.filename}`;
      imagePublicId = (req.file as any).filename;
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim()) {
      imageUrl = req.body.image.trim();
    }

    const parsedPrice = price !== undefined && price !== '' && !isNaN(Number(price))
      ? Number(price)
      : (price === null ? null : existing.price);

    const postStatus = status ? (status === 'UNPUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED') : existing.status;

    const updatedPost = await prisma.carDecorationPost.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        price: parsedPrice,
        priceText: priceText !== undefined ? priceText : (parsedPrice ? `₹${parsedPrice.toLocaleString('en-IN')}` : 'Price on Request'),
        image: imageUrl,
        imagePublicId,
        status: postStatus
      }
    });

    res.json({
      success: true,
      message: 'Car decoration post updated successfully',
      post: updatedPost
    });
  } catch (error: any) {
    console.error('Error updating car decoration:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update car decoration' });
  }
};

// 6. Admin: Toggle publish status
export const toggleCarDecorationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.carDecorationPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Car decoration post not found' });
    }

    const newStatus = post.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';

    const updated = await prisma.carDecorationPost.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json({
      success: true,
      message: `Car decoration post is now ${newStatus.toLowerCase()}`,
      post: updated
    });
  } catch (error: any) {
    console.error('Error toggling status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
};

// 7. Admin: Delete Car Decoration post
export const deleteCarDecoration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.carDecorationPost.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Car decoration post not found' });
    }

    await prisma.carDecorationPost.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Car decoration post deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting car decoration:', error);
    res.status(500).json({ success: false, message: 'Failed to delete car decoration' });
  }
};
