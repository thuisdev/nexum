import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'

export type ApplicationCardProps = {
  freelancerId?: string
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
  freelancerId,
  freelancerName,
  avatarUrl,
  verified = false,
  timeAgo,
  pitch,
  onAccept,
  onReject,
  className,
}: ApplicationCardProps) {
  const profileLink = freelancerId ? ROUTES.profile(freelancerId) : undefined

  const identity = (
    <div className="flex items-center gap-2">
      <Avatar src={avatarUrl} name={freelancerName} size="sm" />
      <span className="text-sm font-medium text-ink-900">{freelancerName}</span>
      {verified && <VerifiedIcon />}
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {profileLink ? (
          <Link
            to={profileLink}
            className="group rounded-lg outline-offset-2 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {identity}
          </Link>
        ) : (
          identity
        )}
        <span className="text-xs text-ink-400">{timeAgo}</span>
      </div>
      <p className="line-clamp-3 text-sm leading-5 text-ink-600">{pitch}</p>
      {(onAccept || onReject) && (
        <div className="flex justify-end gap-2">
          {onReject && (
            <Button variant="ghost" size="sm" onClick={onReject}>
              Reject
            </Button>
          )}
          {onAccept && (
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
