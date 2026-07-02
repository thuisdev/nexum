import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Modal } from '@/components/ui/Modal'
import {
  ApplicationCard,
  ApplicationCardSkeleton,
} from '@/components/features/applications/ApplicationCard'
import {
  acceptApplication,
  listProjectApplications,
  rejectApplication,
} from '@/lib/applications.api'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { displayName, formatRelativeTime } from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import type { Application } from '@/types/application'

export type ReviewApplicationsModalProps = {
  open: boolean
  projectId: string | null
  projectTitle?: string
  onClose: () => void
  onUpdated?: () => void
  /** Hide link when the modal is opened from project detail. */
  showProjectLink?: boolean
}

type PendingAction = { id: string; type: 'accept' | 'reject' }

export function ReviewApplicationsModal({
  open,
  projectId,
  projectTitle,
  onClose,
  onUpdated,
  showProjectLink = true,
}: ReviewApplicationsModalProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  useEffect(() => {
    if (!open || !projectId) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag before async fetch
    setLoading(true)
    setError(null)

    listProjectApplications(projectId)
      .then((data) => {
        if (!cancelled) setApplications(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load applications'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, projectId])

  const visibleApplications = open ? applications : []
  const pendingCount = visibleApplications.length

  const handleAccept = async (applicationId: string) => {
    setPendingAction({ id: applicationId, type: 'accept' })
    setError(null)
    try {
      await acceptApplication(applicationId)
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept application'))
    } finally {
      setPendingAction(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    setPendingAction({ id: applicationId, type: 'reject' })
    setError(null)
    try {
      await rejectApplication(applicationId)
      if (projectId) {
        const apps = await listProjectApplications(projectId)
        setApplications(apps)
        onUpdated?.()
        if (apps.length === 0) onClose()
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reject application'))
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Applications"
      description={projectTitle}
      className="max-w-[640px]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50/50 px-2.5 py-1 text-xs font-medium text-brand-700">
            <Users className="size-3.5" aria-hidden />
            {loading
              ? 'Loading…'
              : `${pendingCount} pending`}
          </span>
        </div>

        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        <div className="flex max-h-[min(60vh,480px)] flex-col gap-3 overflow-y-auto pr-1">
          {loading ? (
            <>
              <ApplicationCardSkeleton />
              <ApplicationCardSkeleton />
            </>
          ) : visibleApplications.length > 0 ? (
            visibleApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                variant="review"
                freelancerId={application.freelancerId}
                freelancerName={displayName(application.freelancer)}
                avatarUrl={application.freelancer?.avatarUrl}
                avatarColor={application.freelancer?.avatarColor}
                verified={application.freelancer?.isVerified}
                timeAgo={formatRelativeTime(application.createdAt)}
                pitch={application.pitch}
                onAccept={() => void handleAccept(application.id)}
                onReject={() => void handleReject(application.id)}
                acceptLoading={
                  pendingAction?.id === application.id &&
                  pendingAction.type === 'accept'
                }
                rejectLoading={
                  pendingAction?.id === application.id &&
                  pendingAction.type === 'reject'
                }
                disabled={pendingAction !== null}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-ink-100">
                <Users className="size-5 text-ink-400" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-900">No applications yet</p>
                <p className="mt-1 text-sm text-ink-500">
                  Freelancers can apply from the job board while this project is open.
                </p>
              </div>
            </div>
          )}
        </div>

        {showProjectLink && projectId && (
          <Link
            to={ROUTES.project(projectId)}
            onClick={onClose}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View project details →
          </Link>
        )}
      </div>
    </Modal>
  )
}
