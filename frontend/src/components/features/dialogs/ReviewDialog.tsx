import { useState } from 'react'
import { FormField } from '@/components/ui/FormField'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

export type ReviewDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
  loading?: boolean
  subjectName: string
}

function StarButton({
  filled,
  onClick,
}: {
  filled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-2xl leading-none transition-colors',
        filled ? 'text-amber-400' : 'text-ink-200 hover:text-amber-300',
      )}
      aria-label={filled ? 'Filled star' : 'Empty star'}
    >
      ★
    </button>
  )
}

export function ReviewDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  subjectName,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleClose = () => {
    setRating(0)
    setComment('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Review ${subjectName}`}
      footer={
        <ModalActions
          onCancel={handleClose}
          onConfirm={() => onSubmit(rating, comment)}
          confirmLabel="Submit review"
          loading={loading}
        />
      }
    >
      <p className="text-sm text-ink-500">
        Share how the project went. Reviews are public on profiles.
      </p>
      <FormField label="Rating">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarButton
              key={value}
              filled={value <= rating}
              onClick={() => setRating(value)}
            />
          ))}
        </div>
      </FormField>
      <FormField label="Comment (optional)">
        <Textarea
          placeholder="What went well? Would you work together again?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          showCounter
        />
      </FormField>
    </Modal>
  )
}
