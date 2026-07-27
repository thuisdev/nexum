import type { Milestone, Project, ProjectPreview, JobBoardProject } from '@/types/project'
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
      return 'CANCELLED'
    case 'SUBMITTED':
      return 'SUBMITTED'
    default:
      return 'DRAFT'
  }
}

export function resolveClientCardStatus(project: Project): {
  status: StatusBadgeStatus
  label?: string
} {
  if (project.openDispute) {
    return { status: 'DISPUTED', label: 'Under review' }
  }

  const isOpenForHire =
    (project.status === 'DRAFT' || project.status === 'FUNDED') &&
    !project.freelancerId

  if (isOpenForHire && project.invitedFreelancerId) {
    return { status: 'INVITED', label: 'Invite sent' }
  }

  if (isOpenForHire && project.isPublic) {
    const count = project.pendingApplicationCount ?? 0
    if (count > 0) {
      return {
        status: 'PENDING',
        label: `${count} applicant${count === 1 ? '' : 's'}`,
      }
    }
    return {
      status: project.status === 'FUNDED' ? 'FUNDED' : 'PENDING',
      label:
        project.status === 'FUNDED'
          ? 'Funded · open for applications'
          : 'Open for applications',
    }
  }

  if (project.freelancerId && project.escrowStatus === 'NOT_FUNDED') {
    return { status: 'PENDING', label: 'Awaiting funding' }
  }

  if (project.status === 'FUNDED' && !project.freelancerId) {
    return { status: 'FUNDED', label: 'Funded · pick freelancer' }
  }

  if (project.status !== 'DRAFT') {
    return { status: mapProjectStatus(project.status) }
  }

  return { status: 'DRAFT' }
}

/** Client can review applications on an open public project (draft or prefunded). */
export function canOpenApplicationsReview(
  project: Project,
  userId: string,
): boolean {
  return (
    project.clientId === userId &&
    project.isPublic &&
    !project.freelancerId &&
    (project.status === 'DRAFT' || project.status === 'FUNDED') &&
    !project.invitedFreelancerId
  )
}

export function resolveFreelancerCardStatus(
  project: Project,
  userId: string,
): { status: StatusBadgeStatus; label?: string } {
  if (project.openDispute) {
    return { status: 'DISPUTED', label: 'Under review' }
  }

  if (project.invitedFreelancerId === userId && !project.freelancerId) {
    return { status: 'INVITED' }
  }

  if (project.freelancerId === userId && project.status === 'DRAFT') {
    return { status: 'PENDING', label: 'Awaiting funding' }
  }

  return { status: mapProjectStatus(project.status) }
}

export function projectEscrowFunded(
  project: Pick<Project, 'escrowStatus' | 'status'>,
): boolean {
  return (
    project.escrowStatus === 'FUNDED' ||
    project.escrowStatus === 'RELEASED' ||
    project.status === 'IN_PROGRESS' ||
    project.status === 'COMPLETED'
  )
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
    case 'REVISION':
      return 'REVISION'
    case 'DISPUTED':
      return 'DISPUTED'
    default:
      return 'PENDING'
  }
}

export function projectDraftMeta(project: Project) {
  if (project.isPublic) {
    if (!project.freelancerId) {
      return 'Public · open for applications on job board'
    }
    return 'Public · freelancer selected'
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
  return {
    id: job.id,
    title: job.title,
    amount: job.totalBudget,
    currency: job.currency,
    partyName: displayName(job.client),
    tags: job.skills,
    milestoneCount: job.milestoneCount,
    escrowFunded: job.escrowStatus === 'FUNDED',
    timeAgo: formatRelativeTime(job.createdAt),
  }
}

export function projectToClientCardProps(project: Project) {
  const cardStatus = resolveClientCardStatus(project)
  const hasApplicants =
    project.isPublic &&
    !project.freelancerId &&
    (project.status === 'DRAFT' || project.status === 'FUNDED') &&
    !project.invitedFreelancerId
  const applicantCount = project.pendingApplicationCount ?? 0

  const party = project.freelancer
    ? {
        partyId: project.freelancer.id,
        partyLabel: 'Freelancer' as const,
        partyName: displayName(project.freelancer),
        partyAvatarUrl: project.freelancer.avatarUrl,
        verified: project.freelancer.isVerified,
      }
    : project.invitedFreelancer && project.invitedFreelancerId && !project.freelancerId
      ? {
          partyId: project.invitedFreelancer.id,
          partyLabel: 'Invited' as const,
          partyName: displayName(project.invitedFreelancer),
          partyAvatarUrl: project.invitedFreelancer.avatarUrl,
          verified: project.invitedFreelancer.isVerified,
        }
      : {}

  return {
    id: project.id,
    title: project.title,
    amount: project.totalBudget,
    currency: project.currency,
    status: cardStatus.status,
    statusLabel: cardStatus.label,
    tags: project.skills,
    clientState:
      project.status === 'DRAFT' || project.status === 'FUNDED'
        ? ('draft' as const)
        : ('in_progress' as const),
    draftMeta: projectDraftMeta(project),
    milestoneCount: project.milestones.length,
    escrowFunded: projectEscrowFunded(project),
    applicantCount: hasApplicants ? applicantCount : undefined,
    showReviewApplicants: hasApplicants,
    ...party,
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
    escrowFunded: projectEscrowFunded(project),
    ...(project.client
      ? {
          partyId: project.client.id,
          partyLabel: 'Client' as const,
          partyName: displayName(project.client),
          partyAvatarUrl: project.client.avatarUrl,
          verified: project.client.isVerified,
        }
      : {}),
  }
}

export function previewClientName(preview: ProjectPreview) {
  return displayName(preview.client)
}

export function canFullEditProject(project: Project, userId: string) {
  return (
    project.clientId === userId &&
    project.status === 'DRAFT' &&
    project.escrowStatus === 'NOT_FUNDED' &&
    !project.freelancerId
  )
}

export function canEditProject(project: Project, userId: string) {
  return canFullEditProject(project, userId)
}

export function canDeleteProject(project: Project, userId: string) {
  return canFullEditProject(project, userId)
}

const DISPUTABLE_MILESTONE_STATUSES = ['IN_PROGRESS', 'SUBMITTED'] as const

export function canApproveMilestone(
  project: Project,
  milestone: Milestone,
  userId: string,
) {
  return (
    project.clientId === userId &&
    project.status === 'IN_PROGRESS' &&
    milestone.status === 'SUBMITTED'
  )
}

export function canSubmitMilestone(
  project: Project,
  milestone: Milestone,
  userId: string,
) {
  return (
    project.freelancerId === userId &&
    project.status === 'IN_PROGRESS' &&
    milestone.status === 'IN_PROGRESS'
  )
}

/** Base URL for uploaded files (strip trailing /api from VITE_API_URL). */
export function uploadFileUrl(fileUrl: string | null | undefined) {
  if (!fileUrl) return null
  const apiBase = import.meta.env.VITE_API_URL ?? ''
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${fileUrl}`
}

export function findDisputableMilestone(project: Project, userId: string) {
  const isParty =
    userId === project.clientId || userId === project.freelancerId

  if (!isParty) return null

  return (
    project.milestones.find((m) => m.status === 'SUBMITTED') ??
    project.milestones.find((m) => m.status === 'IN_PROGRESS') ??
    project.milestones.find((m) =>
      DISPUTABLE_MILESTONE_STATUSES.includes(
        m.status as (typeof DISPUTABLE_MILESTONE_STATUSES)[number],
      ),
    ) ??
    null
  )
}

export function canRequestDispute(project: Project, userId: string) {
  if (project.openDispute) return false
  if (project.status !== 'IN_PROGRESS' && project.status !== 'FUNDED') {
    return false
  }
  return Boolean(findDisputableMilestone(project, userId))
}

export type DisputeCta =
  | {
      action: 'open'
      milestoneId: string
      milestoneTitle: string
      label: string
      hint: string
    }
  | { action: 'view'; label: string }
  | { action: 'arbiter'; label: string }

export function resolveDisputeCta(
  project: Project,
  userId: string,
  userRole: string,
): DisputeCta | null {
  if (project.openDispute) {
    if (userRole === 'ARBITER' || userRole === 'ADMIN') {
      return { action: 'arbiter', label: 'Resolve dispute' }
    }
    if (userId === project.clientId || userId === project.freelancerId) {
      return { action: 'view', label: 'View dispute' }
    }
    return null
  }

  if (project.status !== 'IN_PROGRESS' && project.status !== 'FUNDED') {
    return null
  }

  const milestone = findDisputableMilestone(project, userId)
  if (!milestone) return null

  const isClient = userId === project.clientId

  return {
    action: 'open',
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    label: 'Request arbiter review',
    hint: isClient
      ? 'Describe what does not match the agreed scope or delivery expectations.'
      : 'Describe the blocker — scope changes, deadlines, communication, or payment timing.',
  }
}
