import { cn } from '@/lib/utils'

export type StatusBadgeStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'INVITED'
  | 'APPLIED'
  | 'APPROVED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'PAID'
  | 'REJECTED'
  | 'REVISION'
  | 'CANCELLED'

const statusStyles: Record<
  StatusBadgeStatus,
  { bg: string; text: string; label: string }
> = {
  DRAFT: { bg: 'bg-ink-100', text: 'text-ink-600', label: 'DRAFT' },
  PENDING: { bg: 'bg-ink-100', text: 'text-ink-600', label: 'PENDING' },
  FUNDED: { bg: 'bg-brand-50', text: 'text-brand-700', label: 'FUNDED' },
  IN_PROGRESS: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'IN PROGRESS',
  },
  SUBMITTED: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    label: 'SUBMITTED',
  },
  INVITED: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'INVITED' },
  APPLIED: { bg: 'bg-ink-100', text: 'text-ink-600', label: 'APPLIED' },
  APPROVED: {
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    label: 'APPROVED',
  },
  ACCEPTED: {
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    label: 'ACCEPTED',
  },
  COMPLETED: {
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    label: 'COMPLETED',
  },
  PAID: { bg: 'bg-emerald-700', text: 'text-white', label: 'PAID' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED' },
  REVISION: { bg: 'bg-red-100', text: 'text-red-700', label: 'REVISION' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'CANCELLED' },
}

export type StatusBadgeProps = {
  status: StatusBadgeStatus
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = statusStyles[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2.5 py-[3px] text-xs font-medium leading-4 tracking-[0.3px] uppercase',
        style.bg,
        style.text,
        className,
      )}
    >
      {label ?? style.label}
    </span>
  )
}
