import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// The Prisma CLI (migrate, db push, studio) connects using `datasource.url`.
// For Supabase this MUST be the direct session connection (port 5432) — the
// transaction pooler (port 6543) does not support the advisory locks that
// migrations require and will hang. The app runtime uses the pooled
// DATABASE_URL via the adapter in src/prisma.ts instead.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
});
