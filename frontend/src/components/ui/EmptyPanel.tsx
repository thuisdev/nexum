import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type EmptyPanelProps = {
  icon?: LucideIcon
  title?: string
  message: string
  action?: ReactNode
  className?: string
}

/** Dashed inline empty state — lists, profile sections, project detail */
export function EmptyPanel({
  icon: Icon,
  title,
  message,
  action,
  className,
}: EmptyPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-5 py-6 sm:flex-row sm:items-start',
        className,
      )}
    >
      {Icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-ink-100">
          <Icon className="size-4 text-ink-400" aria-hidden />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && (
          <p className="text-sm font-medium text-ink-900">{title}</p>
        )}
        <p className="text-sm leading-5 text-ink-500">{message}</p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  )
}
