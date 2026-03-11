import { Users } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  customContent?: ReactNode
}

export function EmptyState({ icon, title, description, customContent }: EmptyStateProps) {
  if (customContent) {
    return customContent
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 dark:border-slate-700 dark:bg-slate-800/20">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        {icon ? icon : <Users className="h-7 w-7 text-slate-400" />}
      </div>
      {title && (
        <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </p>
      )}
      {description && (
        <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}

// Re-export the original shared page empty state as a default
export function SharedEmptyState() {
  return (
    <EmptyState
      customContent={
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 dark:border-slate-700 dark:bg-slate-800/20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users className="h-7 w-7 text-slate-400" />
          </div>
          <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Shared content automatically appears here
          </p>
          <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
            Collaboration is easy with FileDrive. All files shared with your email
            address will be listed in this workspace.
          </p>
        </div>
      }
    />
  )
}
