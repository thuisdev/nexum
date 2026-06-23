import { createPortal } from 'react-dom'
import { NotificationItem } from '@/components/features/notifications/NotificationItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

const PLACEHOLDER_NOTIFICATIONS = [
  {
    id: '1',
    message: 'You were invited to a new project',
    time: '2h ago',
    unread: true,
  },
  {
    id: '2',
    message: 'Milestone approved — payment released',
    time: '1d ago',
    unread: false,
  },
]

export type NotificationDropdownProps = {
  mobile?: boolean
  onClose?: () => void
  className?: string
}

export function NotificationDropdown({
  mobile = false,
  className,
}: NotificationDropdownProps) {
  const hasItems = PLACEHOLDER_NOTIFICATIONS.length > 0

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
        {hasItems ? (
          PLACEHOLDER_NOTIFICATIONS.map((item) => (
            <NotificationItem
              key={item.id}
              message={item.message}
              time={item.time}
              unread={item.unread}
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
    return createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden"
          aria-label="Close notifications"
        />
        {panel}
      </>,
      document.body,
    )
  }

  return panel
}
