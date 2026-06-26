import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Send } from 'lucide-react'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { DashboardGridSkeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import {
  DashboardSummary,
  EmptyState,
  EmptyStateButton,
  ProjectCard,
} from '@/components/features'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { acceptInvite, listProjects } from '@/lib/projects.api'
import { projectToFreelancerCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/project'

export default function FreelancerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const counts = useMemo(() => {
    if (!user) return { active: 0, invitations: 0, applied: 0 }

    const invitations = projects.filter(
      (p) => p.invitedFreelancerId === user.id && !p.freelancerId,
    ).length
    const active = projects.filter((p) => p.freelancerId === user.id).length

    return { active, invitations, applied: 0 }
  }, [projects, user])

  const [activeTab, setActiveTab] = useState('active')
  const [tabInitialized, setTabInitialized] = useState(false)

  useEffect(() => {
    if (!loading && !tabInitialized) {
      setActiveTab(counts.invitations > 0 ? 'invitations' : 'active')
      setTabInitialized(true)
    }
  }, [loading, counts.invitations, tabInitialized])

  const tabs = useMemo(
    () => [
      { id: 'active', label: 'Active', badge: counts.active },
      { id: 'applied', label: 'Applied', badge: counts.applied },
      { id: 'invitations', label: 'Invitations', badge: counts.invitations },
    ],
    [counts],
  )

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
    <AppSection className="!py-8 md:!py-12">
      <PageHeader title="Your work" />

      {!loading && (
        <DashboardSummary
          stats={[
            {
              id: 'active',
              label: 'Active projects',
              value: counts.active,
              icon: Briefcase,
              highlight: counts.active > 0,
            },
            {
              id: 'invitations',
              label: 'Pending invites',
              value: counts.invitations,
              icon: Mail,
              highlight: counts.invitations > 0,
            },
            {
              id: 'applied',
              label: 'Applications sent',
              value: counts.applied,
              icon: Send,
            },
          ]}
        />
      )}

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />

      {loading ? (
        <DashboardGridSkeleton count={2} />
      ) : filtered.length > 0 && user ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
          description={
            activeTab === 'applied'
              ? 'Apply to open jobs on the board — your pending applications will show up here.'
              : 'Browse open work on the job board or accept a client invite.'
          }
          action={
            <EmptyStateButton
              label={activeTab === 'invitations' ? 'Browse jobs' : 'Browse jobs'}
              onClick={() => navigate(ROUTES.jobs)}
            />
          }
        />
      )}
    </AppSection>
  )
}
