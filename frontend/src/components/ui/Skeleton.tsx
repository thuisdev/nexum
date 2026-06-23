import { cn } from '@/lib/utils'

export type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-ink-100',
        className,
      )}
      aria-hidden
    />
  )
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <Skeleton className="h-4 w-3/5 rounded" />
      <Skeleton className="h-3 w-2/5 rounded" />
      <Skeleton className="h-3 w-4/5 rounded" />
    </div>
  )
}
