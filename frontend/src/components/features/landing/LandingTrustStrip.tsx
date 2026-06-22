import { cn } from '@/lib/utils'

export type TrustStripStat = {
  id: string
  value: string
  label: string
  highlight?: boolean
}

export type LandingTrustStripProps = {
  stats: TrustStripStat[]
  className?: string
}

/** Landing §3 — horizontal stats on ink-50 band */
export function LandingTrustStrip({ stats, className }: LandingTrustStripProps) {
  return (
    <div
      className={cn(
        'w-full border-y border-ink-200 bg-ink-50 px-4 py-[22px] md:px-8',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1152px] flex-wrap justify-around gap-6 md:flex-nowrap md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center gap-0.5 text-center"
          >
            <span
              className={cn(
                'font-mono text-[22px] font-medium leading-7',
                stat.highlight ? 'text-emerald-700' : 'text-ink-900',
              )}
            >
              {stat.value}
            </span>
            <span className="text-xs leading-4 text-ink-500">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
