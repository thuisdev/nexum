import { Gavel, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DisputePanel } from '@/components/features/dialogs/ResolveDisputeDialog'
import type { DisputeCta } from '@/lib/projectDisplay'
import type { ProjectOpenDispute } from '@/types/project'

export type ProjectEscrowSectionProps = {
  funded?: boolean
  disputeCta?: DisputeCta | null
  openDispute?: ProjectOpenDispute | null
  onOpenDispute?: () => void
  onViewDispute?: () => void
  onResolveDispute?: () => void
}

export function ProjectEscrowSection({
  funded = false,
  disputeCta = null,
  openDispute,
  onOpenDispute,
  onViewDispute,
  onResolveDispute,
}: ProjectEscrowSectionProps) {
  const showPanel = Boolean(openDispute)
  const canRequest = disputeCta?.action === 'open'
  const canView = disputeCta?.action === 'view'
  const canResolve = disputeCta?.action === 'arbiter'
  const hasActions = canRequest || canView || canResolve

  return (
    <section className="flex flex-col gap-3 text-left">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-ink-100 bg-ink-50/60 px-5 py-4 md:px-6">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-ink-200">
            {showPanel ? <Gavel className="size-5" /> : <Shield className="size-5" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="font-display text-lg font-semibold leading-7 text-ink-900">
              {showPanel ? 'Dispute in review' : 'Escrow protection'}
            </h2>
            <p className="text-sm leading-6 text-ink-500">
              {showPanel
                ? 'An arbiter is reviewing this milestone. Escrow stays locked until a decision is made.'
                : funded
                  ? 'Budget is locked in escrow. Funds release per milestone after approval — either side can request an arbiter if something goes wrong.'
                  : 'Once funded, the full budget locks in escrow until milestones are approved. Either side can request an independent arbiter if needed.'}
            </p>
          </div>
        </div>

        {(showPanel || hasActions) && (
          <div className="flex flex-col gap-4 p-5 md:p-6">
            {showPanel && openDispute && <DisputePanel dispute={openDispute} />}

            {hasActions && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {canRequest && onOpenDispute && (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={onOpenDispute}
                  >
                    Request arbiter review
                  </Button>
                )}
                {canView && onViewDispute && (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={onViewDispute}
                  >
                    View dispute details
                  </Button>
                )}
                {canResolve && onResolveDispute && (
                  <Button className="w-full sm:w-auto" onClick={onResolveDispute}>
                    Resolve dispute
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
