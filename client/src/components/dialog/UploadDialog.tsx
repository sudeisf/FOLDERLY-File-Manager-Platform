import { useMemo, useState } from "react"
import { UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FolderItem } from "@/features/file-manager/types"
import { bytesToLabel } from "@/features/file-manager/utils"
import { toast } from "@/hooks/use-toast"

type UploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: FolderItem[]
  defaultFolderName?: string
  isUploading: boolean
  onUpload: (payload: { file: File; folderName: string }) => Promise<void>
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
])

const MAX_FILE_SIZE = 2 * 1024 * 1024

export default function UploadDialog({
  open,
  onOpenChange,
  folders,
  defaultFolderName,
  isUploading,
  onUpload,
}: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFolderName, setSelectedFolderName] = useState(defaultFolderName ?? "public")
  const [newFolderName, setNewFolderName] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const folderOptions = useMemo(() => {
    const names = folders.map((folder) => folder.name)
    if (!names.includes("public")) {
      names.unshift("public")
    }
    return names
  }, [folders])

  const resetState = () => {
    setSelectedFile(null)
    setNewFolderName("")
    setIsDragging(false)
    setSelectedFolderName(defaultFolderName ?? "public")
  }

  const closeDialog = () => {
    onOpenChange(false)
    resetState()
  }

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "File size must be 2MB or less.",
        variant: "destructive",
      })
      return false
    }

    if (!allowedMimeTypes.has(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Allowed: JPG, PNG, SVG, PDF, DOCX, PPTX.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleFileSelection = (file: File | undefined) => {
    if (!file) {
      return
    }
    if (!validateFile(file)) {
      return
    }
    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Choose a file before uploading.",
        variant: "destructive",
      })
      return
    }

    const folderName = newFolderName.trim() || selectedFolderName || "public"
    await onUpload({ file: selectedFile, folderName })
    closeDialog()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Drag and drop or browse a file, then choose its destination folder.</DialogDescription>
        </DialogHeader>

        <div
          className={[
            "rounded-xl border-2 border-dashed p-6 transition-colors",
            isDragging ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20" : "border-border bg-muted/20",
          ].join(" ")}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            handleFileSelection(event.dataTransfer.files?.[0])
          }}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-12 w-12 place-content-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop a file here or browse</p>
              <p className="text-xs text-muted-foreground">Max 2MB. JPG, PNG, SVG, PDF, DOCX, PPTX.</p>
            </div>
            <Label htmlFor="upload-file-input" className="cursor-pointer">
              <span className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium">
                Choose File
              </span>
            </Label>
            <Input
              id="upload-file-input"
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.svg,.pdf,.docx,.pptx,image/jpeg,image/png,image/svg+xml,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
            />
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{bytesToLabel(selectedFile.size)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="folder-select">Select Folder</Label>
            <select
              id="folder-select"
              value={selectedFolderName}
              onChange={(event) => setSelectedFolderName(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {folderOptions.map((folderName) => (
                <option key={folderName} value={folderName}>
                  {folderName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-folder">Or Create Folder</Label>
            <Input
              id="new-folder"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="e.g. Invoices"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isUploading || !selectedFile}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
