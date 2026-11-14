import { Router } from 'express';

import {
  handleApproveMilestone,
  handleDownloadMilestoneAttachment,
  handleReturnMilestone,
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

router.get(
  '/:id/attachment',
  checkAuth,
  handleDownloadMilestoneAttachment,
);

router.post(
  '/:id/approve',
  checkAuth,
  requireRole('CLIENT'),
  handleApproveMilestone,
);

router.post(
  '/:id/return',
  checkAuth,
  requireRole('CLIENT'),
  handleReturnMilestone,
);

export default router;
