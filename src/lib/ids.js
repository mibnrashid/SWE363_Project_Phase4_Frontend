// Short unique ids for new records: makeId('app') -> 'app_lq3k9x_4f2a'
export function makeId(prefix = 'id') {
  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${prefix}_${time}_${rand}`
}
