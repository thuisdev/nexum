import { FormField } from '@/components/ui/FormField'
import { FileUpload } from '@/components/ui/FileUpload'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'

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
        />
      }
    >
      <FormField label="Link or note">
        <Input
          placeholder="Paste a link or add a note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </FormField>
      <FileUpload file={file} onFileChange={onFileChange} />
    </Modal>
  )
}
