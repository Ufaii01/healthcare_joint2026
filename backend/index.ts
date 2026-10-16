import { createApp } from "./app.ts";
import { env } from "./config/env.ts";

const app = createApp();

const HOST = "0.0.0.0";
const server = app.listen(env.PORT, HOST, () => {
  console.log(`Auth server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
