import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'

export type ProfileReviewCardProps = {
  rating: number
  authorId?: string
  author: string
  authorAvatarUrl?: string | null
  authorAvatarColor?: string | null
  timeAgo: string
  text: string
  className?: string
}

export function ProfileReviewCard({
  rating,
  authorId,
  author,
  authorAvatarUrl,
  authorAvatarColor,
  timeAgo,
  text,
  className,
}: ProfileReviewCardProps) {
  const authorRow = (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar
        src={authorAvatarUrl}
        name={author}
        color={authorAvatarColor}
        size="sm"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-900">{author}</p>
        <p className="text-xs text-ink-400">{timeAgo}</p>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {authorId ? (
          <Link
            to={ROUTES.profile(authorId)}
            className="group min-w-0 rounded-lg outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {authorRow}
          </Link>
        ) : (
          authorRow
        )}
        <div className="flex items-center gap-1.5">
          <StarRating rating={rating} size="sm" />
          <span className="font-mono text-sm font-medium text-ink-700">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-base leading-6 text-ink-700">{text}</p>
    </div>
  )
}
