import { Router } from 'express';

import { handleUpdateUser } from '../controllers/users.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.patch('/me', checkAuth, handleUpdateUser);

export default router;
