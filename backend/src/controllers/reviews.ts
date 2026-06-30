import type { NextFunction, Request, Response } from 'express';

import { createReviewSchema } from '../schemas/review.schema.js';
import {
  createProjectReview,
  getMyProjectReview,
} from '../services/review.services.js';

/** POST /api/projects/:id/review — leave a review after project completion. */
export const handleCreateProjectReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createReviewSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const projectId = String(req.params.id);
    const review = await createProjectReview(
      projectId,
      req.userId!,
      result.data,
    );

    if (review === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (review === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (review === 'not_completed') {
      res.status(409).json({ error: 'Reviews are only allowed after project completion' });
      return;
    }

    if (review === 'no_counterparty') {
      res.status(409).json({ error: 'No counterparty to review' });
      return;
    }

    if (review === 'already_reviewed') {
      res.status(409).json({ error: 'You already reviewed this project' });
      return;
    }

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:id/my-review — current user's review on this project. */
export const handleGetMyProjectReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const review = await getMyProjectReview(projectId, req.userId!);
    res.json(review);
  } catch (error) {
    next(error);
  }
};
