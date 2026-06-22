import { cn } from '@/lib/utils'

export type ProgressBarProps = {
  label: string
  value: number
  max?: number
  className?: string
}

export function ProgressBar({
  label,
  value,
  max = 100,
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <p className="text-sm leading-5 text-ink-500">{label}</p>
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
