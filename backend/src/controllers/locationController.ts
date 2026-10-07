import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * Public: Get active locations grouped by taluka or as flat list
 */
export const getActiveLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taluka, search } = req.query;

    const whereClause: any = { isActive: true };
    if (taluka) {
      whereClause.taluka = String(taluka);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { village: { contains: q, mode: 'insensitive' } },
        { taluka: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } }
      ];
    }

    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: [{ taluka: 'asc' }, { village: 'asc' }]
    });

    // Extract unique talukas for convenience
    const talukas = Array.from(new Set(locations.map((l) => l.taluka))).sort();

    res.json({
      success: true,
      count: locations.length,
      talukas,
      locations
    });
  } catch (error: any) {
    console.error('getActiveLocations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch locations.', error: error.message });
  }
};

/**
 * Admin: Get all locations (including inactive) with filtering
 */
export const getAllLocationsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, taluka } = req.query;

    const whereClause: any = {};
    if (taluka && taluka !== 'ALL') {
      whereClause.taluka = String(taluka);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { village: { contains: q, mode: 'insensitive' } },
        { taluka: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } }
      ];
    }

    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: [{ taluka: 'asc' }, { village: 'asc' }]
    });

    res.json({ success: true, count: locations.length, locations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin locations.', error: error.message });
  }
};

/**
 * Admin: Create a location
 */
export const createLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { district = 'Nashik', taluka, village, area, isActive = true } = req.body;

    if (!taluka || !village) {
      res.status(400).json({ success: false, message: 'Taluka and Village are required.' });
      return;
    }

    const existing = await prisma.location.findFirst({
      where: {
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim()
      }
    });

    if (existing) {
      res.status(400).json({ success: false, message: `Location "${village}" in taluka "${taluka}" already exists.` });
      return;
    }

    const location = await prisma.location.create({
      data: {
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim(),
        area: area ? area.trim() : null,
        isActive: Boolean(isActive)
      }
    });

    res.status(201).json({ success: true, message: 'Location added successfully.', location });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create location.', error: error.message });
  }
};

/**
 * Admin: Update location
 */
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { district, taluka, village, area, isActive } = req.body;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        district: district !== undefined ? district.trim() : undefined,
        taluka: taluka !== undefined ? taluka.trim() : undefined,
        village: village !== undefined ? village.trim() : undefined,
        area: area !== undefined ? (area ? area.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    res.json({ success: true, message: 'Location updated successfully.', location: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update location.', error: error.message });
  }
};

/**
 * Admin: Toggle location active status
 */
export const toggleLocationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    const updated = await prisma.location.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });

    res.json({
      success: true,
      message: `Location ${updated.village} is now ${updated.isActive ? 'active' : 'inactive'}.`,
      location: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle location status.', error: error.message });
  }
};

/**
 * Admin: Delete location
 */
export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    await prisma.location.delete({ where: { id } });
    res.json({ success: true, message: 'Location deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete location.', error: error.message });
  }
};
