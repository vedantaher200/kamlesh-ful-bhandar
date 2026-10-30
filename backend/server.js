// Kamlesh Ful Bhandar Backend API Entrypoint for Vercel Express
import app from './server-bundle.mjs';

// Export the Express application directly as default (required by Vercel Express framework)
export default app;
export { app };
