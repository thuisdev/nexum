import { Check } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type AudienceCardProps = {
  eyebrow: string
  title: string
  items: string[]
  ctaLabel: string
  ctaVariant?: ButtonProps['variant']
  onCta?: () => void
  className?: string
}

export function AudienceCard({
  eyebrow,
  title,
  items,
  ctaLabel,
  ctaVariant = 'primary',
  onCta,
  className,
}: AudienceCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-2xl border border-ink-200 bg-white p-8',
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-[1.5px] text-brand-600">
        {eyebrow}
      </span>
      <h3 className="font-display text-2xl font-semibold leading-[30px] tracking-[-0.5px] text-ink-900">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-[18px] shrink-0 text-emerald-600" />
            <span className="text-sm leading-5 text-ink-600">{item}</span>
          </li>
        ))}
      </ul>
      <Button variant={ctaVariant} onClick={onCta} className="w-fit">
        {ctaLabel}
      </Button>
    </div>
  )
}
