import type { Request, Response } from "express";
import type { QueryEngine } from "../services/query.service.js";
import {
  DEFAULT_MATCH_MODE,
  MatchModes,
  type MatchMode,
} from "../filters/types.js";
import { QueryParams } from "../constants/api.js";

function parseList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
  return raw
    .flatMap((v) => String(v).split(","))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseMatchMode(value: unknown): MatchMode {
  return String(value ?? DEFAULT_MATCH_MODE).toLowerCase() === MatchModes.ANY
    ? MatchModes.ANY
    : MatchModes.ALL;
}

export function createRoutesController(engine: QueryEngine) {
  return (req: Request, res: Response): void => {
    const filterNames = parseList(req.query[QueryParams.FILTERS]);
    const mode = parseMatchMode(req.query[QueryParams.MATCH]);
    const result = engine.query({ filterNames, mode });
    res.json(result);
  };
}
