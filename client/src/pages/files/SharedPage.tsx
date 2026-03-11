import { useEffect, useMemo, useState } from "react"
import { LayoutGrid, List, Users } from "lucide-react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"

import { useSharedItemsQuery } from "@/api/hooks/useSharedItems"
import { type SharedItem } from "@/api/shared"
import { queryKeys } from "@/api/queryKeys"
import { Button } from "@/components/ui/button"

import {
  EmptyState,
  ItemDetailsSheet,
  SharedItemCard,
  SharedItemRow,
} from "./components"

type Tab = "all" | "folders" | "files"

export default function SharedPage() {
  const queryClient = useQueryClient()
  const sharedQuery = useSharedItemsQuery()
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [selectedItem, setSelectedItem] = useState<SharedItem | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  useEffect(() => {
    const baseURL = String(import.meta.env.VITE_API_URL || "")
    const socket = io(baseURL, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    })
    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shared.items })
    })
    return () => {
      socket.disconnect()
    }
  }, [queryClient])

  const allItems = useMemo(
    () => sharedQuery.data?.items ?? [],
    [sharedQuery.data]
  )

  const visibleItems = useMemo(() => {
    if (activeTab === "folders") return allItems.filter((i) => i.type === "folder")
    if (activeTab === "files") return allItems.filter((i) => i.type === "file")
    return allItems
  }, [allItems, activeTab])

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Items" },
    { key: "folders", label: "Folders" },
    { key: "files", label: "Files" },
  ]

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        {/* header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6 shrink-0 text-slate-900 dark:text-slate-100" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Shared with Me
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Files and folders others have shared with you
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
        {sharedQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
              />
            ))}
          </div>
        )}

        {sharedQuery.isError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            Could not load shared items right now.
          </p>
        )}

        {!sharedQuery.isLoading && !sharedQuery.isError && (
          <>
            {visibleItems.length === 0 ? (
              <EmptyState />
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {visibleItems.map((item) => (
                  <SharedItemRow
                    key={item.id}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ItemDetailsSheet
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  )
}
