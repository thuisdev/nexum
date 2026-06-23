import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type PaginationProps = {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  className,
}: PaginationProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-6',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
      >
        ← Prev
      </Button>
      <span className="text-sm text-ink-500">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next →
      </Button>
    </div>
  )
}
