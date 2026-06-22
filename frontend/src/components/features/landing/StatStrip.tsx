import { cn } from '@/lib/utils'

export type StatCell = {
  id: string
  value: string
  label: string
  highlight?: boolean
}

export type StatStripProps = {
  cells: StatCell[]
  className?: string
}

export function StatStrip({ cells, className }: StatStripProps) {
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
            'flex w-1/2 flex-col items-center gap-1 border-ink-100 px-4 py-4 md:w-full md:flex-1 md:border-r md:py-5',
            index % 2 === 0 && 'border-r md:border-r',
            index < 2 && 'border-b md:border-b-0',
            index === cells.length - 1 && 'md:border-r-0',
          )}
        >
          <span
            className={cn(
              'font-mono text-[22px] font-medium leading-7',
              cell.highlight ? 'text-emerald-700' : 'text-ink-900',
            )}
          >
            {cell.value}
          </span>
          <span className="text-center text-xs leading-4 text-ink-500">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  )
}
