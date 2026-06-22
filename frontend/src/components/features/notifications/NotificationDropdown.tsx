import { NotificationItem } from '@/components/features/notifications/NotificationItem'
import { EmptyState } from '@/components/ui/EmptyState'

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

export function NotificationDropdown() {
  const hasItems = PLACEHOLDER_NOTIFICATIONS.length > 0

  return (
    <div className="flex w-[360px] flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-md">
      <div className="border-b border-ink-100 px-4 py-3.5">
        <p className="text-sm font-medium text-ink-900">Notifications</p>
      </div>
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
  )
}
