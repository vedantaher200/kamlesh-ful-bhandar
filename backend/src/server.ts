import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { prisma } from './config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from all possible locations
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging middleware (without logging sensitive bodies)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN || ''
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is allowed
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev access gracefully
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploaded images statically
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Determine runtime environment
const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NODE_ENV === 'production'
);

// Diagnostics ping endpoints
app.get('/api/ping', (_req, res) => res.json({ status: 'pong', time: new Date().toISOString() }));
app.get('/ping', (_req, res) => res.json({ status: 'pong', time: new Date().toISOString() }));

// Comprehensive diagnostic endpoint to safely inspect runtime and database status
const handleDiag = async (_req: express.Request, res: express.Response) => {
  let dbStatus = 'untested';
  let carCount = 0;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    carCount = await prisma.carDecorationPost.count();
  } catch (err: any) {
    dbStatus = 'disconnected';
    dbError = err.message || String(err);
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      isServerlessRuntime,
      vercel: Boolean(process.env.VERCEL)
    },
    database: {
      status: dbStatus,
      carDecorationPostsCount: carCount,
      error: dbError
    }
  });
};

app.get('/api/diag', handleDiag);
app.get('/diag', handleDiag);

// Health check endpoint
const handleHealth = async (_req: express.Request, res: express.Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Health Check DB Error:', err);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Mount Central API Routes (supports both /api/* and direct path if rewritten)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Catch process-level unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Process Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Process Unhandled Rejection:', reason);
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server in standalone / local environment only (never on serverless)
if (!isServerlessRuntime) {
  const server = app.listen(PORT, () => {
    console.log(`🌸 Kamlesh Ful Bhandar Backend API listening on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  });
}

export default app;
