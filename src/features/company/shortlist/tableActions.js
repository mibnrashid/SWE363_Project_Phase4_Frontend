/*
  Pure helpers for the shortlist tables (FR-C7).
  Every function that changes data takes the whole db and returns a NEW db,
  so it can be used inside transaction() from useStore().
*/
import { APP_STATUS, RULES } from '../../../lib/constants'
import { makeId } from '../../../lib/ids'

export const POOL_SORTS = [
  { value: 'appliedAt', label: 'Date applied' },
  { value: 'name', label: 'Name' },
  { value: 'gpa', label: 'GPA' },
]

export const TABLE_SORTS = [
  { value: 'name', label: 'Name' },
  { value: 'gpa', label: 'GPA' },
  { value: 'graduationDate', label: 'Graduation date' },
  { value: 'appliedAt', label: 'Date applied' },
]

// optional columns a table can show under each name
export const TABLE_COLUMNS = [
  { key: 'major', label: 'Major' },
  { key: 'gpa', label: 'GPA' },
  { key: 'graduation', label: 'Graduation' },
  { key: 'skills', label: 'Skills' },
]
export const DEFAULT_COLUMNS = ['major']

// GPA on a 4.0 scale so 4 and 5 point GPAs can be compared
export function gpa4(student) {
  if (!student || student.gpa == null) return null
  return student.gpaScale === 5 ? (student.gpa / 5) * 4 : student.gpa
}

export function gpaLabel(student) {
  if (!student || student.gpa == null) return '-'
  return `${student.gpa} / ${student.gpaScale ?? 4}`
}

export function monthYear(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const compareBy = {
  name: (a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? ''),
  gpa: (a, b) => (gpa4(b.student) ?? -1) - (gpa4(a.student) ?? -1),
  graduationDate: (a, b) => new Date(a.student?.graduationDate ?? 0) - new Date(b.student?.graduationDate ?? 0),
  appliedAt: (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt),
}

// sort applications ({ ...application, student }) by one of the fields above
export function sortApplications(apps, field, { newestFirst = false } = {}) {
  const cmp = compareBy[field] ?? compareBy.appliedAt
  const sorted = [...apps].sort(cmp)
  return field === 'appliedAt' && newestFirst ? sorted.reverse() : sorted
}

export const isWithdrawn = (app) => app.status === APP_STATUS.WITHDRAWN
export const isUnderReview = (app) => app.status === APP_STATUS.UNDER_REVIEW

export function tablesForListing(db, listingId) {
  return (db.shortlistTables ?? [])
    .filter((t) => t.listingId === listingId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

// returns an error message, or '' when the name is fine
export function validateTableName(name, tables, ignoreId = null) {
  const clean = name.trim()
  if (!clean) return 'Table name is required.'
  if (clean.length > RULES.TABLE_NAME_MAX) return `Table name must be ${RULES.TABLE_NAME_MAX} characters or fewer.`
  const taken = tables.some((t) => t.id !== ignoreId && t.name.trim().toLowerCase() === clean.toLowerCase())
  if (taken) return 'A table with this name already exists for this posting.'
  return ''
}

export function canAddTable(tables) {
  return tables.length < RULES.MAX_TABLES_PER_POSTING
}

export const TOO_MANY_TABLES = `You can have up to ${RULES.MAX_TABLES_PER_POSTING} tables for one posting.`

export function makeTable(listingId, name, createdBy = 'company', applicationIds = []) {
  return {
    id: makeId('tbl'),
    listingId,
    name: name.trim(),
    applicationIds,
    isShortlist: false,
    createdBy,
    createdAt: new Date().toISOString(),
    columns: DEFAULT_COLUMNS,
    sortBy: null,
  }
}

function mapTable(db, tableId, fn) {
  return {
    ...db,
    shortlistTables: (db.shortlistTables ?? []).map((t) => (t.id === tableId ? { ...t, ...fn(t) } : t)),
  }
}

export function insertTable(db, table) {
  return { ...db, shortlistTables: [table, ...(db.shortlistTables ?? [])] }
}

export function deleteTable(db, tableId) {
  return { ...db, shortlistTables: (db.shortlistTables ?? []).filter((t) => t.id !== tableId) }
}

export function addToTable(db, tableId, ids) {
  return mapTable(db, tableId, (t) => ({ applicationIds: [...new Set([...t.applicationIds, ...ids])] }))
}

export function removeFromTable(db, tableId, ids) {
  const drop = new Set(ids)
  return mapTable(db, tableId, (t) => ({ applicationIds: t.applicationIds.filter((id) => !drop.has(id)) }))
}

export function patchTable(db, tableId, patch) {
  return mapTable(db, tableId, () => patch)
}

// put the table's rows in a given order; members missing from `order` keep their place at the end
export function setTableOrder(db, tableId, order) {
  return mapTable(db, tableId, (t) => {
    const members = new Set(t.applicationIds)
    const first = order.filter((id) => members.has(id))
    const rest = t.applicationIds.filter((id) => !first.includes(id))
    return { applicationIds: [...first, ...rest] }
  })
}

// order the table by a field and remember the choice
export function sortTable(db, tableId, field, appsById) {
  const table = (db.shortlistTables ?? []).find((t) => t.id === tableId)
  if (!table) return db
  const rows = table.applicationIds.map((id) => appsById[id]).filter(Boolean)
  const order = sortApplications(rows, field).map((a) => a.id)
  return mapTable(setTableOrder(db, tableId, order), tableId, () => ({ sortBy: field }))
}
