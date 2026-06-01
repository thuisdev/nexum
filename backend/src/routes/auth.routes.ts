import { Router } from 'express';
import { loginHandler, registerHandler, meHandler } from '../controllers/auth.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', checkAuth, meHandler)

export default router;
