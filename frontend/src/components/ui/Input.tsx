import { Search } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
  variant?: 'default' | 'search'
  inputSize?: 'default' | 'search'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error = false,
      variant = 'default',
      inputSize,
      disabled,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const isSearch = variant === 'search' || inputSize === 'search'

    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border bg-white px-3 transition-colors',
          isSearch ? 'h-11' : 'h-10',
          error
            ? 'border-red-600'
            : 'border-ink-200 focus-within:border-brand-500',
          disabled && 'cursor-not-allowed opacity-50 bg-ink-50',
          className,
        )}
      >
        {isSearch && (
          <Search className="size-4 shrink-0 text-ink-400" aria-hidden />
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-sm leading-5 text-ink-900 outline-none placeholder:text-ink-400',
            'focus-visible:outline-none',
          )}
          {...props}
        />
      </div>
    )
  },
)

Input.displayName = 'Input'
