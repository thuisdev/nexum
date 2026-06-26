import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type ProjectOverflowItem = {
  id: string
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}

export type ProjectOverflowMenuProps = {
  items: ProjectOverflowItem[]
  className?: string
}

export function ProjectOverflowMenu({ items, className }: ProjectOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label="Project options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 shadow-sm transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[180px] overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={cn(
                'flex w-full px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
                item.tone === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-ink-700 hover:bg-ink-50',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
