import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// The Prisma CLI (migrate, db push, studio) connects using `datasource.url`.
// For Supabase this MUST be the direct session connection (port 5432) — the
// transaction pooler (port 6543) does not support the advisory locks that
// migrations require and will hang. The app runtime uses the pooled
// DATABASE_URL via the adapter in src/prisma.ts instead.
//
// We read process.env directly (with a harmless fallback) instead of
// prisma/config's env() helper, which throws when the variable is missing.
// That matters on Vercel: `prisma generate` only needs the schema, not a
// live DB URL, so the build must not fail just because DIRECT_URL is unset.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
