import { useState } from 'react'
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
        />
      }
    >
      <p className="text-sm text-ink-600">{hint}</p>
      <p className="text-base font-medium text-ink-900">
        Milestone: <span className="font-normal">{milestoneTitle}</span>
      </p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Describe what went wrong and what outcome you expect…"
        rows={4}
      />
      <p className="text-xs text-ink-500">
        An arbiter will review escrow and milestone details before deciding.
      </p>
    </Modal>
  )
}
