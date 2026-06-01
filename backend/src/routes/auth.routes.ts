import { Router } from 'express';
import { loginHandler, registerHandler } from '../controllers/auth.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
