import {
  deleteNotification,
  listNotifications,
  markNotificationRead,
} from '@/lib/notifications.api'
import { formatRelativeTime } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '@/types/notification'

export function useNotifications(enabled = true) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const data = await listNotifications()
      setNotifications(data)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch notifications on mount
    void refresh()
  }, [refresh, enabled])

  const visibleNotifications = enabled ? notifications : []
  const unreadCount = visibleNotifications.filter((n) => !n.readAt).length

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: new Date().toISOString() }
              : item,
          ),
        )
      } catch {
        // still navigate if possible
      }
    }

    if (notification.projectId) {
      navigate(ROUTES.project(notification.projectId))
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
    } catch {
      // ignore
    }
  }

  const items = visibleNotifications.map((notification) => ({
    id: notification.id,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    unread: !notification.readAt,
    onClick: () => void handleNotificationClick(notification),
    onDelete: () => void handleDelete(notification.id),
  }))

  return { items, unreadCount, loading, refresh }
}
