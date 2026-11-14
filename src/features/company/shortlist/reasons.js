/*
  FR-AI4: a short reason (max 40 words) for why an applicant fits a posting.
  Built ONLY from the student's own profile data: the skills that match the posting + one gap.
  It never shows a score or a percentage.
*/

export const AI_LABEL = 'AI-generated, may be inaccurate'
export const REASON_UNAVAILABLE = 'Reason unavailable'

const lower = (s) => String(s ?? '').toLowerCase()

function listWords(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function limitWords(text, max = 40) {
  const words = text.split(/\s+/)
  return words.length <= max ? text : `${words.slice(0, max).join(' ')}...`
}

export function reasonFor(student, listing) {
  if (!student) return ''
  const skills = student.skills ?? []
  const wanted = listing?.skills ?? []
  const has = new Set(skills.map(lower))

  const matching = wanted.filter((s) => has.has(lower(s))).slice(0, 3)
  const gap = wanted.find((s) => !has.has(lower(s)))
  const majorFits = (listing?.majors ?? []).some((m) => lower(m) === lower(student.major))

  let text
  if (matching.length > 0) {
    text = `Strong ${listWords(matching)} from their profile`
  } else if (skills.length > 0) {
    text = `Lists ${listWords(skills.slice(0, 2))} but none of the posting's skills`
  } else {
    text = 'No skills listed on their profile'
  }
  if (majorFits) text += `; ${student.major} matches the posting`
  text += gap ? `; no ${gap} mentioned.` : '; covers every listed skill.'
  return limitWords(text)
}
