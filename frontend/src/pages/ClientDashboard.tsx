import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState, EmptyStateButton, ProjectCard } from '@/components/features'
import { CLIENT_PROJECTS } from '@/lib/mockData'
import { ROUTES } from '@/router/routes'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const projects = CLIENT_PROJECTS

  return (
    <AppSection>
      <PageHeader
        title="Your projects"
        action={
          <Button onClick={() => navigate(ROUTES.createProject)}>
            New project
          </Button>
        }
      />
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              variant="client"
              {...project}
              onCardClick={() => navigate(ROUTES.project(project.id))}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Create your first project and invite a freelancer."
          action={
            <EmptyStateButton
              label="New project"
              onClick={() => navigate(ROUTES.createProject)}
            />
          }
        />
      )}
    </AppSection>
  )
}
