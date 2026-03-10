import { useQuery } from "@tanstack/react-query"

import { foldersApi } from "@/api/folders"
import { queryKeys } from "@/api/queryKeys"

export const useFoldersQuery = () => {
  return useQuery({
    queryKey: queryKeys.folders,
    queryFn: foldersApi.list,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
