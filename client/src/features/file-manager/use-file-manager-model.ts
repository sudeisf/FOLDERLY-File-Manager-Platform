import { useMemo, useState } from "react"

import {
  useDeleteFileMutation,
  useShareFolderMutation,
  useToggleFileStarMutation,
  useUploadFileMutation,
} from "@/api/hooks/useFileManagerMutations"
import { filesApi } from "@/api/files"
import { sharedApi } from "@/api/shared"
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
  isSharing: boolean
  uploadProgress: number
  refreshFolders: () => Promise<void>
  uploadFile: (payload: { file: File; folderName: string }) => Promise<void>
  deleteSelectedFile: () => Promise<void>
  downloadSelectedFile: () => Promise<void>
  downloadActiveFolderZip: () => Promise<void>
  shareActiveFolder: (emails?: string[]) => Promise<void>
  toggleFileStar: (fileId: string) => Promise<void>
}

export const useFileManagerModel = (): FileManagerModel => {
  const { data, isLoading, refetch } = useFolder()
  const folders = (data ?? []) as FolderItem[]
  const uploadMutation = useUploadFileMutation()
  const deleteMutation = useDeleteFileMutation()
  const shareMutation = useShareFolderMutation()
  const toggleStarMutation = useToggleFileStarMutation()

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
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

    try {
      setIsUploading(true)
      setUploadProgress(0)

      await uploadMutation.mutateAsync({
        file,
        folderName: normalizedFolderName,
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
      await deleteMutation.mutateAsync({ folderName: activeFolder.name, fileUid })
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

  const getDownloadFileName = (contentDisposition: string): string => {
    if (!contentDisposition) return "download"

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1])
      } catch {
        return utf8Match[1]
      }
    }

    const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
    return basicMatch?.[1] || "download"
  }

  const downloadSelectedFile = async () => {
    if (!activeFolder || !selectedFile) {
      return
    }

    const fileUid = selectedFile.uid ?? selectedFile.id
    if (!fileUid) {
      toast({
        title: "Download failed",
        description: "File identifier is missing.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await filesApi.download(activeFolder.name, fileUid)
      const fileBlob = response.data
      const url = window.URL.createObjectURL(fileBlob)
      const link = document.createElement("a")
      link.href = url

      const contentDisposition = String(response.headers["content-disposition"] ?? "")
      link.setAttribute("download", getDownloadFileName(contentDisposition))
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `${selectedFile.name} is being downloaded.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Download failed",
        description: "Could not download selected file.",
        variant: "destructive",
      })
    }
  }

  const downloadActiveFolderZip = async () => {
    if (!activeFolder) {
      return
    }

    try {
      const response = await filesApi.downloadFolderZip(activeFolder.name)
      const zipBlob = response.data
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url

      const contentDisposition = String(response.headers["content-disposition"] ?? "")
      const fallbackName = `${activeFolder.name}.zip`
      link.setAttribute("download", contentDisposition ? getDownloadFileName(contentDisposition) : fallbackName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "ZIP ready",
        description: `${activeFolder.name}.zip is downloading.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "ZIP download failed",
        description: "Could not download folder as ZIP.",
        variant: "destructive",
      })
    }
  }

  const shareActiveFolder = async (emails: string[] = []) => {
    if (!activeFolder) {
      return
    }

    try {
      setIsSharing(true)

      const response = await shareMutation.mutateAsync(activeFolder.id)
      const link = response?.link
      if (typeof link === "string" && link.length > 0) {
        try {
          await navigator.clipboard.writeText(link)
        } catch {
          // Fallback for when document focus is lost (e.g. inside a dialog)
          const el = document.createElement("textarea")
          el.value = link
          el.style.position = "fixed"
          el.style.opacity = "0"
          document.body.appendChild(el)
          el.focus()
          el.select()
          document.execCommand("copy")
          document.body.removeChild(el)
        }
      }

      if (emails.length === 0) {
        toast({
          title: "Share link ready",
          description: "Folder link copied to clipboard.",
        })
        return
      }

      try {
        await sharedApi.shareFolderWithUsers(activeFolder.id, { emails })
        toast({
          title: "Shared successfully",
          description: "Folder link copied and recipients notified.",
        })
      } catch (shareWithUsersError: any) {
        const apiMessage =
          shareWithUsersError?.response?.data?.message ||
          (typeof shareWithUsersError?.response?.data === "string" ? shareWithUsersError.response.data : "") ||
          shareWithUsersError?.message ||
          "Could not share folder with selected recipients."

        toast({
          title: "Shared link copied",
          description: `Link copied, but recipient sharing failed: ${apiMessage}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
      const apiMessage =
        (error as any)?.response?.data?.message ||
        (typeof (error as any)?.response?.data === "string" ? (error as any).response.data : "") ||
        (error as Error)?.message ||
        "Could not generate a share link for this folder."
      toast({
        title: "Share failed",
        description: apiMessage,
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const toggleFileStar = async (fileId: string) => {
    if (!fileId) {
      toast({
        title: "Error",
        description: "File ID is missing.",
        variant: "destructive",
      })
      return
    }
    try {
      await toggleStarMutation.mutateAsync(fileId)
      await refreshFolders()
      toast({
        title: "File updated",
        description: "Star status changed.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Could not update star status.",
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
    isSharing,
    uploadProgress,
    refreshFolders,
    uploadFile,
    deleteSelectedFile,
    downloadSelectedFile,
    downloadActiveFolderZip,
    shareActiveFolder,
    toggleFileStar,
  }
}
