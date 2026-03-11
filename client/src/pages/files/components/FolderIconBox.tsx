import { Folder } from "lucide-react"

interface FolderIconBoxProps {
  size?: "md" | "lg"
}

export function FolderIconBox({ size = "md" }: FolderIconBoxProps) {
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11"
  const iconCls = size === "lg" ? "h-8 w-8" : "h-5 w-5"

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}
    >
      <Folder className={iconCls} />
    </div>
  )
}
