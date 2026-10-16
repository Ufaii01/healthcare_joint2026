// Vercel serverless entry. Wraps the existing Express app so the whole
// backend runs as a single serverless function. Vercel's @vercel/node
// builder accepts an Express app as the default export and passes each
// incoming (req, res) to it.
import { createApp } from "../backend/app.ts";

const app = createApp();

export default app;
