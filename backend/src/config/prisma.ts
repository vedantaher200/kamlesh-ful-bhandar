import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [Prisma] DATABASE_URL environment variable is not set. Ensure it is defined in your Vercel Project Settings.');
} else if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
  console.warn('⚠️ [Prisma] DATABASE_URL points to localhost. Cloud deployments require a hosted PostgreSQL URL (e.g., Neon, Supabase).');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
