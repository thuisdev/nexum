import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'
import { mapMilestoneStatus } from '@/lib/projectDisplay'

export type MilestoneStepperItem = {
  id: string
  title: string
  status: string
}

export type MilestoneStepperProps = {
  milestones: MilestoneStepperItem[]
  className?: string
}

export function MilestoneStepper({ milestones, className }: MilestoneStepperProps) {
  if (milestones.length === 0) return null

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1',
        className,
      )}
    >
      {milestones.map((milestone, index) => {
        const badgeStatus = mapMilestoneStatus(milestone.status) as StatusBadgeStatus
        return (
          <div
            key={milestone.id}
            className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl border border-ink-200 bg-ink-50/50 px-3 py-3"
          >
            <span className="text-xs font-medium text-ink-400">
              Step {index + 1}
            </span>
            <p className="truncate text-sm font-medium text-ink-900">
              {milestone.title}
            </p>
            <StatusBadge status={badgeStatus} className="w-fit" />
          </div>
        )
      })}
    </div>
  )
}
