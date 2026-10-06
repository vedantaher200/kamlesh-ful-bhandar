import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getApprovedReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.', error: error.message });
  }
};

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.', error: error.message });
  }
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, rating, comment } = req.body;
    if (!customerName || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Customer name, rating (1-5), and feedback are required.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        customerName: customerName.trim(),
        rating: Math.min(5, Math.max(1, parseInt(String(rating)))),
        comment: comment.trim(),
        isApproved: false,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending administrator approval.',
      review
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit review.', error: error.message });
  }
};

export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let { status, isApproved } = req.body; // APPROVED, REJECTED, PENDING or boolean isApproved

    if (isApproved !== undefined && !status) {
      status = isApproved ? 'APPROVED' : 'REJECTED';
    } else {
      isApproved = status === 'APPROVED';
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status: status || 'PENDING', isApproved: Boolean(isApproved) }
    });

    res.json({ success: true, message: `Review marked as ${status}.`, review: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update review status.', error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete review.', error: error.message });
  }
};
