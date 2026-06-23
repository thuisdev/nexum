import { Router } from 'express';

import { handleListJobs } from '../controllers/projects.js';

const router = Router();

router.get('/', handleListJobs);

export default router;
