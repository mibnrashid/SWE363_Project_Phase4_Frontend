import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/authContext'
import { useToast } from '../../context/toastContext'
import { ROLES } from '../../lib/constants'
import { cn } from '../../lib/cn'
import { HOME_BY_ROLE, NAV_BY_ROLE, PATHS } from '../../routes/paths'
import Button from '../ui/Button'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import AccountMenu from './AccountMenu'

function RoleBadge({ role }) {
  return (
    <span className="hidden rounded-full bg-[#efefec] px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase sm:inline-block">
      {role ?? 'Guest'}
    </span>
  )
}

/**
 * Top navigation bar. The links change with the role (see NAV_BY_ROLE in routes/paths.js).
 * Below 1024px the links move into a menu opened by the hamburger button.
 */
export default function Navbar() {
  const { user, role, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = NAV_BY_ROLE[role ?? 'guest']

  const doLogout = () => {
    setMobileOpen(false)
    logout()
    toast.info('You have been logged out.')
    navigate(PATHS.home)
  }

  const linkClass = ({ isActive }, hashLink) =>
    cn(
      'relative flex h-16 items-center text-sm transition-colors',
      isActive && !hashLink
        ? 'font-semibold text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
        : 'text-muted hover:text-ink',
    )

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="container-page flex h-16 items-center gap-8">
        <Logo to={user ? HOME_BY_ROLE[role] : PATHS.home} />

        <nav className="hidden h-full items-center gap-7 lg:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.label} to={link.to} end={link.end} className={(s) => linkClass(s, link.to.includes('#'))}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <RoleBadge role={role} />
          {!user && (
            <>
              <Button variant="ghost" to={PATHS.login} className="hidden sm:inline-flex">
                Log in
              </Button>
              <Button to={PATHS.signup} className="hidden sm:inline-flex">
                Sign up
              </Button>
            </>
          )}
          {user && (
            <>
              {role !== ROLES.ADMIN && <NotificationBell />}
              {role !== ROLES.STUDENT && (
                <Button variant="ghost" onClick={doLogout} className="hidden sm:inline-flex">
                  Log out
                </Button>
              )}
              <AccountMenu />
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-lg border border-line lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-line bg-white lg:hidden"
          aria-label="Mobile"
          // close the menu after a link is tapped
          onClick={(e) => e.target.closest('a') && setMobileOpen(false)}
        >
          <div className="container-page flex flex-col py-2">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-sm',
                    isActive && !link.to.includes('#') ? 'bg-primary-soft font-semibold text-primary' : 'text-body',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3 pb-1">
                <Button variant="secondary" to={PATHS.login}>
                  Log in
                </Button>
                <Button to={PATHS.signup}>Sign up</Button>
              </div>
            )}
            {user && (
              <button type="button" onClick={doLogout} className="mt-1 rounded-lg px-3 py-3 text-left text-sm text-danger">
                Log out
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
