import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // Comma-separated list of allowed origins, or "*" for any. In production on
  // Vercel the frontend is same-origin, so CORS is effectively a no-op.
  CORS_ORIGIN: z.string().default("*"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  // Throw instead of process.exit so the error surfaces as a 500 in a
  // serverless environment (and doesn't hard-kill the build) while still
  // crashing a locally-run `tsx` server loudly.
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
