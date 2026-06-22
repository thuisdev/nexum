import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Divider } from '@/components/ui/Divider'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'

export type UserMenuProps = {
  name?: string | null
  avatarUrl?: string | null
  onLogout: () => void
  className?: string
}

export function UserMenu({
  onLogout,
  className,
}: UserMenuProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'w-[200px] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-md',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => navigate(ROUTES.settings)}
        className="block w-full px-3.5 py-2.5 text-left text-sm text-ink-900 hover:bg-ink-50"
      >
        Settings
      </button>
      <Divider />
      <button
        type="button"
        onClick={onLogout}
        className="block w-full px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-ink-50"
      >
        Log out
      </button>
    </div>
  )
}

export function UserMenuTrigger({
  name,
  avatarUrl,
  onClick,
  className,
}: {
  name?: string | null
  avatarUrl?: string | null
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
        className,
      )}
      aria-label="Open account menu"
    >
      <Avatar src={avatarUrl} name={name} size="nav" />
    </button>
  )
}
