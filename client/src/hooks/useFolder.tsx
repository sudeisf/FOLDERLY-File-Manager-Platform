import { useFoldersQuery } from "@/api/hooks/useFoldersQuery"

export const useFolder = () => {
  const { data, isLoading, error, refetch } = useFoldersQuery()

  return { data, isLoading, error, refetch }
}