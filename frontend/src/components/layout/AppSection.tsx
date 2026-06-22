import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AppSectionProps = {
  children: ReactNode
  marketing?: boolean
  narrow?: boolean
  className?: string
}

export function AppSection({
  children,
  marketing = false,
  narrow = false,
  className,
}: AppSectionProps) {
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center px-4 md:px-6 lg:px-8',
        marketing ? 'py-12 md:py-[72px] lg:py-24' : 'py-6 md:py-8',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col gap-6',
          narrow ? 'max-w-[720px]' : 'max-w-[1152px]',
        )}
      >
        {children}
      </div>
    </section>
  )
}
