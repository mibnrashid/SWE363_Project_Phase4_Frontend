/*
  Read helpers so pages don't repeat the same .find() logic.
  They take the db object from useStore().

    const { db } = useStore()
    const listing = getListing(db, id)
    const company = getListingCompany(db, listing)
*/
import { APP_STATUS, LISTING_SOURCE, POSTING_STATUS } from '../lib/constants'

export const getListing = (db, id) => db.listings.find((l) => l.id === id) ?? null
export const getCompany = (db, id) => db.companies.find((c) => c.id === id) ?? null
export const getStudent = (db, id) => db.students.find((s) => s.id === id) ?? null
export const getAccount = (db, id) => db.accounts.find((a) => a.id === id) ?? null
export const getApplication = (db, id) => db.applications.find((a) => a.id === id) ?? null

// { name, logo, ... } for internal listings, a light object for external ones
export function getListingCompany(db, listing) {
  if (!listing) return null
  if (listing.source === LISTING_SOURCE.EXTERNAL) {
    return { id: null, name: listing.companyName, logo: null, industry: '', size: '', description: '' }
  }
  return getCompany(db, listing.companyId)
}

export const companyNameOf = (db, listing) => getListingCompany(db, listing)?.name ?? ''

// open listings visible in search (FR-G1, FR-S2)
export function getOpenListings(db) {
  return db.listings.filter((l) => l.status === POSTING_STATUS.OPEN)
}

export function isListingOpen(listing) {
  return listing?.status === POSTING_STATUS.OPEN && new Date(listing.deadline).getTime() > Date.now()
}

// the student's (non-withdrawn) application to a listing, if any
export function getStudentApplication(db, studentId, listingId) {
  return db.applications.find((a) => a.studentId === studentId && a.listingId === listingId) ?? null
}

export function getApplicationsForListing(db, listingId) {
  return db.applications.filter((a) => a.listingId === listingId)
}

export function getApplicationsForStudent(db, studentId) {
  return db.applications.filter((a) => a.studentId === studentId)
}

export function isSaved(db, studentId, listingId) {
  return (db.saved ?? []).some((s) => s.studentId === studentId && s.listingId === listingId)
}

export function getNotificationsFor(db, userId) {
  return (db.notifications ?? [])
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function countActiveApplicants(db, listingId) {
  return db.applications.filter((a) => a.listingId === listingId && a.status !== APP_STATUS.WITHDRAWN).length
}
