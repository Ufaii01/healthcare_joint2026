import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import { membersRoutes } from "./modules/members/members.routes.ts";
import { ordersRoutes } from "./modules/orders/orders.routes.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";

export function createApp() {
  const app = express();

  const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.use(cors({ origin: origins.includes("*") ? true : origins, credentials: true }));
  app.use(express.json({ limit: "3mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/members", membersRoutes);
  app.use("/api/orders", ordersRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
