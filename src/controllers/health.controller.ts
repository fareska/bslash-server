import type { Request, Response } from "express";
import { HealthStatus } from "../constants/api.js";

export function createHealthController() {
  return (_req: Request, res: Response): void => {
    res.json({ status: HealthStatus.OK });
  };
}
