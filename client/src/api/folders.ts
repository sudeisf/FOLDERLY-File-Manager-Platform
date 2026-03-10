import { apiClient } from "@/api/http"
import type { FolderItem } from "@/features/file-manager/types"

export const foldersApi = {
  async list() {
    const { data } = await apiClient.get<FolderItem[]>("/api/folders/folder-list")
    return data
  },

  async listNames() {
    const { data } = await apiClient.get<string[]>("/api/folders/get-folders-names")
    return data
  },

  async create(name: string) {
    const { data } = await apiClient.post<{ success: boolean; message: string; folderID: string }>(
      "/api/folders/create-folder",
      { name }
    )
    return data
  },
}
