import { cn } from '@/lib/utils'

export type TagProps = {
  children: string
  className?: string
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-ink-50 px-2 py-0.5 text-xs font-medium leading-4 text-ink-500',
        className,
      )}
    >
      {children}
    </span>
  )
}
