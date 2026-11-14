import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/authContext'
import { useStore } from '../store/useStore'
import { getNotificationsFor } from '../store/selectors'

/**
 * Notifications of the logged-in user (FR-S10). Used by the bell in the navbar
 * and by the full notifications page.
 *
 *   const { items, unreadCount, markRead, markAllRead } = useNotifications()
 */
export function useNotifications() {
  const { user } = useAuth()
  const { db, update, setCollection } = useStore()

  const items = useMemo(() => (user ? getNotificationsFor(db, user.id) : []), [db, user])
  const unreadCount = items.filter((n) => !n.read).length

  const markRead = useCallback((id) => update('notifications', id, { read: true }), [update])

  const markAllRead = useCallback(() => {
    if (!user) return
    setCollection('notifications', (rows) => rows.map((n) => (n.userId === user.id ? { ...n, read: true } : n)))
  }, [setCollection, user])

  return { items, unreadCount, markRead, markAllRead }
}
