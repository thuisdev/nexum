import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type FormFieldProps = {
  label: string
  htmlFor?: string
  helper?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  helper,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-5 text-ink-900"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs leading-4 text-red-600" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="text-xs leading-4 text-ink-500">{helper}</p>
      ) : null}
    </div>
  )
}
