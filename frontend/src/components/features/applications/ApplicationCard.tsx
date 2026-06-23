import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { cn } from '@/lib/utils'

export type ApplicationCardProps = {
  freelancerName: string
  avatarUrl?: string | null
  verified?: boolean
  timeAgo: string
  pitch: string
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

export function ApplicationCard({
  freelancerName,
  avatarUrl,
  verified = false,
  timeAgo,
  pitch,
  onAccept,
  onReject,
  className,
}: ApplicationCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar src={avatarUrl} name={freelancerName} size="sm" />
          <span className="text-sm font-medium text-ink-900">{freelancerName}</span>
          {verified && <VerifiedIcon />}
        </div>
        <span className="text-xs text-ink-400">{timeAgo}</span>
      </div>
      <p className="line-clamp-3 text-sm leading-5 text-ink-600">{pitch}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onReject}>
          Reject
        </Button>
        <Button size="sm" onClick={onAccept}>
          Accept
        </Button>
      </div>
    </div>
  )
}
