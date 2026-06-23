import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VerifiedIconProps = {
  size?: 'sm' | 'lg'
  className?: string
}

export function VerifiedIcon({ size = 'sm', className }: VerifiedIconProps) {
  return (
    <BadgeCheck
      className={cn(
        'shrink-0 text-brand-500',
        size === 'sm' ? 'size-3.5' : 'size-5',
        className,
      )}
      aria-label="Verified"
    />
  )
}
