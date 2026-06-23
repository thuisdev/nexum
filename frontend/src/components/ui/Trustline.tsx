import { cn } from '@/lib/utils'

export type TrustlineProps = {
  text: string
  className?: string
}

/** Green live dot + mono stat line (Landing, Job Board) */
export function Trustline({ text, className }: TrustlineProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="size-1.5 shrink-0 rounded-full bg-emerald-600 shadow-[0_0_0_3px_#ecfdf5]"
        aria-hidden
      />
      <span className="font-mono text-[13px] leading-[18px] text-ink-500">{text}</span>
    </div>
  )
}

export type EyebrowProps = {
  children: string
  className?: string
}

/** Caption uppercase ls 1.5 ink-400 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-normal uppercase leading-4 tracking-[1.5px] text-ink-400',
        className,
      )}
    >
      {children}
    </p>
  )
}
