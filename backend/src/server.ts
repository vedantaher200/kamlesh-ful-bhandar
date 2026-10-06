import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { prisma } from './config/prisma.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Mount Central API Routes
app.use('/api', apiRouter);

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
