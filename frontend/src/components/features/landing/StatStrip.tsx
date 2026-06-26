import { cn } from '@/lib/utils'

export type StatCell = {
  id: string
  value: string
  label: string
  highlight?: boolean
  tone?: 'emerald' | 'amber' | 'brand'
}

export type StatStripProps = {
  cells: StatCell[]
  align?: 'center' | 'start'
  className?: string
}

export function StatStrip({ cells, align = 'center', className }: StatStripProps) {
  const centered = align === 'center'

  const valueTone = (cell: StatCell) => {
    if (!cell.highlight) return 'text-ink-900'
    if (cell.tone === 'amber') return 'text-amber-600'
    if (cell.tone === 'brand') return 'text-brand-700'
    return 'text-emerald-700'
  }

  return (
    <div
      className={cn(
        'flex w-full flex-wrap overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm md:flex-nowrap',
        className,
      )}
    >
      {cells.map((cell, index) => (
        <div
          key={cell.id}
          className={cn(
            'flex w-1/2 flex-col gap-1 border-ink-100 px-5 py-4 md:w-full md:flex-1 md:px-6 md:py-5',
            centered ? 'items-center' : 'items-start',
            index % 2 === 0 && 'border-r',
            index < 2 && 'border-b md:border-b-0',
            index !== cells.length - 1 && 'md:border-r',
          )}
        >
          <span
            className={cn(
              'font-mono text-[22px] font-medium leading-7',
              valueTone(cell),
            )}
          >
            {cell.value}
            {(cell.id === 'stars' || cell.id === 'rating') && cell.highlight && (
              <span className="ml-0.5 font-sans text-base text-amber-500">★</span>
            )}
          </span>
          <span
            className={cn(
              'text-xs leading-4 text-ink-500',
              centered && 'text-center',
            )}
          >
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  )
}
