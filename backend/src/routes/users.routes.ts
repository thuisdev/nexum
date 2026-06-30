import { Router } from 'express';

import {
  handleGetPublicProfile,
  handleGetUserReviews,
  handleUpdateUser,
  handleUploadAvatar,
} from '../controllers/users.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { avatarUpload } from '../lib/upload.js';

const router = Router();

router.get('/:id/public', handleGetPublicProfile);
router.get('/:id/reviews', handleGetUserReviews);
router.patch('/me', checkAuth, handleUpdateUser);
router.post(
  '/me/avatar',
  checkAuth,
  avatarUpload.single('avatar'),
  handleUploadAvatar,
);

export default router;
