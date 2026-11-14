/*
  Shared "business rules" that more than one feature needs.
  Every function takes the whole db object and RETURNS A NEW db (it never mutates).
  Use them with transaction() from useStore():

    const { transaction } = useStore()
    transaction((db) => setApplicationStatus(db, [appId], APP_STATUS.WITHDRAWN, 'Withdrawn by student'))
*/
import { APP_STATUS, POSTING_STATUS } from '../lib/constants'
import { makeId } from '../lib/ids'

// Add an in-app notification for a user (student, company or admin account id).
export function addNotification(db, { userId, type = 'system', title, message, link = null }) {
  const note = { id: makeId('n'), userId, type, title, message, link, read: false, createdAt: new Date().toISOString() }
  return { ...db, notifications: [note, ...(db.notifications ?? [])] }
}

// Write an entry to the audit log ("who approved the shortlist and when").
export function addAuditLog(db, { action, by, details = '' }) {
  const entry = { id: makeId('log'), action, by, details, at: new Date().toISOString() }
  return { ...db, auditLog: [entry, ...(db.auditLog ?? [])] }
}

/**
 * Change the status of one or more internal applications.
 * - adds a line to each application's status history
 * - sends the student an in-app notification if they have status updates turned on (FR-S8, FR-S10)
 * - Withdrawn applications are never changed (Phase 3 rule), unless the new status is Withdrawn itself
 */
export function setApplicationStatus(db, applicationIds, status, note = '', { notify = true } = {}) {
  const ids = new Set(applicationIds)
  const now = new Date().toISOString()
  let next = { ...db }
  const changed = []

  next.applications = db.applications.map((app) => {
    if (!ids.has(app.id)) return app
    if (app.status === APP_STATUS.WITHDRAWN && status !== APP_STATUS.WITHDRAWN) return app
    if (app.status === status) return app
    changed.push(app)
    return { ...app, status, history: [...(app.history ?? []), { status, at: now, note }] }
  })

  if (notify) {
    for (const app of changed) {
      const student = db.students.find((s) => s.id === app.studentId)
      if (!student || student.notifyStatusUpdates === false) continue
      const listing = db.listings.find((l) => l.id === app.listingId)
      const company = db.companies.find((c) => c.id === listing?.companyId)
      next = addNotification(next, {
        userId: app.studentId,
        type: 'status',
        title: status === APP_STATUS.SHORT_LISTED ? 'You were short-listed' : 'Application status updated',
        message: `${company?.name ?? 'The company'} moved your ${listing?.title ?? ''} application to ${status}.`,
        link: '/student/applications',
      })
    }
  }
  return next
}

/**
 * Close a posting (by the company or automatically at the deadline).
 * FR-SYS3: every Applied application moves to Under Review and the student is notified.
 */
export function closePosting(db, listingId, reason = 'Posting closed') {
  const listing = db.listings.find((l) => l.id === listingId)
  if (!listing || listing.status !== POSTING_STATUS.OPEN) return db

  let next = {
    ...db,
    listings: db.listings.map((l) => (l.id === listingId ? { ...l, status: POSTING_STATUS.CLOSED } : l)),
  }
  const appliedIds = db.applications
    .filter((a) => a.listingId === listingId && a.status === APP_STATUS.APPLIED)
    .map((a) => a.id)
  next = setApplicationStatus(next, appliedIds, APP_STATUS.UNDER_REVIEW, reason)

  if (listing.companyId) {
    next = addNotification(next, {
      userId: listing.companyId,
      type: 'system',
      title: 'Posting closed',
      message: `${listing.title} closed. ${appliedIds.length} applicant${appliedIds.length === 1 ? '' : 's'} moved to Under Review.`,
      link: `/company/postings/${listingId}/applicants`,
    })
  }
  return next
}
