import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"

import { filesApi } from "@/api/files"
import { foldersApi } from "@/api/folders"
import { queryKeys } from "@/api/queryKeys"
import { shareApi } from "@/api/share"

type UploadVariables = {
  file: File
  folderName: string
  onUploadProgress?: (event: AxiosProgressEvent) => void
}

export const useCreateFolderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: foldersApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
}

export const useUploadFileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, folderName, onUploadProgress }: UploadVariables) =>
      filesApi.upload({ file, folderName, onUploadProgress }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
}

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ folderName, fileUid }: { folderName: string; fileUid: string }) => filesApi.delete(folderName, fileUid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
}

export const useShareFolderMutation = () => {
  return useMutation({
    mutationFn: (folderId: string) => shareApi.generateFolderLink(folderId),
  })
}
