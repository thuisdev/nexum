import type { NextFunction, Request, Response } from 'express';

import {
  listArbiterDisputes,
  listProjectDisputes,
  openDispute,
  resolveDispute,
} from '../services/dispute.services.js';
import {
  openDisputeSchema,
  resolveDisputeSchema,
} from '../schemas/dispute.schema.js';

export const handleListProjectDisputes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const result = await listProjectDisputes(
      projectId,
      req.userId!,
      req.userRole!,
    );

    if (result === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (result === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleOpenDispute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = openDisputeSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const projectId = String(req.params.id);
    const dispute = await openDispute(
      projectId,
      req.userId!,
      req.userRole!,
      result.data,
    );

    if (dispute === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (dispute === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (dispute === 'not_in_progress') {
      res.status(409).json({
        error: 'Disputes are only available on funded, active projects',
      });
      return;
    }

    if (dispute === 'milestone_not_found') {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    if (dispute === 'dispute_already_open') {
      res.status(409).json({ error: 'This project already has an open dispute' });
      return;
    }

    if (dispute === 'client_cannot_dispute') {
      res.status(409).json({
        error: 'Disputes can be opened on active or submitted milestones',
      });
      return;
    }

    if (dispute === 'freelancer_cannot_dispute') {
      res.status(409).json({
        error: 'Disputes can be opened on active or submitted milestones',
      });
      return;
    }

    res.status(201).json(dispute);
  } catch (error) {
    next(error);
  }
};

export const handleResolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = resolveDisputeSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const disputeId = String(req.params.disputeId);
    const dispute = await resolveDispute(
      disputeId,
      req.userId!,
      req.userRole!,
      result.data,
    );

    if (dispute === null) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    if (dispute === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (dispute === 'already_resolved') {
      res.status(409).json({ error: 'Dispute is already resolved' });
      return;
    }

    res.json(dispute);
  } catch (error) {
    next(error);
  }
};

export const handleListArbiterDisputes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listArbiterDisputes(req.userId!, req.userRole!);

    if (result === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};
