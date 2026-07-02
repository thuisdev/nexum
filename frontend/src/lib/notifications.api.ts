import { api } from './axiosInteceptor'
import type { Notification } from '@/types/notification'

export const listNotifications = async () => {
  const res = await api.get<Notification[]>('/notifications')
  return res.data
}

export const markNotificationRead = async (notificationId: string) => {
  const res = await api.patch<{ id: string; readAt: string | null }>(
    `/notifications/${notificationId}/read`,
  )
  return res.data
}

export const deleteNotification = async (notificationId: string) => {
  const res = await api.delete<{ id: string }>(`/notifications/${notificationId}`)
  return res.data
}

export const markProjectNotificationsRead = async (projectId: string) => {
  const res = await api.post<{ updated: number }>('/notifications/mark-project-read', {
    projectId,
  })
  return res.data
}
