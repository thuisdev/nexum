import { Router } from 'express';

import {
  handleListNotifications,
  handleMarkNotificationRead,
} from '../controllers/notifications.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', checkAuth, handleListNotifications);
router.patch('/:id/read', checkAuth, handleMarkNotificationRead);

export default router;
