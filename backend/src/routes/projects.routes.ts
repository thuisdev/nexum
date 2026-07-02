import { Router } from 'express';

import {
  handleListArbiterDisputes,
  handleListProjectDisputes,
  handleOpenDispute,
  handleResolveDispute,
} from '../controllers/disputes.js';
import {
  handleAcceptInvite,
  handleAppendMilestones,
  handleCreateProject,
  handleDeclineInvite,
  handleDeleteProject,
  handleFundProject,
  handleGetProject,
  handleGetProjectActivity,
  handleGetProjectPreview,
  handleInviteProject,
  handleListProjects,
  handleUpdateProject,
} from '../controllers/projects.js';
import {
  handleApplyToProject,
  handleGetMyApplication,
  handleListProjectApplications,
  handleWithdrawApplication,
} from '../controllers/applications.js';
import {
  handleCreateProjectReview,
  handleGetMyProjectReview,
} from '../controllers/reviews.js';
import { checkAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', checkAuth, requireRole('CLIENT'), handleCreateProject);
router.get('/', checkAuth, handleListProjects);
router.get('/disputes/assigned', checkAuth, requireRole('ARBITER', 'ADMIN'), handleListArbiterDisputes);
router.get('/:id/preview', handleGetProjectPreview);
router.post('/:id/invite', checkAuth, requireRole('CLIENT'), handleInviteProject);
router.post('/:id/accept', checkAuth, requireRole('FREELANCER'), handleAcceptInvite);
router.post('/:id/decline', checkAuth, requireRole('FREELANCER'), handleDeclineInvite);
router.post('/:id/apply', checkAuth, requireRole('FREELANCER'), handleApplyToProject);
router.delete(
  '/:id/my-application',
  checkAuth,
  requireRole('FREELANCER'),
  handleWithdrawApplication,
);
router.get(
  '/:id/applications',
  checkAuth,
  requireRole('CLIENT', 'ADMIN'),
  handleListProjectApplications,
);
router.get(
  '/:id/my-application',
  checkAuth,
  requireRole('FREELANCER'),
  handleGetMyApplication,
);
router.post('/:id/fund', checkAuth, requireRole('CLIENT'), handleFundProject);
router.post('/:id/review', checkAuth, handleCreateProjectReview);
router.get('/:id/my-review', checkAuth, handleGetMyProjectReview);
router.post('/:id/milestones', checkAuth, requireRole('CLIENT'), handleAppendMilestones);
router.get('/:id/activity', checkAuth, handleGetProjectActivity);
router.get('/:id/disputes', checkAuth, handleListProjectDisputes);
router.post('/:id/disputes', checkAuth, handleOpenDispute);
router.post('/disputes/:disputeId/resolve', checkAuth, requireRole('ARBITER', 'ADMIN'), handleResolveDispute);
router.get('/:id', checkAuth, handleGetProject);
router.patch('/:id', checkAuth, requireRole('CLIENT'), handleUpdateProject);
router.delete('/:id', checkAuth, requireRole('CLIENT'), handleDeleteProject);

export default router;
