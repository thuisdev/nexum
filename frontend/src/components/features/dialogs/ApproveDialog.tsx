import { Modal, ModalActions } from '@/components/ui/Modal'

export type ApproveDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  amount: string
  recipient: string
}

export function ApproveDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  amount,
  recipient,
}: ApproveDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approve"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="Approve"
          confirmVariant="approve"
          loading={loading}
        />
      }
    >
      <p className="text-base leading-6 text-ink-900">
        This releases{' '}
        <span className="font-mono font-medium">{amount} USDC</span> to{' '}
        {recipient}.
      </p>
      <p className="text-sm text-ink-500">This can&apos;t be undone.</p>
    </Modal>
  )
}
