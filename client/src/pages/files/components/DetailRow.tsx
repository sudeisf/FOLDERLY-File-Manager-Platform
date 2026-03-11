interface DetailRowProps {
  label: string
  value: React.ReactNode
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-right text-xs text-slate-800 dark:text-slate-200 break-all">
        {value}
      </span>
    </div>
  )
}
