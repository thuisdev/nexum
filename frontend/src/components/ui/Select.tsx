import { ChevronDown } from 'lucide-react'
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error = false, disabled, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative flex h-10 w-full items-center rounded-lg border bg-white',
          error
            ? 'border-red-600'
            : 'border-ink-200 focus-within:border-brand-500',
          disabled && 'cursor-not-allowed opacity-50 bg-ink-50',
          className,
        )}
      >
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'h-full w-full appearance-none bg-transparent py-0 pl-3 pr-9 text-sm leading-5 text-ink-900 outline-none',
            'focus-visible:outline-none',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 size-4 text-ink-400"
          aria-hidden
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
