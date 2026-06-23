import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import {
  EmptyState,
  JobBoardFilters,
  JobBoardHeader,
  ProjectCard,
} from '@/components/features'
import { JOB_BOARD_PROJECTS } from '@/lib/mockData'
import { ROUTES } from '@/router/routes'

const FILTER_CHIPS = ['All', 'Solidity', 'Design', 'Frontend', 'Writing', 'Audit']

export default function JobBoardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')

  const filtered = useMemo(() => {
    return JOB_BOARD_PROJECTS.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.partyName?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      const matchesChip =
        activeChip === 'All' ||
        p.tags?.some((t) => t.toLowerCase().includes(activeChip.toLowerCase()))
      return matchesSearch && matchesChip
    })
  }, [search, activeChip])

  return (
    <AppSection>
      <JobBoardHeader />
      <JobBoardFilters
        searchValue={search}
        onSearchChange={setSearch}
        chips={FILTER_CHIPS}
        activeChip={activeChip}
        onChipChange={setActiveChip}
      />
      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              variant="jobboard"
              {...project}
              onCardClick={() => navigate(ROUTES.project(project.id))}
              onApply={() => navigate(ROUTES.register)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects match these filters"
          description="Clear filters to see all open work."
          action={
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('')
                setActiveChip('All')
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </AppSection>
  )
}
