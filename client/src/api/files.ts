import type { AxiosProgressEvent } from "axios"

import { apiClient } from "@/api/http"

type UploadInput = {
  file: File
  folderName: string
  onUploadProgress?: (event: AxiosProgressEvent) => void
}

export const filesApi = {
  async upload({ file, folderName, onUploadProgress }: UploadInput) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folderName)

    const { data } = await apiClient.post<{ message: string }>("/api/files/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    })

    return data
  },

  async delete(folderName: string, fileUid: string) {
    const { data } = await apiClient.delete<string>(
      `/api/files/delete/${encodeURIComponent(folderName)}/${encodeURIComponent(fileUid)}`
    )
    return data
  },
}
