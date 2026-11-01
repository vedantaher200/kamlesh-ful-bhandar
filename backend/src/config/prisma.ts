import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/client/index.js';

// Ensure the Prisma query engine is explicitly located in serverless environments (Vercel)
const ensureQueryEngine = () => {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY && fs.existsSync(process.env.PRISMA_QUERY_ENGINE_LIBRARY)) {
    return;
  }

  const isWindows = process.platform === 'win32';
  const engineNames = isWindows
    ? ['query_engine-windows.dll.node']
    : [
        'libquery_engine-rhel-openssl-3.0.x.so.node',
        'libquery_engine-rhel-openssl-1.0.x.so.node',
        'libquery_engine-debian-openssl-3.0.x.so.node'
      ];


  const searchRoots = [
    process.cwd(),
    path.join(process.cwd(), 'backend'),
    path.join(process.cwd(), 'backend/api'),
    path.join(process.cwd(), 'backend/src/generated/client'),
    path.join(process.cwd(), 'src/generated/client'),
    '/var/task',
    '/var/task/backend',
    '/var/task/backend/api',
    '/var/task/backend/src/generated/client',
    '/var/task/src/generated/client',
    typeof __dirname !== 'undefined' ? __dirname : '',
    typeof __dirname !== 'undefined' ? path.join(__dirname, '..') : '',
    typeof __dirname !== 'undefined' ? path.join(__dirname, '../src/generated/client') : ''
  ].filter(Boolean);

  let foundPath: string | null = null;
  for (const root of searchRoots) {
    for (const name of engineNames) {
      const candidate = path.join(root, name);
      try {
        if (fs.existsSync(candidate)) {
          foundPath = candidate;
          break;
        }
      } catch {}
    }
    if (foundPath) break;
  }

  if (foundPath) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = foundPath;
    console.log(`[Prisma] Query engine located at: ${foundPath}`);

    // If on Linux/Vercel and /tmp is writable, also seed /tmp/prisma-engines for Prisma's fallback
    if (process.platform === 'linux') {
      try {
        const tmpDir = '/tmp/prisma-engines';
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const tmpTarget = path.join(tmpDir, path.basename(foundPath));
        if (!fs.existsSync(tmpTarget)) {
          fs.copyFileSync(foundPath, tmpTarget);
        }
      } catch {}
    }
  }
};

ensureQueryEngine();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [Prisma] DATABASE_URL environment variable is not set. Ensure it is defined in your Vercel Project Settings.');
} else if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
  console.warn('⚠️ [Prisma] DATABASE_URL points to localhost. Cloud deployments require a hosted PostgreSQL URL (e.g., Neon, Supabase).');
}

let _prismaInstance: PrismaClient | null = null;


function getPrismaClient(): PrismaClient {
  if (!_prismaInstance) {
    if (globalForPrisma.prisma) {
      _prismaInstance = globalForPrisma.prisma;
    } else {
      let dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        if (dbUrl.includes('?sslmode') && !dbUrl.includes('sslmode=')) {
          dbUrl = dbUrl.replace(/\?sslmode.*$/, '?sslmode=require');
        } else if (!dbUrl.includes('sslmode=')) {
          dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
        }
      }
      _prismaInstance = new PrismaClient({
        datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
      globalForPrisma.prisma = _prismaInstance;
    }
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
