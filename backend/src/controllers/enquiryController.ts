import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const createEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, phone, eventType, eventDate, eventLocation, service, budget, message } = req.body;
    const finalPhone = customerPhone || phone;

    if (!customerName || !finalPhone) {
      res.status(400).json({ success: false, message: 'Customer Name and Mobile Number are required.' });
      return;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: finalPhone.trim(),
        eventType: eventType || 'Wedding',
        eventDate: eventDate || null,
        eventLocation: eventLocation || 'Nashik',
        service: service || 'Flower Decoration',
        budget: budget || null,
        message: message ? message.trim() : null,
        status: 'NEW'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our team will contact you shortly.',
      enquiry
    });
  } catch (error: any) {
    console.error('createEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to record enquiry.', error: error.message });
  }
};

export const getEnquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }

    const enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries.', error: error.message });
  }
};

export const updateEnquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, message: 'Enquiry status updated.', enquiry: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update enquiry status.', error: error.message });
  }
};

export const deleteEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.enquiry.delete({ where: { id } });
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete enquiry.', error: error.message });
  }
};
