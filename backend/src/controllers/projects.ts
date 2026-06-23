import type { NextFunction, Request, Response } from 'express';

import {
  createProject,
  getProjectById,
  listProjects,
  updateProject,
} from '../services/project.services.js';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema.js';

/** POST /api/projects — client creates a DRAFT project with milestones. */
export const handleCreateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createProjectSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const project = await createProject(req.userId!, result.data);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects — projects the current user may see. */
export const handleListProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projects = await listProjects(req.userId!, req.userRole!);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:id */
export const handleGetProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const result = await getProjectById(
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

/** PATCH /api/projects/:id — edit DRAFT project (client owner only). */
export const handleUpdateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = updateProjectSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    if (
      result.data.title === undefined &&
      result.data.description === undefined
    ) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const projectId = String(req.params.id);
    const project = await updateProject(
      projectId,
      req.userId!,
      result.data,
    );

    if (project === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (project === 'not_editable') {
      res.status(409).json({
        error: 'Project can only be edited while status is DRAFT',
      });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};
