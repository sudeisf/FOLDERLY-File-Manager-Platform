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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}

export function useToggleFolderStarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => favoritesApi.toggleFolderStar(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}
