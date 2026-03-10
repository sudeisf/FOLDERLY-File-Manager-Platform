import { apiClient } from "@/api/http"

export type FavoriteItem = {
  type: "file" | "folder"
  id: string
  name: string
  uid?: string
  url?: string
  size?: number
  folderId?: string
  parentId?: string
  updatedAt?: string
  createdAt?: string
}

export type ToggleStarResponse = {
  success: boolean
  message: string
  file?: {
    id: string
    name: string
    isStarred: boolean
    updatedAt: string
  }
  folder?: {
    id: string
    name: string
    isStarred: boolean
    updatedAt: string
  }
}

export const favoritesApi = {
  async getFavorites() {
    const { data } = await apiClient.get<FavoriteItem[]>("/api/favorites")
    return data
  },

  async toggleFileStar(fileId: string) {
    const { data } = await apiClient.put<ToggleStarResponse>(`/api/files/${fileId}/star`)
    return data
  },

  async toggleFolderStar(folderId: string) {
    const { data } = await apiClient.put<ToggleStarResponse>(`/api/folders/${folderId}/star`)
    return data
  },
}
