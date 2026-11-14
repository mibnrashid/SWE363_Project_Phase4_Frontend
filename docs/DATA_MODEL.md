# Data model (demo data in the browser)

All data lives in one object (`db` from `useStore()`), one array per collection. The starting data is created by `src/data/seed.js`. Dates are ISO strings (`new Date().toISOString()`).

If you need a new collection (for example `assistantChats`), just `insert('assistantChats', row)`: it is created automatically.

## accounts
Login records for every role.
```js
{ id, role: 'student'|'company'|'admin', email, password, name,
  status: 'active'|'unverified'|'pending'|'rejected'|'suspended',
  rejectReason, suspendReason, failedAttempts, lockedUntil, createdAt, lastLoginAt }
```
`id` is the same as the student / company record id.

## students
```js
{ id, name, email, phone, university, major, academicLevel, graduationDate, gpa, gpaScale: 4|5,
  skills: [], preferredCities: [], preferredTypes: [], bio,
  resume: null | { fileName, dataUrl /* null = use /sample-resume.pdf */, uploadedAt, status: 'analysed'|'pending'|'unreadable' },
  notifyStatusUpdates: true, createdAt }
```

## companies
```js
{ id, name, crNumber, industry, city, email, contactPerson, phone, website, description, size,
  logo /* data URL or null */, submittedAt }
```
Approval status is on the matching **account** (`status: 'pending' | 'active' | 'rejected' | 'suspended'`).

## listings
Postings by companies (`source: 'internal'`) and imported ones (`source: 'external'`).
```js
{ id, source: 'internal'|'external', companyId /* internal */, companyName /* external */, externalUrl /* external */,
  title, summary, description, responsibilities: [], requirements: [], skills: [],
  trainingType, majors: [], academicLevels: [], city, workMode, durationWeeks,
  startDate, deadline, openings, paid: true|false, stipend: null|number,
  screeningQuestions: [{ id, text, type: 'text'|'yesno', required }],
  status: 'open'|'closed'|'removed', removedReason,
  postedAt, shortlistApprovedAt, finalizedAt }
```

## applications
Applications made through InternConnect.
```js
{ id, listingId, studentId, status /* APP_STATUS */, appliedAt,
  answers: { [questionId]: 'Yes' | 'No' | 'text' },
  history: [{ status, at, note }], external: false, archived /* optional, set when the student is suspended */ }
```
A student can apply only once per posting (even after withdrawing).

## externalApplications
Applications the student made on other websites and records by hand (FR-S9). Never updated automatically.
```js
{ id, studentId, company, title, link, appliedAt, status /* APP_STATUS */, notes, fromListingId /* or null */, history: [] }
```

## saved
```js
{ id, studentId, listingId, savedAt, reminder: true|false, reminderSentFor /* set by the reminder job */ }
```

## notifications
```js
{ id, userId, type: 'status'|'reminder'|'system', title, message, link /* a PATHS url or null */, read, createdAt }
```

## shortlistTables
Company shortlist tables (FR-C7). `applicationIds` hold application ids (not student ids).
```js
{ id, listingId, name, applicationIds: [], isShortlist: true|false, createdBy: 'company'|'assistant', createdAt,
  columns /* optional: which columns to show */, sortBy /* optional */ }
```

## assistantChats
Created by the shortlist assistant. Starts empty.
```js
{ id /* = listingId */, listingId, messages: [{ id, from: 'company'|'assistant', text, at, changes: [{ id, label, undo }] }] }
```
(`undo` should be data you can use to reverse the change, not a function, because the store is saved as JSON.)

## importedListings
Listings fetched from the external job API, waiting for admin review (FR-AD4).
```js
{ id, title, companyName, city, trainingType, majors: [], startDate, deadline, externalUrl, importedAt,
  status: 'new'|'published'|'rejected', duplicateOf /* listing id or null */ }
```

## externalSources
```js
{ id, name, url, schedule, status: 'enabled'|'disabled'|'error', lastSyncAt, imported, lastError, lastErrorAt }
```

## auditLog
```js
{ id, action, by, details, at }
```

## passwordResets
Used by the forgot-password flow only.
```js
{ id /* token */, accountId, expiresAt, used }
```
