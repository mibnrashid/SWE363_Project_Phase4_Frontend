/*
  Front-end version of "Smart search" (FR-AI6) and the listing filters (FR-G1, FR-S2).

  The real system uses keyword search + Gemini embeddings. Here we fake the two parts:
   1. keyword search with typo tolerance ("aramko" still finds "Aramco")
   2. "meaning" search using a small list of related words ("machine learning" also finds "AI")
  Keyword hits are always listed first, then meaning-only hits (Phase 3 rule).
*/
import { DURATIONS } from './constants'
import { daysUntil } from './format'

// small dictionary standing in for embeddings
const RELATED = {
  'machine learning': ['ai', 'artificial intelligence', 'tensorflow', 'deep learning', 'data science'],
  ai: ['machine learning', 'artificial intelligence', 'tensorflow', 'deep learning'],
  data: ['analytics', 'sql', 'power bi', 'pandas', 'spark', 'etl'],
  software: ['engineering', 'javascript', 'react', 'developer', 'web'],
  web: ['react', 'javascript', 'frontend', 'software'],
  design: ['ux', 'ui', 'figma', 'product design'],
  security: ['cybersecurity', 'network', 'soc'],
  money: ['finance', 'accounting'],
  finance: ['accounting', 'financial analysis'],
  marketing: ['social media', 'content', 'campaign'],
  cloud: ['aws', 'linux', 'infrastructure'],
  logistics: ['supply chain', 'planning'],
}

// Levenshtein distance, stopped early once it is bigger than 1 (we only allow 1 typo)
function withinOneEdit(a, b) {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function textOf(listing, companyName) {
  return [listing.title, companyName, listing.city, listing.trainingType, listing.summary, listing.description, ...(listing.skills ?? []), ...(listing.majors ?? [])]
    .join(' ')
    .toLowerCase()
}

// true if every word of the query is in the text (exact, prefix, or 1 typo for words of 4+ letters)
export function keywordMatch(text, query) {
  const words = text.split(/[^a-z0-9+#.]+/).filter(Boolean)
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((q) => text.includes(q) || (q.length >= 4 && words.some((w) => withinOneEdit(w, q))))
}

function meaningMatch(text, query) {
  const q = query.toLowerCase().trim()
  const related = Object.entries(RELATED)
    .filter(([key]) => q.includes(key))
    .flatMap(([, words]) => words)
  return related.some((word) => text.includes(word))
}

export const EMPTY_FILTERS = {
  q: '',
  major: '',
  city: '',
  type: '',
  duration: '',
  start: '',
  pay: '',
  mode: '',
}

export function hasActiveFilters(filters) {
  return Object.entries(filters).some(([key, value]) => key !== 'sort' && Boolean(value))
}

function passesFilters(listing, f) {
  if (f.major && !(listing.majors ?? []).includes(f.major)) return false
  if (f.city && listing.city !== f.city) return false
  if (f.type && listing.trainingType !== f.type) return false
  if (f.mode && listing.workMode !== f.mode) return false
  if (f.pay === 'Paid' && !listing.paid) return false
  if (f.pay === 'Unpaid' && listing.paid) return false
  if (f.duration) {
    const bucket = DURATIONS.find((d) => d.value === f.duration)
    if (bucket && (listing.durationWeeks < bucket.min || listing.durationWeeks > bucket.max)) return false
  }
  if (f.start) {
    if (!listing.startDate) return false
    const days = daysUntil(listing.startDate)
    if (days < 0 || days > Number(f.start)) return false
  }
  return true
}

/**
 * searchListings(listings, filters, { companyNameOf, sort, scoreOf })
 *  - listings: usually getOpenListings(db)
 *  - filters: EMPTY_FILTERS shape
 *  - companyNameOf(listing): returns the company name (for keyword search)
 *  - sort: 'newest' | 'deadline' | 'best'
 *  - scoreOf(listing): only needed for 'best' (use scoreListing from ./match.js)
 * Returns { results, keywordCount }
 */
export function searchListings(listings, filters, { companyNameOf = () => '', sort = 'newest', scoreOf } = {}) {
  const filtered = listings.filter((l) => passesFilters(l, filters))
  const q = (filters.q ?? '').trim()

  let keywordHits = filtered
  let meaningHits = []
  if (q) {
    keywordHits = filtered.filter((l) => keywordMatch(textOf(l, companyNameOf(l)), q))
    // meaning search only for 2+ characters (FR-AI6)
    if (q.length >= 2) {
      const ids = new Set(keywordHits.map((l) => l.id))
      meaningHits = filtered.filter((l) => !ids.has(l.id) && meaningMatch(textOf(l, companyNameOf(l)), q))
    }
  }

  const sorter = {
    newest: (a, b) => new Date(b.postedAt) - new Date(a.postedAt),
    deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
    best: (a, b) => (scoreOf ? scoreOf(b) - scoreOf(a) : 0),
  }[sort] ?? (() => 0)

  return {
    results: [...[...keywordHits].sort(sorter), ...[...meaningHits].sort(sorter)],
    keywordCount: keywordHits.length,
  }
}
