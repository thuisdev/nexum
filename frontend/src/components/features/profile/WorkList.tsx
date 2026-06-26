import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'

export type WorkListItem = {
  id: string
  title: string
  clientName: string
  amount: string
}

export type WorkListProps = {
  items: WorkListItem[]
  className?: string
}

export function WorkList({ items, className }: WorkListProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-ink-200 bg-white',
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between',
            index !== items.length - 1 && 'border-b border-ink-100',
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-base font-medium leading-6 text-ink-900">{item.title}</p>
            <p className="text-xs leading-4 text-ink-500">for {item.clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium leading-5 text-ink-900">
              {item.amount} USDC
            </span>
            <StatusBadge status="COMPLETED" />
          </div>
        </div>
      ))}
    </div>
  )
}
