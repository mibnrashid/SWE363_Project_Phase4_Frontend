// Small helpers shared by the admin pages

export function isThisMonth(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export function patchRow(db, collection, id, patch) {
  return {
    ...db,
    [collection]: (db[collection] ?? []).map((row) =>
      row.id === id ? { ...row, ...(typeof patch === 'function' ? patch(row) : patch) } : row,
    ),
  }
}

export function matchesText(query, ...values) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return values.some((v) => String(v ?? '').toLowerCase().includes(q))
}
