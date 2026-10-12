import { Modal, ModalActions } from '@/components/ui/Modal'

export type RequestChangesDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  milestoneTitle: string
}

export function RequestChangesDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  milestoneTitle,
}: RequestChangesDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request changes"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="Send back"
          loading={loading}
        />
      }
    >
      <p className="text-base leading-6 text-ink-900">
        Send &quot;{milestoneTitle}&quot; back to the freelancer. No payout. They
        can submit again.
      </p>
    </Modal>
  )
}
