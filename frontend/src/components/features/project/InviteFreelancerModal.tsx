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
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('Freelancer email is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await inviteFreelancer(projectId, email.trim())
      setEmail('')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send invite'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite freelancer"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleInvite}
          confirmLabel="Send invite"
          loading={loading}
        />
      }
    >
      <p className="text-sm leading-5 text-ink-500">
        Enter the freelancer's registered email.
      </p>
      <FormField label="Freelancer email" error={error ?? undefined}>
        <Input
          type="email"
          placeholder="freelancer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
        />
      </FormField>
    </Modal>
  )
}
