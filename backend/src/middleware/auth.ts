import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'kamlesh_default_jwt_secret';

    const decoded = jwt.verify(token, secret) as { id: string; email?: string; role: string; name?: string };

    if (!decoded || decoded.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
      return;
    }

    let user = null;
    try {
      if (decoded.id && decoded.id !== 'admin-configured') {
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true }
        });
      }

      if (!user) {
        user = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
          select: { id: true, name: true, email: true, role: true }
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [Auth Middleware] Database lookup failed, falling back to verified JWT claims:', dbErr);
    }

    if (!user) {
      user = {
        id: decoded.id || 'admin-configured',
        name: decoded.name || 'Kamlesh Ful Bhandar Admin',
        email: decoded.email || 'admin@kamleshfulbhandar.com',
        role: decoded.role || 'ADMIN'
      };
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
