import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-2 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? <Icon className="size-8 text-ink-300" aria-hidden /> : null}
      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl md:leading-7">
        {title}
      </h3>
      {description ? (
        <p className="max-w-md text-sm leading-5 text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
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
