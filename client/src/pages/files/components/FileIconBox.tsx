import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
} from "lucide-react"

import { fileExtension } from "../utils"

function getFileIcon(ext: string, cls = "h-5 w-5"): React.ReactNode {
  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext))
    return <FileImage className={cls} />
  if (["mp4", "mov", "avi", "mkv"].includes(ext))
    return <FileVideo className={cls} />
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className={cls} />
  if (["ppt", "pptx"].includes(ext))
    return <FileType className={cls} />
  if (["zip", "rar", "7z", "tar"].includes(ext))
    return <FileArchive className={cls} />
  if (["doc", "docx", "pdf", "txt"].includes(ext))
    return <FileText className={cls} />
  return <File className={cls} />
}

interface FileIconBoxProps {
  name: string
  size?: "md" | "lg"
}

export function FileIconBox({ name, size = "md" }: FileIconBoxProps) {
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11"
  const iconCls = size === "lg" ? "h-8 w-8" : "h-5 w-5"

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}
    >
      {getFileIcon(fileExtension(name), iconCls)}
    </div>
  )
}
