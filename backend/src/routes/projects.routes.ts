import { Router } from 'express';

import {
  handleCreateProject,
  handleGetProject,
  handleListProjects,
  handleUpdateProject,
} from '../controllers/projects.js';
import { checkAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', checkAuth, requireRole('CLIENT'), handleCreateProject);
router.get('/', checkAuth, handleListProjects);
router.get('/:id', checkAuth, handleGetProject);
router.patch('/:id', checkAuth, requireRole('CLIENT'), handleUpdateProject);

export default router;
