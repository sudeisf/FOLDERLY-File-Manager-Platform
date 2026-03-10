import { Star } from "lucide-react"

import { useFavoritesQuery, useToggleFileStarMutation, useToggleFolderStarMutation } from "@/api/hooks/useFavorites"
import { bytesToLabel, getFileIcon } from "@/features/file-manager/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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

export default function StarredPage() {
  const { data: favorites, isLoading, error } = useFavoritesQuery()
  const toggleFileStar = useToggleFileStarMutation()
  const toggleFolderStar = useToggleFolderStarMutation()
  const { toast } = useToast()

  const starredFiles = favorites?.filter((item) => item.type === "file") ?? []
  const starredFolders = favorites?.filter((item) => item.type === "folder") ?? []

  const handleToggleFileStar = async (fileId: string, fileName: string) => {
    try {
      await toggleFileStar.mutateAsync(fileId)
      toast({
        title: "File unstarred",
        description: `${fileName} has been removed from starred files.`,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unstar file. Please try again.",
      })
    }
  }

  const handleToggleFolderStar = async (folderId: string, folderName: string) => {
    try {
      await toggleFolderStar.mutateAsync(folderId)
      toast({
        title: "Folder unstarred",
        description: `${folderName} has been removed from starred folders.`,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unstar folder. Please try again.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-xl border-slate-200 bg-white shadow-none">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-xl border-slate-200 bg-white shadow-none">
          <CardContent className="p-6">
            <p className="text-sm text-red-500">Failed to load starred items. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isEmpty = starredFiles.length === 0 && starredFolders.length === 0

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 md:px-6 md:py-5">
      <div className="mb-5">
        <h2 className="mb-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Starred</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your starred files and folders
        </p>
      </div>

      {isEmpty ? (
        <Card className="w-full max-w-xl border-slate-200 bg-white shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Star className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-slate-700 dark:text-slate-200">No starred items</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Star files or folders to quickly access them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {starredFolders.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Folders ({starredFolders.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {starredFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer border-border bg-card shadow-none transition-colors hover:border-primary/60"
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="grid h-10 w-10 place-content-center rounded-lg bg-primary/10 text-primary">
                        <FolderGlyph />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{folder.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-amber-500 hover:text-amber-600"
                        onClick={() => handleToggleFolderStar(folder.id, folder.name)}
                        disabled={toggleFolderStar.isPending}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {starredFiles.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Files ({starredFiles.length})
              </h3>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid grid-cols-[minmax(0,1fr)_140px_110px_80px] border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span>Name</span>
                  <span>Size</span>
                  <span>Modified</span>
                  <span></span>
                </div>
                {starredFiles.map((file) => {
                  const Icon = getFileIcon(file.name)
                  return (
                    <div
                      key={file.id}
                      className="grid grid-cols-[minmax(0,1fr)_140px_110px_80px] items-center border-b border-border px-4 py-3 text-sm last:border-b-0"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate font-medium">{file.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.size ? bytesToLabel(file.size) : "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.updatedAt
                          ? new Date(file.updatedAt).toLocaleDateString()
                          : "-"}
                      </span>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:text-amber-600"
                          onClick={() => handleToggleFileStar(file.id, file.name)}
                          disabled={toggleFileStar.isPending}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
