import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { sharedApi, type ShareWithUsersPayload } from "@/api/shared"

export const useItemActivityQuery = (type: "file" | "folder" | null, id: string | null) => {
  return useQuery({
    queryKey: ["shared-activity", type, id],
    queryFn: () => sharedApi.getItemActivity(type!, id!),
    enabled: !!type && !!id,
    staleTime: 30_000,
  })
}

export const useMyActivityQuery = () => {
  return useQuery({
    queryKey: ["my-activity"],
    queryFn: () => sharedApi.getMyActivity(),
    staleTime: 30_000,
  })
}

export const useSharedItemsQuery = () => {
  return useQuery({
    queryKey: queryKeys.shared.items,
    queryFn: sharedApi.list,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export const useShareFolderWithUsersMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: ShareWithUsersPayload }) =>
      sharedApi.shareFolderWithUsers(folderId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.shared.items })
    },
  })
}
