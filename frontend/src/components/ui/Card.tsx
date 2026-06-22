import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

export function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-sm md:p-6',
        interactive &&
          'cursor-pointer transition-[box-shadow,border-color,transform] duration-[180ms] hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
