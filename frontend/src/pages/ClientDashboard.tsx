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
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { listProjects } from '@/lib/projects.api'
import { projectToClientCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import type { Project } from '@/types/project'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null)

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
    const drafts = projects.filter((p) => p.status === 'DRAFT').length
    const active = projects.filter(
      (p) => p.status !== 'DRAFT' && p.status !== 'COMPLETED' && p.status !== 'CANCELLED',
    ).length
    return { total: projects.length, drafts, active }
  }, [projects])

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
          stats={[
            {
              id: 'total',
              label: 'Total projects',
              value: summary.total,
              icon: Briefcase,
            },
            {
              id: 'drafts',
              label: 'Drafts',
              value: summary.drafts,
              icon: FileEdit,
              highlight: summary.drafts > 0,
            },
            {
              id: 'active',
              label: 'In progress',
              value: summary.active,
              icon: Rocket,
              highlight: summary.active > 0,
            },
          ]}
        />
      )}

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {loading ? (
        <DashboardGridSkeleton count={3} />
      ) : projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const card = projectToClientCardProps(project)
            const canInvite =
              project.status === 'DRAFT' &&
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
              />
            )
          })}
        </div>
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
    </AppSection>
  )
}
