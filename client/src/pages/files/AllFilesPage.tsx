import { FolderDown, LayoutGrid, List, Star, Upload } from "lucide-react"
import { useState } from "react"
import { useOutletContext } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import UploadDialog from "@/components/dialog/UploadDialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileManagerModel } from "@/features/file-manager/use-file-manager-model"
import { bytesToLabel, getFileIcon } from "@/features/file-manager/utils"
import { cn } from "@/lib/utils"
import { useFileManagerViewStore } from "@/stores/fileManagerViewStore"

function FolderGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <path
        d="M3 6.75A2.75 2.75 0 0 1 5.75 4h4.1c.9 0 1.67.45 2.15 1.12l.47.63c.2.27.5.42.83.42h5.98A2.75 2.75 0 0 1 22 8.92v8.33A2.75 2.75 0 0 1 19.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Z"
        fill="#F1C40F"
      />
    </svg>
  )
}

// Check if file is an image that can be previewed
function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith("image/")
}

export default function AllFilesPage() {
  const model = useOutletContext<FileManagerModel>()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const viewMode = useFileManagerViewStore((state) => state.viewMode)
  const setViewMode = useFileManagerViewStore((state) => state.setViewMode)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 md:px-6 md:py-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Project Alpha</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{model.activeFolder?.name ?? "Assets"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border bg-card p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:text-white" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-1 h-4 w-4" />
            Upload New
          </Button>
        </div>
      </div>

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        folders={model.folders}
        defaultFolderName={model.activeFolder?.name}
        isUploading={model.isUploading}
        onUpload={model.uploadFile}
      />

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recently Accessed</h3>
        {viewMode === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {model.recentFiles.length === 0 &&
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={`recent-${index}`} className="h-[86px]" />)}
            {model.recentFiles.map((file) => {
              const Icon = getFileIcon(file.metadata.mimetype)
              return (
                <Card key={(file.uid ?? file.id) ?? file.name} className="border-border shadow-none">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="grid h-10 w-10 place-content-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.folderName}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[minmax(0,1fr)_140px_110px] border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Name</span>
              <span>Folder</span>
              <span>Size</span>
            </div>
            {model.recentFiles.length === 0 ? (
              <div className="p-3">
                <Skeleton className="h-[56px]" />
              </div>
            ) : (
              model.recentFiles.map((file) => {
                const Icon = getFileIcon(file.metadata.mimetype)
                const key = (file.uid ?? file.id) ?? file.name
                return (
                  <div key={key} className="grid grid-cols-[minmax(0,1fr)_140px_110px] items-center border-b border-border px-4 py-3 text-sm last:border-b-0">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate font-medium">{file.name}</span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{file.folderName}</span>
                    <span className="text-xs text-muted-foreground">{bytesToLabel(file.metadata.size)}</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Folders & Files</h3>
          <span className="text-xs text-muted-foreground">{model.filteredFiles.length} items</span>
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {model.activeFolder && (
              <Card className="border-border bg-card shadow-none">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                      <div className="relative grid h-10 w-10 place-content-center">
                        <FolderGlyph />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full border border-border bg-background"
                          onClick={model.downloadActiveFolderZip}
                          aria-label="Download folder as ZIP"
                        >
                          <FolderDown className="h-3 w-3" />
                        </Button>
                    </div>
                    <Checkbox checked={false} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{model.activeFolder.name}</p>
                    <p className="text-xs text-muted-foreground">{model.activeFolder.files.length} files</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {model.filteredFiles.map((file) => {
              const key = file.uid ?? file.id ?? file.name
              const isSelected = (model.selectedFile?.uid ?? model.selectedFile?.id ?? model.selectedFile?.name) === key
              const Icon = getFileIcon(file.metadata.mimetype)
              const isImage = isImageFile(file.metadata.mimetype)

              return (
                <Card
                  key={key}
                  className={cn(
                    "cursor-pointer border-border bg-card shadow-none transition-colors hover:border-primary/60",
                    isSelected && "border-blue-500 ring-1 ring-blue-500"
                  )}
                  onClick={() => model.setSelectedFileId(file.uid ?? file.id ?? null)}
                >
                  <CardContent className="space-y-4 p-4">
                    {isImage && "url" in file && (file as any).url ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={(file as any).url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-content-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:text-amber-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              model.toggleFileStar(file.uid ?? file.id ?? "")
                            }}
                          >
                            <Star className="h-4 w-4 text-slate-400 hover:text-amber-500" />
                          </Button>
                          <Checkbox checked={isSelected} />
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="truncate text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{bytesToLabel(file.metadata.size)}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_40px_50px] border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Name</span>
              <span>Size</span>
              <span></span>
              <span className="text-right">Select</span>
            </div>
            <div>
              {model.filteredFiles.map((file) => {
                const key = file.uid ?? file.id ?? file.name
                const isSelected = (model.selectedFile?.uid ?? model.selectedFile?.id ?? model.selectedFile?.name) === key
                const Icon = getFileIcon(file.metadata.mimetype)

                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_120px_40px_50px] items-center border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted/40",
                      isSelected && "bg-blue-50 dark:bg-blue-950/30"
                    )}
                    onClick={() => model.setSelectedFileId(file.uid ?? file.id ?? null)}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium">{file.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{bytesToLabel(file.metadata.size)}</span>
                    <span className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          model.toggleFileStar(file.uid ?? file.id ?? "")
                        }}
                      >
                        <Star className="h-4 w-4 text-slate-400 hover:text-amber-500" />
                      </Button>
                      <Checkbox checked={isSelected} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {model.isUploading && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[min(90vw,460px)] -translate-x-1/2 rounded-xl border border-slate-800/80 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-2xl">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>Uploading file...</span>
            <span>{model.uploadProgress}%</span>
          </div>
          <Progress value={model.uploadProgress} className="h-1.5 bg-slate-700 [&>div]:bg-emerald-400" />
        </div>
      )}
    </div>
  )
}
