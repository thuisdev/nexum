import type { NextFunction, Request, Response } from 'express';

import {
  listNotifications,
  markNotificationRead,
} from '../services/notification.services.js';

/** GET /api/notifications */
export const handleListNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notifications = await listNotifications(req.userId!);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/notifications/:id/read */
export const handleMarkNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notificationId = String(req.params.id);
    const result = await markNotificationRead(notificationId, req.userId!);

    if (result === null) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    if (result === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({
      id: result.id,
      readAt: result.readAt?.toISOString() ?? null,
    });
  } catch (error) {
    next(error);
  }
};
