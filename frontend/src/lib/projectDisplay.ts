import type { Project, ProjectPreview, JobBoardProject } from '@/types/project'
import type { PublicUserProfile } from '@/types/user'
import type { StatusBadgeStatus } from '@/components/ui/StatusBadge'

export function displayName(
  user: Pick<PublicUserProfile, 'displayName' | 'name'> | null | undefined,
  fallback = 'Anonymous',
) {
  return user?.displayName ?? user?.name ?? fallback
}

export function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString()
}

export function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function mapProjectStatus(status: string): StatusBadgeStatus {
  switch (status) {
    case 'DRAFT':
      return 'DRAFT'
    case 'FUNDED':
      return 'FUNDED'
    case 'IN_PROGRESS':
      return 'IN_PROGRESS'
    case 'COMPLETED':
      return 'COMPLETED'
    case 'CANCELLED':
      return 'REJECTED'
    default:
      return 'DRAFT'
  }
}

export function resolveClientCardStatus(project: Project): {
  status: StatusBadgeStatus
  label?: string
} {
  if (project.status !== 'DRAFT') {
    return { status: mapProjectStatus(project.status) }
  }

  if (project.invitedFreelancerId && !project.freelancerId) {
    return { status: 'INVITED', label: 'Invite sent' }
  }

  if (project.freelancerId) {
    return { status: 'PENDING', label: 'Awaiting funding' }
  }

  return { status: 'DRAFT' }
}

export function resolveFreelancerCardStatus(
  project: Project,
  userId: string,
): { status: StatusBadgeStatus; label?: string } {
  if (project.invitedFreelancerId === userId && !project.freelancerId) {
    return { status: 'INVITED' }
  }

  if (project.freelancerId === userId && project.status === 'DRAFT') {
    return { status: 'PENDING', label: 'Awaiting funding' }
  }

  return { status: mapProjectStatus(project.status) }
}

export function projectEscrowLabel(project: Project) {
  if (project.escrowStatus === 'FUNDED' || project.status === 'IN_PROGRESS') {
    return 'Escrow-funded'
  }

  return 'Escrow-backed'
}

export function mapMilestoneStatus(status: string): StatusBadgeStatus {
  switch (status) {
    case 'PENDING':
      return 'PENDING'
    case 'IN_PROGRESS':
      return 'IN_PROGRESS'
    case 'SUBMITTED':
      return 'SUBMITTED'
    case 'APPROVED':
      return 'APPROVED'
    case 'PAID':
      return 'PAID'
    default:
      return 'PENDING'
  }
}

export function projectDraftMeta(project: Project) {
  if (project.isPublic) {
    return 'Not funded yet · public on job board'
  }
  if (project.invitedFreelancerId && !project.freelancerId) {
    return 'Private · invite sent · waiting for acceptance'
  }
  if (!project.freelancerId) {
    return 'Private · invite a freelancer'
  }
  return 'Private · freelancer accepted'
}

export function jobToCardProps(job: JobBoardProject) {
  const lastMilestone = job.milestoneCount
  return {
    id: job.id,
    title: job.title,
    amount: job.totalBudget,
    currency: job.currency,
    partyName: displayName(job.client),
    tags: job.skills,
    milestoneCount: lastMilestone,
    escrowLabel: 'Escrow-backed',
    timeAgo: formatRelativeTime(job.createdAt),
  }
}

export function projectToClientCardProps(project: Project) {
  const cardStatus = resolveClientCardStatus(project)

  return {
    id: project.id,
    title: project.title,
    amount: project.totalBudget,
    currency: project.currency,
    status: cardStatus.status,
    statusLabel: cardStatus.label,
    tags: project.skills,
    clientState:
      project.status === 'DRAFT' ? ('draft' as const) : ('in_progress' as const),
    draftMeta: projectDraftMeta(project),
    milestoneCount: project.milestones.length,
    escrowLabel: projectEscrowLabel(project),
  }
}

export function projectToFreelancerCardProps(
  project: Project,
  userId: string,
) {
  const isInvited =
    project.invitedFreelancerId === userId && !project.freelancerId
  const cardStatus = resolveFreelancerCardStatus(project, userId)

  return {
    id: project.id,
    title: project.title,
    amount: project.totalBudget,
    currency: project.currency,
    status: cardStatus.status,
    statusLabel: cardStatus.label,
    tags: project.skills,
    freelancerState: isInvited
      ? ('invited' as const)
      : ('in_progress' as const),
    milestoneCount: project.milestones.length,
    escrowLabel: projectEscrowLabel(project),
  }
}

export function previewClientName(preview: ProjectPreview) {
  return displayName(preview.client)
}
