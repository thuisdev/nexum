import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    Icon: AlertCircle,
  },
  success: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    Icon: CheckCircle,
  },
  info: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    Icon: Info,
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    Icon: AlertTriangle,
  },
} as const satisfies Record<
  string,
  { bg: string; text: string; Icon: LucideIcon }
>

export type InlineAlertVariant = keyof typeof variants

export type InlineAlertProps = {
  variant?: InlineAlertVariant
  children: string
  className?: string
}

export function InlineAlert({
  variant = 'error',
  children,
  className,
}: InlineAlertProps) {
  const { bg, text, Icon } = variants[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex w-full items-start gap-2 rounded-lg px-3.5 py-3',
        bg,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', text)} aria-hidden />
      <p className={cn('text-sm leading-5', text)}>{children}</p>
    </div>
  )
}
