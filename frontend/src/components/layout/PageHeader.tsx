import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PageHeaderProps = {
  title: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <h1 className="font-display text-2xl font-bold leading-8 tracking-[-0.6px] text-ink-900 lg:text-[36px] lg:leading-10 lg:tracking-[-0.9px]">
        {title}
      </h1>
      {action ? <div className="[&_button]:w-full lg:[&_button]:w-auto">{action}</div> : null}
    </div>
  )
}
