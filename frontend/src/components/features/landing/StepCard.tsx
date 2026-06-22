import { cn } from '@/lib/utils'

export type StepCardProps = {
  step: number
  title: string
  description: string
  className?: string
}

export function StepCard({ step, title, description, className }: StepCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[14px] border border-ink-200 p-[26px] shadow-sm',
        className,
      )}
    >
      <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-brand-50 font-mono text-sm font-medium text-brand-700">
        {step}
      </span>
      <h3 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl">
        {title}
      </h3>
      <p className="text-sm leading-5 text-ink-500">{description}</p>
    </div>
  )
}
