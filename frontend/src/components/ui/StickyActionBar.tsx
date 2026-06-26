import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StickyActionBarProps = {
  children: ReactNode
  className?: string
}

/** Mobile-only sticky footer for primary project CTAs */
export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm md:hidden',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1152px] flex-col gap-2">{children}</div>
    </div>
  )
}
