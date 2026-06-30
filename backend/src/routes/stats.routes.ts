import { Router } from 'express';

import { handleGetPlatformStats } from '../controllers/stats.js';

const router = Router();

router.get('/', handleGetPlatformStats);

export default router;
