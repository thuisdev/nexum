import { FormField } from '@/components/ui/FormField'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

export type ApplyDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (pitch: string) => void
  loading?: boolean
  pitch: string
  onPitchChange: (value: string) => void
  maxLength?: number
}

export function ApplyDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  pitch,
  onPitchChange,
  maxLength = 100,
}: ApplyDialogProps) {
  const pitchTooShort = pitch.trim().length < 10

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply to this project"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={() => onSubmit(pitch)}
          confirmLabel="Send application"
          loading={loading}
          confirmDisabled={pitchTooShort}
        />
      }
    >
      <p className="text-sm text-ink-500">
        Tell the client why you&apos;re the right fit.
      </p>
      <FormField
        label="Your pitch"
        helper="At least 10 characters"
        error={
          pitch.length > 0 && pitchTooShort
            ? 'Pitch must be at least 10 characters'
            : undefined
        }
      >
        <Textarea
          placeholder="Tell them why you're a fit…"
          value={pitch}
          onChange={(e) => onPitchChange(e.target.value)}
          maxLength={maxLength}
          showCounter
        />
      </FormField>
    </Modal>
  )
}
