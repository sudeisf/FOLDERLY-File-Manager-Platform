interface TypeBadgeProps {
  type: "file" | "folder"
}

export function TypeBadge({ type }: TypeBadgeProps) {
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
