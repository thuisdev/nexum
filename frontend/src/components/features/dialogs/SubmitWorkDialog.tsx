import { FormField } from '@/components/ui/FormField'
import { FileUpload } from '@/components/ui/FileUpload'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

const MIN_CONTENT_LENGTH = 50

export type SubmitWorkDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  loading?: boolean
  milestoneTitle: string
  note: string
  onNoteChange: (value: string) => void
  file: File | null
  onFileChange: (file: File | null) => void
}

export function SubmitWorkDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  milestoneTitle,
  note,
  onNoteChange,
  file,
  onFileChange,
}: SubmitWorkDialogProps) {
  const charCount = note.trim().length
  const canSubmit = charCount >= MIN_CONTENT_LENGTH

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Submit work — ${milestoneTitle}`}
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={onSubmit}
          confirmLabel="Submit"
          loading={loading}
          confirmDisabled={!canSubmit}
        />
      }
    >
      <FormField
        label="Delivery notes"
        helper={`${charCount}/${MIN_CONTENT_LENGTH} characters minimum`}
      >
        <Textarea
          placeholder="Describe what you delivered, include links, or paste your handoff notes…"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={5}
        />
      </FormField>
      <FormField label="Attachment (optional)">
        <FileUpload file={file} onFileChange={onFileChange} />
      </FormField>
    </Modal>
  )
}
