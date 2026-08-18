import { cn } from '@/lib/utils'

export type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-ink-100', className)}
      aria-hidden
    />
  )
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-sm" />
      </div>
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="mt-auto flex flex-col gap-3">
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  )
}

export function DashboardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8 sm:flex-row sm:items-start">
          <Skeleton className="size-32 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-9 w-2/3 max-w-xs" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full max-w-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 bg-white px-6 py-5">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-56" />
      <div className="rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex items-center gap-4 border-b border-ink-100 pb-6">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Skeleton className="h-10 w-2/3 max-w-md" />
            <Skeleton className="h-6 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-9 w-44 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-sm" />
            <Skeleton className="h-6 w-20 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <div className="flex flex-col gap-4 border-t border-ink-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-[10px]" />
        ))}
      </div>
    </div>
  )
}
