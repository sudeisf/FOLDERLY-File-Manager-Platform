import { useMemo, useState } from "react"
import { CheckCheck, ChevronDown, CloudUpload, HardDrive, Shield, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NotificationItem = {
  id: string
  title: string
  message: string
  time: string
  icon: "share" | "storage" | "upload" | "security"
  category: "general" | "system"
  unread?: boolean
  highlighted?: boolean
  primaryAction?: string
  secondaryAction?: string
}

type NotificationTab = "all" | "unread" | "system"

const items: NotificationItem[] = [
  {
    id: "1",
    title: "File Shared",
    message: "Sarah Jenkins shared 'Project_Proposal_v2.pdf' with you.",
    time: "JUST NOW",
    icon: "share",
    category: "general",
    unread: true,
    highlighted: true,
    primaryAction: "View File",
    secondaryAction: "Mark as read",
  },
  {
    id: "2",
    title: "Storage Almost Full",
    message: "You've used 92% of your 50GB storage. Delete some files or upgrade your plan to continue uploading.",
    time: "2 HRS AGO",
    icon: "storage",
    category: "system",
    unread: true,
    highlighted: true,
    primaryAction: "Upgrade Now",
    secondaryAction: "Dismiss",
  },
  {
    id: "3",
    title: "Upload Complete",
    message: "The folder 'Vacation Photos' (1.2 GB) has been successfully uploaded to your cloud.",
    time: "YESTERDAY",
    icon: "upload",
    category: "general",
  },
  {
    id: "4",
    title: "New Login Detected",
    message: "A new login was detected from a Chrome browser on Windows 11 (IP: 192.168.1.1). Was this you?",
    time: "AUG 24",
    icon: "security",
    category: "system",
    primaryAction: "Check Activity",
  },
]

function NotificationIcon({ type }: { type: NotificationItem["icon"] }) {
  const classes = "h-5 w-5 text-slate-500 dark:text-slate-300"
  if (type === "share") return <Share2 className={classes} />
  if (type === "storage") return <HardDrive className={classes} />
  if (type === "upload") return <CloudUpload className={classes} />
  return <Shield className={classes} />
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all")

  const filteredItems = useMemo(() => {
    if (activeTab === "unread") {
      return items.filter((item) => item.unread)
    }
    if (activeTab === "system") {
      return items.filter((item) => item.category === "system")
    }
    return items
  }, [activeTab])

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4 md:px-6 md:py-6 dark:bg-[#18181B]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your recent app activities and system alerts</p>
          </div>
          <Button variant="outline" className="h-10 rounded-sm border-slate-300 px-4 text-sm dark:border-slate-700">
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

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={cn(
                "rounded-sm border px-4 py-3 dark:bg-[#18181B]",
                item.highlighted
                  ? "border-blue-200 bg-white dark:border-blue-500/40"
                  : "border-slate-200 bg-white dark:border-slate-700"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-10 w-10 place-content-center rounded-sm bg-slate-100 dark:bg-slate-800">
                  <NotificationIcon type={item.icon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-medium leading-tight text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">{item.time}</span>
                      {item.unread ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
                    </div>
                  </div>

                  {(item.primaryAction || item.secondaryAction) && (
                    <div className="mt-2 flex items-center gap-3 text-sm font-medium">
                      {item.primaryAction ? (
                        <button
                          type="button"
                          className={cn(
                            item.primaryAction === "Upgrade Now"
                              ? "h-8 rounded-sm bg-blue-600 px-3 text-sm text-white"
                              : "text-blue-600 hover:text-blue-700"
                          )}
                        >
                          {item.primaryAction}
                        </button>
                      ) : null}
                      {item.secondaryAction ? (
                        <button type="button" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                          {item.secondaryAction}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
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
