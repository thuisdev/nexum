import type { NextFunction, Request, Response } from 'express';

import {
  acceptInvite,
  appendMilestones,
  createProject,
  deleteProject,
  fundProject,
  getProjectActivity,
  getProjectById,
  getProjectPreview,
  inviteFreelancer,
  listProjects,
  listPublicJobs,
  updateProject,
} from '../services/project.services.js';
import {
  appendMilestonesSchema,
  createProjectSchema,
  inviteFreelancerSchema,
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

/** GET /api/projects/:id/preview — public preview (no auth). */
export const handleGetProjectPreview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const project = await getProjectPreview(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found or not public' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** GET /api/jobs — public job board listings. */
export const handleListJobs = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobs = await listPublicJobs();
    res.json(jobs);
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

    if (Object.keys(result.data).length === 0) {
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
        error: 'Project can only be edited while DRAFT and not funded',
      });
      return;
    }

    if (project === 'freelancer_assigned') {
      res.status(409).json({
        error: 'Project can only be edited before a freelancer is assigned',
      });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/projects/:id/milestones — append milestones (freelancer assigned). */
export const handleAppendMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = appendMilestonesSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const projectId = String(req.params.id);
    const project = await appendMilestones(
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
        error: 'Milestones can only be added while DRAFT and not funded',
      });
      return;
    }

    if (project === 'no_freelancer') {
      res.status(409).json({
        error: 'Assign a freelancer before adding milestones this way',
      });
      return;
    }

    if (project === 'milestones_in_progress') {
      res.status(409).json({
        error: 'Cannot add milestones after work has started',
      });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:id/activity — project activity log. */
export const handleGetProjectActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const result = await getProjectActivity(
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

/** POST /api/projects/:id/invite — client invites freelancer by email. */
export const handleInviteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = inviteFreelancerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const projectId = String(req.params.id);
    const project = await inviteFreelancer(
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

    if (project === 'not_draft') {
      res.status(409).json({
        error: 'Invites are only allowed while project status is DRAFT',
      });
      return;
    }

    if (project === 'freelancer_already_assigned') {
      res.status(409).json({ error: 'Project already has a freelancer' });
      return;
    }

    if (project === 'freelancer_not_found') {
      res.status(404).json({ error: 'Freelancer not found' });
      return;
    }

    if (project === 'not_freelancer_role') {
      res.status(400).json({ error: 'User is not a freelancer' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/projects/:id/accept — invited freelancer accepts. */
export const handleAcceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const project = await acceptInvite(projectId, req.userId!);

    if (project === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (project === 'not_draft') {
      res.status(409).json({
        error: 'Invite can only be accepted while project status is DRAFT',
      });
      return;
    }

    if (project === 'already_accepted') {
      res.status(409).json({ error: 'Invite already accepted' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/projects/:id/fund — client funds escrow (simulated). */
export const handleFundProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const project = await fundProject(projectId, req.userId!);

    if (project === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (project === 'not_draft') {
      res.status(409).json({
        error: 'Project can only be funded while status is DRAFT',
      });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/projects/:id — remove DRAFT project (no freelancer assigned). */
export const handleDeleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.params.id);
    const result = await deleteProject(projectId, req.userId!);

    if (result === null) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (result === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (result === 'not_deletable') {
      res.status(409).json({
        error: 'Project can only be deleted while DRAFT and not funded',
      });
      return;
    }

    if (result === 'freelancer_assigned') {
      res.status(409).json({
        error: 'Project can only be deleted before a freelancer is assigned',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};
