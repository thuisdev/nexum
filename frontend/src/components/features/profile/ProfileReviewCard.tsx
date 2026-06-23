import { cn } from '@/lib/utils'

export type ProfileReviewCardProps = {
  rating: number
  author: string
  timeAgo: string
  text: string
  className?: string
}

export function ProfileReviewCard({
  rating,
  author,
  timeAgo,
  text,
  className,
}: ProfileReviewCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-ink-200 p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-600">★★★★★</span>
          <span className="font-mono text-sm font-medium text-ink-900">
            {rating.toFixed(1)}
          </span>
        </div>
        <span className="text-xs leading-4 text-ink-500">
          {author} · {timeAgo}
        </span>
      </div>
      <p className="text-base leading-6 text-ink-900">{text}</p>
    </div>
  )
}
