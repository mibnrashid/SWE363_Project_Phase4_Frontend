/*
  Every URL in the app. Use these instead of typing paths by hand:
    <Link to={PATHS.listing(listing.id)}>   navigate(PATHS.student.applications)
*/
import { ROLES } from '../lib/constants'

export const PATHS = {
  home: '/',
  listing: (id) => `/listings/${id}`,

  // auth (Musa)
  signup: '/signup',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: (token) => `/reset-password/${token}`,
  checkEmail: (accountId) => `/check-email/${accountId}`,
  verifyEmail: (accountId) => `/verify-email/${accountId}`,
  companyPending: '/company/pending',

  // student (Asim)
  student: {
    dashboard: '/student',
    profile: '/student/profile',
    search: '/student/search',
    apply: (listingId) => `/student/apply/${listingId}`,
    saved: '/student/saved',
    applications: '/student/applications',
    settings: '/student/settings',
    notifications: '/student/notifications',
  },

  // company (Bahaa, shortlist pages by Raed)
  company: {
    dashboard: '/company',
    postings: '/company/postings',
    newPosting: '/company/postings/new',
    editPosting: (id) => `/company/postings/${id}/edit`,
    applicants: (listingId) => `/company/postings/${listingId}/applicants`,
    shortlist: (listingId) => `/company/postings/${listingId}/shortlist`,
    applicant: (applicationId) => `/company/applicants/${applicationId}`,
    allApplicants: '/company/applicants',
    profile: '/company/profile',
  },

  // admin (Raed)
  admin: {
    requests: '/admin/requests',
    users: '/admin/users',
    postings: '/admin/postings',
    imports: '/admin/imports',
    sources: '/admin/sources',
    statistics: '/admin/statistics',
  },
}

export const HOME_BY_ROLE = {
  [ROLES.STUDENT]: PATHS.student.dashboard,
  [ROLES.COMPANY]: PATHS.company.dashboard,
  [ROLES.ADMIN]: PATHS.admin.requests,
}

// links in the top navbar for each role (matches the prototype)
export const NAV_BY_ROLE = {
  guest: [
    { label: 'Opportunities', to: '/', end: true },
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'For companies', to: '/#for-companies' },
  ],
  [ROLES.STUDENT]: [
    { label: 'Dashboard', to: PATHS.student.dashboard, end: true },
    { label: 'Find opportunities', to: PATHS.student.search },
    { label: 'Applications', to: PATHS.student.applications },
    { label: 'Saved', to: PATHS.student.saved },
  ],
  [ROLES.COMPANY]: [
    { label: 'Dashboard', to: PATHS.company.dashboard, end: true },
    { label: 'Listings', to: PATHS.company.postings },
    { label: 'Applicants', to: PATHS.company.allApplicants },
    { label: 'Profile', to: PATHS.company.profile },
  ],
  [ROLES.ADMIN]: [
    { label: 'Requests', to: PATHS.admin.requests },
    { label: 'Users', to: PATHS.admin.users },
    { label: 'Postings', to: PATHS.admin.postings },
    { label: 'Imports', to: PATHS.admin.imports },
    { label: 'Sources', to: PATHS.admin.sources },
    { label: 'Statistics', to: PATHS.admin.statistics },
  ],
}
