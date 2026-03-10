import { apiClient } from "@/api/http"

export type NotificationTab = "all" | "unread" | "system"

export type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  metadata?: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export const notificationsApi = {
  async count() {
    const { data } = await apiClient.get<{ unreadCount: number }>("/api/notifications/count")
    return data
  },

  async list(tab: NotificationTab) {
    const { data } = await apiClient.get<NotificationItem[]>("/api/notifications", {
      params: { tab },
    })
    return data
  },

  async markRead(notificationId: string) {
    const { data } = await apiClient.put<NotificationItem>(`/api/notifications/${notificationId}/read`)
    return data
  },

  async markAllRead() {
    const { data } = await apiClient.put<{ success: boolean; updatedCount: number }>("/api/notifications/read-all")
    return data
  },
}
