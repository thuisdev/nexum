import { Router } from 'express';

import {
  handleAcceptInvite,
  handleCreateProject,
  handleFundProject,
  handleGetProject,
  handleGetProjectPreview,
  handleInviteProject,
  handleListProjects,
  handleUpdateProject,
} from '../controllers/projects.js';
import { checkAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', checkAuth, requireRole('CLIENT'), handleCreateProject);
router.get('/', checkAuth, handleListProjects);
router.get('/:id/preview', handleGetProjectPreview);
router.post('/:id/invite', checkAuth, requireRole('CLIENT'), handleInviteProject);
router.post('/:id/accept', checkAuth, requireRole('FREELANCER'), handleAcceptInvite);
router.post('/:id/fund', checkAuth, requireRole('CLIENT'), handleFundProject);
router.get('/:id', checkAuth, handleGetProject);
router.patch('/:id', checkAuth, requireRole('CLIENT'), handleUpdateProject);

export default router;
