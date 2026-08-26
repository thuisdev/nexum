import { useState } from 'react'
import { FormField } from '@/components/ui/FormField'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

export type DisputeDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  loading?: boolean
  milestoneTitle: string
  hint: string
}

export function DisputeDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  milestoneTitle,
  hint,
}: DisputeDialogProps) {
  const [reason, setReason] = useState('')

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const reasonTooShort = reason.trim().length < 10

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request arbiter review"
      footer={
        <ModalActions
          onCancel={handleClose}
          onConfirm={() => onConfirm(reason.trim())}
          confirmLabel="Submit for review"
          confirmVariant="danger"
          loading={loading}
          confirmDisabled={reasonTooShort}
        />
      }
    >
      <p className="text-sm text-ink-600">{hint}</p>
      <p className="text-base font-medium text-ink-900">
        Milestone: <span className="font-normal">{milestoneTitle}</span>
      </p>
      <FormField
        label="What went wrong"
        helper="At least 10 characters"
        error={
          reason.length > 0 && reasonTooShort
            ? 'Please describe the issue in at least 10 characters'
            : undefined
        }
      >
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe what went wrong and what outcome you expect…"
          rows={4}
        />
      </FormField>
      <p className="text-xs text-ink-500">
        An arbiter will review escrow and milestone details before deciding.
      </p>
    </Modal>
  )
}
