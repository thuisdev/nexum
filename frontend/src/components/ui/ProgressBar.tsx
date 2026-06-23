import { cn } from '@/lib/utils'

export type ProgressBarProps = {
  /** e.g. 2 */
  milestonesDone?: number
  /** e.g. 3 */
  milestonesTotal?: number
  /** e.g. "533 USDC released" or "2,500 USDC earned" */
  amountText?: string
  /** Fallback plain label when structured parts aren't used */
  label?: string
  value: number
  max?: number
  className?: string
}

export function ProgressBar({
  milestonesDone,
  milestonesTotal,
  amountText,
  label,
  value,
  max = 100,
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  const hasStructured =
    milestonesDone !== undefined &&
    milestonesTotal !== undefined &&
    amountText !== undefined

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <p className="text-sm leading-5 text-ink-500">
        {hasStructured ? (
          <>
            <span className="font-mono font-medium text-ink-900">
              {milestonesDone} / {milestonesTotal}
            </span>{' '}
            milestones ·{' '}
            <span className="font-mono font-medium text-ink-900">{amountText}</span>
          </>
        ) : (
          label
        )}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
