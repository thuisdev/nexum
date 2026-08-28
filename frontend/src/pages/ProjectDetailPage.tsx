import { ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { StarRating } from '@/components/ui/StarRating'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { StickyActionBar } from '@/components/ui/StickyActionBar'
import {
  ActivityTimeline,
  ApplyDialog,
  ApproveDialog,
  InviteFreelancerModal,
  MilestoneCard,
  ProjectDetailHero,
  ProjectEscrowSection,
  ProjectOverflowMenu,
  SubmitWorkDialog,
  type ProjectDetailParty,
  type ProjectOverflowItem,
} from '@/components/features'
import { DeclineInviteDialog } from '@/components/features/dialogs/DeclineInviteDialog'
import { ReviewDialog } from '@/components/features/dialogs/ReviewDialog'
import { DisputeDialog } from '@/components/features/dialogs/DisputeDialog'
import {
  DisputePanel,
  ResolveDisputeDialog,
} from '@/components/features/dialogs/ResolveDisputeDialog'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { SectionLabel } from '@/components/ui/Tag'
import { ProjectDetailSkeleton } from '@/components/ui/Skeleton'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import {
  acceptInvite,
  approveMilestone,
  cancelInvite,
  createProjectReview,
  declineInvite,
  deleteProject,
  fundProject,
  getMyProjectReview,
  getProject,
  getProjectActivity,
  getProjectPreview,
  openDispute,
  resolveDispute,
  submitMilestone,
  type ProjectReview,
} from '@/lib/projects.api'
import {
  applyToProject,
  getMyApplication,
  withdrawApplication,
} from '@/lib/applications.api'
import { markProjectNotificationsRead } from '@/lib/notifications.api'
import {
  canApproveMilestone,
  canDeleteProject,
  canEditProject,
  canOpenApplicationsReview,
  canSubmitMilestone,
  displayName,
  formatDeadline,
  mapMilestoneStatus,
  mapProjectStatus,
  previewClientName,
  projectEscrowFunded,
  resolveClientCardStatus,
  resolveDisputeCta,
  resolveFreelancerCardStatus,
  uploadFileUrl,
} from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Milestone, Project, ProjectActivity, ProjectPreview } from '@/types/project'
import type { Application } from '@/types/application'
import axios from 'axios'
import { ReviewApplicationsModal } from '@/components/features/applications/ReviewApplicationsModal'

const COMPLETED_MILESTONE_STATUSES = new Set(['PAID', 'REFUNDED'])

function isCompletedMilestone(status: string) {
  return COMPLETED_MILESTONE_STATUSES.has(status)
}

function resolveParties(
  project: Project | null,
  preview: ProjectPreview | null,
): ProjectDetailParty[] {
  const parties: ProjectDetailParty[] = []

  if (project?.client) {
    parties.push({
      id: project.client.id,
      name: displayName(project.client),
      role: 'Client',
      avatarUrl: project.client.avatarUrl,
      verified: project.client.isVerified,
    })
  } else if (preview?.client) {
    parties.push({
      id: preview.client.id,
      name: previewClientName(preview),
      role: 'Client',
    })
  }

  if (project?.freelancer) {
    parties.push({
      id: project.freelancer.id,
      name: displayName(project.freelancer),
      role: 'Freelancer',
      avatarUrl: project.freelancer.avatarUrl,
      verified: project.freelancer.isVerified,
    })
  }

  if (!project?.freelancer && project?.invitedFreelancer) {
    parties.push({
      id: project.invitedFreelancer.id,
      name: displayName(project.invitedFreelancer),
      role: 'Freelancer',
      avatarUrl: project.invitedFreelancer.avatarUrl,
      verified: project.invitedFreelancer.isVerified,
    })
  }

  return parties
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [preview, setPreview] = useState<ProjectPreview | null>(null)
  const [activity, setActivity] = useState<ProjectActivity[]>([])
  const [mode, setMode] = useState<'full' | 'preview' | 'error'>('full')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(searchParams.get('invite') === '1')
  const [applicationsOpen, setApplicationsOpen] = useState(
    searchParams.get('applications') === '1',
  )
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [viewDisputeOpen, setViewDisputeOpen] = useState(false)
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null)
  const [submitNote, setSubmitNote] = useState('')
  const [submitFile, setSubmitFile] = useState<File | null>(null)
  const [approveMilestoneId, setApproveMilestoneId] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyPitch, setApplyPitch] = useState('')
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [showCompletedMilestones, setShowCompletedMilestones] = useState(false)
  const [myReview, setMyReview] = useState<ProjectReview | null>(null)
  const [myApplication, setMyApplication] = useState<Application | null>(null)
  const reloadProject = useCallback(async () => {
    if (!id || authLoading) return

    setLoading(true)
    setError(null)

    if (user) {
      try {
        const full = await getProject(id)
        setProject(full)
        setPreview(null)
        setMode('full')
        try {
          const logs = await getProjectActivity(id)
          setActivity(logs)
        } catch {
          setActivity([])
        }

        void markProjectNotificationsRead(id).catch(() => undefined)

        if (user.role === 'FREELANCER' || user.role === 'ADMIN') {
          try {
            const app = await getMyApplication(id)
            setMyApplication(app)
          } catch {
            setMyApplication(null)
          }
        } else {
          setMyApplication(null)
        }

        if (full.status === 'COMPLETED') {
          try {
            const review = await getMyProjectReview(id)
            setMyReview(review)
          } catch {
            setMyReview(null)
          }
        } else {
          setMyReview(null)
        }

        setLoading(false)
        return
      } catch (err) {
        if (
          !axios.isAxiosError(err) ||
          (err.response?.status !== 403 && err.response?.status !== 404)
        ) {
          setError(getApiErrorMessage(err, 'Could not load project'))
          setMode('error')
          setLoading(false)
          return
        }
      }
    }

    try {
      const data = await getProjectPreview(id)
      setPreview(data)
      setProject(null)
      setActivity([])
      setMyReview(null)
      if (user?.role === 'FREELANCER') {
        try {
          const app = await getMyApplication(id)
          setMyApplication(app)
        } catch {
          setMyApplication(null)
        }
      } else {
        setMyApplication(null)
      }
      setMode('preview')
    } catch {
      setError(
        user
          ? 'This project is private or does not exist.'
          : 'Project not found. Log in if you were invited.',
      )
      setMode('error')
    } finally {
      setLoading(false)
    }
  }, [id, user, authLoading])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch updates page state
    void reloadProject()
  }, [reloadProject])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when switching projects
    setShowCompletedMilestones(false)
  }, [id])

  const closeInviteModal = () => {
    setInviteOpen(false)
    if (searchParams.get('invite')) {
      searchParams.delete('invite')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const closeApplicationsModal = () => {
    setApplicationsOpen(false)
    if (searchParams.get('applications')) {
      searchParams.delete('applications')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleAccept = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await acceptInvite(id)
      void markProjectNotificationsRead(id).catch(() => undefined)
      const full = await getProject(id)
      setProject(full)
      setMode('full')
      const logs = await getProjectActivity(id)
      setActivity(logs)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept invite'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeclineInvite = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await declineInvite(id, declineReason)
      setDeclineOpen(false)
      setDeclineReason('')
      navigate(ROUTES.freelancerDashboard)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not decline invite'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdrawApplication = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await withdrawApplication(id)
      setMyApplication(null)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not withdraw application'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id || rating < 1) return
    setActionLoading(true)
    try {
      const review = await createProjectReview(id, {
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      })
      setMyReview(review)
      setReviewOpen(false)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit review'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleFund = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await fundProject(id)
      const full = await getProject(id)
      setProject(full)
      setMode('full')
      const logs = await getProjectActivity(id)
      setActivity(logs)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not fund project'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleApply = async () => {
    if (!id || applyPitch.trim().length < 10) return
    setActionLoading(true)
    try {
      const app = await applyToProject(id, applyPitch.trim())
      setMyApplication(app)
      setApplyOpen(false)
      setApplyPitch('')
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send application'))
    } finally {
      setActionLoading(false)
    }
  }

  const isClientOwner =
    mode === 'full' &&
    project &&
    user &&
    user.id === project.clientId &&
    (user.role === 'CLIENT' || user.role === 'ADMIN')

  const canEdit =
    mode === 'full' && project && user && canEditProject(project, user.id)

  const canDelete =
    mode === 'full' && project && user && canDeleteProject(project, user.id)

  const disputeCta =
    mode === 'full' && project && user
      ? resolveDisputeCta(project, user.id, user.role)
      : null
  const isInvitedFreelancer =
    mode === 'full' &&
    project &&
    user?.id === project.invitedFreelancerId &&
    !project.freelancerId

  const canInvite = Boolean(
    isClientOwner &&
      project &&
      (project.status === 'DRAFT' || project.status === 'FUNDED') &&
      !project.freelancerId,
  )

  const canCancelInvite = Boolean(
    canInvite && project?.invitedFreelancerId,
  )

  const handleCancelInvite = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await cancelInvite(id)
      await reloadProject()
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not cancel invite'))
    } finally {
      setActionLoading(false)
    }
  }

  const canFund =
    isClientOwner &&
    project?.status === 'DRAFT' &&
    project.escrowStatus !== 'FUNDED'

  const canReviewApplications = Boolean(
    mode === 'full' &&
      project &&
      user &&
      canOpenApplicationsReview(project, user.id) &&
      (project.pendingApplicationCount ?? 0) > 0,
  )

  const isPublicProject = project?.isPublic ?? preview?.isPublic ?? false
  const isOpenFundedJob =
    (project?.status ?? preview?.status) === 'FUNDED' &&
    (project?.escrowStatus ?? preview?.escrowStatus) === 'FUNDED' &&
    !(project?.freelancerId ?? false)
  const isFreelancerUser =
    user?.role === 'FREELANCER' || user?.role === 'ADMIN'
  const canGuestApply = Boolean(mode === 'preview' && !user && isPublicProject && isOpenFundedJob)

  const canApply = Boolean(
    user &&
      isFreelancerUser &&
      isPublicProject &&
      isOpenFundedJob &&
      !isInvitedFreelancer &&
      user.id !== (project?.clientId ?? preview?.client.id) &&
      (!myApplication || myApplication.status === 'REJECTED'),
  )

  const applicationPending = myApplication?.status === 'PENDING'

  const reviewSubject =
    project && user
      ? user.id === project.clientId
        ? project.freelancer
        : project.client
      : null

  const canLeaveReview = Boolean(
    mode === 'full' &&
      project?.status === 'COMPLETED' &&
      user &&
      reviewSubject &&
      !myReview,
  )

  const title = project?.title ?? preview?.title ?? 'Project'
  const description = project?.description ?? preview?.description
  const budget = project?.totalBudget ?? preview?.totalBudget ?? '0'
  const currency = project?.currency ?? preview?.currency ?? 'USDC'
  const skills = project?.skills ?? preview?.skills ?? []
  const parties = resolveParties(project, preview)

  const statusInfo =
    mode === 'full' && project && user
      ? user.id === project.clientId
        ? resolveClientCardStatus(project)
        : resolveFreelancerCardStatus(project, user.id)
      : {
          status: mapProjectStatus(preview?.status ?? 'DRAFT'),
        }

  const milestones: Milestone[] = useMemo(
    () =>
      mode === 'full'
        ? (project?.milestones ?? [])
        : (preview?.milestones ?? []).map((milestone, index) => ({
            id: String(index),
            orderIndex: milestone.orderIndex,
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            deadline: milestone.deadline,
            status: 'PENDING',
            latestSubmission: null,
          })),
    [mode, project?.milestones, preview?.milestones],
  )

  const milestoneStats = useMemo(() => {
    const total = milestones.length
    const paid = milestones.filter((m) => m.status === 'PAID').length
    return { total, paid }
  }, [milestones])

  const completedMilestoneCount = useMemo(
    () => milestones.filter((m) => isCompletedMilestone(m.status)).length,
    [milestones],
  )

  const activeMilestones = useMemo(
    () => milestones.filter((m) => !isCompletedMilestone(m.status)),
    [milestones],
  )

  const completedMilestones = useMemo(
    () => milestones.filter((m) => isCompletedMilestone(m.status)),
    [milestones],
  )

  const handleDelete = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await deleteProject(id)
      navigate(ROUTES.clientDashboard)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete project'))
      setDeleteOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenDispute = async (reason: string) => {
    if (!id || !disputeCta || disputeCta.action !== 'open') return
    if (reason.length < 10) {
      setError('Please describe the issue in at least 10 characters')
      return
    }
    setActionLoading(true)
    try {
      await openDispute(id, {
        milestoneId: disputeCta.milestoneId,
        reason,
      })
      setDisputeOpen(false)
      await reloadProject()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not open dispute'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveDispute = async (outcome: string, resolution: string) => {
    if (!project?.openDispute || resolution.length < 5) return
    setActionLoading(true)
    try {
      await resolveDispute(project.openDispute.id, { outcome, resolution })
      setResolveOpen(false)
      await reloadProject()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resolve dispute'))
    } finally {
      setActionLoading(false)
    }
  }

  const closeSubmitDialog = () => {
    setSubmitMilestoneId(null)
    setSubmitNote('')
    setSubmitFile(null)
  }

  const closeApproveDialog = () => {
    setApproveMilestoneId(null)
  }

  const handleSubmitWork = async () => {
    if (!submitMilestoneId || submitNote.trim().length < 50) return
    setActionLoading(true)
    try {
      const full = await submitMilestone(
        submitMilestoneId,
        submitNote.trim(),
        submitFile,
      )
      setProject(full)
      if (id) {
        const logs = await getProjectActivity(id)
        setActivity(logs)
      }
      closeSubmitDialog()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit work'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveWork = async () => {
    if (!approveMilestoneId) return
    setActionLoading(true)
    try {
      const full = await approveMilestone(approveMilestoneId)
      setProject(full)
      if (id) {
        const logs = await getProjectActivity(id)
        setActivity(logs)
      }
      closeApproveDialog()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not approve milestone'))
    } finally {
      setActionLoading(false)
    }
  }

  const submitTarget = submitMilestoneId
    ? project?.milestones.find((m) => m.id === submitMilestoneId)
    : null

  const approveTarget = approveMilestoneId
    ? project?.milestones.find((m) => m.id === approveMilestoneId)
    : null

  const resolveMilestoneCardAction = (milestone: Milestone) => {
    if (!project || !user) return {}

    if (canSubmitMilestone(project, milestone, user.id)) {
      return {
        actionLabel: 'Submit work',
        actionVariant: 'primary' as const,
        onAction: () => setSubmitMilestoneId(milestone.id),
      }
    }

    if (canApproveMilestone(project, milestone, user.id)) {
      return {
        actionLabel: 'Approve',
        actionVariant: 'approve' as const,
        onAction: () => setApproveMilestoneId(milestone.id),
      }
    }

    return {}
  }

  const renderMilestoneCard = (milestone: Milestone) => {
    const cardAction = resolveMilestoneCardAction(milestone)
    const orderIndex =
      milestones.findIndex((item) => item.id === milestone.id) + 1

    return (
      <MilestoneCard
        key={milestone.id ?? milestone.orderIndex}
        orderLabel={`Milestone ${orderIndex || milestone.orderIndex + 1}`}
        title={milestone.title}
        description={milestone.description}
        amount={milestone.amount}
        deadline={formatDeadline(milestone.deadline)}
        status={mapMilestoneStatus(milestone.status)}
        submission={milestone.latestSubmission}
        fileDownloadUrl={uploadFileUrl(milestone.latestSubmission?.fileUrl)}
        paidAt={milestone.paidAt}
        {...cardAction}
      />
    )
  }

  const overflowItems = useMemo((): ProjectOverflowItem[] => {
    if (!id) return []
    const items: ProjectOverflowItem[] = []
    if (canEdit) {
      items.push({
        id: 'edit',
        label: 'Edit project',
        onClick: () => navigate(ROUTES.editProject(id)),
      })
    }
    if (canDelete) {
      items.push({
        id: 'delete',
        label: 'Delete project',
        tone: 'danger',
        onClick: () => setDeleteOpen(true),
      })
    }
    return items
  }, [canDelete, canEdit, id, navigate])

  const workflowActions = (
    <>
      {canInvite && id && (
        <Button className="w-full sm:w-auto" onClick={() => setInviteOpen(true)}>
          {project?.invitedFreelancerId ? 'Change invite' : 'Invite freelancer'}
        </Button>
      )}
      {canCancelInvite && (
        <Button
          variant="ghost"
          className="w-full sm:w-auto"
          loading={actionLoading}
          onClick={() => void handleCancelInvite()}
        >
          Cancel invite
        </Button>
      )}
      {canReviewApplications && (
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setApplicationsOpen(true)}
        >
          Review applications
        </Button>
      )}
      {isInvitedFreelancer && (
        <>
          <Button
            className="w-full sm:w-auto"
            loading={actionLoading}
            onClick={() => void handleAccept()}
          >
            Accept invite
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => setDeclineOpen(true)}
          >
            Decline
          </Button>
        </>
      )}
      {mode === 'full' && project && canFund && (
        <Button
          className="w-full sm:w-auto"
          loading={actionLoading}
          onClick={() => void handleFund()}
        >
          Fund project
        </Button>
      )}
      {canGuestApply && (
        <>
          <Button className="w-full sm:w-auto" onClick={() => navigate(ROUTES.register)}>
            Sign up to apply
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => navigate(ROUTES.login)}
          >
            Log in
          </Button>
        </>
      )}
      {canApply && (
        <Button className="w-full sm:w-auto" onClick={() => setApplyOpen(true)}>
          Apply to project
        </Button>
      )}
      {applicationPending && (
        <Button
          className="w-full sm:w-auto"
          variant="ghost"
          loading={actionLoading}
          onClick={() => void handleWithdrawApplication()}
        >
          Withdraw application
        </Button>
      )}
      {canLeaveReview && (
        <Button className="w-full sm:w-auto" onClick={() => setReviewOpen(true)}>
          Leave a review
        </Button>
      )}
    </>
  )

  const hasMobileActions = Boolean(
    canInvite ||
      canCancelInvite ||
      canReviewApplications ||
      isInvitedFreelancer ||
      canFund ||
      canApply ||
      applicationPending ||
      canLeaveReview ||
      canGuestApply,
  )

  if (loading) {
    return (
      <AppSection className="!py-8 md:!py-12">
        <ProjectDetailSkeleton />
      </AppSection>
    )
  }

  if (mode === 'error') {
    return (
      <AppSection className="!py-8 md:!py-12">
        <InlineAlert variant="error">{error ?? 'Project not found'}</InlineAlert>
      </AppSection>
    )
  }

  return (
    <>
      <AppSection className={hasMobileActions ? '!pb-28 md:!pb-12' : '!py-8 md:!py-12'}>
        <div className="flex flex-col gap-10">
          {error && <InlineAlert variant="error">{error}</InlineAlert>}

          {myApplication?.status === 'REJECTED' && (
            <InlineAlert variant="info">
              Your previous application was not selected. You can apply again with a
              new pitch.
            </InlineAlert>
          )}

          <ProjectDetailHero
            title={title}
            status={statusInfo.status}
            statusLabel={statusInfo.label}
            skills={skills}
            escrowFunded={
              mode === 'full' && project
                ? projectEscrowFunded(project)
                : preview
                  ? projectEscrowFunded({
                      escrowStatus: preview.escrowStatus ?? 'NOT_FUNDED',
                      status: preview.status,
                    })
                  : undefined
            }
            milestoneCount={milestoneStats.total}
            milestonesPaid={milestoneStats.paid}
            milestonesTotal={milestoneStats.total}
            description={description}
            budget={budget}
            currency={currency}
            parties={parties}
            menu={<ProjectOverflowMenu items={overflowItems} />}
            actions={workflowActions}
          />

          <section className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
              <SectionLabel>Milestones</SectionLabel>
              <p className="text-sm text-ink-500">
                Scope, deadlines, and escrow releases for this project.
              </p>
            </div>
            {activeMilestones.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeMilestones.map((milestone) => renderMilestoneCard(milestone))}
              </div>
            ) : completedMilestoneCount > 0 ? (
              <EmptyPanel
                icon={ListChecks}
                title="All milestones completed"
                message="Use “Show completed” below to view paid milestones."
              />
            ) : (
              <EmptyPanel
                icon={ListChecks}
                title="No milestones yet"
                message="Milestones define scope, deadlines, and escrow releases for this project."
              />
            )}
            {completedMilestoneCount > 0 && (
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCompletedMilestones((prev) => !prev)}
                    className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {showCompletedMilestones
                      ? 'Hide completed'
                      : `Show completed (${completedMilestoneCount})`}
                  </button>
                </div>
                {showCompletedMilestones && (
                  <div className="flex flex-col gap-3 border-t border-ink-100 pt-4">
                    <SectionLabel>Completed</SectionLabel>
                    <div className="flex flex-col gap-3">
                      {completedMilestones.map((milestone) =>
                        renderMilestoneCard(milestone),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {mode === 'full' && (
            <section className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <SectionLabel>Activity</SectionLabel>
                <p className="text-sm text-ink-500">
                  Recent project events and status changes.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
                <ActivityTimeline items={activity} />
              </div>
            </section>
          )}

          {myReview && (
            <section className="flex flex-col gap-3 text-left">
              <SectionLabel>Your review</SectionLabel>
              <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
                <StarRating rating={myReview.rating} size="md" />
                {myReview.comment && (
                  <p className="mt-2 text-sm leading-5 text-ink-600">{myReview.comment}</p>
                )}
              </div>
            </section>
          )}

          {mode === 'full' && (
            <ProjectEscrowSection
              funded={project ? projectEscrowFunded(project) : false}
              disputeCta={disputeCta}
              openDispute={project?.openDispute}
              onOpenDispute={() => setDisputeOpen(true)}
              onViewDispute={() => setViewDisputeOpen(true)}
              onResolveDispute={() => setResolveOpen(true)}
            />
          )}
        </div>

        {id && (
          <InviteFreelancerModal
            open={inviteOpen}
            projectId={id}
            onClose={closeInviteModal}
            onSuccess={() => void reloadProject()}
          />
        )}

        {id && (
          <ReviewApplicationsModal
            open={applicationsOpen}
            projectId={id}
            projectTitle={project?.title}
            onClose={closeApplicationsModal}
            onUpdated={() => void reloadProject()}
            showProjectLink={false}
          />
        )}

        <Modal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete project?"
          footer={
            <ModalActions
              onCancel={() => setDeleteOpen(false)}
              onConfirm={() => void handleDelete()}
              confirmLabel="Delete"
              confirmVariant="danger"
              loading={actionLoading}
            />
          }
        >
          <p className="text-base leading-6 text-ink-900">
            This permanently removes the project and all milestones. This can&apos;t
            be undone.
          </p>
        </Modal>

        {disputeCta?.action === 'open' && (
          <DisputeDialog
            open={disputeOpen}
            onClose={() => setDisputeOpen(false)}
            onConfirm={(reason) => void handleOpenDispute(reason)}
            loading={actionLoading}
            milestoneTitle={disputeCta.milestoneTitle}
            hint={disputeCta.hint}
          />
        )}

        {project?.openDispute && (
          <>
            <Modal
              open={viewDisputeOpen}
              onClose={() => setViewDisputeOpen(false)}
              title="Dispute details"
              footer={
                <Button variant="ghost" onClick={() => setViewDisputeOpen(false)}>
                  Close
                </Button>
              }
            >
              <DisputePanel dispute={project.openDispute} />
            </Modal>
            <ResolveDisputeDialog
              open={resolveOpen}
              onClose={() => setResolveOpen(false)}
              onConfirm={(outcome, resolution) =>
                void handleResolveDispute(outcome, resolution)
              }
              loading={actionLoading}
              dispute={project.openDispute}
            />
          </>
        )}

        {submitTarget && (
          <SubmitWorkDialog
            open={Boolean(submitMilestoneId)}
            onClose={closeSubmitDialog}
            onSubmit={() => void handleSubmitWork()}
            loading={actionLoading}
            milestoneTitle={submitTarget.title}
            note={submitNote}
            onNoteChange={setSubmitNote}
            file={submitFile}
            onFileChange={setSubmitFile}
          />
        )}

        {approveTarget && project?.freelancer && (
          <ApproveDialog
            open={Boolean(approveMilestoneId)}
            onClose={closeApproveDialog}
            onConfirm={() => void handleApproveWork()}
            loading={actionLoading}
            amount={approveTarget.amount}
            recipient={displayName(project.freelancer)}
          />
        )}

        <ApplyDialog
          open={applyOpen}
          onClose={() => {
            setApplyOpen(false)
            setApplyPitch('')
          }}
          onSubmit={() => void handleApply()}
          loading={actionLoading}
          pitch={applyPitch}
          onPitchChange={setApplyPitch}
        />

        <DeclineInviteDialog
          open={declineOpen}
          onClose={() => {
            setDeclineOpen(false)
            setDeclineReason('')
          }}
          onSubmit={() => void handleDeclineInvite()}
          loading={actionLoading}
          reason={declineReason}
          onReasonChange={setDeclineReason}
        />

        {reviewSubject && (
          <ReviewDialog
            open={reviewOpen}
            onClose={() => setReviewOpen(false)}
            onSubmit={(rating, comment) => void handleSubmitReview(rating, comment)}
            loading={actionLoading}
            subjectName={displayName(reviewSubject)}
          />
        )}
      </AppSection>
      {hasMobileActions && (
        <StickyActionBar>{workflowActions}</StickyActionBar>
      )}
    </>
  )
}
