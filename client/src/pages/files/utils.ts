// ─── date/time helpers ───────────────────────────────────────────────────────────

export const toRelativeTime = (isoDate: string) => {
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

export const toFullDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

// ─── size helpers ────────────────────────────────────────────────────────────────

export const bytesToLabel = (bytes?: number) => {
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

// ─── file helpers ────────────────────────────────────────────────────────────────

export const fileExtension = (name: string) => name.split(".").pop()?.toLowerCase() ?? ""

export const isValidDate = (date: string) => {
  const d = new Date(date)
  return !isNaN(d.getTime())
}

// ─── file type helpers ─────────────────────────────────────────────────────────

export const isImageFile = (name: string) => {
  const ext = fileExtension(name)
  return ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)
}

export const isVideoFile = (name: string) => {
  const ext = fileExtension(name)
  return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)
}
