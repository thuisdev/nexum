import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type CtaBandProps = {
  title: string
  description: string
  primaryLabel: string
  secondaryLabel: string
  onPrimary?: () => void
  onSecondary?: () => void
  className?: string
}

export function CtaBand({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  className,
}: CtaBandProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-4 rounded-[20px] bg-brand-500 px-6 py-10 text-center md:px-8 md:py-14',
        className,
      )}
    >
      <h2 className="font-display text-2xl font-semibold leading-8 text-white md:text-[30px] md:leading-9">
        {title}
      </h2>
      <p className="max-w-lg text-base leading-6 text-brand-100">{description}</p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-center sm:gap-3">
        <Button variant="invert" size="lg" fullWidth className="sm:w-auto" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        <Button
          variant="invert-ghost"
          size="lg"
          fullWidth
          className="sm:w-auto"
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
      </div>
    </div>
  )
}
