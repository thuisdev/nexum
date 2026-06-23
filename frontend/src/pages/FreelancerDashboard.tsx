import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, EmptyStateButton, ProjectCard } from '@/components/features'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { acceptInvite, listProjects } from '@/lib/projects.api'
import { projectToFreelancerCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/project'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'applied', label: 'Applied' },
  { id: 'invitations', label: 'Invitations' },
]

export default function FreelancerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('invitations')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

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

  const filtered = useMemo(() => {
    if (!user) return []

    return projects.filter((project) => {
      const isInvited =
        project.invitedFreelancerId === user.id && !project.freelancerId
      const isActive = project.freelancerId === user.id

      if (activeTab === 'invitations') return isInvited
      if (activeTab === 'active') return isActive
      return false
    })
  }, [projects, activeTab, user])

  const handleAccept = async (projectId: string) => {
    setAcceptingId(projectId)
    try {
      await acceptInvite(projectId)
      await refreshProjects()
      navigate(ROUTES.project(projectId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept invite'))
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <AppSection>
      <PageHeader
        title="Your work"
        action={
          <Button variant="ghost" onClick={() => navigate(ROUTES.jobs)}>
            Browse jobs
          </Button>
        }
      />

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {loading ? (
        <p className="text-sm text-ink-500">Loading projects…</p>
      ) : filtered.length > 0 && user ? (
        <div className="flex flex-wrap gap-6">
          {filtered.map((project) => {
            const card = projectToFreelancerCardProps(project, user.id)
            return (
              <ProjectCard
                key={project.id}
                variant="freelancer"
                {...card}
                onCardClick={() => navigate(ROUTES.project(project.id))}
                onAccept={() => void handleAccept(project.id)}
                onDecline={() => undefined}
                onSubmit={() => navigate(ROUTES.project(project.id))}
                className={acceptingId === project.id ? 'opacity-70' : undefined}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={
            activeTab === 'applied'
              ? 'No applications yet'
              : activeTab === 'invitations'
                ? 'No pending invitations'
                : 'No active projects'
          }
          description="Browse open work on the job board."
          action={
            <EmptyStateButton
              label="Browse jobs"
              onClick={() => navigate(ROUTES.jobs)}
            />
          }
        />
      )}
    </AppSection>
  )
}
