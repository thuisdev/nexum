import { Router } from 'express';

import {
  handleListNotifications,
  handleMarkNotificationRead,
  handleDeleteNotification,
  handleMarkProjectNotificationsRead,
  handleCountUnreadNotifications,
} from '../controllers/notifications.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', checkAuth, handleListNotifications);
router.get('/unread-count', checkAuth, handleCountUnreadNotifications);
router.post('/mark-project-read', checkAuth, handleMarkProjectNotificationsRead);
router.patch('/:id/read', checkAuth, handleMarkNotificationRead);
router.delete('/:id', checkAuth, handleDeleteNotification);

export default router;
