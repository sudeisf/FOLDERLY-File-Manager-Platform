import { type FavoriteItem } from "@/api/favorites"
import { bytesToLabel } from "../utils"
import { FileIconBox } from "./FileIconBox"
import { FolderIconBox } from "./FolderIconBox"
import { TypeBadge } from "./TypeBadge"

interface StarredItemRowProps {
  item: FavoriteItem
  onClick?: () => void
}

export function StarredItemRow({ item, onClick }: StarredItemRowProps) {
  const sizeLabel = bytesToLabel(item.size)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
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
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : "-"}
          {sizeLabel && ` · ${sizeLabel}`}
        </p>
      </div>
    </div>
  )
}
