import { Button } from '@/components/ui/Button'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'

export type MilestoneCardProps = {
  title: string
  amount: string
  deadline: string
  status: StatusBadgeStatus
  actionLabel?: string
  actionVariant?: 'primary' | 'approve'
  onAction?: () => void
  className?: string
}

export function MilestoneCard({
  title,
  amount,
  deadline,
  status,
  actionLabel,
  actionVariant = 'primary',
  onAction,
  className,
}: MilestoneCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[10px] border border-ink-200 bg-white p-4 max-md:[&_button]:w-full md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-base font-medium leading-6 text-ink-900">{title}</p>
        <p className="font-mono text-xs leading-4 text-ink-400">
          {amount} USDC · Due {deadline}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actionLabel && onAction ? (
          <Button
            size="sm"
            variant={actionVariant}
            fullWidth
            className="md:w-auto"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : (
          <StatusBadge status={status} />
        )}
      </div>
    </div>
  )
}
