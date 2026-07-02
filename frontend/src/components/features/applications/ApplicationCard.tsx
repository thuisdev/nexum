import { ExternalLink } from 'lucide-react'
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
  avatarColor?: string | null
  verified?: boolean
  timeAgo: string
  pitch: string
  onAccept?: () => void
  onReject?: () => void
  acceptLoading?: boolean
  rejectLoading?: boolean
  disabled?: boolean
  variant?: 'default' | 'review'
  className?: string
}

export function ApplicationCard({
  freelancerId,
  freelancerName,
  avatarUrl,
  avatarColor,
  verified = false,
  timeAgo,
  pitch,
  onAccept,
  onReject,
  acceptLoading = false,
  rejectLoading = false,
  disabled = false,
  variant = 'default',
  className,
}: ApplicationCardProps) {
  const profileLink = freelancerId ? ROUTES.profile(freelancerId) : undefined
  const actionsDisabled = disabled || acceptLoading || rejectLoading

  if (variant === 'review') {
    return (
      <article
        className={cn(
          'overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-[border-color,box-shadow] hover:border-ink-200 hover:shadow-md',
          className,
        )}
      >
        <div className="flex gap-4 p-5">
          {profileLink ? (
            <Link
              to={profileLink}
              className="group shrink-0 rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              aria-label={`View ${freelancerName}'s profile`}
            >
              <Avatar
                src={avatarUrl}
                name={freelancerName}
                color={avatarColor}
                size="md"
                className="ring-2 ring-white transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          ) : (
            <Avatar
              src={avatarUrl}
              name={freelancerName}
              color={avatarColor}
              size="md"
              className="shrink-0 ring-2 ring-white"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <div className="min-w-0">
                {profileLink ? (
                  <Link
                    to={profileLink}
                    className="group inline-flex max-w-full items-center gap-1.5 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <span className="truncate text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                      {freelancerName}
                    </span>
                    {verified && <VerifiedIcon size="sm" />}
                    <ExternalLink className="size-3.5 shrink-0 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-base font-semibold text-ink-900">
                      {freelancerName}
                    </span>
                    {verified && <VerifiedIcon size="sm" />}
                  </div>
                )}
                <p className="text-xs text-ink-400">Applied {timeAgo}</p>
              </div>
            </div>

            <blockquote className="mt-3 rounded-xl bg-ink-50 px-4 py-3 text-[15px] leading-relaxed text-ink-700">
              <span className="sr-only">Pitch:</span>
              {pitch}
            </blockquote>
          </div>
        </div>

        {(onAccept || onReject) && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/40 px-5 py-3">
            {onReject && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReject}
                loading={rejectLoading}
                disabled={actionsDisabled}
                className="text-ink-600 hover:text-red-700"
              >
                Reject
              </Button>
            )}
            {onAccept && (
              <Button
                size="sm"
                onClick={onAccept}
                loading={acceptLoading}
                disabled={actionsDisabled}
              >
                Accept
              </Button>
            )}
          </div>
        )}
      </article>
    )
  }

  const identity = (
    <div className="flex items-center gap-2">
      <Avatar
        src={avatarUrl}
        name={freelancerName}
        color={avatarColor}
        size="sm"
      />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              loading={rejectLoading}
              disabled={actionsDisabled}
            >
              Reject
            </Button>
          )}
          {onAccept && (
            <Button
              size="sm"
              onClick={onAccept}
              loading={acceptLoading}
              disabled={actionsDisabled}
            >
              Accept
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function ApplicationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
      <div className="flex gap-4 p-5">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-ink-100" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-5 w-32 animate-pulse rounded bg-ink-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-ink-50" />
          <div className="h-20 animate-pulse rounded-xl bg-ink-50" />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-ink-100 bg-ink-50/40 px-5 py-3">
        <div className="h-8 w-16 animate-pulse rounded-lg bg-ink-100" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-ink-100" />
      </div>
    </div>
  )
}
