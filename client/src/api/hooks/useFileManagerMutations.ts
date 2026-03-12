import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"

import { filesApi } from "@/api/files"
import { favoritesApi } from "@/api/favorites"
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

export const useToggleFileStarMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => favoritesApi.toggleFileStar(fileId),
    onMutate: async (fileId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.folders })

      // Snapshot the previous value
      const previousFolders = queryClient.getQueryData(queryKeys.folders)

      // Optimistically update the isStarred status
      queryClient.setQueryData(queryKeys.folders, (old: any) => {
        if (!old) return old
        return old.map((folder: any) => ({
          ...folder,
          files: folder.files?.map((file: any) => {
            const fileKey = file.uid ?? file.id ?? file.name
            if (fileKey === fileId) {
              return { ...file, isStarred: !file.isStarred }
            }
            return file
          }),
        }))
      })

      return { previousFolders }
    },
    onError: (_err, _fileId, context) => {
      // Rollback on error
      if (context?.previousFolders) {
        queryClient.setQueryData(queryKeys.folders, context.previousFolders)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.folders })
      await queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}
