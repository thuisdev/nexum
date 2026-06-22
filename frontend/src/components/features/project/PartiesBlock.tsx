import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export type PartyInfo = {
  role: string
  name: string
  avatarUrl?: string | null
}

export type PartiesBlockProps = {
  parties: PartyInfo[]
  className?: string
}

export function PartiesBlock({ parties, className }: PartiesBlockProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 md:flex-row md:gap-6',
        className,
      )}
    >
      {parties.map((party) => (
        <div key={party.role} className="flex flex-col gap-1">
          <span className="text-xs uppercase leading-4 tracking-wide text-ink-400">
            {party.role}
          </span>
          <div className="flex items-center gap-2">
            <Avatar src={party.avatarUrl} name={party.name} size="sm" />
            <span className="text-base font-medium leading-6 text-ink-900">
              {party.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
