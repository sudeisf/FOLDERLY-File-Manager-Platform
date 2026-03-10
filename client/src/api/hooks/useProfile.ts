import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { profileApi, type UpdateProfilePayload } from "@/api/profile"
import { queryKeys } from "@/api/queryKeys"

export const useMyProfileQuery = () => {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: profileApi.getMyProfile,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export const useUpdateMyProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateMyProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.me })
    },
  })
}

export const useUploadMyAvatarMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadMyAvatar(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.me })
    },
  })
}