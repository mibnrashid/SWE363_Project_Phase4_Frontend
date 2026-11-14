/*
  Pure helpers for the company screens.
  They keep the pages small and are safe to unit test without rendering React.
*/
import { APP_STATUS, POSTING_STATUS } from '../../../lib/constants.js'

const requiredValue = (value, message) => (String(value ?? '').trim() ? '' : message)
const countActiveApplicants = (db, listingId) =>
  db.applications.filter((application) => application.listingId === listingId && application.status !== APP_STATUS.WITHDRAWN).length

export const DURATION_WEEKS = [4, 6, 8, 10, 12, 16, 20, 24, 28]

export const POSTING_TABS = [
  { value: 'all', label: 'All' },
  { value: POSTING_STATUS.OPEN, label: 'Open' },
  { value: POSTING_STATUS.CLOSED, label: 'Closed' },
  { value: POSTING_STATUS.REMOVED, label: 'Removed' },
]

export const EMPTY_POSTING_FORM = {
  title: '',
  trainingType: '',
  city: '',
  workMode: '',
  durationWeeks: '',
  startDate: '',
  deadline: '',
  openings: '',
  majors: [],
  academicLevels: [],
  paid: true,
  stipend: '',
  skills: [],
  summary: '',
  description: '',
  responsibilities: '',
  requirements: '',
  screeningQuestions: [],
}

// "2026-06-30T09:00:00.000Z" -> "2026-06-30" for a date input
export function toDateInput(iso) {
  return iso ? String(iso).slice(0, 10) : ''
}

// "2026-06-30" -> ISO string at the given local hour
export function dateInputToIso(value, hour = 9) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return ''
  return new Date(year, month - 1, day, hour, hour === 23 ? 59 : 0, 0, 0).toISOString()
}

// shared by the posting form and the reopen dialog
export function validateDeadline(value, startDate = '', { requiredMessage = 'Application deadline is required.' } = {}) {
  if (!value) return requiredMessage
  if (new Date(dateInputToIso(value, 23)).getTime() <= Date.now()) {
    return 'The application deadline must be in the future.'
  }
  if (startDate && value >= startDate) {
    return 'The deadline must be before the start date.'
  }
  return ''
}

export function formFromListing(listing) {
  if (!listing) return { ...EMPTY_POSTING_FORM }
  return {
    title: listing.title ?? '',
    trainingType: listing.trainingType ?? '',
    city: listing.city ?? '',
    workMode: listing.workMode ?? '',
    durationWeeks: String(listing.durationWeeks ?? ''),
    startDate: toDateInput(listing.startDate),
    deadline: toDateInput(listing.deadline),
    openings: String(listing.openings ?? ''),
    majors: listing.majors ?? [],
    academicLevels: listing.academicLevels ?? [],
    paid: listing.paid !== false,
    stipend: listing.stipend === null || listing.stipend === undefined ? '' : String(listing.stipend),
    skills: listing.skills ?? [],
    summary: listing.summary ?? '',
    description: listing.description ?? '',
    responsibilities: (listing.responsibilities ?? []).join('\n'),
    requirements: (listing.requirements ?? []).join('\n'),
    screeningQuestions: listing.screeningQuestions ?? [],
  }
}

export function splitLines(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

// form state -> the fields we store on a listing (no status/company fields)
export function formToPayload(form) {
  return {
    title: form.title.trim(),
    trainingType: form.trainingType,
    city: form.city,
    workMode: form.workMode,
    durationWeeks: Number(form.durationWeeks) || 0,
    startDate: dateInputToIso(form.startDate, 9),
    deadline: dateInputToIso(form.deadline, 23),
    openings: Number(form.openings) || 0,
    majors: form.majors,
    academicLevels: form.academicLevels,
    paid: Boolean(form.paid),
    stipend: form.paid && String(form.stipend).trim() ? Number(form.stipend) : null,
    skills: form.skills,
    summary: form.summary.trim(),
    description: form.description.trim(),
    responsibilities: splitLines(form.responsibilities),
    requirements: splitLines(form.requirements),
    screeningQuestions: form.screeningQuestions.map((question) => ({
      id: question.id,
      text: question.text.trim(),
      type: question.type,
      required: Boolean(question.required),
    })),
  }
}

export function validatePostingForm(form) {
  const errors = {
    title: requiredValue(form.title, 'Posting title is required.'),
    trainingType: requiredValue(form.trainingType, 'Training type is required.'),
    city: requiredValue(form.city, 'City is required.'),
    workMode: requiredValue(form.workMode, 'Work mode is required.'),
    durationWeeks: requiredValue(form.durationWeeks, 'Duration is required.'),
    startDate: requiredValue(form.startDate, 'Start date is required.'),
    deadline: requiredValue(form.deadline, 'Application deadline is required.'),
    openings: requiredValue(form.openings, 'Number of openings is required.'),
    majors: form.majors.length ? '' : 'Select at least one eligible major.',
    academicLevels: form.academicLevels.length ? '' : 'Select at least one academic level.',
    skills: form.skills.length ? '' : 'Add at least one required skill.',
    description: requiredValue(form.description, 'Description is required.'),
    responsibilities: splitLines(form.responsibilities).length ? '' : 'Responsibilities are required.',
  }

  if (form.deadline) {
    const deadlineError = validateDeadline(form.deadline, form.startDate)
    if (deadlineError) errors.deadline = deadlineError
  }

  if (form.openings && (!Number.isInteger(Number(form.openings)) || Number(form.openings) < 1)) {
    errors.openings = 'Number of openings must be at least 1.'
  }

  form.screeningQuestions.forEach((question) => {
    if (!question.text.trim()) errors[`question_${question.id}`] = 'Question text is required.'
  })

  return errors
}

export function hasApplications(db, listingId) {
  return db.applications.some((application) => application.listingId === listingId)
}

export function postingsForCompany(db, companyId) {
  return db.listings.filter((listing) => listing.companyId === companyId)
}

export function companyApplications(db, companyId) {
  const listingIds = new Set(postingsForCompany(db, companyId).map((listing) => listing.id))
  return db.applications.filter((application) => listingIds.has(application.listingId))
}

export function countByStatus(applications) {
  const counts = Object.fromEntries(Object.values(APP_STATUS).map((status) => [status, 0]))
  applications.forEach((application) => {
    if (counts[application.status] !== undefined) counts[application.status] += 1
  })
  return counts
}

export function filterPostings(listings, tab, query = '') {
  const q = query.trim().toLowerCase()
  return listings.filter((listing) => {
    const matchesTab = tab === 'all' || listing.status === tab
    const matchesQuery = !q || `${listing.title} ${listing.city} ${listing.trainingType}`.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
}

export function sortPostings(listings, sort, db) {
  const rows = [...listings]
  if (sort === 'deadline') return rows.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  if (sort === 'applicants') {
    return rows.sort((a, b) => countActiveApplicants(db, b.id) - countActiveApplicants(db, a.id))
  }
  return rows.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
}

export function shortlistedCount(db, listingId) {
  return db.applications.filter((application) => application.listingId === listingId && application.status === APP_STATUS.SHORT_LISTED).length
}

export function recentApplicants(db, companyId, limit = 5) {
  const listingIds = new Set(postingsForCompany(db, companyId).map((listing) => listing.id))
  return db.applications
    .filter(
      (application) =>
        listingIds.has(application.listingId) && !application.archived && application.status !== APP_STATUS.WITHDRAWN,
    )
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, limit)
}

export function postingPerformance(db, companyId) {
  const listingIds = new Set(postingsForCompany(db, companyId).map((listing) => listing.id))
  return postingsForCompany(db, companyId)
    .map((listing) => ({
      listing,
      count: db.applications.filter((application) => application.listingId === listing.id && listingIds.has(application.listingId) && !application.archived).length,
    }))
    .sort((a, b) => b.count - a.count)
}

export function companyStats(db, companyId) {
  const listings = postingsForCompany(db, companyId)
  const applications = companyApplications(db, companyId).filter((application) => !application.archived)
  const counts = countByStatus(applications)
  const recentlyPosted = listings.filter((listing) => Date.now() - new Date(listing.postedAt).getTime() <= 30 * 24 * 60 * 60 * 1000).length
  const recentlyApplied = applications.filter((application) => Date.now() - new Date(application.appliedAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length
  const shortlistedRoles = new Set(
    applications.filter((application) => application.status === APP_STATUS.SHORT_LISTED).map((application) => application.listingId),
  ).size
  return {
    activePostings: listings.filter((listing) => listing.status === POSTING_STATUS.OPEN).length,
    totalApplicants: applications.filter((application) => application.status !== APP_STATUS.WITHDRAWN).length,
    awaitingReview: counts[APP_STATUS.UNDER_REVIEW],
    shortlisted: counts[APP_STATUS.SHORT_LISTED],
    recentlyPosted,
    recentlyApplied,
    shortlistedRoles,
  }
}
