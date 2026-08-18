import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'

export type MobileNavSheetProps = {
  open: boolean
  onClose: () => void
  isLoggedIn: boolean
  userId?: string
  userName?: string | null
  avatarUrl?: string | null
  unreadCount?: number
  onOpenNotifications?: () => void
  onLogout: () => void
}

export function MobileNavSheet({
  open,
  onClose,
  isLoggedIn,
  userId,
  userName,
  avatarUrl,
  unreadCount = 0,
  onOpenNotifications,
  onLogout,
}: MobileNavSheetProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  return createPortal(
    <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-ink-950/60"
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        className="relative z-10 ml-auto flex h-full w-[min(320px,85vw)] flex-col gap-2 bg-white p-6 shadow-lg [animation:slideInFromRight_200ms_ease-out]"
      >
        <div className="mb-2 flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => go(ROUTES.home)}
            className="font-display text-xl font-bold text-ink-900"
            aria-label="Nexum home"
          >
            Nexum
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-600"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="flex flex-col">
          <button
            type="button"
            onClick={() => go(ROUTES.jobs)}
            className="py-3 text-left text-base text-ink-900"
          >
            Jobs
          </button>
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => go(ROUTES.dashboard)}
                className="py-3 text-left text-base text-ink-900"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenNotifications?.()
                }}
                className="flex items-center justify-between py-3 text-left text-base text-ink-900"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => go(ROUTES.settings)}
                className="py-3 text-left text-base text-ink-900"
              >
                Settings
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => go(ROUTES.login)}
              className="py-3 text-left text-base text-ink-900"
            >
              Login
            </button>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (userId) go(ROUTES.profile(userId))
                }}
                disabled={!userId}
                className="flex items-center gap-2 rounded-lg py-2 text-left transition-colors hover:bg-ink-50 disabled:opacity-60"
                aria-label="Open profile"
              >
                <Avatar src={avatarUrl} name={userName} size="md" />
                <span className="text-base font-medium text-ink-900">
                  {userName ?? 'Account'}
                </span>
              </button>
              <Button
                variant="ghost"
                fullWidth
                className="text-red-600"
                onClick={() => {
                  onLogout()
                  onClose()
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button fullWidth onClick={() => go(ROUTES.register)}>
                Register
              </Button>
              <Button variant="secondary" fullWidth onClick={() => go(ROUTES.login)}>
                Login
              </Button>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
