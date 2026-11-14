# Toolbox - shared code you can use (but not edit)

Everything here already exists on `main`. Import it, don't copy it, and **don't edit these files**. If something is missing or broken, tell Musa.

Import paths below are written from a page inside `src/features/<area>/pages/`. From `src/features/company/shortlist/` they are the same (also three `../`).

---

## 1. UI components - `src/components/ui`

```jsx
import { Alert, Avatar, Badge, Button, Card, Checkbox, ConfirmDialog, Drawer, EmptyState, FileUpload,
  FormField, Input, Modal, PageHeader, Select, Spinner, StatCard, StatusBadge, Tabs, Textarea, Toggle,
  Table, Th, Td } from '../../../components/ui'
```

| Component | Use it for | Example |
| --- | --- | --- |
| `PageHeader` | Top of every page (eyebrow + serif title + subtitle + buttons) | `<PageHeader eyebrow="Student workspace" title="Saved listings" subtitle="..." actions={<Button>..</Button>} />` |
| `Button` | All buttons and button-looking links | `<Button>Save</Button>` · `<Button variant="secondary" icon={Plus}>Add</Button>` · `<Button to={PATHS.student.search}>Search</Button>` · variants: `primary` `secondary` `ghost` `link` `danger` `danger-outline` · sizes `sm` `md` `lg` · `loading` `fullWidth` `disabled` |
| `Input` | Text, email, number, date, password inputs | `<Input label="GPA" type="number" value={gpa} onChange={e => setGpa(e.target.value)} error={errors.gpa} />` |
| `Select` | Dropdowns | `<Select label="City" options={CITIES} placeholder="All cities" value={city} onChange={...} />` (options: strings or `{value,label}`) |
| `Textarea` | Long text, optional counter | `<Textarea label="Short bio" maxLength={300} value={bio} onChange={...} />` |
| `Checkbox` | Single checkbox | `<Checkbox checked={x} onChange={e => setX(e.target.checked)} label="..." />` |
| `Toggle` | On/off switch | `<Toggle checked={on} onChange={setOn} label="In-app notifications" />` (onChange gets a boolean) |
| `FormField` | Wrap a custom input with label + error | `<FormField label="Skills" error={errors.skills}>{(id) => <MyInput id={id} />}</FormField>` |
| `FileUpload` | PDF resume / logo with type + size checks | `<FileUpload accept={['application/pdf']} maxSizeMB={5} typeError="Please upload a PDF under 5 MB." onFile={(file, dataUrl) => ...} />` |
| `Card` | White box, optional title row | `<Card title="Recent applications" subtitle="..." action={<Link>..</Link>}>...</Card>` |
| `StatCard` | Number tile on dashboards | `<StatCard icon={Briefcase} value={3} label="Active postings" note="+1 this month" />` |
| `Badge` | Small labels | `<Badge>Co-op</Badge>` · tones: `neutral` `teal` `success` `warning` `danger` `info` `dark` |
| `StatusBadge` | Application status pill with the right colour | `<StatusBadge status={app.status} />` |
| `Avatar` | Initials box / circle / logo | `<Avatar name="Aramco Digital" />` · `<Avatar name={student.name} round />` · `<Avatar src={company.logo} name={company.name} />` |
| `Tabs` | Underline tabs or segmented switch | `<Tabs value={tab} onChange={setTab} options={[{value:'all',label:'All',count:8}, ...]} />` · `variant="segmented"` |
| `Table`, `Th`, `Td` | Tables (scroll sideways on phones) | `<Table><thead><tr><Th>Name</Th></tr></thead><tbody><tr><Td>..</Td></tr></tbody></Table>` |
| `Modal` | Dialogs and forms in a popup | `<Modal open={open} onClose={() => setOpen(false)} title="Add external application" footer={<Button>Save</Button>}>...</Modal>` |
| `ConfirmDialog` | "Are you sure?" for actions that can't be undone, optional required reason | `<ConfirmDialog open={open} title="Withdraw application?" message="..." confirmLabel="Withdraw" danger requireReason onConfirm={(reason) => ...} onCancel={() => setOpen(false)} />` |
| `Drawer` | Side panel from the right | `<Drawer open={!!selected} onClose={() => setSelected(null)} footer={...}>...</Drawer>` |
| `Alert` | Inline message box | `<Alert tone="info" title="Showing keyword results only">...</Alert>` · tones `info` `success` `warning` `danger` |
| `EmptyState` | Empty lists | `<EmptyState icon={Bookmark} title="You haven't saved any listings yet" action={<Button to={...}>Search listings</Button>} />` |
| `Spinner` | Loading text | `<Spinner label="We're analysing your resume" />` |

Listing components - `src/components/listings`:

```jsx
import ListingCard from '../../../components/listings/ListingCard'
import FilterBar from '../../../components/listings/FilterBar'
import LoginPromptModal from '../../../components/listings/LoginPromptModal'
```

- `<ListingCard listing={l} companyName="stc" companyLogo={c.logo} saved={isSaved(l.id)} onToggleSave={() => toggleSave(l.id)} matchLabel="Strong match" showDeadline />`
- `<FilterBar filters={filters} onChange={setFilters} />` (7 filters + Clear all)

Icons: `import { Bookmark, Plus } from 'lucide-react'` (browse names at https://lucide.dev/icons).

Styling: Tailwind classes. Use the project colours: `text-ink` `text-body` `text-muted` `bg-canvas` `border-line` `bg-primary` `text-primary` `bg-primary-soft` `bg-night` `text-mint` `text-danger` `bg-danger-soft` `text-warning` `bg-warning-soft` `text-success` `bg-success-soft` `text-info` `bg-info-soft`. Headings automatically use the serif font; add `font-serif` to other text that should be serif. `className="eyebrow"` gives the small uppercase teal label. Combine classes with `cn()` from `lib/cn` when they depend on conditions.

## 2. Who is logged in - `useAuth()`

```jsx
import { useAuth } from '../../../context/authContext'
const { user, role, profile, logout } = useAuth()
```

- `user` - the account `{ id, role, email, name, status }`
- `profile` - the student record (students) or company record (companies). `profile.id === user.id`.
- Students: `user.id` is the `studentId` used in `applications`, `saved`, `externalApplications`.
- Companies: `user.id` is the `companyId` used in `listings`.

Pages are already protected by role in `AppRoutes.jsx`; you don't need to check the role yourself.

## 3. Messages - `useToast()`

```jsx
import { useToast } from '../../../context/toastContext'
const toast = useToast()
toast.success('Profile saved.')     toast.error('Please fix the highlighted fields.')     toast.info('Removed from saved.')
```

Every action must show a success or error message (NFR-4).

## 4. Data store - `useStore()`

```jsx
import { useStore } from '../../../store/useStore'
const { db, insert, update, remove, setCollection, transaction } = useStore()
```

| Call | What it does |
| --- | --- |
| `db.listings` (any collection) | Read data. It re-renders automatically when data changes. |
| `insert('saved', row)` | Add a row at the top. Unknown collection names are created automatically. |
| `update('students', id, { bio })` | Merge fields into one row. Also accepts a function: `update('listings', id, (row) => ({ openings: row.openings + 1 }))` |
| `remove('saved', id)` | Delete one row |
| `setCollection('shortlistTables', (rows) => rows.filter(...))` | Replace a whole collection |
| `transaction((db) => newDb)` | Change several collections at once. Use with the shared actions below. |

Data is saved in localStorage automatically. New ids: `import { makeId } from '../../../lib/ids'` → `makeId('app')`.
The shape of every collection is in [DATA_MODEL.md](DATA_MODEL.md).

### Read helpers - `src/store/selectors.js`

```jsx
import { getListing, getCompany, getStudent, getAccount, getApplication, getListingCompany, companyNameOf,
  getOpenListings, isListingOpen, getStudentApplication, getApplicationsForListing, getApplicationsForStudent,
  isSaved, getNotificationsFor, countActiveApplicants } from '../../../store/selectors'
```

All take `db` first: `getListing(db, id)`, `getListingCompany(db, listing)` (works for internal and external listings), `getStudentApplication(db, studentId, listingId)`, `countActiveApplicants(db, listingId)` (ignores Withdrawn).

### Shared business rules - `src/store/actions.js`

Use them inside `transaction`. They follow the Phase 3 rules for you.

```jsx
import { setApplicationStatus, closePosting, addNotification, addAuditLog } from '../../../store/actions'

// change status of one or many applications: adds history + notifies students who have notifications on
transaction((db) => setApplicationStatus(db, [app.id], APP_STATUS.WITHDRAWN, 'Withdrawn by student'))

// close a posting: Applied -> Under Review for all its applications + notifies (FR-C4, FR-SYS3)
transaction((db) => closePosting(db, listing.id, 'Closed by company'))

// notify someone
transaction((db) => addNotification(db, { userId: listing.companyId, type: 'status', title: 'Offer declined', message: '...', link: PATHS.company.applicants(listing.id) }))

// log who did something important
transaction((db) => addAuditLog(db, { action: 'Shortlist approved', by: user.name, details: listing.title }))

// several at once
transaction((db) => {
  let next = setApplicationStatus(db, ids, APP_STATUS.SHORT_LISTED)
  next = addAuditLog(next, { action: 'Shortlist approved', by: user.name })
  return { ...next, listings: next.listings.map((l) => (l.id === listing.id ? { ...l, shortlistApprovedAt: new Date().toISOString() } : l)) }
})
```

Automatic jobs (auto-close at the deadline, 2-day reminders) already run every minute in `store/systemJobs.js`.

## 5. Shared hooks - `src/hooks`

| Hook | Returns |
| --- | --- |
| `useSavedListings()` | `{ savedRows, isSaved(listingId), toggleSave(listingId), setReminder(savedId, bool), canSave }` - the logged-in student's saved listings (shows toasts for you) |
| `useNotifications()` | `{ items, unreadCount, markRead(id), markAllRead() }` - the logged-in user's notifications, newest first |
| `useListingFilters(defaultSort)` | `{ filters, setFilters, sort, setSort, clearAll }` - filters kept in the URL |
| `useDocumentTitle('Saved listings')` | Sets the browser tab title. Call it at the top of every page. |
| `useAiStatus()` | `{ aiAvailable }` - false when "Simulate AI outage" in the footer is on (FR-AI5) |

```jsx
import { useSavedListings } from '../../../hooks/useSavedListings'
```

## 6. Constants and helpers - `src/lib`

```jsx
import { APP_STATUS, APP_STATUS_LIST, ACCOUNT_STATUS, POSTING_STATUS, LISTING_SOURCE, ROLES, TRAINING_TYPES, WORK_MODES,
  COMPENSATION, ACADEMIC_LEVELS, DURATIONS, START_WINDOWS, SORT_OPTIONS, CITIES, MAJORS, UNIVERSITIES, INDUSTRIES, RULES } from '../../../lib/constants'
import { formatDate, formatLongDate, formatDateTime, daysUntil, timeAgo, deadlineLabel, durationLabel, greeting, initials } from '../../../lib/format'
import { required, validateEmail, validatePassword, validateConfirm, validateCR, validateUrl, validatePhone, validateGpa, validatePastDate, isValid } from '../../../lib/validation'
import { searchListings, EMPTY_FILTERS, hasActiveFilters, keywordMatch } from '../../../lib/search'
import { recommendListings, scoreListing, isEligible, MATCH_LABEL } from '../../../lib/match'
import { downloadTable } from '../../../lib/exportFile'
import { makeId } from '../../../lib/ids'
import { cn } from '../../../lib/cn'
```

- Never type a status as a string: use `APP_STATUS.SHORT_LISTED`, `POSTING_STATUS.CLOSED` ...
- `RULES` holds the Phase 3 numbers (`RESUME_MAX_MB`, `LOGO_MAX_MB`, `REMINDER_DAYS_BEFORE`, `MAX_RECOMMENDATIONS`, `TABLE_NAME_MAX`, `MAX_TABLES_PER_POSTING`, `CHAT_MIN`, `CHAT_MAX`, `CHAT_PER_HOUR`).
- Validation functions return an error message or `''`. Pattern:

```jsx
const found = { title: required(form.title, 'Title is required.'), link: validateUrl(form.link) }
if (!isValid(found)) { setErrors(found); toast.error('Please fix the highlighted fields.'); return }
```

## 7. URLs - `PATHS`

```jsx
import { PATHS } from '../../../routes/paths'
<Link to={PATHS.listing(l.id)}>  navigate(PATHS.student.applications)  PATHS.company.applicants(listingId)  PATHS.admin.users
```

Never hard-code a URL string. All available paths are in `src/routes/paths.js`.

## 8. Demo accounts and resetting

Demo logins are on the login page and in the README. Use **Reset demo data** in the footer whenever you want the original data back (for example after testing an action that can't be undone).
