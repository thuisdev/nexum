import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, EmptyStateButton, ProjectCard } from '@/components/features'
import { FREELANCER_ACTIVE, FREELANCER_INVITED } from '@/lib/mockData'
import { ROUTES } from '@/router/routes'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'applied', label: 'Applied' },
  { id: 'invitations', label: 'Invitations' },
]

export default function FreelancerDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active')

  const projects =
    activeTab === 'invitations'
      ? FREELANCER_INVITED
      : activeTab === 'active'
        ? FREELANCER_ACTIVE
        : []

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
      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              variant="freelancer"
              {...project}
              onCardClick={() => navigate(ROUTES.project(project.id))}
              onAccept={() => navigate(ROUTES.project(project.id))}
              onDecline={() => undefined}
              onSubmit={() => navigate(ROUTES.project(project.id))}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            activeTab === 'applied'
              ? 'No applications yet'
              : 'Nothing here'
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
