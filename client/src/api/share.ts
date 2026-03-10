import { apiClient } from "@/api/http"

export const shareApi = {
  async generateFolderLink(folderId: string) {
    const { data } = await apiClient.post<{ message: string; link: string }>(`/share/${folderId}`, {})
    return data
  },
}
