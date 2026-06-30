import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/projectDisplay'
import { cn } from '@/lib/utils'
import type { MilestoneSubmission } from '@/types/project'

export type MilestoneCardProps = {
  orderLabel?: string
  title: string
  description?: string
  amount: string
  deadline: string
  status: StatusBadgeStatus
  actionLabel?: string
  actionVariant?: 'primary' | 'approve'
  onAction?: () => void
  submission?: MilestoneSubmission | null
  fileDownloadUrl?: string | null
  paidAt?: string | null
  className?: string
}

export function MilestoneCard({
  orderLabel,
  title,
  description,
  amount,
  deadline,
  status,
  actionLabel,
  actionVariant = 'primary',
  onAction,
  submission,
  fileDownloadUrl,
  paidAt,
  className,
}: MilestoneCardProps) {
  const showSubmission =
    submission && (status === 'SUBMITTED' || status === 'PAID' || status === 'APPROVED')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[10px] border border-ink-200 bg-white p-4',
        className,
      )}
    >
      <div className="flex flex-col gap-3 max-md:[&_button]:w-full md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          {orderLabel && (
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
              {orderLabel}
            </span>
          )}
          <p className="text-base font-medium leading-6 text-ink-900">{title}</p>
          {description && (
            <p className="text-sm leading-5 text-ink-600">{description}</p>
          )}
          <p className="font-mono text-xs leading-4 text-ink-400">
            {amount} USDC · Due {deadline}
            {paidAt ? ` · Paid ${formatRelativeTime(paidAt)}` : null}
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

      {showSubmission && (
        <div className="rounded-lg border border-ink-100 bg-ink-50 p-3 text-left">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-500">
            Submission
          </p>
          <p className="whitespace-pre-wrap text-sm leading-5 text-ink-800">
            {submission.content}
          </p>
          {fileDownloadUrl && (
            <a
              href={fileDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Download className="size-3.5" aria-hidden />
              Download attachment
            </a>
          )}
        </div>
      )}
    </div>
  )
}
