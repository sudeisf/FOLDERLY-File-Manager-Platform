import { useMemo, useState } from "react"

import { useFolder } from "@/hooks/useFolder"

import type { FileWithFolder, FolderItem } from "./types"

export type FileManagerModel = {
  folders: FolderItem[]
  isLoading: boolean
  selectedFolderId: string | null
  setSelectedFolderId: (value: string | null) => void
  selectedFileId: string | null
  setSelectedFileId: (value: string | null) => void
  search: string
  setSearch: (value: string) => void
  activeFolder: FolderItem | null
  allFiles: FileWithFolder[]
  recentFiles: FileWithFolder[]
  filteredFiles: FolderItem["files"]
  selectedFile: FolderItem["files"][number] | null
  totalUsed: number
  usedPercent: number
}

export const useFileManagerModel = (): FileManagerModel => {
  const { data, isLoading } = useFolder()
  const folders = (data ?? []) as FolderItem[]

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const activeFolder = useMemo(() => {
    if (!folders.length) return null
    if (!selectedFolderId) return folders[0]
    return folders.find((folder) => folder.id === selectedFolderId) ?? folders[0]
  }, [folders, selectedFolderId])

  const allFiles = useMemo<FileWithFolder[]>(
    () => folders.flatMap((folder) => folder.files.map((file) => ({ ...file, folderName: folder.name }))),
    [folders]
  )

  const recentFiles = useMemo(() => allFiles.slice(0, 4), [allFiles])

  const filteredFiles = useMemo(() => {
    if (!activeFolder) return []
    if (!search.trim()) return activeFolder.files
    const term = search.toLowerCase()
    return activeFolder.files.filter((file) => file.name.toLowerCase().includes(term))
  }, [activeFolder, search])

  const selectedFile = useMemo(() => {
    if (!filteredFiles.length) return null
    if (!selectedFileId) return filteredFiles[0]
    return filteredFiles.find((file) => (file.uid ?? file.id) === selectedFileId) ?? filteredFiles[0]
  }, [filteredFiles, selectedFileId])

  const totalUsed = useMemo(
    () => folders.reduce((acc, folder) => acc + folder.files.reduce((fAcc, file) => fAcc + file.metadata.size, 0), 0),
    [folders]
  )

  const storageCap = 10 * 1024 * 1024 * 1024
  const usedPercent = Math.min(100, (totalUsed / storageCap) * 100)

  return {
    folders,
    isLoading,
    selectedFolderId,
    setSelectedFolderId,
    selectedFileId,
    setSelectedFileId,
    search,
    setSearch,
    activeFolder,
    allFiles,
    recentFiles,
    filteredFiles,
    selectedFile,
    totalUsed,
    usedPercent,
  }
}
