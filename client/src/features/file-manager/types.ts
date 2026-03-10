export type FileItem = {
  id?: string
  uid?: string
  name: string
  metadata: {
    originalName: string
    mimetype: string
    size: number
  }
  type?: "file" | "shared"
}

export type FolderItem = {
  id: string
  name: string
  files: FileItem[]
}

export type FileWithFolder = FileItem & {
  folderName: string
}
