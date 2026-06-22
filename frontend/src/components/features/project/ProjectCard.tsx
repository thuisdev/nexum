import { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { EscrowPill } from '@/components/ui/EscrowPill'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ReviewPill } from '@/components/ui/ReviewPill'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { cn } from '@/lib/utils'

export type ProjectCardVariant = 'jobboard' | 'client' | 'freelancer'

export type ProjectCardProps = {
  variant: ProjectCardVariant
  id: string
  title: string
  amount: string
  currency?: string
  status?: StatusBadgeStatus
  partyName?: string
  partyAvatarUrl?: string | null
  verified?: boolean
  timeAgo?: string
  tags?: string[]
  milestoneCount?: number
  applicantCount?: number
  progressLabel?: string
  progressValue?: number
  progressMax?: number
  reviewCount?: number
  draftMeta?: string
  footLinkLabel?: string
  footLinkTo?: string
  invited?: boolean
  submitLabel?: string
  onCardClick?: () => void
  onApply?: () => void
  onAccept?: () => void
  onDecline?: () => void
  onSubmit?: () => void
  className?: string
}

export function ProjectCard({
  variant,
  id: projectId,
  title,
  amount,
  currency = 'USDC',
  status,
  partyName,
  partyAvatarUrl,
  verified = false,
  timeAgo,
  tags = [],
  milestoneCount,
  applicantCount,
  progressLabel,
  progressValue = 0,
  progressMax = 100,
  reviewCount,
  draftMeta,
  footLinkLabel,
  footLinkTo,
  invited = false,
  submitLabel,
  onCardClick,
  onApply,
  onAccept,
  onDecline,
  onSubmit,
  className,
}: ProjectCardProps) {
  const showParty =
    variant !== 'jobboard' || (variant === 'jobboard' && partyName)

  const handleCardClick = () => {
    onCardClick?.()
  }

  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick()
      }}
      className={cn(
        'flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color,transform] duration-[180ms] hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md md:w-[360px]',
        className,
      )}
      data-project-id={projectId}
    >
      <div className="flex items-center justify-between gap-2">
        {showParty ? (
          <div className="flex min-w-0 items-center gap-2">
            {partyName ? (
              <>
                <Avatar src={partyAvatarUrl} name={partyName} size="sm" />
                <span className="truncate text-sm font-medium text-ink-900">
                  {partyName}
                </span>
                {verified && <VerifiedIcon />}
              </>
            ) : (
              <span className="text-sm text-ink-500">
                Open · {applicantCount ?? 0} applicants
              </span>
            )}
          </div>
        ) : (
          <span />
        )}
        {variant === 'jobboard' && timeAgo ? (
          <span className="shrink-0 text-xs text-ink-400">{timeAgo}</span>
        ) : status ? (
          <StatusBadge status={status} />
        ) : null}
      </div>

      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7">
        {title}
      </h3>

      {variant === 'jobboard' && (
        <div className="flex flex-col gap-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
          <EscrowPill milestoneCount={milestoneCount} />
        </div>
      )}

      {variant === 'client' && (
        <div className="flex flex-col gap-2">
          {draftMeta ? (
            <p className="text-sm text-ink-500">{draftMeta}</p>
          ) : null}
          {progressLabel ? (
            <ProgressBar
              label={progressLabel}
              value={progressValue}
              max={progressMax}
            />
          ) : null}
          {reviewCount ? <ReviewPill count={reviewCount} /> : null}
        </div>
      )}

      {variant === 'freelancer' && (
        <div className="flex flex-col gap-2">
          {invited ? (
            <EscrowPill milestoneCount={milestoneCount} />
          ) : progressLabel ? (
            <ProgressBar
              label={progressLabel}
              value={progressValue}
              max={progressMax}
            />
          ) : null}
        </div>
      )}

      <Divider />

      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          variant === 'freelancer' && invited && 'gap-3',
        )}
      >
        <p className="font-mono text-xl font-medium leading-[26px] text-ink-900">
          {amount}{' '}
          <span className="font-sans text-[13px] text-ink-400">{currency}</span>
        </p>

        <div onClick={stop} onKeyDown={stop as never}>
          {variant === 'jobboard' && (
            <Button size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
          {variant === 'client' && footLinkTo && (
            <Link
              to={footLinkTo}
              className="text-base font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              {footLinkLabel ?? 'Review →'}
            </Link>
          )}
          {variant === 'freelancer' && invited && (
            <div className="flex gap-2 [&_button]:flex-1 sm:[&_button]:flex-none">
              <Button variant="ghost" size="sm" onClick={onDecline}>
                Decline
              </Button>
              <Button size="sm" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}
          {variant === 'freelancer' && !invited && submitLabel && (
            <Button size="sm" onClick={onSubmit}>
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
