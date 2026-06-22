import { Button } from '@/components/ui/Button'
import { EscrowPill } from '@/components/ui/EscrowPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'

export type HeroMilestone = {
  id: string
  title: string
  amount: string
  status: 'paid' | 'in_progress' | 'approve'
}

export type HeroPanelProps = {
  escrowAmount: string
  milestones: HeroMilestone[]
  className?: string
}

export function HeroPanel({ escrowAmount, milestones, className }: HeroPanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-[18px] shadow-xl',
        className,
      )}
    >
      <div className="flex items-center justify-between px-1.5 pb-3.5 pt-1.5">
        <span className="font-display text-base font-semibold leading-[22px] text-ink-900">
          Live escrow
        </span>
        <EscrowPill label={`${escrowAmount} in escrow`} />
      </div>
      {milestones.map((ms) => (
        <div
          key={ms.id}
          className="flex items-center justify-between rounded-[10px] border border-ink-100 px-3 py-[13px]"
        >
          <div>
            <p className="text-sm font-medium text-ink-900">{ms.title}</p>
            <p className="font-mono text-xs text-ink-400">{ms.amount} USDC</p>
          </div>
          {ms.status === 'paid' && (
            <StatusBadge status="PAID" label="Paid" />
          )}
          {ms.status === 'in_progress' && (
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-500">
              In progress
            </span>
          )}
          {ms.status === 'approve' && (
            <Button size="sm" variant="approve">
              Approve
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
