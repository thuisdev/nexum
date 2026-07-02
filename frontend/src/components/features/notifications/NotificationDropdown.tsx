import { NotificationItem } from '@/components/features/notifications/NotificationItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

export type NotificationDropdownItem = {
  id: string
  message: string
  time: string
  unread?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export type NotificationDropdownProps = {
  mobile?: boolean
  onClose?: () => void
  className?: string
  items?: NotificationDropdownItem[]
  loading?: boolean
}

export function NotificationDropdown({
  mobile = false,
  onClose,
  className,
  items = [],
  loading = false,
}: NotificationDropdownProps) {
  const hasItems = items.length > 0

  const panel = (
    <div
      className={cn(
        'flex flex-col overflow-hidden border border-ink-200 bg-white shadow-md',
        mobile
          ? 'fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-2xl'
          : 'w-[360px] rounded-xl',
        className,
      )}
    >
      <div className="border-b border-ink-100 px-4 py-3.5">
        <p className="text-sm font-medium text-ink-900">Notifications</p>
      </div>
      <div className="overflow-y-auto">
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink-500">Loading…</p>
        ) : hasItems ? (
          items.map((item) => (
            <NotificationItem
              key={item.id}
              message={item.message}
              time={item.time}
              unread={item.unread}
              onClick={item.onClick}
              onDelete={item.onDelete}
            />
          ))
        ) : (
          <EmptyState
            title="No notifications"
            description="You're all caught up."
            className="py-8"
          />
        )}
      </div>
    </div>
  )

  if (mobile) {
    return (
      <>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden"
          aria-label="Close notifications"
          onClick={onClose}
        />
        {panel}
      </>
    )
  }

  return panel
}
