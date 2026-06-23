import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export type MilestoneRowData = {
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
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-2',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-1">
        <Input
          placeholder="Milestone title"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          error={!!errors?.title}
          className="md:flex-1"
        />
        {errors?.title && (
          <p className="text-xs leading-4 text-red-600" role="alert">
            {errors.title}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 md:w-[120px] md:shrink-0">
        <Input
          placeholder="Amount"
          value={value.amount}
          onChange={(e) => onChange({ ...value, amount: e.target.value })}
          error={!!errors?.amount}
        />
        {errors?.amount && (
          <p className="text-xs leading-4 text-red-600" role="alert">
            {errors.amount}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 md:w-[150px] md:shrink-0">
        <Input
          type="date"
          value={value.deadline}
          onChange={(e) => onChange({ ...value, deadline: e.target.value })}
          error={!!errors?.deadline}
        />
        {errors?.deadline && (
          <p className="text-xs leading-4 text-red-600" role="alert">
            {errors.deadline}
          </p>
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="self-end rounded p-2 text-ink-400 hover:text-ink-600 md:mt-1 md:self-start"
          aria-label="Remove milestone"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
