// Resilient Vercel serverless entrypoint for Kamlesh Ful Bhandar Backend API
let app = null;
let startupError = null;

try {
  const mod = await import('./server-bundle.mjs');
  app = mod.default || mod.app || mod;
} catch (err) {
  startupError = {
    name: err?.name || 'Error',
    message: err?.message || String(err),
    stack: err?.stack || ''
  };
  console.error('Fatal Backend Startup Error:', err);
}

export default function handler(req, res) {
  if (startupError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify(
        {
          success: false,
          status: 'startup_error',
          error: startupError,
          env: {
            nodeVersion: process.version,
            cwd: process.cwd(),
            platform: process.platform,
            hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
            vercel: Boolean(process.env.VERCEL)
          }
        },
        null,
        2
      )
    );
  }

  if (typeof app === 'function') {
    return app(req, res);
  }

  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  return res.end(
    JSON.stringify({
      success: false,
      message: 'App is not a callable request listener'
    })
  );
}

export { handler };
