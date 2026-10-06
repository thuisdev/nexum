import {
  countUnreadNotifications,
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const fetchGen = useRef(0)

  if (!enabled && notifications.length > 0) {
    setNotifications([])
  }
  if (!enabled && unreadCount !== 0) {
    setUnreadCount(0)
  }
  if (!enabled && loading) {
    setLoading(false)
  }

  const load = useCallback(async (gen: number) => {
    try {
      const data = await listNotifications()
      if (gen !== fetchGen.current) return
      setNotifications(data)
      setUnreadCount(data.filter((item) => !item.readAt).length)
    } catch {
      if (gen !== fetchGen.current) return
      setNotifications([])
      setUnreadCount(0)
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
    void countUnreadNotifications()
      .then((count) => {
        if (gen !== fetchGen.current) return
        setUnreadCount(count)
      })
      .catch(() => {
        if (gen !== fetchGen.current) return
        setUnreadCount(0)
      })

    return () => {
      fetchGen.current += 1
    }
  }, [enabled])

  const visibleNotifications = enabled ? notifications : []

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
        setUnreadCount((count) => Math.max(0, count - 1))
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
    const target = notifications.find((item) => item.id === notificationId)
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
      if (target && !target.readAt) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
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
