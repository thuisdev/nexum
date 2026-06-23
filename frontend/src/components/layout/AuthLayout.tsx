import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AuthLayoutProps = {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center px-4 py-12 md:px-8 md:py-16',
        className,
      )}
    >
      <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
        {children}
      </div>
    </section>
  )
}
