# RESPONSIBILITIES - Raed Abumostafa (`raed` branch)

**Your part:**
1. The company **shortlist workspace**: shortlist tables, drag and drop, the **Table assistant** chat, reasons, "Use as shortlist" (screen 16, the closed-posting part).
2. The **Short-Listed page**: export and finalize (screen 17).
3. All **admin** screens (screens 19-24).

**Requirements you cover:** FR-C7, FR-C8, FR-C9, FR-C10, FR-AI3, FR-AI4, FR-AI5 (company side), FR-AD1 to FR-AD6, NFR-13.

Read this whole file once before you start. If anything here is unclear, ask Musa **before** guessing.

---

## 0. Setup (do this once)

```bash
git clone <repository-url>
cd SWE363_Project_Phase4_Frontend
git checkout raed
git config user.name "Raed Abumostafa"      # your GitHub name
git config user.email "<your GitHub email>" # the email on your GitHub account
npm install
npm run dev                                 # open http://localhost:5173
```

Demo logins (buttons on the login page):
- Company **hr@aramcodigital.sa / Company123** → Listings → *AI Engineer Trainee* (closed, 10 applicants Under Review, 1 Withdrawn, one draft table "Strong ML background") → **Applicants**. This is where your workspace appears. *Cybersecurity Summer Training* has an approved shortlist → your Short-Listed page.
- Admin **admin@internconnect.sa / Admin1234** → all admin pages.

Before you start each day: `git pull origin main`.

## 1. Golden rules (these keep us free of merge conflicts)

**You may create and edit ONLY these:**

```
src/features/company/shortlist/**   (everything inside: ShortlistWorkspace.jsx, ShortlistPage.jsx + your new files)
src/features/admin/**               (everything inside)
AI_USAGE.md                         (ONLY the line under "### Raed Abumostafa")
```

**Never edit** `src/features/company/pages/**` (Bahaa's), and never edit `src/components`, `src/store`, `src/lib`, `src/hooks`, `src/context`, `src/routes`, `src/data`, `src/index.css`, `package.json`, `package-lock.json`, `README.md` or other members' folders. Don't run `npm install <something>` - **`recharts` (charts) and `@dnd-kit/core` (drag and drop) are already installed** for you.

- Your page files already exist as placeholders and are registered in `AppRoutes.jsx`. Replace their content, keep the file names and the `export default function <Name>()` names.
- `ShortlistWorkspace.jsx` is a **component** that Bahaa's `ApplicantsPage` renders. Keep its name, its default export and its two props: `listing` and `applications` (all applications of the posting, each `{ ...application, student }`).
- If a shared file needs a change, message Musa. He changes it on `main`, you `git pull origin main`.

## 2. Design reference

- **Screenshots of every screen are in this repo: [`docs/prototype/`](../prototype/README.md)** (start here - no Figma login needed). Each screen below lists its screenshot. If you use an AI assistant (e.g. Claude Code), point it at the image, for example: *"Build `src/features/...` to match `docs/prototype/...jpg`, following docs/responsibilities/raed.md section 4.x"*. Read `docs/prototype/README.md` first: it lists what to ignore in the images (the Figma top bar and the grey PROTOTYPE STATES bars).
- **Figma Make prototype:** https://www.figma.com/make/Kq6KXCPbxBB8ZD8cK04Jdz/InternConnect-Desktop-Prototype
  - **Company flow** → Applicants → "Preview closed state" (the workspace) and the Short-Listed table / finalize screens.
  - **Admin flow** → Requests, Users, Postings, Imports, Sources, Statistics.
- **Annotated wireframes:** https://www.figma.com/design/TTgWHwlEfcfQgtLAXtT716/InternConnect---Phase-3-Annotated-Wireframes?node-id=0-1 → boards 16, 17, 19-24.
- Ignore the grey "PROTOTYPE STATES" / "ASSISTANT STATE" bars. States must come from real data and from the footer switch **Simulate AI outage** (`useAiStatus()`).
- Copy patterns from Musa's pages (`src/features/guest`, `src/features/auth`).

## 3. Tools you will use

All documented with examples in **`docs/TOOLBOX.md`** and **`docs/DATA_MODEL.md`**. The most important for you:

| Need | Use |
| --- | --- |
| Change statuses (adds history + notifies students) | `transaction((db) => setApplicationStatus(db, ids, APP_STATUS.SHORT_LISTED))` |
| Log who did what | `addAuditLog(db, { action: 'Shortlist approved', by: user.name, details: listing.title })` |
| Notify someone | `addNotification(db, { userId, type: 'system', title, message, link })` |
| Tables data | collection `shortlistTables` (exists, 2 demo tables) |
| Chat data | collection `assistantChats` (exists, empty) |
| Admin data | `accounts`, `companies`, `students`, `listings`, `importedListings`, `externalSources`, `auditLog` |
| AI down? | `const { aiAvailable } = useAiStatus()` |
| Confirm + reason | `<ConfirmDialog requireReason ... onConfirm={(reason) => ...} />` |
| Side panel | `<Drawer>` |
| Export | `downloadTable({ fileName, format: 'csv' | 'excel', columns, rows })` from `lib/exportFile` |
| Charts | `import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'` |
| Drag and drop | `import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'` |

Phase 3 rules that apply to everything you build:
- **The assistant can never change an application status.** Only the company's buttons ("Use as shortlist", "Confirm accepted") do (NFR-13).
- **Companies never see match scores or percentages.** Ordering is fine, numbers are not.
- AI-written text (reasons) is always labelled **"AI-generated, may be inaccurate"**.

---

## 4. Shortlist workspace - `src/features/company/shortlist/ShortlistWorkspace.jsx`

Shown inside Bahaa's applicants page (route `/company/postings/:listingId/applicants`). It has **three modes**:

| Mode | When | What you show |
| --- | --- | --- |
| Locked | `listing.status === 'open'` | Card with lock icon: "Applicants can be shortlisted after the posting closes" + "Applications are still arriving. Tables and assistant chat will unlock when you close the posting." + faded skeleton rows (like the prototype). Bahaa's list is shown above it. |
| Workspace | closed and `!listing.shortlistApprovedAt` | The full workspace below. Bahaa hides his list in this mode, so **your table is the applicants list**. |
| Approved | `listing.shortlistApprovedAt` is set | Small card: "Shortlist approved on <date>", number short-listed, button **Open Short-Listed table** → `PATHS.company.shortlist(listing.id)`. Tables are locked (read-only, no chat). |

Split your code into files inside `shortlist/`, for example: `ApplicantPool.jsx`, `TablesPanel.jsx`, `ShortlistTable.jsx`, `AssistantChat.jsx`, `assistant.js` (the command logic), `reasons.js`, `tableActions.js`.

### 4.1 Workspace layout (prototype "Posting closed")
**Screenshot:** `docs/prototype/company/10-applicants-posting-open-locked.jpg` (locked mode), `docs/prototype/company/11-applicants-closed-workspace.jpg` (workspace mode)
Two columns on desktop (`lg:grid-cols-[1fr_360px]`), one column on mobile, chat full width below:

**Left - Applicants pool** (white card, title "Applicants", subtitle "Select applicants to add to a table.", **Sort** select: Date applied / Name / GPA):
- Table: checkbox, Name (round avatar + name), University, Major, Date applied, Status.
- Only the posting's applications. **Withdrawn** rows greyed, checkbox disabled, not draggable.
- Clicking the name → `PATHS.company.applicant(app.id)` (Bahaa's detail page).
- Each row is **draggable** onto a table. If several rows are ticked, dragging one of them drags all ticked rows (multi-select drag).
- Footer: "N selected" + **Add to table** button (disabled when nothing is ticked) → small menu / `Modal` to pick the table (or create a new one).

**Right - Tables panel** (title "Tables", subtitle "Organize applicants before finalizing.", button **+ New table**):
- Checkbox **Show optional Reason column** (turns on AI reasons, see 4.4).
- One card per table of this posting (`shortlistTables` where `listingId === listing.id`): name (serif), "N applicants", a ≡ menu with **Rename**, **Sort by** (name / GPA / graduation date / date applied), **Columns** (choose which to show: major, GPA, graduation, skills), **Delete table**.
- Rows: drag handle, number, name, major (+ the selected columns), and when reasons are on: the reason line in small olive text prefixed with "AI-generated, may be inaccurate · ".
- Each table is a **drop zone**. Rows can be dragged between tables. Each row has a remove (×) button.
- Each table has a **Use as shortlist** button at the bottom (see 4.5).
- An applicant can be in more than one table.

Rules (FR-C7):
- table name required, max `RULES.TABLE_NAME_MAX` (40) characters, unique within the posting (case-insensitive); max `RULES.MAX_TABLES_PER_POSTING` (10) tables per posting - show the error in the modal.
- New table row: `insert('shortlistTables', { id: makeId('tbl'), listingId, name, applicationIds: [], isShortlist: false, createdBy: 'company', createdAt: now })`.
- Everything saves automatically (it is in the store), so a refresh keeps the tables (FR-C7 "save automatically as drafts").

### 4.2 Drag and drop with dnd-kit
- Wrap the workspace in one `<DndContext sensors={sensors} onDragEnd={handleDragEnd}>` so pool rows and table rows share it.
- `useDraggable({ id: \`pool:${appId}\` })` for pool rows, `useDraggable({ id: \`table:${tableId}:${appId}\` })` for table rows, `useDroppable({ id: \`drop:${tableId}\` })` for tables.
- In `handleDragEnd({ active, over })`: work out the application id(s) and the target table, then `update('shortlistTables', targetId, (t) => ({ applicationIds: [...new Set([...t.applicationIds, ...ids])] }))`. Moving from one table to another also removes it from the source table.
- Use both `PointerSensor` (with `activationConstraint: { distance: 6 }` so clicks still work) and `TouchSensor` (phones).
- Keep **Add to table** as the keyboard / mobile-friendly alternative to dragging.

### 4.3 Table assistant chat (FR-C7 steps 3-5, FR-AI3)
**Screenshot:** `docs/prototype/company/12-workspace-assistant-chat.jpg`, `docs/prototype/company/13-workspace-assistant-unavailable.jpg`
Layout (prototype "Table assistant"): header with shield icon, "Table assistant", "Ask for help organizing applicants. You stay in control." Message list (company messages right in a dark bubble, assistant answers left in a white card), input + **Send**.

There is no real Gemini in Phase 4. Write a small **rule-based** interpreter in `shortlist/assistant.js`: `runAssistant(message, { listing, applications, tables }) → { reply, changes }`. It must understand at least these requests (case-insensitive, flexible wording):

| Request example | What it does |
| --- | --- |
| "Make a table of the 5 strongest for an AI engineer role" | create table (name e.g. "AI engineer picks"), fill with the top N Under Review applicants ranked by fit (see below) |
| "Create a table called Backup picks" | create an empty table |
| "Add Sara Alanazi to Backup picks" | add that applicant |
| "Remove Omar from Strong ML background" | remove that applicant |
| "Move everyone from Strong ML background who graduates after July to Backup picks" | filter by profile field, move |
| "Add everyone with GPA above 3.5 to Backup picks" / "with Python" / "majoring in Data Science" | filter by GPA, skill, major, academic level, graduation date |
| "Sort Backup picks by GPA" (or name, graduation date, date applied) | reorder the table |
| "Why is Reem in Strong ML background?" | answer with the reason sentence (4.4) |

Ranking by fit (for "strongest" / skill requests): count overlap between the applicant's skills and the posting's `skills` + words in the message (e.g. "AI" → Python, Machine Learning, TensorFlow; "data" → SQL, pandas, Spark). Ties → earlier application date first (FR-AI3). Never show the score.

Rules:
- message length `RULES.CHAT_MIN`-`RULES.CHAT_MAX` (10-500) characters, otherwise an error under the input.
- only **Under Review** applicants are used. Withdrawn are always excluded.
- not about this posting's applicants (e.g. "what's the weather") → reply "I can only help with this posting's applicants."
- can't understand → reply "Please rephrase your request."
- asked to shortlist/approve/reject/accept → reply that only the company can do that with the buttons (NFR-13) and make no change.
- show a typing indicator (`Spinner`) for ~1 second before the answer (NFR-2: loading indicator).
- rate limit: max `RULES.CHAT_PER_HOUR` (20) company messages per posting per hour → "Please wait a few minutes before sending another message." (count from the stored messages' timestamps).
- AI down (`!aiAvailable`) → disable the input and show `Alert` "The assistant is unavailable right now. You can still create tables and drag applicants by hand."
- Each assistant answer lists **what changed** ("Created table AI engineer picks", "Added 5 applicants") with an **Undo** button **per change**. Store changes as plain data so they survive a refresh, e.g. `{ id, type: 'createTable', tableId }`, `{ id, type: 'add', tableId, applicationIds }`, `{ id, type: 'remove', tableId, applicationIds }`, `{ id, type: 'reorder', tableId, previousOrder }`, and write an `undoChange(change)` function. After undo, mark the change `undone: true` and grey it out.
- Save the chat in `assistantChats`: one row per posting `{ id: listing.id, listingId, messages: [...] }` (insert the first time, then `update`).

### 4.4 Reasons (FR-AI4)
`shortlist/reasons.js` → `reasonFor(student, listing)` returns one short sentence (max 40 words) built **only from the student's data**: matching skills + one gap. Example: "Strong Python and Machine Learning from their profile; no TensorFlow mentioned." Shown when **Show optional Reason column** is on or when asked "why is X in this table". Always prefixed with "AI-generated, may be inaccurate". When AI is down: "Reason unavailable".

### 4.5 Use as shortlist (FR-C8)
**Screenshot:** `docs/prototype/company/14-use-as-shortlist-confirm.jpg`
- Button on each table card. Disabled when the table is empty.
- `ConfirmDialog`: title "Use this table as the shortlist?", message `${N} applicants will become Short-Listed. ${M} applicants will be Rejected. This can't be undone.` where N = table members that are Under Review, M = all other Under Review applicants of the posting (Withdrawn skipped).
- Confirm → one `transaction`:
  1. `setApplicationStatus(db, shortlistedIds, APP_STATUS.SHORT_LISTED, 'Added to the shortlist')`
  2. `setApplicationStatus(next, otherIds, APP_STATUS.REJECTED, 'Not short-listed')`
  3. set `listing.shortlistApprovedAt = now`, set the table's `isShortlist: true`
  4. `addAuditLog(next, { action: 'Shortlist approved', by: user.name, details: \`${listing.title} - ${N} short-listed\` })`
- toast "Shortlist approved." → the workspace switches to "Approved" mode, and the posting shows the "Shortlist approved" badge on Bahaa's postings page (he reads `shortlistApprovedAt`).
- Allowed once per posting; afterwards tables are read-only.

## 5. Short-Listed page - `src/features/company/shortlist/ShortlistPage.jsx`
**Screenshot:** `docs/prototype/company/20-shortlisted-page.jpg`, `docs/prototype/company/21-shortlist-export-modal.jpg`, `docs/prototype/company/22-shortlist-finalize.jpg`, `docs/prototype/company/23-finalize-confirm.jpg`
Route `/company/postings/:listingId/shortlist` · FR-C9, FR-C10 · Prototype: Company flow → View shortlist

- Access: only the posting's company (`listing.companyId === user.id`), otherwise `EmptyState` "Posting not found". If `!listing.shortlistApprovedAt` → `EmptyState` "Export and finalize are available after you approve a shortlist." + link to applicants.
- Header: eyebrow "Company workspace", title "Short-Listed applicants", subtitle = posting title, "← Back to applicants", badges "Shortlist approved" / "Finalized".
- Table of the posting's Short-Listed (and after finalize: Accepted / Rejected-from-shortlist) applicants: name, university, major, GPA, graduation, skills, status.
- **Export** (FR-C9): `Modal` with format radio (CSV / Excel) and column checkboxes (Name, University, Major, GPA, Graduation date, Skills, Email, Resume link - all ticked by default). At least one column ("Select at least one column."). Download with `downloadTable({ fileName: \`${listing.title} shortlist ${YYYY-MM-DD}\`, format, columns, rows })`. Resume link = `student.resume?.dataUrl ? 'Uploaded on InternConnect' : window.location.origin + '/sample-resume.pdf'`. `addAuditLog(... 'Shortlist exported' ...)`. Students are **not** notified.
- **Finalize** (FR-C10): button **Finalize** → the table shows a checkbox per Short-Listed applicant (Withdrawn skipped) and a **Confirm accepted** button.
  - number ticked > `listing.openings` → error `You have ${openings} openings. Untick some applicants or add openings.`
  - none ticked → "Select at least one applicant."
  - `ConfirmDialog`: `${N} applicants will be Accepted. ${M} applicants will be Rejected.` → `setApplicationStatus` Accepted for ticked, Rejected for the rest of the shortlist, set `listing.finalizedAt = now`, `addAuditLog('Applicants finalized')`, toast "Applicants finalized."
  - allowed once; afterwards the page is read-only and shows the "Finalized" badge.

## 6. Admin screens - `src/features/admin/pages/*`

Every admin page: `useDocumentTitle`, `PageHeader` eyebrow **"Admin console"**, toasts for every action. Put shared admin pieces in `src/features/admin/components/`.

### 6.1 Company requests - `CompanyRequestsPage.jsx` (route `/admin/requests`, FR-AD1)
**Screenshot:** `docs/prototype/admin/01-company-requests.jpg`, `docs/prototype/admin/02-request-drawer.jpg`, `docs/prototype/admin/03-reject-with-reason.jpg`
- Title "Company requests", subtitle "Review and verify company registrations."
- 3 small stat chips: Pending review, Approved this month, Rejected this month (from `accounts` with role company).
- `Table`: Company (square avatar + name), Industry, City, CR number, Submitted, chevron. Only accounts with `status === 'pending'`. Row click → `Drawer`.
- **Drawer** (prototype): avatar, name, "Industry · City", "Pending review" badge; **Registration details** (CR number, submitted, contact person, work email, phone); a "Commercial Registration" file row with **View document** (opens a `Modal` "Document preview is not available in the front-end prototype." showing the CR number); **Verification checklist** (3 checkboxes, visual only); buttons **Approve company** (primary) and **Reject request** (danger).
  - Approve → `update('accounts', id, { status: 'active', rejectReason: '' })` + `addNotification` to the company ("Your company was approved") + audit log, toast "Company approved." The company can now log in to the dashboard.
  - Reject → `ConfirmDialog requireReason` → `status: 'rejected', rejectReason: reason` + notification + audit log. The company sees the reason on its pending page (already built by Musa) and can resubmit.
- Empty → `EmptyState` "No pending requests".

### 6.2 Users - `UsersPage.jsx` (route `/admin/users`, FR-AD2)
**Screenshot:** `docs/prototype/admin/04-users.jpg`
- Title "Users", subtitle "Manage student and company access."
- Search (name or email) + role `Select` (All roles / Student / Company) + status `Select` (All / Active / Suspended / Pending / Rejected / Unverified).
- `Table`: User (avatar + name), Role, Email, Status (badge: Active teal/success, Suspended danger, others neutral), Joined, chevron → `Drawer` with details and activity (students: number of applications; companies: number of postings), and buttons:
  - **Suspend** (`ConfirmDialog requireReason`) → account `status: 'suspended', suspendReason`. Archive their content: company → its open/closed listings get `status: 'removed', removedReason: 'Account suspended', suspendedFrom: <old status>`; student → their applications get `archived: true`. Audit log. A suspended user is logged out and can't log in (already handled by auth).
  - **Reactivate** → `status: 'active'`, restore: listings with `suspendedFrom` go back to that status, applications `archived: false`.
  - The admin can't suspend their own account (hide the button for `user.id`). Don't list admin accounts for suspension.

### 6.3 Postings - `AdminPostingsPage.jsx` (route `/admin/postings`, FR-AD3)
**Screenshot:** `docs/prototype/admin/05-postings.jpg`
- Title "Postings", subtitle "Review and moderate all published opportunities."
- Search (posting or company) + status `Select` + training type `Select`.
- `Table`: Posting, Company, Status, City, Deadline, actions **View** (→ `PATHS.listing(id)`) and **Remove** (danger).
- Remove → `ConfirmDialog requireReason` → `update('listings', id, { status: 'removed', removedReason: reason })` + notify the company ("Removed by admin") + audit log. Removed rows show the reason in red under the title.

### 6.4 Imported listings - `ImportedListingsPage.jsx` (route `/admin/imports`, FR-AD4)
**Screenshot:** `docs/prototype/admin/06-imported-listings.jpg`, `docs/prototype/admin/07-imports-compare-duplicates.jpg`
- Title "Imported listings", subtitle "Review external opportunities before publishing them." Info line: "Listings imported from the external job listing API. Review before publishing."
- "Review queue" with `Tabs` Waiting / Published / Rejected and a sort select (Newest first).
- Each row: briefcase icon, title + outlined "External" badge, "Company · City", "Imported <time>", status badge (**Possible duplicate** when `duplicateOf`, **Missing info** when required fields are empty, otherwise **Ready to review**), buttons **Edit**, **Compare** (only for duplicates), **Publish**, **Reject**.
- **Edit** → `Modal` with title, company, city, training type, majors, start date, deadline, original link → `update('importedListings', ...)`.
- **Publish**: title, company, city, training type and original link are required ("Fill in title, company, city, training type and link before publishing."). Then insert a listing: `{ id: makeId('l'), source: 'external', companyName, externalUrl, title, summary: '', description: 'This listing was imported from an external job board. Apply on the original website.', trainingType, majors, city, workMode: 'On-site', durationWeeks: 12, startDate, deadline, status: 'open', postedAt: now, skills: [], responsibilities: [], requirements: [], academicLevels: [], screeningQuestions: [], openings: 1, paid: true }` and set the import `status: 'published'`. It appears in search with the "External" label (already supported).
- **Compare** → `Modal` with the imported listing and the existing listing (`duplicateOf`) side by side, buttons **Keep existing** (reject the import) and **Keep imported** (publish the import and set the old listing `status: 'removed', removedReason: 'Duplicate listing'`).
- **Reject** → confirm → `status: 'rejected'`.
- Empty tab → `EmptyState`.

### 6.5 External sources - `ExternalSourcesPage.jsx` (route `/admin/sources`, FR-AD5)
**Screenshot:** `docs/prototype/admin/08-external-sources.jpg`
- Title "External sources", subtitle "Manage approved sources used to import training listings.", action **Sync all sources**.
- 3 stat chips: Enabled sources, Imported total, Sync issues.
- One card per `externalSources` row (3 demo rows: Elm enabled, SABIC with an error, Ma'aden disabled): avatar, name, url, enable `Toggle`; rows: Status (green / grey dot + text), Sync schedule, Last sync, Listings found; footer **Sync now** and **Configure**.
  - Toggle → `status: 'enabled' | 'disabled'` (disabled: no new imports, existing listings stay), toast.
  - Error card: light red box "Sync failed · <lastError>" with the time it failed and **Retry** → clears the error, `status: 'enabled'`, `lastSyncAt: now`.
  - **Sync now** (disabled when the source is disabled) → `lastSyncAt: now`, toast "Sync finished. No new listings." (optionally insert 1 new import into `importedListings`).
  - **Configure** → `Modal` with sync schedule select (Every 6 hours / Every 12 hours / Daily).

### 6.6 Statistics - `StatisticsPage.jsx` (route `/admin/statistics`, FR-AD6)
**Screenshot:** `docs/prototype/admin/09-statistics.jpg`
- Title "Platform statistics", subtitle "Monitor activity and growth across InternConnect.", range switch (segmented `Tabs`): **7 days / 30 days / All time**.
- 4 `StatCard`s: Student accounts, Verified companies, Active postings, Applications sent (+ Pending requests somewhere on the page). For the range, count records whose `createdAt` / `appliedAt` / `postedAt` is inside it (accounts and applications), current totals for the rest.
- **Applications by status** card: one horizontal bar per status (same style as the company dashboard bars) with the count and a total.
- **New sign-ups** card: recharts `LineChart` inside `ResponsiveContainer` (height ~260), x = date (group by day for 7/30 days, by week for all time), two lines: Students (teal `#0f766e`) and Companies (grey `#8a918e`), from `accounts.createdAt`.
- Empty range → zeros and a flat chart, never an error.

---

## 7. Responsive checklist

Check every screen at **390px** (Chrome DevTools device toolbar) and **1440px**:
- [ ] workspace: pool, tables and chat stack in one column on mobile; tables are usable with **Add to table** when dragging is hard
- [ ] tables scroll sideways inside their card (the `Table` component does this), not the page
- [ ] drawers and modals fit (shared components already do)
- [ ] source cards and stat chips wrap (`grid sm:grid-cols-2 lg:grid-cols-3`, `flex-wrap`)
- [ ] the line chart resizes (`ResponsiveContainer`)

## 8. Suggested commits (small, in your own words)

1. `shortlist workspace modes and applicant pool`
2. `tables panel with create, rename, delete`
3. `drag and drop between pool and tables`
4. `assistant command parser`
5. `assistant chat with undo and limits`
6. `ai reasons column`
7. `use as shortlist confirm`
8. `shortlist page export`
9. `finalize accepted applicants`
10. `admin company requests`
11. `admin users suspend/reactivate`
12. `admin postings moderation`
13. `admin imported listings and duplicates`
14. `admin external sources`
15. `admin statistics charts`
16. `mobile fixes`
17. `ai usage note`

Commit only your files: `git add src/features/company/shortlist src/features/admin AI_USAGE.md`. Never `git add .`.

## 9. Pull request checklist

Push: `git push origin raed`. GitHub → **Pull requests → New → base: main, compare: raed**. Title "Shortlist workspace and admin screens". Paste and tick:

- [ ] I only changed `src/features/company/shortlist/`, `src/features/admin/` and my line in `AI_USAGE.md`
- [ ] `npm run lint` shows no errors and `npm run build` works
- [ ] Workspace: 3 modes, pool with checkboxes, withdrawn locked, sort, tables create/rename/delete/sort/columns, name rules, drag & drop (also multi-select), Add to table
- [ ] Assistant: all request types, rules (length, scope, rephrase, no status changes), typing indicator, rate limit, unavailable state, per-change Undo, chat saved
- [ ] Reasons column labelled AI-generated, "Reason unavailable" when AI is down
- [ ] Use as shortlist: N / M confirm, statuses + notifications, audit log, once only, tables locked
- [ ] Short-Listed page: export CSV + Excel with column choice, finalize with openings limit, confirm, once only
- [ ] Admin: requests approve/reject, users suspend/reactivate (+ archive), postings remove, imports edit/publish/compare/reject, sources toggle/retry/sync/configure, statistics with range + charts
- [ ] No scores or percentages shown to companies
- [ ] Every screen checked at 390px and 1440px

## 10. AI usage

If you use any AI tool (ChatGPT, Copilot, Claude, Cursor, even autocomplete), replace **only** the line `_To be completed by Raed ..._` in `AI_USAGE.md` with the tools, what you used them for, and the files affected. If you didn't use any, write "I did not use any AI tools." Keep copies of your AI conversations for the AI Evidence zip. You must be able to explain every line you commit.
