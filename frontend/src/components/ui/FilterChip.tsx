import { cn } from '@/lib/utils'

export type FilterChipProps = {
  children: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function FilterChip({
  children,
  active = false,
  onClick,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-auto items-center rounded-full px-3.5 py-2 text-sm font-medium leading-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
        active
          ? 'bg-brand-500 text-white'
          : 'bg-ink-50 text-ink-500 hover:bg-ink-100',
        className,
      )}
    >
      {children}
    </button>
  )
}
