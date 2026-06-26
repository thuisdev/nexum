import { Router } from 'express';

import {
  handleApproveMilestone,
  handleSubmitMilestone,
} from '../controllers/milestones.js';
import { checkAuth, requireRole } from '../middleware/auth.middleware.js';
import { submitUpload } from '../lib/upload.js';

const router = Router();

router.post(
  '/:id/submit',
  checkAuth,
  requireRole('FREELANCER'),
  submitUpload.single('file'),
  handleSubmitMilestone,
);

router.post(
  '/:id/approve',
  checkAuth,
  requireRole('CLIENT'),
  handleApproveMilestone,
);

export default router;
