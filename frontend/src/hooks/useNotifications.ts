import {
  deleteNotification,
  listNotifications,
  markNotificationRead,
} from '@/lib/notifications.api'
import { formatRelativeTime } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '@/types/notification'

export function useNotifications(enabled = true) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const fetchGen = useRef(0)

  if (!enabled && notifications.length > 0) {
    setNotifications([])
  }
  if (!enabled && loading) {
    setLoading(false)
  }

  const load = useCallback(async (gen: number) => {
    try {
      const data = await listNotifications()
      if (gen !== fetchGen.current) return
      setNotifications(data)
    } catch {
      if (gen !== fetchGen.current) return
      setNotifications([])
    } finally {
      if (gen === fetchGen.current) setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled) return
    const gen = ++fetchGen.current
    setLoading(true)
    await load(gen)
  }, [enabled, load])

  useEffect(() => {
    if (!enabled) {
      fetchGen.current += 1
      return
    }

    const gen = ++fetchGen.current
    void load(gen)
    return () => {
      fetchGen.current += 1
    }
  }, [enabled, load])

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
      if (notification.type === 'APPLICATION_RECEIVED') {
        navigate(`${ROUTES.project(notification.projectId)}?applications=1`)
        return
      }

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
