import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../../context/authContext'
import { useToast } from '../../context/toastContext'
import { ROLES } from '../../lib/constants'
import { PATHS } from '../../routes/paths'
import Avatar from '../ui/Avatar'

const linksByRole = {
  [ROLES.STUDENT]: [
    { label: 'My profile', to: PATHS.student.profile, icon: User },
    { label: 'Settings', to: PATHS.student.settings, icon: Settings },
  ],
  [ROLES.COMPANY]: [{ label: 'Company profile', to: PATHS.company.profile, icon: User }],
  [ROLES.ADMIN]: [],
}

// avatar button that opens the account menu (FR-A5: "opens the account menu and clicks Log out")
export default function AccountMenu() {
  const { user, role, profile, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const doLogout = () => {
    setOpen(false)
    logout()
    toast.info('You have been logged out.')
    navigate(PATHS.home)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Account menu" className="rounded-full">
        <Avatar
          name={user.name}
          src={role === ROLES.COMPANY ? profile?.logo : null}
          round
          dark={role === ROLES.STUDENT}
          className={role === ROLES.STUDENT ? '' : 'border-0 bg-night! text-white!'}
        />
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-40 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          {linksByRole[role].map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body hover:bg-canvas hover:text-ink"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={doLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
