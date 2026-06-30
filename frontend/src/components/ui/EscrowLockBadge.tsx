import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EscrowLockBadgeProps = {
  funded: boolean
  className?: string
}

export function EscrowLockBadge({ funded, className }: EscrowLockBadgeProps) {
  const label = funded ? 'Escrow funded' : 'Not funded'

  return (
    <span className={cn('group relative inline-flex', className)}>
      <span
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-[border-color,box-shadow] duration-150',
          funded
            ? 'border-emerald-500 text-emerald-600 group-hover:shadow-emerald-100'
            : 'border-red-300 text-red-400 group-hover:shadow-red-100',
        )}
        aria-label={label}
      >
        <Lock className="size-3.5" strokeWidth={2.25} aria-hidden />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}

export function MilestoneCount({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  return (
    <span className={cn('text-xs font-medium text-ink-500', className)}>
      {count} milestone{count === 1 ? '' : 's'}
    </span>
  )
}
