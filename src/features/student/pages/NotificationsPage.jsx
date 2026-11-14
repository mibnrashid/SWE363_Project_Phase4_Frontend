/*
  Notifications page (FR-S10) - full version of the navbar bell dropdown.
  Tabs: All / Unread / Reminders / Status updates. Clicking marks as read and opens the link.
*/
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, CheckCheck, ListChecks } from 'lucide-react'
import { useNotifications } from '../../../hooks/useNotifications'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { timeAgo } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import { Button, EmptyState, PageHeader, Tabs } from '../../../components/ui'

const ICON_BY_TYPE = { reminder: BellRing, status: ListChecks }

const FILTERS = {
  all: () => true,
  unread: (n) => !n.read,
  reminder: (n) => n.type === 'reminder',
  status: (n) => n.type === 'status',
}

export default function NotificationsPage() {
  useDocumentTitle('Notifications')
  const { items, unreadCount, markRead, markAllRead } = useNotifications()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')

  const tabs = [
    { value: 'all', label: 'All', count: items.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'reminder', label: 'Reminders', count: items.filter(FILTERS.reminder).length },
    { value: 'status', label: 'Status updates', count: items.filter(FILTERS.status).length },
  ]
  const visible = items.filter(FILTERS[tab])

  const open = (n) => {
    if (!n.read) markRead(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Student workspace"
        title="Notifications"
        subtitle="Updates on your applications and reminders for saved opportunities."
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={() => {
                markAllRead()
                toast.success('All notifications marked as read.')
              }}
            >
              Mark all as read
            </Button>
          )
        }
      />

      <Tabs value={tab} onChange={setTab} options={tabs} />

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
        {visible.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up." message="New updates about your applications will show up here." />
        ) : (
          <ul>
            {visible.map((n) => {
              const Icon = ICON_BY_TYPE[n.type] ?? Bell
              return (
                <li key={n.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    onClick={() => open(n)}
                    className={cn('flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-canvas sm:px-5', !n.read && 'bg-primary-soft/30')}
                  >
                    <span className={cn('mt-2 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} aria-hidden="true" />
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm text-ink', n.read ? 'font-medium' : 'font-semibold')}>
                        {n.title}
                        {!n.read && <span className="sr-only"> (unread)</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-body">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
