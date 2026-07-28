import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, FileEdit, Rocket } from 'lucide-react'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { DashboardGridSkeleton } from '@/components/ui/Skeleton'
import {
  DashboardSummary,
  EmptyState,
  EmptyStateButton,
  InviteFreelancerModal,
  ProjectCard,
} from '@/components/features'
import { ReviewApplicationsModal } from '@/components/features/applications/ReviewApplicationsModal'
import { SectionLabel } from '@/components/ui/Tag'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { listProjects } from '@/lib/projects.api'
import { projectToClientCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import type { Project } from '@/types/project'

type ClientFilter = 'all' | 'drafts' | 'active'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null)
  const [reviewProject, setReviewProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<ClientFilter>('all')
  const [showCompleted, setShowCompleted] = useState(false)

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

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load projects'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    const drafts = projects.filter(
      (p) => p.status === 'DRAFT' || p.status === 'FUNDED',
    ).length
    const active = projects.filter(
      (p) =>
        p.status !== 'DRAFT' &&
        p.status !== 'FUNDED' &&
        p.status !== 'COMPLETED' &&
        p.status !== 'CANCELLED',
    ).length
    const completed = projects.filter((p) => p.status === 'COMPLETED').length
    return { total: projects.length, drafts, active, completed }
  }, [projects])

  const filteredProjects = useMemo(() => {
    let list = projects.filter(
      (p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED',
    )

    if (filter === 'drafts') {
      list = list.filter((p) => p.status === 'DRAFT' || p.status === 'FUNDED')
    } else if (filter === 'active') {
      list = list.filter(
        (p) =>
          p.status !== 'DRAFT' &&
          p.status !== 'FUNDED',
      )
    }

    return list
  }, [projects, filter])

  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === 'COMPLETED'),
    [projects],
  )

  const renderClientProjectCard = (project: Project) => {
    const card = projectToClientCardProps(project)
    const canInvite =
      (project.status === 'DRAFT' || project.status === 'FUNDED') &&
      !project.freelancerId

    return (
      <ProjectCard
        key={project.id}
        variant="client"
        {...card}
        className="rounded-none border-x-0 sm:rounded-xl sm:border-x"
        showInvite={canInvite}
        onCardClick={() => navigate(ROUTES.project(project.id))}
        onInvite={() => setInviteProjectId(project.id)}
        showReviewApplicants={card.showReviewApplicants}
        applicantCount={card.applicantCount}
        onReviewApplicants={() => setReviewProject(project)}
      />
    )
  }

  return (
    <AppSection className="!px-0 !py-8 md:!px-6 md:!py-12 lg:!px-8">
      <div className="flex flex-col gap-6 px-4 md:px-0">
        <PageHeader
          title="Your projects"
          action={
            <Button onClick={() => navigate(ROUTES.createProject)}>
              New project
            </Button>
          }
        />

        {!loading && projects.length > 0 && (
          <DashboardSummary
            className="mb-0"
            stats={[
              {
                id: 'total',
                label: 'Total projects',
                value: summary.total,
                icon: Briefcase,
                active: filter === 'all',
                onClick: () => setFilter('all'),
              },
              {
                id: 'drafts',
                label: 'Drafts',
                value: summary.drafts,
                icon: FileEdit,
                highlight: summary.drafts > 0,
                active: filter === 'drafts',
                onClick: () => setFilter('drafts'),
              },
              {
                id: 'active',
                label: 'In progress',
                value: summary.active,
                icon: Rocket,
                highlight: summary.active > 0,
                active: filter === 'active',
                onClick: () => setFilter('active'),
              },
            ]}
          />
        )}

        {error && <InlineAlert variant="error">{error}</InlineAlert>}
      </div>

      {loading ? (
        <div className="px-4 md:px-0">
          <DashboardGridSkeleton count={3} />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {filteredProjects.map((project) => renderClientProjectCard(project))}
        </div>
      ) : projects.length > 0 && filteredProjects.length === 0 ? (
        <div className="px-4 md:px-0">
          <EmptyState
            title="No projects in this view"
            description="Try another filter or create a new project."
            action={
              <EmptyStateButton label="Show all" onClick={() => setFilter('all')} />
            }
          />
        </div>
      ) : (
        <div className="px-4 md:px-0">
          <EmptyState
            title="No projects yet"
            description="Create your first project, define milestones, and invite a freelancer."
            action={
              <EmptyStateButton
                label="New project"
                onClick={() => navigate(ROUTES.createProject)}
              />
            }
          />
        </div>
      )}

      {!loading && summary.completed > 0 && (
        <div className="mt-6 flex flex-col gap-4 px-4 md:px-0">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowCompleted((prev) => !prev)}
              className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              {showCompleted
                ? 'Hide completed'
                : `Show completed (${summary.completed})`}
            </button>
          </div>
          {showCompleted && (
            <div className="-mx-4 flex flex-col gap-3 border-t border-ink-100 pt-6 md:mx-0">
              <SectionLabel className="px-4 md:px-0">Completed</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {completedProjects.map((project) => renderClientProjectCard(project))}
              </div>
            </div>
          )}
        </div>
      )}

      {inviteProjectId && (
        <InviteFreelancerModal
          open={!!inviteProjectId}
          projectId={inviteProjectId}
          onClose={() => setInviteProjectId(null)}
          onSuccess={() => void refreshProjects()}
        />
      )}

      <ReviewApplicationsModal
        open={!!reviewProject}
        projectId={reviewProject?.id ?? null}
        projectTitle={reviewProject?.title}
        onClose={() => setReviewProject(null)}
        onUpdated={() => void refreshProjects()}
      />
    </AppSection>
  )
}
