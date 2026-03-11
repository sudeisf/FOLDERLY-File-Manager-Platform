import { LayoutGrid, List, Star } from "lucide-react"

import { useFavoritesQuery, useToggleFileStarMutation, useToggleFolderStarMutation } from "@/api/hooks/useFavorites"
import { type FavoriteItem } from "@/api/favorites"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useStarredViewStore } from "@/stores/starredViewStore"

import { EmptyState, StarredItemCard, StarredItemRow } from "./components"

export default function StarredPage() {
  const { data: favorites, isLoading, error } = useFavoritesQuery()
  const toggleFileStar = useToggleFileStarMutation()
  const toggleFolderStar = useToggleFolderStarMutation()
  const { toast } = useToast()
  
  // Use persisted store for view mode and active tab
  const { viewMode, activeTab, setViewMode, setActiveTab } = useStarredViewStore()

  const starredFiles = favorites?.filter((item) => item.type === "file") ?? []
  const starredFolders = favorites?.filter((item) => item.type === "folder") ?? []

  const allItems = favorites ?? []
  
  const visibleItems = (() => {
    if (activeTab === "folders") return starredFolders
    if (activeTab === "files") return starredFiles
    return allItems
  })()

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "all", label: "All Items" },
    { key: "folders", label: "Folders" },
    { key: "files", label: "Files" },
  ]

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

  const handleItemClick = (item: FavoriteItem) => {
    if (item.type === "folder") {
      // Navigate to folder - would need router
    } else {
      // Handle file click
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          Could not load starred items right now.
        </p>
      </div>
    )
  }

  const isEmpty = starredFiles.length === 0 && starredFolders.length === 0

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        {/* header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Star className="h-6 w-6 shrink-0 text-amber-500 fill-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Starred
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your starred files and folders
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* view toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-r-none ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-400"
                }`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-l-none border-l border-slate-200 dark:border-slate-700 ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-400"
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="mb-4 flex gap-6 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        {!isEmpty ? (
          <>
            {viewMode === "list" ? (
              <div className="space-y-3">
                {visibleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <StarredItemRow
                        item={item}
                        onClick={() => handleItemClick(item)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-amber-500 hover:text-amber-600"
                      onClick={() => {
                        if (item.type === "folder") {
                          handleToggleFolderStar(item.id, item.name)
                        } else {
                          handleToggleFileStar(item.id, item.name)
                        }
                      }}
                      disabled={
                        item.type === "folder"
                          ? toggleFolderStar.isPending
                          : toggleFileStar.isPending
                      }
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <div key={item.id} className="relative">
                    <StarredItemCard
                      item={item}
                      onClick={() => handleItemClick(item)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 bg-white/80 text-amber-500 hover:text-amber-600 dark:bg-slate-800/80"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.type === "folder") {
                          handleToggleFolderStar(item.id, item.name)
                        } else {
                          handleToggleFileStar(item.id, item.name)
                        }
                      }}
                      disabled={
                        item.type === "folder"
                          ? toggleFolderStar.isPending
                          : toggleFileStar.isPending
                      }
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title="No starred items"
            description="Star files or folders to quickly access them here."
          />
        )}
      </div>
    </>
  )
}
