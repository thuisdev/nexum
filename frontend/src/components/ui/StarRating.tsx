import { cn } from '@/lib/utils'

export type StarRatingProps = {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
} as const

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  className,
}: StarRatingProps) {
  const clamped = Math.min(max, Math.max(0, Math.round(rating)))

  return (
    <span
      className={cn('inline-flex gap-px leading-none', sizeClasses[size], className)}
      aria-label={`${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={index < clamped ? 'text-amber-400' : 'text-ink-200'}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  )
}
