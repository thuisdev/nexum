import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
  showCounter?: boolean
  maxLength?: number
  value?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error = false,
      showCounter = false,
      maxLength,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref,
  ) => {
    const currentLength =
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
          ? defaultValue.length
          : 0

    return (
      <div className="flex w-full flex-col gap-1">
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'min-h-[120px] w-full resize-y rounded-lg border bg-white p-3 text-sm leading-5 text-ink-900 outline-none placeholder:text-ink-400',
            error
              ? 'border-red-600'
              : 'border-ink-200 focus:border-brand-500',
            disabled && 'cursor-not-allowed opacity-50 bg-ink-50',
            className,
          )}
          {...props}
        />
        {showCounter && maxLength !== undefined && (
          <p className="text-right text-xs leading-4 text-ink-400">
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
