/*
  Phase 3 "Automatic system actions". In the real app these run on the server every hour.
  In this front-end prototype they run when the app loads and then every minute.

  FR-SYS1  Auto-close postings past their deadline
  FR-SYS2  Create deadline reminders 2 days before a saved listing closes
  FR-SYS3  Move Applied applications to Under Review when a posting closes (inside closePosting)
*/
import { APP_STATUS, LISTING_SOURCE, POSTING_STATUS, RULES } from '../lib/constants'
import { daysUntil } from '../lib/format'
import { addNotification, closePosting } from './actions'

export function runSystemJobs(db) {
  let next = db

  // FR-SYS1 + FR-SYS3
  const now = Date.now()
  for (const listing of db.listings) {
    if (
      listing.source === LISTING_SOURCE.INTERNAL &&
      listing.status === POSTING_STATUS.OPEN &&
      new Date(listing.deadline).getTime() < now
    ) {
      next = closePosting(next, listing.id, 'Deadline passed')
    }
  }

  // FR-SYS2 (FR-S7 rules: not if already applied, not if closed, only when switched on)
  for (const saved of next.saved ?? []) {
    if (!saved.reminder || saved.reminderSentFor) continue
    const listing = next.listings.find((l) => l.id === saved.listingId)
    if (!listing || listing.status !== POSTING_STATUS.OPEN) continue
    const days = daysUntil(listing.deadline)
    if (days < 0 || days > RULES.REMINDER_DAYS_BEFORE) continue

    const alreadyApplied = next.applications.some(
      (a) => a.listingId === listing.id && a.studentId === saved.studentId && a.status !== APP_STATUS.WITHDRAWN,
    )
    // don't remind twice for the same deadline
    const alreadyReminded = (next.notifications ?? []).some(
      (n) => n.userId === saved.studentId && n.type === 'reminder' && n.link === `/listings/${listing.id}`,
    )
    if (alreadyApplied || alreadyReminded) continue

    const company = next.companies.find((c) => c.id === listing.companyId)
    next = addNotification(next, {
      userId: saved.studentId,
      type: 'reminder',
      title: 'Application deadline reminder',
      message: `${listing.title} at ${company?.name ?? listing.companyName} closes in ${days} day${days === 1 ? '' : 's'}.`,
      link: `/listings/${listing.id}`,
    })
    next = {
      ...next,
      saved: next.saved.map((s) => (s.id === saved.id ? { ...s, reminderSentFor: listing.deadline } : s)),
    }
  }

  return next
}
