// Central Vercel serverless entrypoint for Kamlesh Ful Bhandar API
process.env.VERCEL = process.env.VERCEL || '1';
import app from '../backend/server-bundle.mjs';

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled Serverless API Error:', err);
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
