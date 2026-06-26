import type { NextFunction, Request, Response } from 'express';

import { toPublicFileUrl } from '../lib/upload.js';
import { getProjectById } from '../services/project.services.js';
import {
  approveMilestone,
  submitMilestone,
} from '../services/milestone.services.js';
import { submitMilestoneSchema } from '../schemas/milestone.schema.js';

const loadProjectResponse = async (
  projectId: string,
  userId: string,
  userRole: string,
  res: Response,
) => {
  const project = await getProjectById(
    projectId,
    userId,
    userRole as Parameters<typeof getProjectById>[2],
  );

  if (project === null) {
    res.status(404).json({ error: 'Project not found' });
    return null;
  }

  if (project === 'forbidden') {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return project;
};

/** POST /api/milestones/:id/submit — freelancer delivers work (optional file). */
export const handleSubmitMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = submitMilestoneSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const milestoneId = String(req.params.id);
    const file = req.file;
    const fileUrl = file ? toPublicFileUrl(file.filename) : null;

    const outcome = await submitMilestone(
      milestoneId,
      req.userId!,
      result.data,
      fileUrl,
    );

    if (outcome === null) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    if (outcome === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (outcome === 'invalid_status') {
      res.status(409).json({
        error: 'Milestone must be IN_PROGRESS to submit',
      });
      return;
    }

    if (outcome === 'project_not_active') {
      res.status(409).json({
        error: 'Project must be IN_PROGRESS to submit work',
      });
      return;
    }

    const project = await loadProjectResponse(
      outcome.projectId,
      req.userId!,
      req.userRole!,
      res,
    );
    if (!project) return;

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/milestones/:id/approve — client approves and releases simulated payout. */
export const handleApproveMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const milestoneId = String(req.params.id);
    const outcome = await approveMilestone(milestoneId, req.userId!);

    if (outcome === null) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    if (outcome === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (outcome === 'invalid_status') {
      res.status(409).json({
        error: 'Milestone must be SUBMITTED to approve',
      });
      return;
    }

    if (outcome === 'project_not_active') {
      res.status(409).json({
        error: 'Project must be IN_PROGRESS to approve milestones',
      });
      return;
    }

    const project = await loadProjectResponse(
      outcome.projectId,
      req.userId!,
      req.userRole!,
      res,
    );
    if (!project) return;

    res.json({ ...project, payoutTxRef: outcome.payoutTxRef });
  } catch (error) {
    next(error);
  }
};
