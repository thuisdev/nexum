import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EscrowPillProps = {
  label?: string
  milestoneCount?: number
  className?: string
}

export function EscrowPill({
  label,
  milestoneCount,
  className,
}: EscrowPillProps) {
  if (!label) return null

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium leading-4 text-emerald-700">
        <Lock className="size-3" aria-hidden />
        {label}
      </span>
      {milestoneCount !== undefined && (
        <span className="text-xs leading-4 text-ink-500">
          · {milestoneCount} milestones
        </span>
      )}
    </span>
  )
}
