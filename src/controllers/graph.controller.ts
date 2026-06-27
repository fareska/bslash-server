import type { Request, Response } from "express";
import type { QueryEngine } from "../services/query.service.js";

export function createGraphController(engine: QueryEngine) {
  return (_req: Request, res: Response): void => {
    res.json(engine.fullGraph());
  };
}
