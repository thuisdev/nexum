import { Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { DashboardSummary } from '@/components/features'
import { DisputePanel } from '@/components/features/dialogs/ResolveDisputeDialog'
import { Button } from '@/components/ui/Button'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { DashboardGridSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { displayName } from '@/lib/projectDisplay'
import { listArbiterDisputes } from '@/lib/projects.api'
import { ROUTES } from '@/router/routes'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState<
    Awaited<ReturnType<typeof listArbiterDisputes>>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listArbiterDisputes()
      .then((data) => {
        if (!cancelled) {
          setDisputes(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load disputes'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppSection className="!py-8 md:!py-12">
      <PageHeader
        title={`Welcome, ${user ? displayName(user) : 'Admin'}`}
        action={
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Admin
          </span>
        }
      />

      <DashboardSummary
        stats={[
          {
            id: 'disputes',
            label: 'Open disputes',
            value: loading ? '—' : String(disputes.length),
            icon: Shield,
          },
        ]}
      />

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {loading ? (
        <DashboardGridSkeleton count={2} />
      ) : disputes.length > 0 ? (
        <div className="flex flex-col gap-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[1px] text-ink-400">
                    {dispute.project.title}
                  </p>
                  <p className="text-sm text-ink-600">
                    {displayName(dispute.project.client)} vs{' '}
                    {displayName(dispute.project.freelancer ?? undefined, 'Freelancer')}
                  </p>
                </div>
                <Link to={ROUTES.project(dispute.project.id)}>
                  <Button size="sm" className="w-full sm:w-auto">
                    Review
                  </Button>
                </Link>
              </div>
              <DisputePanel dispute={dispute} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={Shield}
          title="No open disputes"
          message="When a milestone is escalated, it will appear here so you can review and resolve it."
        />
      )}
    </AppSection>
  )
}
