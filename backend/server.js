import express from 'express';

const app = express();

let bundleApp = null;
let loadError = null;

try {
  const mod = await import('./server-bundle.mjs');
  bundleApp = mod.default || mod.app;
} catch (err) {
  loadError = err;
  console.error('CRITICAL: Failed to import server-bundle.mjs:', err);
}

app.all('*', (req, res, next) => {
  if (bundleApp) {
    return bundleApp(req, res, next);
  }
  res.status(500).json({
    status: 'bundle_load_failed',
    message: loadError?.message || 'Bundle app is not loaded',
    stack: loadError?.stack || null,
    code: loadError?.code || null,
    platform: process.platform,
    nodeVersion: process.version,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      isServerless: Boolean(process.env.VERCEL)
    }
  });
});

export default app;
export { app };
