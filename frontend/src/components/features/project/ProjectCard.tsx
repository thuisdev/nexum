import { type MouseEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@/components/ui/Link'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { EscrowLockBadge, MilestoneCount } from '@/components/ui/EscrowLockBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ReviewPill } from '@/components/ui/ReviewPill'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { ROUTES } from '@/router/routes'
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
  statusLabel?: string
  /** Client on jobboard / counterparty on dashboards */
  partyId?: string
  partyLabel?: string
  partyName?: string
  partyAvatarUrl?: string | null
  verified?: boolean
  timeAgo?: string
  deadline?: string
  tags?: string[]
  escrowFunded?: boolean
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
  showReviewApplicants?: boolean
  onReviewApplicants?: () => void
  showApply?: boolean
  clientState?: ClientCardState
  freelancerState?: FreelancerCardState
  submitLabel?: string
  onCardClick?: () => void
  onInvite?: () => void
  showInvite?: boolean
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
  statusLabel,
  partyId,
  partyLabel,
  partyName,
  partyAvatarUrl,
  verified = false,
  timeAgo,
  deadline,
  tags = [],
  escrowFunded,
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
  showReviewApplicants = false,
  onReviewApplicants,
  showApply = true,
  clientState = 'in_progress',
  freelancerState = 'invited',
  submitLabel,
  onCardClick,
  onInvite,
  showInvite = false,
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

  const dashboardFallback =
    variant === 'client' && !partyName
      ? applicantCount !== undefined
        ? `Open · ${applicantCount} applicant${applicantCount === 1 ? '' : 's'}`
        : 'Awaiting freelancer'
      : null

  const renderTopLeft = () => {
    if (isJobboard) {
      return (
        <div className={cn('flex min-w-0 items-center', partyGap)}>
          {partyName && (
            <Avatar src={partyAvatarUrl} name={partyName} size="sm" />
          )}
          <span className="truncate text-sm font-medium text-ink-900">
            {partyName ?? 'Open'}
          </span>
          {partyName && verified && <VerifiedIcon size="sm" />}
        </div>
      )
    }

    if (partyName && partyId) {
      return (
        <RouterLink
          to={ROUTES.profile(partyId)}
          onClick={stop}
          className="group flex min-w-0 items-center gap-2 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <Avatar src={partyAvatarUrl} name={partyName} size="sm" />
          <div className="min-w-0 text-left">
            {partyLabel && (
              <span className="block text-[10px] font-medium uppercase tracking-[0.8px] text-ink-400">
                {partyLabel}
              </span>
            )}
            <span className="block truncate text-sm font-medium text-ink-900 transition-colors group-hover:text-brand-700">
              {partyName}
            </span>
          </div>
          {verified && <VerifiedIcon size="sm" />}
        </RouterLink>
      )
    }

    if (dashboardFallback) {
      return (
        <span className="text-sm font-medium text-ink-500">{dashboardFallback}</span>
      )
    }

    return null
  }

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
        'flex h-full w-full cursor-pointer flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-sm',
        'transition-[box-shadow,border-color,transform] duration-[180ms]',
        'hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md',
        cardGap,
        className,
      )}
    >
      {/* Top row — fixed min height so titles align across cards */}
      <div className="flex min-h-10 items-center justify-between gap-2">
        {renderTopLeft()}
        <div className="flex shrink-0 items-center gap-2">
          {isJobboard && <EscrowLockBadge funded={escrowFunded} />}
          {isJobboard && timeAgo ? (
            <span className="text-xs leading-4 text-ink-400">{timeAgo}</span>
          ) : status ? (
            <StatusBadge status={status} label={statusLabel} />
          ) : null}
        </div>
      </div>

      {/* Title — H3 Desktop */}
      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7">
        {title}
      </h3>

      {/* Job board: deadline under title optional in spec as caption row - client group has time top right */}
      {isJobboard && deadline && (
        <p className="text-xs leading-4 text-ink-400">Due {deadline}</p>
      )}

      {/* Variable middle — grows so footer stays at card bottom */}
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {isJobboard && (
          <>
            {milestoneCount !== undefined && (
              <MilestoneCount count={milestoneCount} />
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </>
        )}

        {variant === 'client' && (
          <>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
            {clientState === 'draft' && draftMeta && (
              <p className="text-sm leading-5 text-ink-500">{draftMeta}</p>
            )}
            {(clientState === 'draft' || clientState === 'in_progress') && (
              <div className="flex items-center gap-2">
                <EscrowLockBadge funded={escrowFunded} />
                {milestoneCount !== undefined && (
                  <MilestoneCount count={milestoneCount} />
                )}
              </div>
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
          </>
        )}

        {variant === 'freelancer' && (
          <>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
            {freelancerState === 'invited' ? (
              <div className="flex items-center gap-2">
                <EscrowLockBadge funded={escrowFunded} />
                {milestoneCount !== undefined && (
                  <MilestoneCount count={milestoneCount} />
                )}
              </div>
            ) : (
              milestoneCount !== undefined && (
                <MilestoneCount count={milestoneCount} />
              )
            )}
            {freelancerState === 'in_progress' &&
            showProgress &&
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
          </>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
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

        <div className="flex shrink-0 items-center gap-2" onClick={stop} onKeyDown={stop as never}>
          {variant === 'client' && showInvite && onInvite && (
            <Button size="sm" variant="secondary" onClick={onInvite}>
              Invite
            </Button>
          )}
          {isJobboard && showApply && (
            <Button size="sm" className="px-[18px]" onClick={onApply}>
              Apply
            </Button>
          )}
          {variant === 'client' && showReviewApplicants && onReviewApplicants && (
            <Button size="sm" onClick={onReviewApplicants}>
              Applications
            </Button>
          )}
          {variant === 'client' && footLinkTo && !showReviewApplicants && (
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
              <Button
                size="sm"
                variant={submitLabel === 'Withdraw' ? 'ghost' : 'primary'}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            )}
        </div>
        </div>
      </div>
    </article>
  )
}
