// Resilient Vercel serverless entrypoint for Kamlesh Ful Bhandar Backend API
import app from './server-bundle.mjs';

// If PORT is provided (e.g. Vercel Express service or standalone node), start listening on it
const port = process.env.PORT || (!process.env.VERCEL ? 5000 : null);
if (port && app && typeof app.listen === 'function') {
  app.listen(port, () => {
    console.log(`🌸 Kamlesh Ful Bhandar Backend API listening on port ${port}`);
  });
}

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled request error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          success: false,
          message: err?.message || 'Internal Server Error',
          stack: err?.stack || ''
        },
        null,
        2
      )
    );
  }
}

export { handler, app };
