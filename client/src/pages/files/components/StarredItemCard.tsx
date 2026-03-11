import { type FavoriteItem } from "@/api/favorites"
import { isImageFile } from "../utils"
import { FileIconBox } from "./FileIconBox"
import { FolderIconBox } from "./FolderIconBox"
import { TypeBadge } from "./TypeBadge"

interface StarredItemCardProps {
  item: FavoriteItem
  onClick?: () => void
}

export function StarredItemCard({ item, onClick }: StarredItemCardProps) {
  const isImage = item.type === "file" && item.url && isImageFile(item.name)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
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
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
            {item.name}
          </p>
          <p className="truncate text-[11px] text-slate-400">
            {item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <TypeBadge type={item.type} />
        </div>
      </div>
    </div>
  )
}
