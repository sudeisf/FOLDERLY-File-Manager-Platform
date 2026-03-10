import { apiClient } from "@/api/http"

export type SharedItem = {
  type: "file" | "folder"
  id: string
  name: string
  parentId?: string | null
  isStarred?: boolean
  uid?: string
  size?: number
  folderId?: string | null
  url?: string
  owner: {
    id: string
    username: string
    email: string
  }
  sharedAt: string
}

export type ShareWithUsersPayload = {
  emails?: string[]
  userIds?: string[]
}

export type ActivityEvent = {
  id: string
  actorId: string
  actorName: string
  itemId: string
  itemType: "file" | "folder"
  event: string
  message: string
  createdAt: string
}

export const sharedApi = {
  async list() {
    const { data } = await apiClient.get<{ items: SharedItem[]; folders: SharedItem[]; files: SharedItem[] }>("/api/shared")
    return data
  },

  async getItemActivity(type: "file" | "folder", id: string) {
    const { data } = await apiClient.get<{ activities: ActivityEvent[] }>(`/api/shared/${type}/${id}/activity`)
    return data.activities
  },

  async shareFolderWithUsers(folderId: string, payload: ShareWithUsersPayload) {
    const { data } = await apiClient.post<{
      success: boolean
      message: string
      folderId: string
      sharedWithUserIds: string[]
      recipients: Array<{ id: string; username: string; email: string }>
    }>(`/api/shared/folders/${folderId}/share-with`, payload)
    return data
  },
}
