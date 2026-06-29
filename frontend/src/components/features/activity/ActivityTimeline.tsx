import { ActivityTimelineItem } from '@/components/features/activity/ActivityTimelineItem'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { formatRelativeTime, displayName } from '@/lib/projectDisplay'
import { History } from 'lucide-react'
import type { ProjectActivity } from '@/types/project'

const actionLabels: Record<string, string> = {
  PROJECT_CREATED: 'created the project',
  PROJECT_UPDATED: 'updated the project',
  FREELANCER_INVITED: 'invited a freelancer',
  FREELANCER_ACCEPTED: 'accepted the invite',
  PROJECT_FUNDED: 'funded the escrow',
  MILESTONES_ADDED: 'added milestones',
  MILESTONE_SUBMITTED: 'submitted work',
  MILESTONE_APPROVED: 'approved a milestone',
  MILESTONE_PAID: 'released payment',
  PROJECT_COMPLETED: 'completed the project',
}

export type ActivityTimelineProps = {
  items: ProjectActivity[]
  className?: string
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <EmptyPanel
        icon={History}
        title="No activity yet"
        message="Project events will appear here as work progresses."
      />
    )
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <ActivityTimelineItem
          key={item.id}
          actor={displayName(item.actor)}
          action={actionLabels[item.action] ?? item.action.toLowerCase().replace(/_/g, ' ')}
          time={formatRelativeTime(item.createdAt)}
          type={
            item.action.includes('FUNDED') || item.action.includes('ACCEPTED')
              ? 'approved'
              : item.action.includes('INVITED') || item.action.includes('SUBMITTED')
                ? 'submitted'
                : 'default'
          }
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  )
}
