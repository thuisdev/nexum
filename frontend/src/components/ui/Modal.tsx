import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'flex w-full max-w-[480px] flex-col gap-4 rounded-xl bg-white p-6 shadow-lg',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h3
            id="modal-title"
            className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded text-ink-400 transition-colors hover:text-ink-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
        {footer ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2 [&_button]:w-full sm:[&_button]:w-auto">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export type ModalActionsProps = {
  onCancel: () => void
  onConfirm: () => void
  cancelLabel?: string
  confirmLabel: string
  confirmVariant?: 'primary' | 'approve' | 'danger'
  loading?: boolean
  confirmDisabled?: boolean
}

export function ModalActions({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmVariant = 'primary',
  loading = false,
  confirmDisabled = false,
}: ModalActionsProps) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        loading={loading}
        disabled={confirmDisabled || loading}
      >
        {confirmLabel}
      </Button>
    </>
  )
}
