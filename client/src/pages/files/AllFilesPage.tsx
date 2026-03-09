import { Upload } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileManagerModel } from "@/features/file-manager/use-file-manager-model"
import { bytesToLabel, getFileIcon } from "@/features/file-manager/utils"
import { cn } from "@/lib/utils"

export default function AllFilesPage() {
  const model = useOutletContext<FileManagerModel>()

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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="mr-1 h-4 w-4" />
          Upload New
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recently Accessed</h3>
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
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Folders & Files</h3>
          <span className="text-xs text-muted-foreground">{model.filteredFiles.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {model.activeFolder && (
            <Card className="border-border bg-card shadow-none">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-amber-200/60 dark:bg-amber-500/30" />
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
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-content-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Checkbox checked={isSelected} />
                  </div>
                  <div>
                    <p className="truncate text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{bytesToLabel(file.metadata.size)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[min(90vw,460px)] -translate-x-1/2 rounded-xl border border-slate-800/80 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-2xl">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>Uploading 2 files...</span>
          <span>45%</span>
        </div>
        <Progress value={45} className="h-1.5 bg-slate-700 [&>div]:bg-emerald-400" />
        <p className="mt-2 text-xs text-slate-300">New version of "Brand_identity.pdf" uploaded successfully.</p>
      </div>
    </div>
  )
}
