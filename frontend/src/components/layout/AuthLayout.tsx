import { type ReactNode } from 'react'
import { Trustline } from '@/components/ui/Trustline'
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
      <div className="mb-8 flex w-full max-w-[480px] flex-col items-center gap-3 text-center">
        <p className="font-display text-2xl font-bold tracking-[-0.5px] text-ink-900">
          Pactum
        </p>
        <Trustline text="Milestone escrow · 0% platform fees" />
      </div>

      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-50/60 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4">{children}</div>
      </div>
    </section>
  )
}
