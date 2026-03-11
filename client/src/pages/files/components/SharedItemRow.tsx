import { type SharedItem } from "@/api/shared"
import { bytesToLabel, isValidDate, toRelativeTime } from "../utils"
import { FileIconBox } from "./FileIconBox"
import { FolderIconBox } from "./FolderIconBox"
import { ItemMenu } from "./ItemMenu"
import { TypeBadge } from "./TypeBadge"

interface SharedItemRowProps {
  item: SharedItem
  onSelect: (item: SharedItem) => void
}

export function SharedItemRow({ item, onSelect }: SharedItemRowProps) {
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
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {item.name}
          </p>
          <TypeBadge type={item.type} />
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          Shared by{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {item.owner?.username || "Unknown"} ({item.owner?.email || "-"})
          </span>
          {" · "}
          {isValidDate(item.sharedAt) ? toRelativeTime(item.sharedAt) : "-"}
          {sizeLabel && ` · ${sizeLabel}`}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Access
        </span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Viewer
        </span>
      </div>
      <ItemMenu item={item} onSelect={onSelect} />
    </div>
  )
}
