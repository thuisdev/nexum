import { prisma } from '../lib/prisma.js';

export const listNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    message: notification.message,
    projectId: notification.projectId,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  }));
};

export const markNotificationRead = async (
  notificationId: string,
  userId: string,
) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    return null;
  }

  if (notification.userId !== userId) {
    return 'forbidden' as const;
  }

  if (notification.readAt) {
    return notification;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
};

export const countUnreadNotifications = async (userId: string) =>
  prisma.notification.count({
    where: { userId, readAt: null },
  });
