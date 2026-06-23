import {
  CheckCircle,
  FileText,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const actionIcons: Record<string, LucideIcon> = {
  submitted: Send,
  approved: CheckCircle,
  default: FileText,
}

export type ActivityTimelineItemProps = {
  action: string
  actor: string
  time: string
  type?: keyof typeof actionIcons | 'default'
  isLast?: boolean
  className?: string
}

export function ActivityTimelineItem({
  action,
  actor,
  time,
  type = 'default',
  isLast = false,
  className,
}: ActivityTimelineItemProps) {
  const Icon = actionIcons[type] ?? actionIcons.default

  return (
    <div className={cn('flex gap-3 pb-4', className)}>
      <div className="flex flex-col items-center">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink-50">
          <Icon className="size-4 text-ink-500" aria-hidden />
        </span>
        {!isLast && <span className="mt-1 w-0.5 flex-1 bg-ink-100" />}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
        <p className="text-sm leading-5 text-ink-900">
          <span className="font-medium">{actor}</span> {action}
        </p>
        <p className="text-xs leading-4 text-ink-400">{time}</p>
      </div>
    </div>
  )
}
