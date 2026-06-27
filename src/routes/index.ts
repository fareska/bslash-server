import type { Express } from "express";
import type { QueryEngine } from "../services/query.service.js";
import type { FilterRegistry } from "../filters/registry.js";
import {
  createHealthController,
  createFiltersController,
  createGraphController,
  createRoutesController,
} from "../controllers/index.js";
import { ApiRoutes } from "../constants/api.js";

export function registerRoutes(
  app: Express,
  engine: QueryEngine,
  registry: FilterRegistry,
): void {
  app.get(ApiRoutes.HEALTH, createHealthController());
  app.get(ApiRoutes.FILTERS, createFiltersController(registry));
  app.get(ApiRoutes.GRAPH, createGraphController(engine));
  app.get(ApiRoutes.ROUTES, createRoutesController(engine));
}
