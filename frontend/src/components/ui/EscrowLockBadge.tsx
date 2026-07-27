import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EscrowLockBadgeProps = {
  funded?: boolean
  className?: string
}

/** Escrow lock — only shown once the project is funded. */
export function EscrowLockBadge({ funded = false, className }: EscrowLockBadgeProps) {
  if (!funded) return null

  return (
    <span className={cn('group relative inline-flex', className)}>
      <span
        className="inline-flex size-7 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-600 shadow-sm transition-[border-color,box-shadow] duration-150 group-hover:shadow-emerald-100"
        aria-label="Escrow funded"
      >
        <Lock className="size-3.5" strokeWidth={2.25} aria-hidden />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        Escrow-backed
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
