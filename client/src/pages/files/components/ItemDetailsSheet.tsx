import { CalendarDays, Download, ExternalLink, HardDrive, User, Users, X } from "lucide-react"
import { type SharedItem } from "@/api/shared"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { bytesToLabel, fileExtension, isImageFile, isValidDate, isVideoFile, toFullDate, toRelativeTime } from "../utils"
import { DetailRow } from "./DetailRow"
import { FileIconBox } from "./FileIconBox"
import { FolderIconBox } from "./FolderIconBox"

interface ItemDetailsSheetProps {
  item: SharedItem | null
  open: boolean
  onClose: () => void
}

export function ItemDetailsSheet({ item, open, onClose }: ItemDetailsSheetProps) {
  if (!item) return null

  const sizeLabel = bytesToLabel(item.size)
  const ext = item.type === "file" ? fileExtension(item.name) : null

  const handleCopy = () => {
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
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col gap-0 p-0 [&>button:first-child]:hidden"
      >
        {/* title row — default SheetContent close suppressed above; we render our own in the header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <SheetTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Details
          </SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* large preview icon + name */}
          <div className="flex flex-col items-center gap-3 text-center">
            {item.type === "folder" ? (
              <FolderIconBox size="lg" />
            ) : item.url && isImageFile(item.name) ? (
              <div className="h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <img src={item.url} alt={item.name} className="h-full w-full object-contain" />
              </div>
            ) : item.url && isVideoFile(item.name) ? (
              <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-700">
                <video src={item.url} controls className="h-48 w-full object-contain" />
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
                  {item.owner?.username || "Unknown"}
                </span>
              }
            />
            <DetailRow label="Owner email" value={item.owner?.email || "-"} />
            <DetailRow
              label="Shared"
              value={`${toRelativeTime(item.sharedAt)} · ${toFullDate(item.sharedAt)}`}
            />
            {sizeLabel && <DetailRow label="Size" value={sizeLabel} />}
            {ext && <DetailRow label="Type" value={ext.toUpperCase()} />}
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
                <Button
                  asChild
                  className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <a href={item.url} download={item.name}>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
              <Users className="h-4 w-4" />
              {item.type === "file" && item.url ? "Copy file URL" : "Copy ID"}
            </Button>
          </div>

          {/* recent activity
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Recent Activity
            </p>
            {activityQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : activityQuery.data && activityQuery.data.length > 0 ? (
              <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-4 pl-4">
                {activityQuery.data.map((act, idx) => (
                  <li key={act.id} className="relative">
                    <span
                      className={`absolute -left-[21px] flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                        idx === 0
                          ? "bg-blue-600"
                          : "bg-slate-300 dark:bg-slate-600"
                      } ring-4 ring-white dark:ring-[#18181B]`}
                    />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {act.message}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {toRelativeTime(act.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div> */}

          <Separator />

          {/* metadata chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <User className="h-3 w-3" />
              {item.owner?.username || "Unknown"}
            </span>
            {sizeLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                <HardDrive className="h-3 w-3" />
                {sizeLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <CalendarDays className="h-3 w-3" />
              {isValidDate(item.sharedAt) ? toRelativeTime(item.sharedAt) : "-"}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

