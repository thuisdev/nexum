import { Router } from 'express';

import {
  handleAcceptApplication,
  handleListMyApplications,
  handleRejectApplication,
} from '../controllers/applications.js';
import { checkAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', checkAuth, requireRole('FREELANCER'), handleListMyApplications);
router.post(
  '/:id/accept',
  checkAuth,
  requireRole('CLIENT'),
  handleAcceptApplication,
);
router.post(
  '/:id/reject',
  checkAuth,
  requireRole('CLIENT'),
  handleRejectApplication,
);

export default router;
