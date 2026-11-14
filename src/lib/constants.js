// Values used across the whole app. Taken from the Phase 3 requirements document.
// Always import from here instead of typing the strings again.

export const ROLES = {
  STUDENT: 'student',
  COMPANY: 'company',
  ADMIN: 'admin',
}

// Application statuses (Phase 3, "Statuses and shortlisting")
export const APP_STATUS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORT_LISTED: 'Short-Listed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}
export const APP_STATUS_LIST = Object.values(APP_STATUS)

// Account statuses
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  UNVERIFIED: 'unverified',
  PENDING: 'pending',     // company waiting for admin approval
  REJECTED: 'rejected',   // company rejected by admin
  SUSPENDED: 'suspended',
}

// Posting statuses
export const POSTING_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  REMOVED: 'removed',     // removed by admin (FR-AD3)
}

// Where a listing comes from
export const LISTING_SOURCE = {
  INTERNAL: 'internal',   // posted by a company on InternConnect
  EXTERNAL: 'external',   // imported from the job listing API (apply on original site)
}

export const TRAINING_TYPES = ['Co-op', 'Internship', 'Summer training']
export const WORK_MODES = ['On-site', 'Hybrid', 'Remote']
export const COMPENSATION = ['Paid', 'Unpaid']
export const ACADEMIC_LEVELS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Recent graduate']

// duration filter buckets
export const DURATIONS = [
  { value: 'short', label: 'Up to 2 months', min: 0, max: 8 },
  { value: 'medium', label: '2 to 4 months', min: 9, max: 17 },
  { value: 'long', label: '4 months or more', min: 18, max: 999 },
]

// start date filter buckets
export const START_WINDOWS = [
  { value: '30', label: 'Within 1 month' },
  { value: '90', label: 'Within 3 months' },
  { value: '180', label: 'Within 6 months' },
]

export const SORT_OPTIONS = [
  { value: 'best', label: 'Best match' },
  { value: 'newest', label: 'Newest' },
  { value: 'deadline', label: 'Closest deadline' },
]

export const CITIES = [
  'Riyadh',
  'Jeddah',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Jubail',
  'Makkah',
  'Madinah',
  'Abha',
  'Tabuk',
  'Yanbu',
  'NEOM',
]

export const MAJORS = [
  'Computer Science',
  'Software Engineering',
  'Computer Engineering',
  'Information Systems',
  'Data Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
  'Petroleum Engineering',
  'Civil Engineering',
  'Finance',
  'Accounting',
  'Marketing',
  'Management',
  'Supply Chain Management',
  'Graphic Design',
]

export const UNIVERSITIES = [
  'King Fahd University of Petroleum and Minerals',
  'King Saud University',
  'King Abdulaziz University',
  'Imam Abdulrahman Bin Faisal University',
  'Princess Nourah bint Abdulrahman University',
  'King Abdullah University of Science and Technology',
  'Alfaisal University',
  'Prince Sultan University',
  'Effat University',
  'Umm Al-Qura University',
  'Qassim University',
  'King Khalid University',
]

export const INDUSTRIES = [
  'Technology',
  'Energy',
  'Telecommunications',
  'Petrochemicals',
  'Finance',
  'Logistics',
  'Retail',
  'Healthcare',
  'Consulting',
  'Government',
]

// Rules from Phase 3 that more than one screen needs
export const RULES = {
  RESUME_MAX_MB: 5,
  LOGO_MAX_MB: 2,
  REMINDER_DAYS_BEFORE: 2,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_MINUTES: 15,
  MAX_RECOMMENDATIONS: 10,
  TABLE_NAME_MAX: 40,
  MAX_TABLES_PER_POSTING: 10,
  CHAT_MIN: 10,
  CHAT_MAX: 500,
  CHAT_PER_HOUR: 20,
}
