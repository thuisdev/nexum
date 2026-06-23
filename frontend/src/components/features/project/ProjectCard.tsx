import { type MouseEvent } from 'react'
import { Link } from '@/components/ui/Link'
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
export type ClientCardState = 'in_progress' | 'draft'
export type FreelancerCardState = 'invited' | 'in_progress'

export type ProjectCardProps = {
  variant: ProjectCardVariant
  id: string
  title: string
  amount: string
  currency?: string
  status?: StatusBadgeStatus
  /** Client on jobboard / counterparty on dashboards */
  partyName?: string
  partyAvatarUrl?: string | null
  verified?: boolean
  timeAgo?: string
  deadline?: string
  tags?: string[]
  milestoneCount?: number
  applicantCount?: number
  /** Structured progress (cards-build) */
  milestonesDone?: number
  milestonesTotal?: number
  progressAmountText?: string
  progressValue?: number
  reviewCount?: number
  draftMeta?: string
  footLinkLabel?: string
  footLinkTo?: string
  clientState?: ClientCardState
  freelancerState?: FreelancerCardState
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
  deadline,
  tags = [],
  milestoneCount,
  applicantCount,
  milestonesDone,
  milestonesTotal,
  progressAmountText,
  progressValue = 0,
  reviewCount,
  draftMeta,
  footLinkLabel,
  footLinkTo,
  clientState = 'in_progress',
  freelancerState = 'invited',
  submitLabel,
  onCardClick,
  onApply,
  onAccept,
  onDecline,
  onSubmit,
  className,
}: ProjectCardProps) {
  const isJobboard = variant === 'jobboard'
  const cardGap = isJobboard ? 'gap-3.5' : 'gap-3'
  const partyGap = isJobboard ? 'gap-1.5' : 'gap-2'

  const handleCardClick = () => onCardClick?.()
  const stop = (e: MouseEvent) => e.stopPropagation()

  const showProgress =
    (variant === 'client' && clientState === 'in_progress') ||
    (variant === 'freelancer' && freelancerState === 'in_progress')

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick()
      }}
      data-project-id={projectId}
      className={cn(
        'flex w-full cursor-pointer flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-sm',
        'transition-[box-shadow,border-color,transform] duration-[180ms]',
        'hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md',
        'md:w-[360px]',
        cardGap,
        className,
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className={cn('flex min-w-0 items-center', partyGap)}>
          {isJobboard || partyName ? (
            <>
              {partyName && (
                <Avatar src={partyAvatarUrl} name={partyName} size="sm" />
              )}
              <span
                className={cn(
                  'truncate text-sm font-medium text-ink-900',
                  !partyName && 'font-normal text-ink-500',
                )}
              >
                {partyName ??
                  (variant === 'client'
                    ? `Open · ${applicantCount ?? 0} applicants`
                    : 'Open')}
              </span>
              {partyName && verified && <VerifiedIcon size="sm" />}
            </>
          ) : (
            <span className="text-sm text-ink-500">
              Open · {applicantCount ?? 0} applicants
            </span>
          )}
        </div>
        {isJobboard && timeAgo ? (
          <span className="shrink-0 text-xs leading-4 text-ink-400">{timeAgo}</span>
        ) : status ? (
          <StatusBadge status={status} />
        ) : null}
      </div>

      {/* Title — H3 Desktop */}
      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7">
        {title}
      </h3>

      {/* Job board: deadline under title optional in spec as caption row - client group has time top right */}
      {isJobboard && deadline && (
        <p className="text-xs leading-4 text-ink-400">Due {deadline}</p>
      )}

      {/* Variable middle */}
      {isJobboard && (
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
          {clientState === 'draft' && draftMeta && (
            <p className="text-sm leading-5 text-ink-500">{draftMeta}</p>
          )}
          {showProgress &&
            milestonesDone !== undefined &&
            milestonesTotal !== undefined &&
            progressAmountText && (
              <ProgressBar
                milestonesDone={milestonesDone}
                milestonesTotal={milestonesTotal}
                amountText={progressAmountText}
                value={progressValue}
                max={100}
              />
            )}
          {reviewCount ? <ReviewPill count={reviewCount} /> : null}
        </div>
      )}

      {variant === 'freelancer' && (
        <div className="flex flex-col gap-2">
          {freelancerState === 'invited' ? (
            <EscrowPill milestoneCount={milestoneCount} />
          ) : showProgress &&
            milestonesDone !== undefined &&
            milestonesTotal !== undefined &&
            progressAmountText ? (
            <ProgressBar
              milestonesDone={milestonesDone}
              milestonesTotal={milestonesTotal}
              amountText={progressAmountText}
              value={progressValue}
              max={100}
            />
          ) : null}
        </div>
      )}

      <Divider />

      {/* Foot */}
      <div
        className={cn(
          'flex flex-col gap-3',
          variant === 'freelancer' && freelancerState === 'invited'
            ? 'md:flex-row md:items-center md:justify-between'
            : 'sm:flex-row sm:items-center sm:justify-between',
        )}
      >
        <p className="font-mono text-xl font-medium leading-[26px] text-ink-900">
          {amount}{' '}
          <span className="font-sans text-[13px] font-normal text-ink-400">
            {currency}
          </span>
        </p>

        <div className="flex shrink-0 items-center" onClick={stop} onKeyDown={stop as never}>
          {isJobboard && (
            <Button size="sm" className="px-[18px]" onClick={onApply}>
              Apply
            </Button>
          )}
          {variant === 'client' && footLinkTo && (
            <Link to={footLinkTo} className="text-base font-medium">
              {footLinkLabel ?? 'Review →'}
            </Link>
          )}
          {variant === 'freelancer' && freelancerState === 'invited' && (
            <div className="flex w-full gap-1.5 md:w-auto [&_button]:flex-1 md:[&_button]:flex-none">
              <Button variant="ghost" size="sm" onClick={onDecline}>
                Decline
              </Button>
              <Button size="sm" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}
          {variant === 'freelancer' &&
            freelancerState === 'in_progress' &&
            submitLabel && (
              <Button size="sm" onClick={onSubmit}>
                {submitLabel}
              </Button>
            )}
        </div>
      </div>
    </article>
  )
}
