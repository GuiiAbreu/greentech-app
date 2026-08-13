import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { uploadsRoot } from "./config/uploads.js";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use("/uploads", express.static(uploadsRoot));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use(routes);
  app.use(errorMiddleware);

  return app;
}

