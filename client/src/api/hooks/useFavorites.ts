import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { favoritesApi } from "@/api/favorites"
import { queryKeys } from "@/api/queryKeys"

export function useFavoritesQuery() {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: () => favoritesApi.getFavorites(),
  })
}

export function useToggleFileStarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => favoritesApi.toggleFileStar(fileId),
    onMutate: async (fileId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all })

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(queryKeys.favorites.all)

      // Optimistically update the isStarred status
      queryClient.setQueryData(queryKeys.favorites.all, (old: any) => {
        if (!old) return old
        return old.map((item: any) => {
          if (item.id === fileId || item.uid === fileId) {
            return { ...item, isStarred: !item.isStarred }
          }
          return item
        })
      })

      return { previousFavorites }
    },
    onError: (_err, _fileId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.all, context.previousFavorites)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}

export function useToggleFolderStarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => favoritesApi.toggleFolderStar(folderId),
    onMutate: async (folderId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all })

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(queryKeys.favorites.all)

      // Optimistically update the isStarred status
      queryClient.setQueryData(queryKeys.favorites.all, (old: any) => {
        if (!old) return old
        return old.map((item: any) => {
          if (item.id === folderId) {
            return { ...item, isStarred: !item.isStarred }
          }
          return item
        })
      })

      return { previousFavorites }
    },
    onError: (_err, _folderId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.all, context.previousFavorites)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}
