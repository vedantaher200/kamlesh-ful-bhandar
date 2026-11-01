import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Constant-time string comparison using SHA-256 hashes to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Helper to strip outer quotes and whitespace from environment variables
 */
const cleanEnv = (val?: string): string | undefined => {
  if (!val) return undefined;
  const t = val.trim();
  return t.replace(/^["']|["']$/g, '').trim();
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminKey, admin_key, key, username, email, password } = req.body;
    const providedKey = (adminKey || admin_key || key || username || email || '').toString().trim();
    const rawPassword = (password || '').toString();
    const trimmedPassword = rawPassword.trim();

    if (!providedKey || !rawPassword) {
      res.status(400).json({
        success: false,
        message: 'Admin Key and Password are required.'
      });
      return;
    }

    const envAdminKey = cleanEnv(process.env.ADMIN_KEY);
    const envPasswordHash = cleanEnv(process.env.ADMIN_PASSWORD_HASH);
    const envPasswordPlain = cleanEnv(process.env.ADMIN_PASSWORD);

    let authenticatedAdmin: {
      id: string;
      name: string;
      email: string;
      role: string;
    } | null = null;

    // 1. Authoritative Environment Credential Pair Verification
    if (envAdminKey && (envPasswordHash || envPasswordPlain)) {
      const isKeyMatch =
        safeCompare(providedKey, envAdminKey) ||
        safeCompare(providedKey.toLowerCase(), envAdminKey.toLowerCase());

      if (isKeyMatch) {
        let isPassMatch = false;
        if (envPasswordHash) {
          isPassMatch =
            (await bcrypt.compare(rawPassword, envPasswordHash)) ||
            (trimmedPassword !== rawPassword ? await bcrypt.compare(trimmedPassword, envPasswordHash) : false);
        }
        if (!isPassMatch && envPasswordPlain) {
          isPassMatch =
            safeCompare(rawPassword, envPasswordPlain) ||
            safeCompare(trimmedPassword, envPasswordPlain);
        }

        if (isPassMatch) {
          authenticatedAdmin = {
            id: 'admin-configured',
            name: 'Kamlesh Flowers Admin',
            email: envAdminKey,
            role: 'ADMIN'
          };
        }
      }
    }

    // 2. Authoritative Database Credential Pair Verification
    if (!authenticatedAdmin) {
      try {
        const dbAdmins = await prisma.user.findMany({
          where: { role: 'ADMIN' }
        });

        for (const admin of dbAdmins) {
          const isKeyMatch =
            safeCompare(providedKey.toLowerCase(), admin.email.toLowerCase()) ||
            safeCompare(providedKey, admin.email) ||
            providedKey.toLowerCase() === 'admin';

          if (isKeyMatch && admin.password) {
            const isPassMatch =
              (await bcrypt.compare(rawPassword, admin.password)) ||
              (trimmedPassword !== rawPassword ? await bcrypt.compare(trimmedPassword, admin.password) : false);

            if (isPassMatch) {
              authenticatedAdmin = {
                id: admin.id,
                name: admin.name || 'Kamlesh Flowers Admin',
                email: admin.email,
                role: admin.role
              };
              break;
            }
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ [AUTH] Database query during admin authentication failed:', dbErr);
      }
    }

    if (!authenticatedAdmin) {
      res.status(401).json({
        success: false,
        message: 'Invalid Admin Key or Password.'
      });
      return;
    }

    const adminId = authenticatedAdmin.id;
    const adminRole = authenticatedAdmin.role;
    const adminName = authenticatedAdmin.name;
    const adminEmail = authenticatedAdmin.email;

    const secret = cleanEnv(process.env.JWT_SECRET) || 'kamlesh_default_jwt_secret';
    const expiresIn = (cleanEnv(process.env.JWT_EXPIRES_IN) || '7d') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      {
        id: adminId,
        role: adminRole,
        name: adminName,
        email: adminEmail
      },
      secret,
      { expiresIn }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: adminId,
        name: adminName,
        role: adminRole,
        email: adminEmail
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let user: any = null;
    try {
      if (req.user.id && req.user.id !== 'admin-configured') {
        user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [Auth] Could not fetch user from DB in getMe, using token payload:', dbErr);
    }

    res.json({
      success: true,
      user: user || {
        id: req.user.id,
        name: req.user.name || 'Kamlesh Flowers Admin',
        role: req.user.role || 'ADMIN',
        email: req.user.email || 'admin@kamleshflowers.com'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.', error: error.message });
  }
};

