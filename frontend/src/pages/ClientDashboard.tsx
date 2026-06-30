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
    return { total: projects.length, drafts, active }
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (filter === 'drafts') {
      return projects.filter((p) => p.status === 'DRAFT' || p.status === 'FUNDED')
    }
    if (filter === 'active') {
      return projects.filter(
        (p) =>
          p.status !== 'DRAFT' &&
          p.status !== 'FUNDED' &&
          p.status !== 'COMPLETED' &&
          p.status !== 'CANCELLED',
      )
    }
    return projects
  }, [projects, filter])

  return (
    <AppSection className="!py-8 md:!py-12">
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
          className="mb-6"
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

      {loading ? (
        <DashboardGridSkeleton count={3} />
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const card = projectToClientCardProps(project)
            const canInvite =
              (project.status === 'DRAFT' || project.status === 'FUNDED') &&
              !project.freelancerId &&
              !project.invitedFreelancerId

            return (
              <ProjectCard
                key={project.id}
                variant="client"
                {...card}
                showInvite={canInvite}
                onCardClick={() => navigate(ROUTES.project(project.id))}
                onInvite={() => setInviteProjectId(project.id)}
                showReviewApplicants={card.showReviewApplicants}
                applicantCount={card.applicantCount}
                onReviewApplicants={() => setReviewProject(project)}
              />
            )
          })}
        </div>
      ) : projects.length > 0 ? (
        <EmptyState
          title="No projects in this view"
          description="Try another filter or create a new project."
          action={
            <EmptyStateButton label="Show all" onClick={() => setFilter('all')} />
          }
        />
      ) : (
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
