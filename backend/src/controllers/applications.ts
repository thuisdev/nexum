import type { NextFunction, Request, Response } from 'express';

import {
  acceptApplication,
  applyToProject,
  getMyApplicationForProject,
  listMyApplications,
  listProjectApplications,
  rejectApplication,
  withdrawApplication,
} from '../services/application.services.js';
import { applyToProjectSchema } from '../schemas/application.schema.js';

/** POST /api/projects/:id/apply — freelancer applies with a pitch. */
export const handleApplyToProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = applyToProjectSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const projectId = String(req.params.id);
    const application = await applyToProject(
      projectId,
      req.userId!,
      result.data,
    );

    if (application === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (application === 'not_public') {
      res.status(403).json({ error: 'Project is not open for applications' });
      return;
    }

    if (application === 'not_open') {
      res.status(409).json({
        error: 'Applications are only allowed while project is open',
      });
      return;
    }

    if (application === 'freelancer_already_assigned') {
      res.status(409).json({ error: 'Project already has a freelancer' });
      return;
    }

    if (application === 'own_project') {
      res.status(400).json({ error: 'You cannot apply to your own project' });
      return;
    }

    if (application === 'already_applied') {
      res.status(409).json({ error: 'You already have a pending application' });
      return;
    }

    if (application === 'already_accepted') {
      res.status(409).json({ error: 'Your application was already accepted' });
      return;
    }

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:id/applications — client lists pending applications. */
export const handleListProjectApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const applications = await listProjectApplications(projectId, req.userId!);

    if (applications === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (applications === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:id/my-application — freelancer's application on this project. */
export const handleGetMyApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const application = await getMyApplicationForProject(
      projectId,
      req.userId!,
    );

    res.json(application);
  } catch (error) {
    next(error);
  }
};

/** GET /api/applications/me — freelancer's applications with project summary. */
export const handleListMyApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await listMyApplications(req.userId!);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

/** POST /api/applications/:id/accept — client accepts an application. */
export const handleAcceptApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.id);
    const project = await acceptApplication(applicationId, req.userId!);

    if (project === null) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (project === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (project === 'not_pending') {
      res.status(409).json({ error: 'Application is not pending' });
      return;
    }

    if (project === 'not_open') {
      res.status(409).json({
        error: 'Application can only be accepted while project is open',
      });
      return;
    }

    if (project === 'freelancer_already_assigned') {
      res.status(409).json({ error: 'Project already has a freelancer' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/applications/:id/reject — client rejects an application. */
export const handleRejectApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.id);
    const application = await rejectApplication(applicationId, req.userId!);

    if (application === null) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (application === 'not_pending') {
      res.status(409).json({ error: 'Application is not pending' });
      return;
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/projects/:id/my-application — freelancer withdraws pending application. */
export const handleWithdrawApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const result = await withdrawApplication(projectId, req.userId!);

    if (result === null) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (result === 'not_pending') {
      res.status(409).json({ error: 'Only pending applications can be withdrawn' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};
