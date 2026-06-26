import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { cn } from '@/lib/utils'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  variant?: 'center' | 'panel'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'center',
  className,
}: EmptyStateProps) {
  if (variant === 'panel') {
    return (
      <EmptyPanel
        icon={Icon}
        title={title}
        message={description ?? ''}
        action={action}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-1 flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-ink-100">
          <Icon className="size-5 text-ink-400" aria-hidden />
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7">
        {title}
      </h3>
      {description ? (
        <p className="max-w-md text-sm leading-5 text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export function EmptyStateButton({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <Button variant="primary" onClick={onClick}>
      {label}
    </Button>
  )
}
