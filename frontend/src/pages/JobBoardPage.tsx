import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import {
  EmptyState,
  JobBoardFilters,
  JobBoardHeader,
  ProjectCard,
} from '@/components/features'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { listJobs } from '@/lib/projects.api'
import { jobToCardProps } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import type { JobBoardProject } from '@/types/project'

const FILTER_CHIPS = ['All', 'Solidity', 'Design', 'Frontend', 'Writing', 'Audit']

export default function JobBoardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [jobs, setJobs] = useState<JobBoardProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listJobs()
      setJobs(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load job board'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const card = jobToCardProps(job)
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.partyName?.toLowerCase().includes(q)
      const matchesChip = activeChip === 'All'
      return matchesSearch && matchesChip
    })
  }, [jobs, search, activeChip])

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

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {loading ? (
        <p className="text-sm text-ink-500">Loading open projects…</p>
      ) : filtered.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {filtered.map((job) => (
            <ProjectCard
              key={job.id}
              variant="jobboard"
              {...jobToCardProps(job)}
              onCardClick={() => navigate(ROUTES.project(job.id))}
              onApply={() => navigate(ROUTES.register)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects match these filters"
          description="Clear filters or check back later for new public projects."
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
