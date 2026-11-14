import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/authContext'
import { useToast } from '../context/toastContext'
import { useStore } from '../store/useStore'
import { ROLES, RULES } from '../lib/constants'
import { daysUntil } from '../lib/format'
import { makeId } from '../lib/ids'

/**
 * Save / unsave listings for the logged-in student (FR-S6, FR-S7).
 *
 *   const { savedRows, isSaved, toggleSave, setReminder, canSave } = useSavedListings()
 *
 *   savedRows          -> this student's rows from db.saved  [{ id, listingId, savedAt, reminder }]
 *   isSaved(listingId) -> boolean
 *   toggleSave(listingId) -> saves or unsaves and shows a toast. Returns false for guests
 *                            (the caller should then open <LoginPromptModal />)
 *   setReminder(savedId, true|false) -> turn the 2-day reminder on/off for one saved listing
 */
export function useSavedListings() {
  const { user, role } = useAuth()
  const { db, insert, remove, update } = useStore()
  const toast = useToast()
  const canSave = role === ROLES.STUDENT

  const savedRows = useMemo(
    () => (canSave ? (db.saved ?? []).filter((s) => s.studentId === user.id) : []),
    [canSave, db.saved, user],
  )

  const isSaved = useCallback((listingId) => savedRows.some((s) => s.listingId === listingId), [savedRows])

  const toggleSave = useCallback(
    (listingId) => {
      if (!canSave) return false
      const existing = savedRows.find((s) => s.listingId === listingId)
      if (existing) {
        remove('saved', existing.id)
        toast.info('Removed from saved.')
        return true
      }
      const listing = db.listings.find((l) => l.id === listingId)
      insert('saved', { id: makeId('sv'), studentId: user.id, listingId, savedAt: new Date().toISOString(), reminder: true })
      // FR-S7: no reminder when less than 2 days are left
      if (listing && daysUntil(listing.deadline) < RULES.REMINDER_DAYS_BEFORE) toast.success('Saved. This listing closes soon.')
      else toast.success('Saved.')
      return true
    },
    [canSave, db.listings, insert, remove, savedRows, toast, user],
  )

  const setReminder = useCallback(
    (savedId, on) => {
      update('saved', savedId, { reminder: on })
      toast.success(on ? 'Reminder turned on.' : 'Reminder turned off.')
    },
    [toast, update],
  )

  return { savedRows, isSaved, toggleSave, setReminder, canSave }
}
