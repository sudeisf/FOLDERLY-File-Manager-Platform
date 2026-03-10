import { useEffect, useMemo, useState } from "react"
import { CheckCheck, ChevronDown, CloudUpload, HardDrive, Shield, Share2 } from "lucide-react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/api/hooks/useNotifications"
import { queryKeys } from "@/api/queryKeys"
import type { NotificationItem as ApiNotificationItem, NotificationTab } from "@/api/notifications"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const toRelativeTime = (isoDate: string) => {
  const now = Date.now()
  const dateMs = new Date(isoDate).getTime()
  const diffMs = Math.max(0, now - dateMs)
  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (mins < 1) return "JUST NOW"
  if (mins < 60) return `${mins} MIN${mins > 1 ? "S" : ""} AGO`
  if (hours < 24) return `${hours} HR${hours > 1 ? "S" : ""} AGO`
  if (days === 1) return "YESTERDAY"
  return new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()
}

const resolveIconType = (item: ApiNotificationItem): "share" | "storage" | "upload" | "security" => {
  const lowerType = item.type.toLowerCase()
  const lowerTitle = item.title.toLowerCase()

  if (lowerType.includes("share") || lowerTitle.includes("share")) return "share"
  if (lowerType.includes("storage") || lowerTitle.includes("storage")) return "storage"
  if (lowerType.includes("upload") || lowerTitle.includes("upload")) return "upload"
  return "security"
}

function NotificationIcon({ type }: { type: ReturnType<typeof resolveIconType> }) {
  const classes = "h-5 w-5 text-slate-500 dark:text-slate-300"
  if (type === "share") return <Share2 className={classes} />
  if (type === "storage") return <HardDrive className={classes} />
  if (type === "upload") return <CloudUpload className={classes} />
  return <Shield className={classes} />
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all")
  const queryClient = useQueryClient()
  const notificationsQuery = useNotificationsQuery(activeTab)
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  useEffect(() => {
    const baseURL = String(import.meta.env.VITE_API_URL || "")
    const socket = io(baseURL, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count })
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient])

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data])

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4 md:px-6 md:py-6 dark:bg-[#18181B]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your recent app activities and system alerts</p>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-sm border-slate-300 px-4 text-sm dark:border-slate-700"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <div className="mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "system", label: "System" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as NotificationTab)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notificationsQuery.isLoading && (
          <div className="rounded-sm border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-400">
            Loading notifications...
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            Could not load notifications right now.
          </div>
        )}

        <div className="space-y-3">
          {notifications.map((item) => {
            const iconType = resolveIconType(item)
            const isSystem = item.type.toLowerCase().includes("system")
            const highlighted = !item.isRead
            const primaryActionLabel = isSystem ? "View" : "Open"

            return (
            <article
              key={item.id}
              className={cn(
                "rounded-sm border px-4 py-3 dark:bg-[#18181B]",
                highlighted
                  ? "border-blue-200 bg-white dark:border-blue-500/40"
                  : "border-slate-200 bg-white dark:border-slate-700"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-10 w-10 place-content-center rounded-sm bg-slate-100 dark:bg-slate-800">
                  <NotificationIcon type={iconType} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-medium leading-tight text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">{toRelativeTime(item.createdAt)}</span>
                      {!item.isRead ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-sm font-medium">
                    <button
                      type="button"
                      className={cn(
                        isSystem ? "h-8 rounded-sm bg-blue-600 px-3 text-sm text-white" : "text-blue-600 hover:text-blue-700"
                      )}
                      onClick={() => {
                        toast({
                          title: item.title,
                          description: item.message,
                        })
                      }}
                    >
                      {primaryActionLabel}
                    </button>

                    {!item.isRead ? (
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        onClick={() => markReadMutation.mutate(item.id)}
                        disabled={markReadMutation.isPending}
                      >
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
            )
          })}

          {!notificationsQuery.isLoading && notifications.length === 0 && (
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-400">
              No notifications in this tab.
            </div>
          )}
        </div>

        <div className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          <button type="button" className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            Load older notifications
            <ChevronDown className="h-4 w-4" />
          </button>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">End of activities</p>
        </div>
      </div>
    </main>
  )
}
