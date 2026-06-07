import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env from the backend directory (for local dev, Vercel uses dashboard env vars)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', 'backend', '.env') });

// Import the Express app
import app from '../backend/index.js';

export default app;
