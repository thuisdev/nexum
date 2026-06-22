import { cn } from '@/lib/utils'

export type StatusBadgeStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'INVITED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'PAID'
  | 'REJECTED'
  | 'REVISION'

const statusStyles: Record<
  StatusBadgeStatus,
  { bg: string; text: string; label: string }
> = {
  DRAFT: { bg: 'bg-ink-100', text: 'text-ink-600', label: 'Draft' },
  PENDING: { bg: 'bg-ink-100', text: 'text-ink-600', label: 'Pending' },
  FUNDED: { bg: 'bg-brand-50', text: 'text-brand-700', label: 'Funded' },
  IN_PROGRESS: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'In progress',
  },
  SUBMITTED: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    label: 'Submitted',
  },
  INVITED: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Invited' },
  APPROVED: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    label: 'Approved',
  },
  COMPLETED: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    label: 'Completed',
  },
  PAID: { bg: 'bg-emerald-700', text: 'text-white', label: 'Paid' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  REVISION: { bg: 'bg-red-100', text: 'text-red-700', label: 'Revision' },
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
        'inline-flex h-6 items-center rounded-sm px-2.5 text-xs font-medium tracking-[0.3px]',
        style.bg,
        style.text,
        className,
      )}
    >
      {label ?? style.label}
    </span>
  )
}
