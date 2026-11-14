import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../context/authContext'
import { ROLES } from '../../lib/constants'
import { timeAgo } from '../../lib/format'
import { cn } from '../../lib/cn'
import { PATHS } from '../../routes/paths'

// Bell icon with unread count and a dropdown of the latest notifications (FR-S10)
export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications()
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openItem = (n) => {
    markRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        className="relative grid size-9 place-items-center rounded-full border border-line bg-white text-ink hover:bg-canvas"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-xl border border-line bg-white shadow-xl sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-[340px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {items.slice(0, 6).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className="flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-canvas"
                  >
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-ink">{n.title}</span>
                      <span className="mt-0.5 block text-xs text-body">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {role === ROLES.STUDENT && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate(PATHS.student.notifications)
              }}
              className="w-full border-t border-line py-3 text-center text-[13px] font-semibold text-primary hover:bg-canvas"
            >
              View all notifications
            </button>
          )}
        </div>
      )}
    </div>
  )
}
