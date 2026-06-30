import type { NextFunction, Request, Response } from 'express';

import {
  listNotifications,
  markNotificationRead,
  deleteNotification,
  markProjectNotificationsRead,
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

/** DELETE /api/notifications/:id */
export const handleDeleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notificationId = String(req.params.id);
    const result = await deleteNotification(notificationId, req.userId!);

    if (result === null) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    if (result === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/** POST /api/notifications/mark-project-read */
export const handleMarkProjectNotificationsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = String(req.body?.projectId ?? '');
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const result = await markProjectNotificationsRead(projectId, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
