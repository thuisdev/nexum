import { FilterChip } from '@/components/ui/FilterChip'
import { Input } from '@/components/ui/Input'
import { Eyebrow, Trustline } from '@/components/ui/Trustline'
import { cn } from '@/lib/utils'

export type JobBoardHeaderProps = {
  statLine?: string
  className?: string
}

export function JobBoardHeader({
  statLine,
  className,
}: JobBoardHeaderProps) {
  const line = statLine ?? 'Loading platform stats…'
  return (
    <header className={cn('flex flex-col gap-2.5', className)}>
      <Eyebrow>Open work · Public board</Eyebrow>
      <h1 className="font-display text-2xl font-bold leading-8 tracking-[-0.6px] text-ink-900 lg:text-[36px] lg:leading-10 lg:tracking-[-0.025em]">
        Find work
      </h1>
      <p className="max-w-[560px] text-base leading-6 text-ink-500">
        Every project is{' '}
        <span className="font-medium text-ink-900">escrow-backed</span>. Funds are
        locked before you start — no chasing payments, no ghosting.
      </p>
      <Trustline text={line} />
    </header>
  )
}

export type JobBoardFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  chips: string[]
  activeChip: string
  onChipChange: (chip: string) => void
  className?: string
}

export function JobBoardFilters({
  searchValue,
  onSearchChange,
  chips,
  activeChip,
  onChipChange,
  className,
}: JobBoardFiltersProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-3',
        className,
      )}
    >
      <Input
        variant="search"
        inputSize="search"
        placeholder="Search projects, skills, clients…"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:flex-1"
      />
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
        {chips.map((chip) => (
          <FilterChip
            key={chip}
            active={activeChip === chip}
            onClick={() => onChipChange(chip)}
          >
            {chip}
          </FilterChip>
        ))}
      </div>
    </div>
  )
}
