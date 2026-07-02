import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotificationItemProps = {
  message: string
  time: string
  unread?: boolean
  onClick?: () => void
  onDelete?: () => void
  className?: string
}

export function NotificationItem({
  message,
  time,
  unread = false,
  onClick,
  onDelete,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-2 border-b border-ink-100 px-4 py-3 text-left transition-colors hover:bg-ink-50',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
      >
        {unread ? (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
        ) : (
          <span className="mt-1.5 size-2 shrink-0" />
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm leading-5 text-ink-900">{message}</span>
          <span className="text-xs leading-4 text-ink-400">{time}</span>
        </span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="mt-0.5 shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
