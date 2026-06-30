import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardStat = {
  id: string
  label: string
  value: string | number
  icon: LucideIcon
  highlight?: boolean
  active?: boolean
  onClick?: () => void
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
        const interactive = Boolean(stat.onClick)
        const Wrapper = interactive ? 'button' : 'div'

        return (
          <Wrapper
            key={stat.id}
            type={interactive ? 'button' : undefined}
            onClick={stat.onClick}
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-[border-color,box-shadow]',
              stat.active
                ? 'border-brand-300 ring-1 ring-brand-100'
                : 'border-ink-200',
              interactive && 'hover:border-brand-200 hover:shadow-md',
            )}
          >
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                stat.highlight || stat.active
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
                  stat.highlight || stat.active ? 'text-brand-700' : 'text-ink-900',
                )}
              >
                {stat.value}
              </span>
              <span className="text-xs leading-4 text-ink-500">{stat.label}</span>
            </div>
          </Wrapper>
        )
      })}
    </div>
  )
}
