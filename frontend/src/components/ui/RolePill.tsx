import { cn } from '@/lib/utils'

export type RolePillProps = {
  role: string
  className?: string
}

export function RolePill({ role, className }: RolePillProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-[3px] text-xs font-medium leading-4 text-brand-700',
        className,
      )}
    >
      {role}
    </span>
  )
}
