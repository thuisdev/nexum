import { cn } from '@/lib/utils'

export type ReviewPillProps = {
  count?: number
  className?: string
}

export function ReviewPill({ count = 1, className }: ReviewPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium leading-4 text-amber-700',
        className,
      )}
    >
      <span className="size-2 rounded-full bg-amber-700" aria-hidden />
      {count} milestone{count === 1 ? '' : 's'} to review
    </span>
  )
}
