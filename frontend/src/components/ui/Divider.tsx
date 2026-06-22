import { cn } from '@/lib/utils'

export type DividerProps = {
  variant?: 'card' | 'section'
  className?: string
}

export function Divider({ variant = 'card', className }: DividerProps) {
  return (
    <hr
      className={cn(
        'w-full border-0',
        variant === 'card' ? 'h-px bg-ink-100' : 'h-px bg-ink-200',
        className,
      )}
    />
  )
}
