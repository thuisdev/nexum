import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { ApplicationCard } from '@/components/features/applications/ApplicationCard'
import {
  acceptApplication,
  listProjectApplications,
  rejectApplication,
} from '@/lib/applications.api'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { displayName, formatRelativeTime } from '@/lib/projectDisplay'
import type { Application } from '@/types/application'

export type ReviewApplicationsModalProps = {
  open: boolean
  projectId: string | null
  projectTitle?: string
  onClose: () => void
  onUpdated?: () => void
}

export function ReviewApplicationsModal({
  open,
  projectId,
  projectTitle,
  onClose,
  onUpdated,
}: ReviewApplicationsModalProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !projectId) {
      setApplications([])
      return
    }

    let cancelled = false
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

  const handleAccept = async (applicationId: string) => {
    setLoading(true)
    setError(null)
    try {
      await acceptApplication(applicationId)
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept application'))
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (applicationId: string) => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projectTitle ? `Applications · ${projectTitle}` : 'Review applications'}
      footer={
        <ModalActions onCancel={onClose} confirmLabel="Close" onConfirm={onClose} />
      }
    >
      <div className="flex flex-col gap-3">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}
        {loading ? (
          <p className="text-sm text-ink-500">Loading applications…</p>
        ) : applications.length > 0 ? (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              freelancerId={application.freelancerId}
              freelancerName={displayName(application.freelancer)}
              avatarUrl={application.freelancer?.avatarUrl}
              verified={application.freelancer?.isVerified}
              timeAgo={formatRelativeTime(application.createdAt)}
              pitch={application.pitch}
              onAccept={() => void handleAccept(application.id)}
              onReject={() => void handleReject(application.id)}
            />
          ))
        ) : (
          <p className="text-sm text-ink-500">No pending applications.</p>
        )}
        {projectId && (
          <Link to={`/projects/${projectId}`} className="text-sm font-medium text-brand-600">
            View project details →
          </Link>
        )}
      </div>
    </Modal>
  )
}
