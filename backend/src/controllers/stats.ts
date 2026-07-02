import type { NextFunction, Request, Response } from 'express';

import { getPlatformStats } from '../services/stats.services.js';

/** GET /api/stats — public platform metrics. */
export const handleGetPlatformStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
