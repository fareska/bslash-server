import type { Request, Response } from "express";
import type { FilterRegistry } from "../filters/registry.js";

export function createFiltersController(registry: FilterRegistry) {
  return (_req: Request, res: Response): void => {
    res.json({
      filters: registry.list().map((f) => ({ name: f.name, description: f.description })),
    });
  };
}
