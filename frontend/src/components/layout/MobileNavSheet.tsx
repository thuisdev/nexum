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
  userName?: string | null
  avatarUrl?: string | null
  onLogout: () => void
}

export function MobileNavSheet({
  open,
  onClose,
  isLoggedIn,
  userName,
  avatarUrl,
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
        className="absolute inset-0 bg-ink-950/60"
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        className="fixed top-0 right-0 z-[41] flex h-full w-[min(320px,85vw)] flex-col gap-2 bg-white p-6 shadow-lg [animation:slideInFromRight_200ms_ease-out]"
      >
        <div className="mb-2 flex items-center justify-between pb-2">
          <span className="font-display text-xl font-bold text-ink-900">Nexum</span>
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
                onClick={() => go(ROUTES.settings)}
                className="py-3 text-left text-base text-ink-900"
              >
                Notifications
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
              <div className="flex items-center gap-2 py-2">
                <Avatar src={avatarUrl} name={userName} size="md" />
                <span className="text-base font-medium text-ink-900">
                  {userName ?? 'Account'}
                </span>
              </div>
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
