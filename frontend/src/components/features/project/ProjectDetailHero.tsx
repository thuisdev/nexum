import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { EscrowPill } from '@/components/ui/EscrowPill'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'

export type ProjectDetailParty = {
  id: string
  name: string
  role: 'Client' | 'Freelancer'
  avatarUrl?: string | null
  verified?: boolean
}

export type ProjectDetailHeroProps = {
  title: string
  status: StatusBadgeStatus
  statusLabel?: string
  skills: string[]
  escrowLabel: string
  milestoneCount?: number
  milestonesPaid?: number
  milestonesTotal?: number
  description?: string
  budget: string
  currency: string
  parties?: ProjectDetailParty[]
  menu?: ReactNode
  actions?: ReactNode
  className?: string
}

function PartyLink({ party }: { party: ProjectDetailParty }) {
  return (
    <Link
      to={ROUTES.profile(party.id)}
      className="group flex w-fit items-center gap-2.5 rounded-full border border-ink-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition-[border-color,box-shadow] hover:border-brand-200 hover:shadow-md"
    >
      <Avatar src={party.avatarUrl} name={party.name} size="sm" />
      <span className="text-xs font-medium uppercase tracking-[1px] text-ink-400">
        {party.role}
      </span>
      <span className="text-sm font-medium text-ink-900 group-hover:text-brand-700">
        {party.name}
      </span>
      {party.verified && <VerifiedIcon size="sm" />}
    </Link>
  )
}

export function ProjectDetailHero({
  title,
  status,
  statusLabel,
  skills,
  escrowLabel,
  milestoneCount,
  milestonesPaid,
  milestonesTotal,
  description,
  budget,
  currency,
  parties = [],
  menu,
  actions,
  className,
}: ProjectDetailHeroProps) {
  const showProgress =
    milestonesTotal !== undefined &&
    milestonesTotal > 0 &&
    milestonesPaid !== undefined

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-brand-50/80 via-brand-50/40 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 p-6 md:p-8">
        <div className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="font-display text-[28px] font-bold leading-8 tracking-[-0.5px] text-ink-900 md:text-[34px] md:leading-10">
              {title}
            </h1>
            <div className="flex shrink-0 items-center gap-2 self-start">
              <StatusBadge
                status={status}
                label={statusLabel}
                className="w-fit shrink-0"
              />
              {menu}
            </div>
          </div>

          {parties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {parties.map((party) => (
                <PartyLink key={`${party.role}-${party.id}`} party={party} />
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          )}

          <EscrowPill label={escrowLabel} milestoneCount={milestoneCount} />

          {description && (
            <p className="max-w-3xl text-base leading-[26px] text-ink-600">
              {description}
            </p>
          )}

          {showProgress && (
            <ProgressBar
              milestonesDone={milestonesPaid}
              milestonesTotal={milestonesTotal}
              amountText={`${milestonesPaid} of ${milestonesTotal} milestones paid`}
              value={Math.round((milestonesPaid / milestonesTotal) * 100)}
              max={100}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-ink-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-xs font-medium uppercase tracking-[1.2px] text-ink-400">
              Total budget
            </span>
            <p className="font-mono text-[28px] font-medium leading-[34px] text-ink-900 md:text-[32px]">
              {budget}{' '}
              <span className="font-sans text-base font-normal text-ink-400">
                {currency}
              </span>
            </p>
          </div>
          {actions ? (
            <div className="hidden flex-col gap-2 sm:flex sm:flex-row sm:items-center md:flex">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
