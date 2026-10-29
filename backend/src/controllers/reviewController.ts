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
    const cleanName = typeof customerName === 'string' ? customerName.trim() : '';
    const cleanComment = typeof comment === 'string' ? comment.trim() : '';
    const numericRating = Number(rating);

    if (!cleanName || !cleanComment || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: 'Enter your name, a review, and a whole-number rating from 1 to 5.' });
      return;
    }
    if (cleanName.length > 100 || cleanComment.length > 3000) {
      res.status(400).json({ success: false, message: 'Name must be 100 characters or less and review must be 3,000 characters or less.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        customerName: cleanName,
        rating: numericRating,
        comment: cleanComment,
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
    console.error('submitReview error:', error);
    const databaseUnavailable = error?.code === 'P1001' || error?.errorCode === 'P1001' || /can't reach database server/i.test(String(error?.message || ''));
    res.status(databaseUnavailable ? 503 : 500).json({
      success: false,
      message: databaseUnavailable
        ? 'Reviews are temporarily unavailable because the database cannot be reached. Please try again later.'
        : 'Failed to submit review. Please try again later.'
    });
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
