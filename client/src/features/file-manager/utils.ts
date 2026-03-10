import { FileIcon, FileSpreadsheet, FileText, Image } from "lucide-react"

export const bytesToLabel = (size: number): string => {
  if (size >= 1024 * 1024 * 1024) return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
  if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${size} B`
}

export const getFileKind = (mimetype: string): string => {
  if (mimetype.startsWith("image/")) return "Image"
  if (mimetype.includes("pdf")) return "PDF"
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel")) return "Spreadsheet"
  if (mimetype.includes("presentation")) return "Presentation"
  if (mimetype.includes("word") || mimetype.includes("document")) return "Document"
  return "File"
}

export const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith("image/")) return Image
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel")) return FileSpreadsheet
  if (mimetype.includes("word") || mimetype.includes("document")) return FileText
  return FileIcon
}
