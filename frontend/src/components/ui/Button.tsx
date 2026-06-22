import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,opacity,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
        secondary:
          'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 active:bg-ink-100',
        ghost:
          'bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-700',
        approve:
          'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-700',
        invert: 'bg-white text-brand-600 hover:bg-white/90',
        'invert-ghost':
          'border border-white/40 bg-transparent text-white hover:bg-white/10',
      },
      size: {
        sm: 'h-8 px-3 text-sm leading-5 [&_svg]:size-4',
        md: 'h-10 px-4 text-sm leading-5 [&_svg]:size-4',
        lg: 'h-11 px-6 text-[15px] leading-[22px] [&_svg]:size-[18px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          loading && 'cursor-wait opacity-70',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'
