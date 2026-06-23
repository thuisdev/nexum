import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export type ReviewCardProps = {
  quote: string
  authorName: string
  authorRole?: string
  className?: string
}

export function ReviewCard({
  quote,
  authorName,
  authorRole,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[14px] border border-ink-200 p-6',
        className,
      )}
    >
      <p className="text-sm leading-5 text-amber-600">★★★★★</p>
      <p className="text-base leading-6 text-ink-900">{quote}</p>
      <div className="flex items-center gap-2">
        <Avatar name={authorName} size="sm" className="!size-[26px] text-[10px]" />
        <span className="text-xs leading-4 text-ink-500">
          {authorName}
          {authorRole ? ` · ${authorRole}` : ''}
        </span>
      </div>
    </div>
  )
}
