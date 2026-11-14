/*
  Table assistant (FR-C7 steps 3-5, FR-AI3).
  There is no real Gemini in Phase 4, so this is a small rule-based interpreter.

    runAssistant(message, { listing, applications, tables })  ->  { reply, actions }
    applyActions(db, actions, names)                          ->  { db, changes }
    undoChange(db, undo)                                      ->  db

  Rules it follows (NFR-13 and Phase 3):
   - it can only organise tables, it NEVER changes an application status
   - only Under Review applicants are added; Withdrawn are always left out
   - ranking uses skill overlap, ties -> earlier application first; the score is never shown
*/
import { ACADEMIC_LEVELS, MAJORS } from '../../../lib/constants'
import { makeId } from '../../../lib/ids'
import { AI_LABEL, reasonFor } from './reasons'
import {
  TABLE_SORTS,
  TOO_MANY_TABLES,
  addToTable,
  canAddTable,
  deleteTable,
  gpa4,
  insertTable,
  isUnderReview,
  isWithdrawn,
  makeTable,
  removeFromTable,
  setTableOrder,
  sortApplications,
  validateTableName,
} from './tableActions'

export const REPLIES = {
  OUT_OF_SCOPE: "I can only help with this posting's applicants.",
  REPHRASE: 'Please rephrase your request.',
  NO_STATUS:
    "I can't change application statuses. Only you can do that, with the Use as shortlist and Confirm accepted buttons. I can help you organise the tables before that.",
}

// words in a request -> skills they point to (used for ranking "the strongest")
const KEYWORD_SKILLS = [
  [/\b(ai|artificial intelligence)\b/, ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP']],
  [/\b(ml|machine learning)\b/, ['Machine Learning', 'TensorFlow', 'PyTorch', 'Python', 'Statistics']],
  [/\bdata\b/, ['SQL', 'pandas', 'Spark', 'Python', 'Power BI', 'Statistics', 'Airflow']],
  [/\b(web|front-?end)\b/, ['JavaScript', 'TypeScript', 'React', 'Vue']],
  [/\bback-?end\b/, ['Java', 'Node.js', 'Spring', 'Docker', 'SQL']],
  [/\b(security|cyber)/, ['Security', 'Cybersecurity', 'Networking', 'Linux']],
  [/\bcloud\b/, ['AWS', 'Docker', 'Linux', 'Cloud']],
]

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30,
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const lower = (s) => String(s ?? '').toLowerCase()

function hasWord(text, word) {
  return new RegExp(`(^|[^a-z0-9+#])${escapeRe(lower(word))}($|[^a-z0-9+#])`).test(text)
}

// ---------- finding things in the message ----------

// every table named in the message, with where it appears
function findTables(text, tables) {
  const found = []
  const byLength = [...tables].sort((a, b) => b.name.length - a.name.length)
  let rest = text
  for (const table of byLength) {
    const name = lower(table.name)
    const index = rest.indexOf(name)
    if (index === -1) continue
    found.push({ table, index })
    rest = rest.slice(0, index) + ' '.repeat(name.length) + rest.slice(index + name.length) // don't match twice
  }
  return { mentions: found.sort((a, b) => a.index - b.index), rest }
}

// the table that comes right after "from" / "to" / "into" / "in"
function tableAfter(text, mentions, words) {
  return (
    mentions.find(({ index }) => {
      const before = text.slice(0, index).trim()
      return words.some((w) => before.endsWith(` ${w}`) || before === w || before.endsWith(` ${w} the`))
    })?.table ?? null
  )
}

// applicants named in the message: full name first, then a unique first name
function findApplicants(text, apps) {
  const found = new Map()
  for (const app of apps) {
    const name = lower(app.student?.name)
    if (name && hasWord(text, name)) found.set(app.id, app)
  }
  for (const app of apps) {
    if (found.has(app.id)) continue
    const first = lower(app.student?.name).split(' ')[0]
    if (!first || first.length < 3 || !hasWord(text, first)) continue
    const sameFirst = apps.filter((a) => lower(a.student?.name).split(' ')[0] === first)
    if (sameFirst.length === 1) found.set(app.id, app)
  }
  return [...found.values()]
}

// "the 5 strongest" -> 5 (GPA values and years are ignored)
function findNumber(text) {
  const clean = text
    .replace(/\d+\.\d+/g, ' ')
    .replace(/gpa[^a-z]*(?:[a-z]+\s+){0,2}\d+/g, ' ')
    .replace(/\b\d{4}\b/g, ' ')
  const digits = clean.match(/\b(\d{1,3})\b/)
  if (digits) return Number(digits[1])
  const word = Object.keys(NUMBER_WORDS).find((w) => hasWord(clean, w))
  return word ? NUMBER_WORDS[word] : null
}

function monthDate(monthIndex, year, endOfMonth) {
  const now = new Date()
  let y = year
  if (!y) y = monthIndex >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1
  return endOfMonth ? new Date(y, monthIndex + 1, 0, 23, 59) : new Date(y, monthIndex, 1)
}

// filters on profile fields: GPA, skill, major, academic level, graduation date
function parseFilters(text, apps, listing) {
  const filters = []
  const labels = []

  const gpa = text.match(
    /gpa\s*(?:of\s*|is\s*)?(above|over|greater than|more than|higher than|at least|>=|>|below|under|less than|lower than|at most|<=|<)\s*(\d(?:\.\d{1,2})?)/,
  )
  if (gpa) {
    const value = Number(gpa[2])
    const min = /above|over|greater|more|higher|at least|>/.test(gpa[1])
    const strict = !/at least|at most|=/.test(gpa[1])
    filters.push((a) => {
      const g = gpa4(a.student)
      if (g == null) return false
      if (min) return strict ? g > value : g >= value
      return strict ? g < value : g <= value
    })
    labels.push(`GPA ${min ? 'above' : 'below'} ${value} (on a 4.0 scale)`)
  }

  const allSkills = new Set([...(listing.skills ?? []), ...apps.flatMap((a) => a.student?.skills ?? [])])
  const skills = [...allSkills].filter((s) => s.length >= 2 && hasWord(text, s))
  const skillCue = /\b(with|knows?|knowing|skilled|experience|who (?:has|have|uses?)|having|using)\b/.test(text)
  if (skills.length && skillCue) {
    filters.push((a) => skills.every((s) => (a.student?.skills ?? []).some((k) => lower(k) === lower(s))))
    labels.push(`with ${skills.join(' and ')}`)
  }

  if (/\bmajor|studying|students? of\b/.test(text)) {
    const majors = [...new Set([...MAJORS, ...apps.map((a) => a.student?.major).filter(Boolean)])].filter((m) => hasWord(text, m))
    if (majors.length) {
      filters.push((a) => majors.some((m) => lower(m) === lower(a.student?.major)))
      labels.push(`majoring in ${majors.join(' or ')}`)
    }
  }

  const level = ACADEMIC_LEVELS.find((l) => new RegExp(`\\b${lower(l)}s?\\b`).test(text))
  if (level) {
    filters.push((a) => a.student?.academicLevel === level)
    labels.push(`${level} level`)
  }

  const grad = text.match(/graduat\w*\s+(after|before|by|in)\s+([a-z]+)(?:\s+(\d{4}))?/)
  if (grad) {
    const month = MONTHS.findIndex((m) => m.startsWith(grad[2].slice(0, 3)))
    if (month !== -1) {
      const year = grad[3] ? Number(grad[3]) : null
      const start = monthDate(month, year, false)
      const end = monthDate(month, year, true)
      const when = (a) => new Date(a.student?.graduationDate ?? 0)
      if (grad[1] === 'after') filters.push((a) => when(a) > end)
      else if (grad[1] === 'in') filters.push((a) => when(a) >= start && when(a) <= end)
      else filters.push((a) => when(a) < (grad[1] === 'by' ? end : start))
      labels.push(`graduating ${grad[1]} ${MONTHS[month][0].toUpperCase()}${MONTHS[month].slice(1)} ${start.getFullYear()}`)
    }
  }

  return { match: (a) => filters.every((f) => f(a)), active: filters.length > 0, labels, skills }
}

// FR-AI3 ranking: skill overlap with the posting + the request, ties -> earlier application
function rankByFit(apps, listing, text, extraSkills) {
  const wanted = new Set([...(listing.skills ?? []), ...extraSkills].map(lower))
  for (const [re, skills] of KEYWORD_SKILLS) if (re.test(text)) skills.forEach((s) => wanted.add(lower(s)))
  const fit = (a) => (a.student?.skills ?? []).filter((s) => wanted.has(lower(s))).length
  return [...apps].sort((a, b) => fit(b) - fit(a) || new Date(a.appliedAt) - new Date(b.appliedAt))
}

function cleanName(raw) {
  return raw
    .replace(/^["'“‘]+|["'”’.?!]+$/g, '')
    .split(/\s+(?:with|and|for|of|containing|that|who)\s+/i)[0]
    .replace(/["'“”‘’]/g, '')
    .trim()
}

function uniqueName(base, tables) {
  let name = base.slice(0, 40).trim()
  let n = 2
  while (validateTableName(name, tables)) {
    name = `${base.slice(0, 36).trim()} ${n}`
    n += 1
    if (n > 20) break
  }
  return name
}

function sortFieldFrom(text) {
  if (/gpa|grade/.test(text)) return 'gpa'
  if (/graduat/.test(text)) return 'graduationDate'
  if (/appl|date|newest|oldest/.test(text)) return 'appliedAt'
  if (/name|alphabet/.test(text)) return 'name'
  return null
}

const DOMAIN = /\b(applicants?|candidates?|students?|people|everyone|all|table|tables|gpa|skills?|majors?|majoring|add|put|remove|move|sort|order|rank|strongest|best|top|why|reason|graduat\w*|picks?|create|make|list|shortlist\w*|approve|reject|accept|hire|senior|junior|python|java)\b/

// ---------- main entry ----------

export function runAssistant(message, { listing, applications, tables }) {
  const original = message.trim()
  const text = lower(original).replace(/\s+/g, ' ')

  const { mentions, rest } = findTables(text, tables)
  const named = findApplicants(rest, applications)
  const filters = parseFilters(rest, applications, listing)
  const underReview = applications.filter(isUnderReview)

  if (!DOMAIN.test(rest) && mentions.length === 0 && named.length === 0) return { reply: REPLIES.OUT_OF_SCOPE, actions: [] }

  // text without a new table name, so a name like "Final shortlist" is not read as a command
  const calledMatch = original.match(/\b(?:called|named|titled)\s+(.+)$/i)
  const cut = rest.search(/\b(called|named|titled)\b/)
  const commandText = cut >= 0 ? rest.slice(0, cut) : rest

  // NFR-13: never change statuses
  if (/\b(approve|reject|accept|hire|finali[sz]e|offer|short-?list(?:ed)?)\b|\bchange (?:the |their |his |her )?status|\bset (?:the |their )?status|\bmark .* as\b/.test(commandText)) {
    return { reply: REPLIES.NO_STATUS, actions: [] }
  }

  // "Why is Reem in Strong ML background?"
  if (/^why\b|\bwhy (?:is|was|did|are)\b|\breason\b/.test(text)) {
    const app = named[0]
    if (!app) return { reply: 'Which applicant do you mean? Use their name, for example "Why is Reem in Backup picks?"', actions: [] }
    const table = mentions[0]?.table
    if (table && !table.applicationIds.includes(app.id)) {
      return { reply: `${app.student.name} isn't in ${table.name}.`, actions: [] }
    }
    return { reply: `${AI_LABEL}: ${reasonFor(app.student, listing)}`, actions: [] }
  }

  // "Sort Backup picks by GPA"
  if (/\b(sort|order|arrange|rank)\b/.test(commandText) && !/\b(make|create|build)\b/.test(commandText)) {
    const table = mentions[0]?.table
    if (!table) return { reply: tableMissing(tables), actions: [] }
    const field = sortFieldFrom(text.slice(text.indexOf(' by ') + 1)) ?? sortFieldFrom(text)
    if (!field) return { reply: 'I can sort by name, GPA, graduation date or date applied.', actions: [] }
    const rows = table.applicationIds.map((id) => applications.find((a) => a.id === id)).filter(Boolean)
    const order = sortApplications(rows, field).map((a) => a.id)
    const label = TABLE_SORTS.find((s) => s.value === field).label
    const by = field === 'gpa' ? label : label.toLowerCase()
    return {
      reply: 'Done. I made these changes:',
      actions: [{ type: 'reorder', tableId: table.id, order, label: `Sorted ${table.name} by ${by}` }],
    }
  }

  // "Make a table of the 5 strongest for an AI engineer role" / "Create a table called Backup picks"
  if (/\b(make|create|build|start|set up|new)\b/.test(commandText) && /\b(table|list)\b/.test(commandText)) {
    if (!canAddTable(tables)) return { reply: TOO_MANY_TABLES, actions: [] }

    let name
    if (calledMatch) {
      name = cleanName(calledMatch[1])
      const problem = validateTableName(name, tables)
      if (problem) return { reply: problem, actions: [] }
    } else {
      const role = original.match(/\bfor (?:an? |the )?(.+?)(?:\s+(?:role|position|job|posting|team))?[.?!]*$/i)
      const base = role && role[1].length <= 30 ? `${role[1].trim()} picks` : 'Assistant picks'
      name = uniqueName(base.charAt(0).toUpperCase() + base.slice(1), tables)
    }

    const table = makeTable(listing.id, name, 'assistant')
    const actions = [{ type: 'createTable', table, label: `Created table ${name}` }]
    let note = ''
    const wantsRanking = /\b(strongest|best|top|most suitable|strong)\b/.test(commandText)
    let pick = []
    if (wantsRanking) {
      const n = findNumber(commandText) ?? 5
      const pool = underReview.filter(filters.match)
      pick = rankByFit(pool, listing, text, filters.skills).slice(0, n)
      if (pool.length < n) note = ` Only ${plural(pool.length, 'applicant')} ${pool.length === 1 ? 'is' : 'are'} Under Review${filters.active ? ' and match' : ''}, so I added ${pool.length === 1 ? 'that one' : 'all of them'}.`
    } else if (filters.active || named.length) {
      pick = named.length ? named.filter(isUnderReview) : underReview.filter(filters.match)
    }
    if (pick.length) {
      actions.push({ type: 'add', tableId: table.id, applicationIds: pick.map((a) => a.id), label: `Added ${plural(pick.length, 'applicant')}` })
    }
    return { reply: `Done. I made these changes:${note}`, actions }
  }

  const fromTable = tableAfter(text, mentions, ['from', 'out of'])
  const toTable = tableAfter(text, mentions, ['to', 'into', 'onto'])
  const quantifier = /\b(everyone|everybody|all|anyone|applicants|students|candidates|people|those)\b/.test(commandText)
  const wantsRanking = /\b(strongest|best|top)\b/.test(commandText)

  // which applicants the request is about, from a pool
  const pickFrom = (pool) => {
    if (named.length) return named.filter((a) => pool.some((p) => p.id === a.id))
    if (wantsRanking) return rankByFit(pool.filter(filters.match), listing, text, filters.skills).slice(0, findNumber(commandText) ?? 5)
    if (quantifier || filters.active) return pool.filter(filters.match)
    return null
  }
  const describe = () => (filters.labels.length ? ` ${filters.labels.join(', ')}` : '')

  // "Move everyone from Strong ML background who graduates after July to Backup picks"
  if (/\bmove\b/.test(commandText)) {
    if (!fromTable || !toTable) return { reply: 'Tell me both tables, for example "Move Reem from Strong ML background to Backup picks".', actions: [] }
    if (fromTable.id === toTable.id) return { reply: 'The two tables are the same.', actions: [] }
    const members = fromTable.applicationIds.map((id) => applications.find((a) => a.id === id)).filter(Boolean)
    const pick = pickFrom(members)
    if (pick === null) return { reply: REPLIES.REPHRASE, actions: [] }
    if (pick.length === 0) return { reply: `Nobody in ${fromTable.name} matches${describe()}.`, actions: [] }
    const ids = pick.map((a) => a.id)
    const fresh = ids.filter((id) => !toTable.applicationIds.includes(id))
    const actions = [{ type: 'remove', tableId: fromTable.id, applicationIds: ids, label: `Removed ${plural(ids.length, 'applicant')} from ${fromTable.name}` }]
    if (fresh.length) actions.push({ type: 'add', tableId: toTable.id, applicationIds: fresh, label: `Added ${plural(fresh.length, 'applicant')} to ${toTable.name}` })
    return { reply: 'Done. I made these changes:', actions }
  }

  // "Add Sara Alanazi to Backup picks" / "Add everyone with GPA above 3.5 to Backup picks"
  if (/\b(add|put|include|copy|place)\b/.test(commandText)) {
    const target = toTable ?? (mentions.length === 1 && !fromTable ? mentions[0].table : null)
    if (!target) return { reply: tableMissing(tables, original.match(/\b(?:to|into)\s+(.+?)[.?!]*$/i)?.[1]), actions: [] }
    const pool = fromTable
      ? fromTable.applicationIds.map((id) => applications.find((a) => a.id === id)).filter((a) => a && isUnderReview(a))
      : underReview
    const pick = pickFrom(pool)
    if (pick === null) {
      if (named.some(isWithdrawn)) return { reply: `${named.find(isWithdrawn).student.name} withdrew, so I can't add them.`, actions: [] }
      return { reply: REPLIES.REPHRASE, actions: [] }
    }
    const skipped = named.filter((a) => !isUnderReview(a))
    const fresh = pick.map((a) => a.id).filter((id) => !target.applicationIds.includes(id))
    const skipNote = skipped.length ? ` I skipped ${skipped.map((a) => a.student.name).join(', ')} (not Under Review).` : ''
    if (fresh.length === 0) {
      return { reply: pick.length ? `They are already in ${target.name}.${skipNote}` : `No Under Review applicants match${describe()}.${skipNote}`, actions: [] }
    }
    return {
      reply: `Done. I made these changes:${skipNote}`,
      actions: [{ type: 'add', tableId: target.id, applicationIds: fresh, label: `Added ${plural(fresh.length, 'applicant')} to ${target.name}` }],
    }
  }

  // "Remove Omar from Strong ML background"
  if (/\b(remove|drop|take out|delete|exclude)\b/.test(commandText)) {
    const table = fromTable ?? (mentions.length === 1 ? mentions[0].table : null)
    if (!table) return { reply: tableMissing(tables, original.match(/\bfrom\s+(.+?)[.?!]*$/i)?.[1]), actions: [] }
    if (!named.length && !quantifier && !filters.active && /\btable\b/.test(commandText)) {
      return { reply: `To delete ${table.name}, use the ≡ menu on the table.`, actions: [] }
    }
    const members = table.applicationIds.map((id) => applications.find((a) => a.id === id)).filter(Boolean)
    const pick = pickFrom(members)
    if (pick === null) return { reply: REPLIES.REPHRASE, actions: [] }
    if (pick.length === 0) {
      return { reply: named.length ? `${named[0].student.name} isn't in ${table.name}.` : `Nobody in ${table.name} matches${describe()}.`, actions: [] }
    }
    return {
      reply: 'Done. I made these changes:',
      actions: [{ type: 'remove', tableId: table.id, applicationIds: pick.map((a) => a.id), label: `Removed ${plural(pick.length, 'applicant')} from ${table.name}` }],
    }
  }

  return { reply: REPLIES.REPHRASE, actions: [] }
}

function tableMissing(tables, guess) {
  const list = tables.length ? ` Your tables are: ${tables.map((t) => t.name).join(', ')}.` : ' You have no tables yet.'
  return guess ? `I couldn't find a table called "${cleanName(guess)}".${list}` : `Which table do you mean?${list}`
}

// ---------- applying and undoing (plain data, so the chat survives a refresh) ----------

export function applyActions(db, actions) {
  let next = db
  const changes = []
  for (const action of actions) {
    const table = (next.shortlistTables ?? []).find((t) => t.id === (action.table?.id ?? action.tableId))
    if (action.type === 'createTable') {
      next = insertTable(next, action.table)
      changes.push({ id: makeId('chg'), label: action.label, undo: { type: 'createTable', tableId: action.table.id }, undone: false })
    } else if (action.type === 'add' && table) {
      next = addToTable(next, table.id, action.applicationIds)
      changes.push({ id: makeId('chg'), label: action.label, undo: { type: 'add', tableId: table.id, applicationIds: action.applicationIds }, undone: false })
    } else if (action.type === 'remove' && table) {
      next = removeFromTable(next, table.id, action.applicationIds)
      changes.push({
        id: makeId('chg'),
        label: action.label,
        undo: { type: 'remove', tableId: table.id, applicationIds: action.applicationIds, previousOrder: table.applicationIds },
        undone: false,
      })
    } else if (action.type === 'reorder' && table) {
      next = setTableOrder(next, table.id, action.order)
      changes.push({ id: makeId('chg'), label: action.label, undo: { type: 'reorder', tableId: table.id, previousOrder: table.applicationIds }, undone: false })
    }
  }
  return { db: next, changes }
}

// reverse one change; returns null when it can't be undone any more (the table was deleted)
export function undoChange(db, undo) {
  const table = (db.shortlistTables ?? []).find((t) => t.id === undo.tableId)
  if (!table) return null
  switch (undo.type) {
    case 'createTable':
      return deleteTable(db, undo.tableId)
    case 'add':
      return removeFromTable(db, undo.tableId, undo.applicationIds)
    case 'remove':
      return setTableOrder(addToTable(db, undo.tableId, undo.applicationIds), undo.tableId, undo.previousOrder)
    case 'reorder':
      return setTableOrder(db, undo.tableId, undo.previousOrder)
    default:
      return null
  }
}
