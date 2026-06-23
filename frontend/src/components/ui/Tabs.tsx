import { cn } from '@/lib/utils'

export type TabItem = {
  id: string
  label: string
}

export type TabsProps = {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex w-full gap-6 overflow-x-auto border-b border-ink-200',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'shrink-0 border-b-2 pb-3 text-base font-medium leading-6 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
              isActive
                ? 'border-brand-500 text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-700',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
