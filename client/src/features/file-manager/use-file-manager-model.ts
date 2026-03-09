import { useMemo, useState } from "react"
import axios from "axios"

import { useFolder } from "@/hooks/useFolder"
import { toast } from "@/hooks/use-toast"

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
  isUploading: boolean
  uploadProgress: number
  refreshFolders: () => Promise<void>
  uploadFile: (payload: { file: File; folderName: string }) => Promise<void>
  deleteSelectedFile: () => Promise<void>
  shareActiveFolder: () => Promise<void>
}

export const useFileManagerModel = (): FileManagerModel => {
  const { data, isLoading, refetch } = useFolder()
  const folders = (data ?? []) as FolderItem[]
  const API_URL = import.meta.env.VITE_API_URL

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  const refreshFolders = async () => {
    await refetch()
  }

  const uploadFile = async ({ file, folderName }: { file: File; folderName: string }) => {
    if (!file) {
      return
    }

    const normalizedFolderName = folderName.trim() || "public"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", normalizedFolderName)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      await axios.post(`${API_URL}/api/files/file`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (!event.total) {
            return
          }
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        },
      })

      await refreshFolders()
      toast({
        title: "Upload complete",
        description: `${file.name} was uploaded to ${normalizedFolderName}.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Upload failed",
        description: "Could not upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadProgress(0)
      setIsUploading(false)
    }
  }

  const deleteSelectedFile = async () => {
    if (!activeFolder || !selectedFile) {
      return
    }

    const fileUid = selectedFile.uid ?? selectedFile.id
    if (!fileUid) {
      toast({
        title: "Delete failed",
        description: "File identifier is missing.",
        variant: "destructive",
      })
      return
    }

    try {
      await axios.delete(`${API_URL}/api/files/delete/${encodeURIComponent(activeFolder.name)}/${encodeURIComponent(fileUid)}`, {
        withCredentials: true,
      })
      await refreshFolders()
      setSelectedFileId(null)
      toast({
        title: "File deleted",
        description: `${selectedFile.name} has been removed.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Delete failed",
        description: "Could not delete the selected file.",
        variant: "destructive",
      })
    }
  }

  const shareActiveFolder = async () => {
    if (!activeFolder) {
      return
    }

    try {
      const response = await axios.post(
        `${API_URL}/share/${activeFolder.id}`,
        {},
        {
          withCredentials: true,
        }
      )
      const link = response.data?.link
      if (typeof link === "string" && link.length > 0 && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
      }

      toast({
        title: "Share link ready",
        description: "Folder link copied to clipboard.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Share failed",
        description: "Could not generate a share link for this folder.",
        variant: "destructive",
      })
    }
  }

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
    isUploading,
    uploadProgress,
    refreshFolders,
    uploadFile,
    deleteSelectedFile,
    shareActiveFolder,
  }
}
