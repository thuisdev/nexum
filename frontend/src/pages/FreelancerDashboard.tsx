import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Send } from 'lucide-react'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { DashboardGridSkeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/components/ui/Tag'
import {
  DashboardSummary,
  EmptyState,
  EmptyStateButton,
  ProjectCard,
} from '@/components/features'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { listMyApplications, withdrawApplication } from '@/lib/applications.api'
import { acceptInvite, declineInvite, listProjects } from '@/lib/projects.api'
import { displayName, formatRelativeTime, projectEscrowFunded, projectToFreelancerCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/project'
import type { FreelancerApplication } from '@/types/application'
import { DeclineInviteDialog } from '@/components/features/dialogs/DeclineInviteDialog'

type FreelancerFilter = 'active' | 'applied' | 'invitations'

export default function FreelancerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<FreelancerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [declineProjectId, setDeclineProjectId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [declineLoading, setDeclineLoading] = useState(false)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [showCompletedProjects, setShowCompletedProjects] = useState(false)
  const [filter, setFilter] = useState<FreelancerFilter>('active')

  const counts = useMemo(() => {
    if (!user) return { active: 0, invitations: 0, applied: 0, completed: 0 }

    const invitations = projects.filter(
      (p) => p.invitedFreelancerId === user.id && !p.freelancerId,
    ).length
    const active = projects.filter(
      (p) =>
        p.freelancerId === user.id &&
        p.status !== 'COMPLETED' &&
        p.status !== 'CANCELLED',
    ).length
    const completed = projects.filter(
      (p) => p.freelancerId === user.id && p.status === 'COMPLETED',
    ).length
    const applied = applications.filter((a) => a.status === 'PENDING').length

    return { active, invitations, applied, completed }
  }, [projects, applications, user])

  const refreshApplications = useCallback(async () => {
    try {
      const data = await listMyApplications()
      setApplications(data)
    } catch {
      setApplications([])
    }
  }, [])

  const refreshProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load projects'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([listProjects(), listMyApplications()])
      .then(([projectsResult, applicationsResult]) => {
        if (cancelled) return

        if (projectsResult.status === 'fulfilled') {
          setProjects(projectsResult.value)
          setError(null)
        } else {
          setError(getApiErrorMessage(projectsResult.reason, 'Could not load projects'))
        }

        if (applicationsResult.status === 'fulfilled') {
          setApplications(applicationsResult.value)
        } else {
          setApplications([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProjects = useMemo(() => {
    if (!user || filter === 'applied') return []

    return projects.filter((project) => {
      const isInvited =
        project.invitedFreelancerId === user.id && !project.freelancerId

      if (filter === 'invitations') return isInvited
      if (filter === 'active') {
        return (
          project.freelancerId === user.id &&
          project.status !== 'COMPLETED' &&
          project.status !== 'CANCELLED'
        )
      }
      return false
    })
  }, [projects, filter, user])

  const completedProjects = useMemo(() => {
    if (!user) return []
    return projects.filter(
      (project) =>
        project.freelancerId === user.id && project.status === 'COMPLETED',
    )
  }, [projects, user])

  const completedProjectCount = counts.completed

  const pendingApplications = useMemo(
    () => applications.filter((application) => application.status === 'PENDING'),
    [applications],
  )

  const handleAccept = async (projectId: string) => {
    setAcceptingId(projectId)
    try {
      await acceptInvite(projectId)
      await Promise.all([refreshProjects(), refreshApplications()])
      navigate(ROUTES.project(projectId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept invite'))
    } finally {
      setAcceptingId(null)
    }
  }

  const handleDecline = async () => {
    if (!declineProjectId) return
    setDeclineLoading(true)
    try {
      await declineInvite(declineProjectId, declineReason)
      setDeclineProjectId(null)
      setDeclineReason('')
      await refreshProjects()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not decline invite'))
    } finally {
      setDeclineLoading(false)
    }
  }

  const handleWithdraw = async (projectId: string) => {
    setWithdrawingId(projectId)
    setError(null)
    try {
      await withdrawApplication(projectId)
      await refreshApplications()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not withdraw application'))
    } finally {
      setWithdrawingId(null)
    }
  }

  return (
    <AppSection className="!py-8 md:!py-12">
      <PageHeader title="Your work" />

      {!loading && (
        <DashboardSummary
          className="mb-6"
          stats={[
            {
              id: 'active',
              label: 'Active projects',
              value: counts.active,
              icon: Briefcase,
              highlight: counts.active > 0,
              active: filter === 'active',
              onClick: () => setFilter('active'),
            },
            {
              id: 'invitations',
              label: 'Pending invites',
              value: counts.invitations,
              icon: Mail,
              highlight: counts.invitations > 0,
              active: filter === 'invitations',
              onClick: () => setFilter('invitations'),
            },
            {
              id: 'applied',
              label: 'Applications sent',
              value: counts.applied,
              icon: Send,
              highlight: counts.applied > 0,
              active: filter === 'applied',
              onClick: () => setFilter('applied'),
            },
          ]}
        />
      )}

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {loading ? (
        <DashboardGridSkeleton count={2} />
      ) : filter === 'applied' && pendingApplications.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pendingApplications.map((application) => (
            <ProjectCard
              key={application.id}
              variant="freelancer"
              id={application.project.id}
              title={application.project.title}
              amount={application.project.totalBudget}
              currency={application.project.currency}
              status="PENDING"
              statusLabel="Application sent"
              partyName={displayName(application.project.client)}
              partyId={application.project.client.id}
              partyLabel="Client"
              tags={application.project.skills}
              timeAgo={formatRelativeTime(application.createdAt)}
              milestoneCount={application.project.milestoneCount}
              escrowFunded={projectEscrowFunded(application.project)}
              freelancerState="in_progress"
              onCardClick={() => navigate(ROUTES.project(application.project.id))}
              submitLabel="Withdraw"
              onSubmit={() => void handleWithdraw(application.project.id)}
              className={
                withdrawingId === application.project.id ? 'opacity-70' : undefined
              }
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 && user ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const card = projectToFreelancerCardProps(project, user.id)
            return (
              <ProjectCard
                key={project.id}
                variant="freelancer"
                {...card}
                onCardClick={() => navigate(ROUTES.project(project.id))}
                onAccept={() => void handleAccept(project.id)}
                onDecline={() => setDeclineProjectId(project.id)}
                onSubmit={() => navigate(ROUTES.project(project.id))}
                className={acceptingId === project.id ? 'opacity-70' : undefined}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={
            filter === 'applied'
              ? 'No applications yet'
              : filter === 'invitations'
                ? 'No pending invitations'
                : 'No active projects'
          }
          description={
            filter === 'applied'
              ? 'Apply to open jobs on the board — your pending applications will show up here.'
              : 'Browse open work on the job board or accept a client invite.'
          }
          action={
            <EmptyStateButton
              label="Browse jobs"
              onClick={() => navigate(ROUTES.jobs)}
            />
          }
        />
      )}

      {!loading && filter === 'active' && completedProjectCount > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowCompletedProjects((prev) => !prev)}
              className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              {showCompletedProjects
                ? 'Hide completed'
                : `Show completed (${completedProjectCount})`}
            </button>
          </div>
          {showCompletedProjects && user && (
            <div className="flex flex-col gap-3 border-t border-ink-100 pt-6">
              <SectionLabel>Completed</SectionLabel>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {completedProjects.map((project) => {
                  const card = projectToFreelancerCardProps(project, user.id)
                  return (
                    <ProjectCard
                      key={project.id}
                      variant="freelancer"
                      {...card}
                      onCardClick={() => navigate(ROUTES.project(project.id))}
                      onSubmit={() => navigate(ROUTES.project(project.id))}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <DeclineInviteDialog
        open={!!declineProjectId}
        onClose={() => {
          setDeclineProjectId(null)
          setDeclineReason('')
        }}
        onSubmit={() => void handleDecline()}
        loading={declineLoading}
        reason={declineReason}
        onReasonChange={setDeclineReason}
      />
    </AppSection>
  )
}
