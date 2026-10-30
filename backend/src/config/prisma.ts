import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [Prisma] DATABASE_URL environment variable is not set. Ensure it is defined in your Vercel Project Settings.');
} else if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
  console.warn('⚠️ [Prisma] DATABASE_URL points to localhost. Cloud deployments require a hosted PostgreSQL URL (e.g., Neon, Supabase).');
}

let _prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!_prismaInstance) {
    _prismaInstance =
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    globalForPrisma.prisma = _prismaInstance;
  }
  return _prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
