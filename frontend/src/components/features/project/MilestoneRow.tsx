import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export type MilestoneRowData = {
  id: string
  title: string
  amount: string
  deadline: string
}

export type MilestoneRowErrors = {
  title?: string
  amount?: string
  deadline?: string
}

export type MilestoneRowProps = {
  value: MilestoneRowData
  onChange: (value: MilestoneRowData) => void
  onRemove: () => void
  canRemove?: boolean
  errors?: MilestoneRowErrors
  className?: string
}

export function MilestoneRow({
  value,
  onChange,
  onRemove,
  canRemove = true,
  errors,
  className,
}: MilestoneRowProps) {
  const hasErrors = !!(errors?.title || errors?.amount || errors?.deadline)

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-2">
        <Input
          placeholder="Milestone title"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          error={!!errors?.title}
          className="md:flex-1"
        />
        <Input
          placeholder="Amount"
          value={value.amount}
          onChange={(e) => onChange({ ...value, amount: e.target.value })}
          error={!!errors?.amount}
          className="md:w-[120px] md:shrink-0"
        />
        <Input
          type="date"
          value={value.deadline}
          onChange={(e) => onChange({ ...value, deadline: e.target.value })}
          error={!!errors?.deadline}
          className="md:w-[150px] md:shrink-0"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="self-end rounded p-2 text-ink-400 hover:text-ink-600 md:self-center"
            aria-label="Remove milestone"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {hasErrors && (
        <div className="flex w-full flex-col gap-2 md:flex-row md:gap-2">
          <p
            className="text-xs leading-4 text-red-600 md:flex-1"
            role={errors?.title ? 'alert' : undefined}
          >
            {errors?.title ?? ''}
          </p>
          <p
            className="text-xs leading-4 text-red-600 md:w-[120px] md:shrink-0"
            role={errors?.amount ? 'alert' : undefined}
          >
            {errors?.amount ?? ''}
          </p>
          <p
            className="text-xs leading-4 text-red-600 md:w-[150px] md:shrink-0"
            role={errors?.deadline ? 'alert' : undefined}
          >
            {errors?.deadline ?? ''}
          </p>
        </div>
      )}
    </div>
  )
}
