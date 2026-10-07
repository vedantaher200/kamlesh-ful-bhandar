import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getBlockedAndBookedDates = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Return all confirmed bookings or dates marked as blocked
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { isDateBlocked: true },
          { status: { in: ['CONFIRMED', 'NEW'] } }
        ]
      },
      select: {
        id: true,
        eventDate: true,
        eventType: true,
        status: true,
        isDateBlocked: true
      }
    });

    const dates = bookings.map((b) => ({
      id: b.id,
      date: b.eventDate.toISOString().split('T')[0],
      eventType: b.eventType,
      status: b.status,
      isDateBlocked: b.isDateBlocked
    }));

    res.json({ success: true, count: dates.length, dates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch calendar dates.', error: error.message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { eventDate: 'asc' }
    });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.', error: error.message });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      phone,
      eventType,
      eventDate,
      eventLocation,
      district = 'Nashik',
      taluka,
      village,
      serviceId,
      productId,
      productName,
      budget,
      message
    } = req.body;
    const finalPhone = customerPhone || phone;

    if (!customerName || !finalPhone || !eventDate) {
      res.status(400).json({ success: false, message: 'Name, phone, and event date are required.' });
      return;
    }

    const targetDate = new Date(eventDate);
    // Check if date is already marked blocked or confirmed for a conflicting booking
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicting = await prisma.booking.findFirst({
      where: {
        eventDate: { gte: startOfDay, lte: endOfDay },
        isDateBlocked: true
      }
    });

    if (conflicting) {
      res.status(409).json({
        success: false,
        message: 'This date has been marked unavailable for new bookings. Please contact us directly.'
      });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: finalPhone.trim(),
        eventType: eventType || 'Wedding',
        eventDate: targetDate,
        eventLocation: eventLocation || (village ? `${village}, ${taluka || 'Nashik'}` : 'Nashik'),
        district: district ? district.trim() : 'Nashik',
        taluka: taluka ? taluka.trim() : null,
        village: village ? village.trim() : null,
        serviceId: serviceId || null,
        productId: productId || null,
        productName: productName || null,
        budget: budget || null,
        message: message ? message.trim() : null,
        status: 'NEW',
        isDateBlocked: false
      }
    });

    res.status(201).json({ success: true, message: 'Booking request registered.', booking });
  } catch (error: any) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking.', error: error.message });
  }
};

export const blockDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required to block.' });
      return;
    }

    const blockBooking = await prisma.booking.create({
      data: {
        customerName: 'Admin Blocked Date',
        customerPhone: '0000000000',
        eventType: reason || 'Fully Booked / Date Blocked',
        eventDate: new Date(date),
        eventLocation: 'Nashik',
        status: 'CONFIRMED',
        isDateBlocked: true,
        message: reason || 'Date manually blocked by business owner.'
      }
    });

    res.status(201).json({ success: true, message: 'Date successfully blocked on calendar.', blockBooking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to block date.', error: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isDateBlocked } = req.body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (isDateBlocked !== undefined) dataToUpdate.isDateBlocked = Boolean(isDateBlocked);

    const updated = await prisma.booking.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Booking updated.', booking: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update booking.', error: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    res.json({ success: true, message: 'Booking deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete booking.', error: error.message });
  }
};
