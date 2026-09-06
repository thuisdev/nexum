import { useState } from 'react'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { inviteFreelancer } from '@/lib/projects.api'

export type InviteFreelancerModalProps = {
  open: boolean
  projectId: string
  onClose: () => void
  onSuccess?: () => void
}

export function InviteFreelancerModal({
  open,
  projectId,
  onClose,
  onSuccess,
}: InviteFreelancerModalProps) {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setIdentifier('')
    setError(null)
    setLoading(false)
    onClose()
  }

  const handleInvite = async () => {
    if (!identifier.trim()) {
      setError('Email or display name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await inviteFreelancer(projectId, identifier.trim())
      onSuccess?.()
      handleClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send invite'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite freelancer"
      footer={
        <ModalActions
          onCancel={handleClose}
          onConfirm={handleInvite}
          confirmLabel="Send invite"
          loading={loading}
        />
      }
    >
      <p className="text-sm leading-5 text-ink-500">
        Enter their registered email or public display name (e.g. bob.eth).
      </p>
      <FormField label="Email or display name" error={error ?? undefined}>
        <Input
          placeholder="freelancer@example.com or bob.eth"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={!!error}
        />
      </FormField>
    </Modal>
  )
}
