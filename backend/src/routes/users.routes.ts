import { Router } from 'express';

import { handleGetPublicProfile, handleUpdateUser } from '../controllers/users.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:id/public', handleGetPublicProfile);
router.patch('/me', checkAuth, handleUpdateUser);

export default router;
