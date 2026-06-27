import express, { type Express, type Request, type Response, type NextFunction } from "express";
import type { QueryEngine } from "../services/query.service.js";
import type { FilterRegistry } from "../filters/registry.js";
import { registerRoutes } from "../routes/index.js";
import { AppError, AppErrors, UnknownFilterError } from "../utils/errors.js";
import { log } from "../utils/logger.js";
import { ServerLogMessages } from "../constants/messages.js";

export function createServer(engine: QueryEngine, registry: FilterRegistry): Express {
  const app = express();
  app.use(express.json());

  registerRoutes(app, engine, registry);

  app.use((_req, res) => {
    const err = AppErrors.notFound();
    res.status(err.statusCode).json({ error: err.message });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof UnknownFilterError) {
      return res.status(err.statusCode).json({
        error: err.message,
        unknown: err.unknown,
        available: err.available,
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    log.error(ServerLogMessages.UNHANDLED_ERROR, err);
    const internal = AppErrors.internal();
    res.status(internal.statusCode).json({ error: internal.message });
  });

  return app;
}
