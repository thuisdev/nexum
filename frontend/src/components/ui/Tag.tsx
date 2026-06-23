import { cn } from '@/lib/utils'

export type TagProps = {
  children: string
  className?: string
}

/** Skill / filter tag — pad 3×9, radius 6, ink-50 */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-ink-50 px-[9px] py-[3px] text-xs font-medium leading-4 text-ink-500',
        className,
      )}
    >
      {children}
    </span>
  )
}

export type CompletedBadgeProps = {
  children?: string
  className?: string
}

/** Profile work list — emerald-100 / emerald-700, pad 3×9 */
export function CompletedBadge({
  children = 'Completed',
  className,
}: CompletedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-emerald-100 px-[9px] py-[3px] text-xs font-medium leading-4 text-emerald-700',
        className,
      )}
    >
      {children}
    </span>
  )
}

export type SectionLabelProps = {
  children: string
  className?: string
}

/** Caption uppercase ink-400, ls 1.2 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'text-xs font-normal uppercase leading-4 tracking-[1.2px] text-ink-400',
        className,
      )}
    >
      {children}
    </p>
  )
}
