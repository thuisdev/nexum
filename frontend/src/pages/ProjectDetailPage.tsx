import { ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { StickyActionBar } from '@/components/ui/StickyActionBar'
import {
  ActivityTimeline,
  ApplicationCard,
  ApplyDialog,
  ApproveDialog,
  InviteFreelancerModal,
  MilestoneCard,
  MilestoneStepper,
  ProjectDetailHero,
  ProjectEscrowSection,
  ProjectOverflowMenu,
  SubmitWorkDialog,
  type ProjectDetailParty,
  type ProjectOverflowItem,
} from '@/components/features'
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
  deleteProject,
  fundProject,
  getProject,
  getProjectActivity,
  getProjectPreview,
  openDispute,
  resolveDispute,
  submitMilestone,
} from '@/lib/projects.api'
import {
  acceptApplication,
  applyToProject,
  getMyApplication,
  listProjectApplications,
  rejectApplication,
} from '@/lib/applications.api'
import {
  canApproveMilestone,
  canDeleteProject,
  canEditProject,
  canSubmitMilestone,
  displayName,
  formatDeadline,
  formatRelativeTime,
  mapMilestoneStatus,
  mapProjectStatus,
  previewClientName,
  projectEscrowLabel,
  resolveClientCardStatus,
  resolveDisputeCta,
  resolveFreelancerCardStatus,
  uploadFileUrl,
} from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Application } from '@/types/application'
import type { Milestone, Project, ProjectActivity, ProjectPreview } from '@/types/project'
import axios from 'axios'

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

  return parties
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [preview, setPreview] = useState<ProjectPreview | null>(null)
  const [activity, setActivity] = useState<ProjectActivity[]>([])
  const [mode, setMode] = useState<'full' | 'preview' | 'error'>('full')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(searchParams.get('invite') === '1')
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [viewDisputeOpen, setViewDisputeOpen] = useState(false)
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null)
  const [submitNote, setSubmitNote] = useState('')
  const [submitFile, setSubmitFile] = useState<File | null>(null)
  const [approveMilestoneId, setApproveMilestoneId] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [myApplication, setMyApplication] = useState<Application | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyPitch, setApplyPitch] = useState('')
  const reloadProject = useCallback(async () => {
    if (!id) return

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
        if (full.clientId === user.id && full.isPublic && !full.freelancerId) {
          try {
            const apps = await listProjectApplications(id)
            setApplications(apps)
          } catch {
            setApplications([])
          }
        } else {
          setApplications([])
        }
        setMyApplication(null)
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
      setApplications([])
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
  }, [id, user])

  useEffect(() => {
    void reloadProject()
  }, [reloadProject])

  const closeInviteModal = () => {
    setInviteOpen(false)
    if (searchParams.get('invite')) {
      searchParams.delete('invite')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleAccept = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await acceptInvite(id)
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

  const handleAcceptApplication = async (applicationId: string) => {
    setActionLoading(true)
    try {
      await acceptApplication(applicationId)
      await reloadProject()
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept application'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    setActionLoading(true)
    try {
      await rejectApplication(applicationId)
      if (id) {
        const apps = await listProjectApplications(id)
        setApplications(apps)
      }
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reject application'))
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

  const canInvite =
    isClientOwner && project?.status === 'DRAFT' && !project.freelancerId && !project.invitedFreelancerId

  const canFund =
    isClientOwner &&
    project?.status === 'DRAFT' &&
    !!project.freelancerId

  const isPublicProject = project?.isPublic ?? preview?.isPublic ?? false
  const isDraftOpen =
    (project?.status ?? preview?.status) === 'DRAFT' &&
    !project?.freelancerId
  const isFreelancerUser =
    user?.role === 'FREELANCER' || user?.role === 'ADMIN'

  const canApply = Boolean(
    user &&
      isFreelancerUser &&
      isPublicProject &&
      isDraftOpen &&
      !isInvitedFreelancer &&
      user.id !== (project?.clientId ?? preview?.client.id) &&
      (!myApplication || myApplication.status === 'REJECTED'),
  )

  const applicationPending = myApplication?.status === 'PENDING'

  const canShowApplications = Boolean(
    isClientOwner &&
      project?.isPublic &&
      project.status === 'DRAFT' &&
      !project.freelancerId,
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

  const milestones: Milestone[] =
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
        }))

  const milestoneStats = useMemo(() => {
    const total = milestones.length
    const paid = milestones.filter((m) => m.status === 'PAID').length
    return { total, paid }
  }, [milestones])

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
        actionLabel: 'Review & approve',
        actionVariant: 'approve' as const,
        onAction: () => setApproveMilestoneId(milestone.id),
      }
    }

    return {}
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
          Invite freelancer
        </Button>
      )}
      {isInvitedFreelancer && (
        <Button
          className="w-full sm:w-auto"
          loading={actionLoading}
          onClick={() => void handleAccept()}
        >
          Accept invite
        </Button>
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
      {mode === 'preview' && !user && (
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
        <Button className="w-full sm:w-auto" variant="secondary" disabled>
          Application pending
        </Button>
      )}
    </>
  )

  const hasMobileActions = Boolean(
    canInvite ||
      isInvitedFreelancer ||
      canFund ||
      canApply ||
      applicationPending ||
      (mode === 'preview' && !user),
  )

  const showEscrowSection =
    mode === 'full' && Boolean(disputeCta || project?.openDispute)

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
        <div className="flex flex-col gap-8">
          {error && <InlineAlert variant="error">{error}</InlineAlert>}

          {mode === 'preview' && (
            <InlineAlert variant="info">
              {user
                ? 'Public preview — milestones and scope only. Apply below if you want to work on this project.'
                : 'Public preview — milestones and scope only. Sign up or log in to apply.'}
            </InlineAlert>
          )}

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
            escrowLabel={project ? projectEscrowLabel(project) : 'Escrow-backed'}
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

          {showEscrowSection && (
            <ProjectEscrowSection
              disputeCta={disputeCta}
              openDispute={project?.openDispute}
              onOpenDispute={() => setDisputeOpen(true)}
              onViewDispute={() => setViewDisputeOpen(true)}
              onResolveDispute={() => setResolveOpen(true)}
            />
          )}

          {milestones.length > 0 && (
            <section className="flex flex-col gap-3 text-left">
              <SectionLabel>Progress</SectionLabel>
              <MilestoneStepper
                milestones={milestones.map((m) => ({
                  id: m.id ?? String(m.orderIndex),
                  title: m.title,
                  status: m.status,
                }))}
              />
            </section>
          )}

          <section className="flex flex-col gap-3 text-left">
            <SectionLabel>Milestones</SectionLabel>
            {milestones.length > 0 ? (
              <div className="flex flex-col gap-3">
                {milestones.map((milestone) => {
                  const cardAction = resolveMilestoneCardAction(milestone)

                  return (
                    <MilestoneCard
                      key={milestone.id ?? milestone.orderIndex}
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
                })}
              </div>
            ) : (
              <EmptyPanel
                icon={ListChecks}
                title="No milestones yet"
                message="Milestones define scope, deadlines, and escrow releases for this project."
              />
            )}
          </section>

          {canShowApplications && (
            <section className="flex flex-col gap-3 text-left">
              <SectionLabel>
                {applications.length > 0
                  ? `Applications (${applications.length})`
                  : 'Applications'}
              </SectionLabel>
              {applications.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      freelancerName={displayName(application.freelancer)}
                      avatarUrl={application.freelancer?.avatarUrl}
                      verified={application.freelancer?.isVerified}
                      timeAgo={formatRelativeTime(application.createdAt)}
                      pitch={application.pitch}
                      onAccept={() => void handleAcceptApplication(application.id)}
                      onReject={() => void handleRejectApplication(application.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={ListChecks}
                  title="No applications yet"
                  message="Freelancers can apply from the public job board while this project is open."
                />
              )}
            </section>
          )}

          {mode === 'full' && (
            <section className="flex flex-col gap-3 text-left">
              <SectionLabel>Activity</SectionLabel>
              <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
                <ActivityTimeline items={activity} />
              </div>
            </section>
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
      </AppSection>
      {hasMobileActions && (
        <StickyActionBar>{workflowActions}</StickyActionBar>
      )}
    </>
  )
}
