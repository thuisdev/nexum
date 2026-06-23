import { Bell, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { MobileNavSheet } from '@/components/layout/MobileNavSheet'
import { NotificationDropdown } from '@/components/features/notifications/NotificationDropdown'
import { UserMenu, UserMenuTrigger } from '@/components/layout/UserMenu'
import { ROUTES } from '@/router/routes'
import { cn } from '@/lib/utils'

export type NavbarProps = {
  landing?: boolean
  unreadCount?: number
}

export default function Navbar({ landing = false, unreadCount = 0 }: NavbarProps) {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false)
      }
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.home)
  }

  const navLinkClass =
    'text-sm font-medium text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2'

  const isLanding = location.pathname === ROUTES.home

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 w-full border-b border-ink-200 bg-white/90 backdrop-blur-[8px]',
          isLanding || landing ? 'h-[60px]' : 'h-14',
        )}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 lg:px-8">
          <Link
            to={ROUTES.home}
            className="font-display text-xl font-bold leading-6 text-ink-900"
          >
            Pactum
          </Link>

          <div className="hidden items-center gap-[18px] lg:flex">
            <Link to={ROUTES.jobs} className={navLinkClass}>
              Jobs
            </Link>

            {isLoggedIn ? (
              <>
                <Link to={ROUTES.dashboard} className={navLinkClass}>
                  Dashboard
                </Link>
                <div ref={bellRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((v) => !v)}
                    className="relative rounded p-1 text-ink-600 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-brand-500" />
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2">
                      <NotificationDropdown />
                    </div>
                  )}
                </div>
                <div ref={userMenuRef} className="relative">
                  <UserMenuTrigger
                    name={user?.displayName ?? user?.name}
                    onClick={() => setUserMenuOpen((v) => !v)}
                  />
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2">
                      <UserMenu
                        userId={user?.id}
                        onLogout={handleLogout}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.login} className={navLinkClass}>
                  Login
                </Link>
                <Button
                  size="sm"
                  onClick={() => navigate(ROUTES.register)}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="text-ink-900 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      <MobileNavSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={user?.displayName ?? user?.name}
        onLogout={handleLogout}
      />
    </>
  )
}
