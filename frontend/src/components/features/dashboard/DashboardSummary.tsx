import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardStat = {
  id: string
  label: string
  value: string | number
  icon: LucideIcon
  highlight?: boolean
}

export type DashboardSummaryProps = {
  stats: DashboardStat[]
  className?: string
}

export function DashboardSummary({ stats, className }: DashboardSummaryProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4',
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.id}
            className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
          >
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                stat.highlight
                  ? 'bg-brand-50 text-brand-600'
                  : 'bg-ink-50 text-ink-500',
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  'font-mono text-xl font-medium leading-7',
                  stat.highlight ? 'text-brand-700' : 'text-ink-900',
                )}
              >
                {stat.value}
              </span>
              <span className="text-xs leading-4 text-ink-500">{stat.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
