import { FormField } from '@/components/ui/FormField'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

export type DeclineInviteDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  loading?: boolean
  reason: string
  onReasonChange: (value: string) => void
}

export function DeclineInviteDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  reason,
  onReasonChange,
}: DeclineInviteDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Decline invitation"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={() => onSubmit(reason)}
          confirmLabel="Decline invite"
          confirmVariant="danger"
          loading={loading}
        />
      }
    >
      <p className="text-sm text-ink-500">
        Optional — let the client know why you&apos;re passing.
      </p>
      <FormField label="Reason (optional)">
        <Textarea
          placeholder="Not a fit right now, timeline conflict…"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          maxLength={500}
          showCounter
        />
      </FormField>
    </Modal>
  )
}
