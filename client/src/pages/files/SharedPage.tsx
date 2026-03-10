import { useEffect, useMemo } from "react"
import { Clock3, FileText, FolderClosed, Users } from "lucide-react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"

import { useSharedItemsQuery } from "@/api/hooks/useSharedItems"
import { queryKeys } from "@/api/queryKeys"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const toRelativeTime = (isoDate: string) => {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

const bytesToLabel = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "-"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export default function SharedPage() {
  const queryClient = useQueryClient()
  const sharedQuery = useSharedItemsQuery()

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

    return () => socket.disconnect()
  }, [queryClient])

  const items = useMemo(() => sharedQuery.data?.items ?? [], [sharedQuery.data])

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 md:px-6 md:py-5">
      <Card className="w-full border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-[#18181B]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Users className="h-5 w-5 text-blue-600" />
            Shared With Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sharedQuery.isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading shared items...</p>}

          {sharedQuery.isError && (
            <p className="text-sm text-red-600 dark:text-red-300">Could not load shared items right now.</p>
          )}

          {!sharedQuery.isLoading && !sharedQuery.isError && items.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No items have been shared with you yet.</p>
          )}

          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-start justify-between gap-3 rounded-sm border border-slate-200 px-3 py-3 dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {item.type === "folder" ? (
                    <FolderClosed className="h-4 w-4 shrink-0 text-blue-600" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                  )}
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                </div>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Shared by {item.owner.username} ({item.owner.email})
                </p>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {toRelativeTime(item.sharedAt)}
                  </span>
                  {item.type === "file" ? <span>{bytesToLabel(item.size)}</span> : null}
                </div>
              </div>

              <span className="rounded-sm bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.type}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
