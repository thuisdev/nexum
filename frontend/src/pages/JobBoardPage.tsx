import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { DashboardGridSkeleton } from '@/components/ui/Skeleton'
import {
  EmptyState,
  JobBoardFilters,
  JobBoardHeader,
  ProjectCard,
} from '@/components/features'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { listJobs } from '@/lib/projects.api'
import { jobToCardProps } from '@/lib/projectDisplay'
import { getPlatformStats, platformStatLine } from '@/lib/stats.api'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/router/routes'
import type { JobBoardProject } from '@/types/project'

import { JOB_BOARD_FILTER_CHIPS } from '@/lib/projectSkills'

export default function JobBoardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [jobs, setJobs] = useState<JobBoardProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statLine, setStatLine] = useState<string | undefined>()

  const canApply = user?.role === 'FREELANCER' || user?.role === 'ADMIN'

  useEffect(() => {
    let cancelled = false

    listJobs()
      .then((data) => {
        if (!cancelled) {
          setJobs(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load job board'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    getPlatformStats()
      .then((stats) => {
        if (!cancelled) setStatLine(platformStatLine(stats))
      })
      .catch(() => {
        if (!cancelled) setStatLine(undefined)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const card = jobToCardProps(job)
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.partyName?.toLowerCase().includes(q) ||
        job.skills.some((skill) => skill.toLowerCase().includes(q))
      const matchesChip =
        activeChip === 'All' || job.skills.includes(activeChip)
      return matchesSearch && matchesChip
    })
  }, [jobs, search, activeChip])

  return (
    <AppSection className="!py-8 md:!py-12">
      <JobBoardHeader statLine={statLine} />
      <JobBoardFilters
        searchValue={search}
        onSearchChange={setSearch}
        chips={[...JOB_BOARD_FILTER_CHIPS]}
        activeChip={activeChip}
        onChipChange={setActiveChip}
      />

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {loading ? (
        <DashboardGridSkeleton count={6} />
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <ProjectCard
              key={job.id}
              variant="jobboard"
              {...jobToCardProps(job)}
              showApply={canApply || !user}
              onCardClick={() => navigate(ROUTES.project(job.id))}
              onApply={() => {
                if (!user) {
                  navigate(ROUTES.register)
                  return
                }
                navigate(ROUTES.project(job.id))
              }}
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
