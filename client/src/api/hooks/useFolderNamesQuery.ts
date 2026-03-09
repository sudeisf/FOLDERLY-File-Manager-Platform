import { useQuery } from "@tanstack/react-query"

import { foldersApi } from "@/api/folders"

export const useFolderNamesQuery = (refreshToken = 0) => {
  return useQuery({
    queryKey: ["folder-names", refreshToken],
    queryFn: foldersApi.listNames,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
