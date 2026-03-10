import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Filter,
  Folder,
  HardDrive,
  LayoutGrid,
  List,
  MoreVertical,
  Share2,
  User,
  Users,
  X,
} from "lucide-react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"

import { useSharedItemsQuery, useItemActivityQuery } from "@/api/hooks/useSharedItems"
import { type SharedItem } from "@/api/shared"
import { queryKeys } from "@/api/queryKeys"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

// ─── helpers ──────────────────────────────────────────────────────────────────

const toRelativeTime = (isoDate: string) => {
  const diff = Math.max(0, Date.now() - new Date(isoDate).getTime())
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

const toFullDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const bytesToLabel = (bytes?: number) => {
  if (!bytes || bytes <= 0) return null
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const fileExtension = (name: string) => name.split(".").pop()?.toLowerCase() ?? ""

// ─── file-type icon ────────────────────────────────────────────────────────────

function getFileIcon(ext: string, cls = "h-5 w-5"): React.ReactNode {
  if (["jpg","jpeg","png","webp","gif","svg"].includes(ext)) return <FileImage className={cls} />
  if (["mp4","mov","avi","mkv"].includes(ext))               return <FileVideo className={cls} />
  if (["xls","xlsx","csv"].includes(ext))                    return <FileSpreadsheet className={cls} />
  if (["ppt","pptx"].includes(ext))                          return <FileType className={cls} />
  if (["zip","rar","7z","tar"].includes(ext))                return <FileArchive className={cls} />
  if (["doc","docx","pdf","txt"].includes(ext))              return <FileText className={cls} />
  return <File className={cls} />
}

function FileIconBox({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11"
  const iconCls = size === "lg" ? "h-8 w-8" : "h-5 w-5"
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}>
      {getFileIcon(fileExtension(name), iconCls)}
    </div>
  )
}

function FolderIconBox({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11"
  const iconCls = size === "lg" ? "h-8 w-8" : "h-5 w-5"
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}>
      <Folder className={iconCls} />
    </div>
  )
}

// ─── details sheet ────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-xs text-slate-800 dark:text-slate-200 break-all">{value}</span>
    </div>
  )
}

function ItemDetailsSheet({
  item,
  open,
  onClose,
}: {
  item: SharedItem | null
  open: boolean
  onClose: () => void
}) {
  const activityQuery = useItemActivityQuery(item?.type ?? null, item?.id ?? null)

  if (!item) return null

  const sizeLabel = bytesToLabel(item.size)
  const ext = item.type === "file" ? fileExtension(item.name) : null
  const activities = activityQuery.data ?? []

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col gap-0 p-0 [&>button:first-child]:hidden">
        {/* title row — default SheetContent close suppressed above; we render our own in the header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <SheetTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Details
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* large preview icon + name */}
          <div className="flex flex-col items-center gap-3 text-center">
            {item.type === "folder" ? (
              <FolderIconBox size="lg" />
            ) : item.url && ["jpg","jpeg","png","webp","gif","svg"].includes(fileExtension(item.name)) ? (
              <div className="h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : item.url && ["mp4","mov","avi","mkv","webm"].includes(fileExtension(item.name)) ? (
              <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-700">
                <video
                  src={item.url}
                  controls
                  className="h-48 w-full object-contain"
                />
              </div>
            ) : (
              <FileIconBox name={item.name} size="lg" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
                {item.name}
              </p>
              <span
                className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  item.type === "folder"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                }`}
              >
                {item.type}
              </span>
            </div>
          </div>

          <Separator />

          {/* info rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <DetailRow
              label="Shared by"
              value={
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {item.owner.username}
                </span>
              }
            />
            <DetailRow
              label="Owner email"
              value={item.owner.email}
            />
            <DetailRow
              label="Shared"
              value={`${toRelativeTime(item.sharedAt)} · ${toFullDate(item.sharedAt)}`}
            />
            {sizeLabel && (
              <DetailRow label="Size" value={sizeLabel} />
            )}
            {ext && (
              <DetailRow label="Type" value={ext.toUpperCase()} />
            )}
            {item.type === "file" && item.folderId && (
              <DetailRow label="In folder" value={item.folderId} />
            )}
            <DetailRow label="Access" value="Viewer" />
          </div>

          <Separator />

          {/* actions */}
          <div className="space-y-2">
            {item.type === "file" && item.url && (
              <>
                <Button asChild variant="outline" className="w-full gap-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open file
                  </a>
                </Button>
                <Button asChild className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700">
                  <a href={item.url} download={item.name}>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                const text = item.url ?? item.id
                try {
                  navigator.clipboard.writeText(text)
                } catch {
                  const el = document.createElement("textarea")
                  el.value = text
                  el.style.position = "fixed"
                  el.style.opacity = "0"
                  document.body.appendChild(el)
                  el.focus()
                  el.select()
                  document.execCommand("copy")
                  document.body.removeChild(el)
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              {item.type === "file" && item.url ? "Copy file URL" : "Copy ID"}
            </Button>
          </div>

          {/* recent activity */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Recent Activity
            </p>
            {activityQuery.isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-slate-400">No activity yet.</p>
            ) : (
              <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-4 pl-4">
                {activities.map((act, idx) => (
                  <li key={act.id} className="relative">
                    <span className={`absolute -left-[21px] flex h-3.5 w-3.5 items-center justify-center rounded-full ${idx === 0 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"} ring-4 ring-white dark:ring-[#18181B]`} />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {act.message}
                    </p>
                    <p className="text-[11px] text-slate-400">{toRelativeTime(act.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <Separator />

          {/* metadata chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <User className="h-3 w-3" />
              {item.owner.username}
            </span>
            {sizeLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                <HardDrive className="h-3 w-3" />
                {sizeLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <CalendarDays className="h-3 w-3" />
              {toRelativeTime(item.sharedAt)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: "file" | "folder" }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        type === "folder"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      }`}
    >
      {type}
    </span>
  )
}

// ─── kebab menu ───────────────────────────────────────────────────────────────

function ItemMenu({ item, onSelect }: { item: SharedItem; onSelect: (item: SharedItem) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(item) }}>
          View details
        </DropdownMenuItem>
        {item.type === "file" && item.url && (
          <DropdownMenuItem asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Open file
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard?.writeText(item.id).catch(() => {})
          }}
        >
          Copy ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── list row ─────────────────────────────────────────────────────────────────

function SharedItemRow({ item, onSelect }: { item: SharedItem; onSelect: (item: SharedItem) => void }) {
  const sizeLabel = bytesToLabel(item.size)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-[#18181B] dark:hover:bg-slate-800/50"
    >
      {item.type === "folder" ? <FolderIconBox /> : <FileIconBox name={item.name} />}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
          <TypeBadge type={item.type} />
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          Shared by{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {item.owner.username} ({item.owner.email})
          </span>
          {" · "}{toRelativeTime(item.sharedAt)}{sizeLabel && ` · ${sizeLabel}`}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Access</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Viewer</span>
      </div>
      <ItemMenu item={item} onSelect={onSelect} />
    </div>
  )
}

// ─── grid card ────────────────────────────────────────────────────────────────

function SharedItemCard({ item, onSelect }: { item: SharedItem; onSelect: (item: SharedItem) => void }) {
  const isImage = item.type === "file" && item.url &&
    ["jpg","jpeg","png","webp","gif","svg"].includes(fileExtension(item.name))

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-[#18181B]"
    >
      {/* preview area */}
      <div className="flex h-36 items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50">
        {isImage ? (
          <img src={item.url!} alt={item.name} className="h-full w-full object-cover" />
        ) : item.type === "folder" ? (
          <FolderIconBox size="lg" />
        ) : (
          <FileIconBox name={item.name} size="lg" />
        )}
      </div>

      {/* footer */}
      <div className="flex items-start gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="truncate text-[11px] text-slate-400">{toRelativeTime(item.sharedAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <TypeBadge type={item.type} />
          <ItemMenu item={item} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 dark:border-slate-700 dark:bg-slate-800/20">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Share2 className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Shared content automatically appears here
      </p>
      <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
        Collaboration is easy with FileDrive. All files shared with your email
        address will be listed in this workspace.
      </p>
    </div>
  )
}

// ─── tabs ─────────────────────────────────────────────────────────────────────

type Tab = "all" | "folders" | "files"

// ─── page ─────────────────────────────────────────────────────────────────────

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
    return () => { socket.disconnect() }
  }, [queryClient])

  const allItems = useMemo(() => sharedQuery.data?.items ?? [], [sharedQuery.data])

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
                className={`h-8 w-8 rounded-r-none ${viewMode === "list" ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-400"}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-l-none border-l border-slate-200 dark:border-slate-700 ${viewMode === "grid" ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-400"}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Share2 className="h-4 w-4" />
              Shared
            </Button>
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
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {visibleItems.map((item) => (
                  <SharedItemCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* details sheet */}
      <ItemDetailsSheet
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  )
}
