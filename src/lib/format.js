// Small helpers for showing dates and text. All dates in the store are ISO strings.

const DAY = 24 * 60 * 60 * 1000

// "Nora Alqahtani" -> "NA", "stc" -> "ST"
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// "Jun 30, 2026"
export function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// "September 1, 2026"
export function formatLongDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// "Jun 30, 2026, 10:42 AM"
export function formatDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// whole days from today until the date (negative if it already passed)
export function daysUntil(iso) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(iso)
  end.setHours(0, 0, 0, 0)
  return Math.round((end - start) / DAY)
}

// "2 days ago", "Yesterday", "20 minutes ago"
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  return formatDate(iso)
}

// "Closes in 2 days" / "Closes today" / "Closed" / "Closes Jun 28"
export function deadlineLabel(iso) {
  const days = daysUntil(iso)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return 'Closes tomorrow'
  if (days <= 7) return `Closes in ${days} days`
  return `Closes ${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

// weeks -> "6 months" / "8 weeks"
export function durationLabel(weeks) {
  if (!weeks) return '-'
  if (weeks % 4 === 0 && weeks >= 8) return `${weeks / 4} months`
  return `${weeks} weeks`
}

// returns an ISO date string N days from now (used by the seed data)
export function daysFromNow(days, hour = 9) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

// "Good morning" / "Good afternoon" / "Good evening"
export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
