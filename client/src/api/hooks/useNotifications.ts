import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notificationsApi, type NotificationTab } from "@/api/notifications"
import { queryKeys } from "@/api/queryKeys"

export const useNotificationCountQuery = () => {
  return useQuery({
    queryKey: queryKeys.notifications.count,
    queryFn: notificationsApi.count,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export const useNotificationsQuery = (tab: NotificationTab) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(tab),
    queryFn: () => notificationsApi.list(tab),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count })
    },
  })
}

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count })
    },
  })
}
