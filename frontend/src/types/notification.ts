export interface Notification {
  id: string
  type: string
  message: string
  projectId: string | null
  readAt: string | null
  createdAt: string
}
