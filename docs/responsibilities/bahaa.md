# RESPONSIBILITIES - Bahaa Najjar (`bahaa` branch)

**Your part:** the **company** screens (Phase 3 screens 13, 14, 15, 18 and the applicants list part of screen 16).
**Requirements you cover:** FR-C1, FR-C2, FR-C3, FR-C4, FR-C5, FR-C6 (+ FR-SYS3 through the shared `closePosting` action).
The shortlist tables, assistant chat, export and finalize (FR-C7 to FR-C10) are **Raed's**, not yours.

Read this whole file once before you start. If anything here is unclear, ask Musa **before** guessing.

---

## 0. Setup (do this once)

```bash
git clone <repository-url>
cd SWE363_Project_Phase4_Frontend
git checkout bahaa
git config user.name "Bahaa Najjar"         # your GitHub name
git config user.email "<your GitHub email>" # the email on your GitHub account
npm install
npm run dev                                 # open http://localhost:5173
```

Log in with the demo company: **hr@aramcodigital.sa / Company123** (button on the login page). Your pages are already reachable from the navbar (Dashboard, Listings, Applicants, Profile); right now they show "This screen is being built".

Before you start each day: `git pull origin main`.

## 1. Golden rules (these keep us free of merge conflicts)

**You may create and edit ONLY these:**

```
src/features/company/pages/**        (all files in this folder)
src/features/company/components/**   (create it for your own components)
src/features/company/utils/**        (create it for your own helpers)
AI_USAGE.md                          (ONLY the line under "### Bahaa Najjar")
```

**Never edit** `src/features/company/shortlist/**` (that is Raed's folder), and never edit `src/components`, `src/store`, `src/lib`, `src/hooks`, `src/context`, `src/routes`, `src/data`, `src/index.css`, `package.json`, `package-lock.json`, `README.md` or other members' folders. Don't run `npm install <something>`.

- Your pages already exist as placeholder files and are registered in `AppRoutes.jsx`. **Replace the content** of each file, keeping the file name and the `export default function <Name>()` name.
- `PostingFormPage.jsx` is used by **two** routes: `/company/postings/new` (no `listingId` param → create) and `/company/postings/:listingId/edit` (edit).
- If a shared file needs a change, message Musa. He changes it on `main`, you `git pull origin main`.

## 2. Design reference

- **Figma Make prototype:** https://www.figma.com/make/Kq6KXCPbxBB8ZD8cK04Jdz/InternConnect-Desktop-Prototype → **Company flow**. Match it as closely as you can.
- **Annotated wireframes:** https://www.figma.com/design/TTgWHwlEfcfQgtLAXtT716/InternConnect---Phase-3-Annotated-Wireframes?node-id=0-1 → boards 13-16 and 18.
- Ignore the grey "PROTOTYPE STATES" bars in the prototype. In our app states come from real data.
- Copy patterns from Musa's pages (`src/features/guest/pages/*`, `src/features/auth/pages/*`).

## 3. Tools you will use

All documented with examples in **`docs/TOOLBOX.md`** and **`docs/DATA_MODEL.md`**. The main ones:

| Need | Use |
| --- | --- |
| Logged-in company | `const { user, profile } = useAuth()` → `profile` is the company record, `user.id` is the companyId |
| This company's postings | `db.listings.filter((l) => l.companyId === user.id)` |
| Applications for a posting | `getApplicationsForListing(db, listingId)`, student with `getStudent(db, app.studentId)` |
| Close a posting | `transaction((db) => closePosting(db, listing.id, 'Closed by company'))` - moves Applied → Under Review and notifies (FR-C4, FR-SYS3) |
| Change data | `insert`, `update`, `remove`, `transaction` from `useStore()` |
| Messages | `toast.success('Posting published.')` |
| URLs | `PATHS.company.*`, `PATHS.listing(id)` |

Demo data as Aramco Digital: **Software Engineering Co-op** (open, closes in 2 days, 3 applicants, screening questions), **Data Engineering Intern** (open, 3 applicants), **AI Engineer Trainee** (closed, 10 Under Review + 1 Withdrawn → Raed's shortlist workspace), **Cybersecurity Summer Training** (closed, shortlist approved). Other companies own other postings, so check you only show **your** company's data.

---

## 4. Screens

Every page: `useDocumentTitle(...)`, `PageHeader` with eyebrow **"Company workspace"**, a toast for every action.

### 4.1 Dashboard - `src/features/company/pages/CompanyDashboardPage.jsx`
Route `/company` · Prototype: Company flow → Dashboard

1. `PageHeader` title `Welcome back, ${profile.name}`, subtitle "Here's an overview of your recruitment activity.", action **+ New posting** → `PATHS.company.newPosting`.
2. 4 `StatCard`s with icons (lucide `Briefcase`, `User`, `Clock`, `Check`): **Active postings** (status open), **Total applicants** (non-withdrawn applications to your postings), **Awaiting review** (status Under Review), **Short-Listed** (status Short-Listed). Small `note` lines like the prototype ("+1 this month" can be computed from `postedAt` in the last 30 days, or a simple text).
3. Two cards side by side:
   - **Recent applicants** ("New applications across your postings", link "View all applicants" → `PATHS.company.allApplicants`): latest 3-5 applications, row = round avatar with initials, student name, posting title, chevron → `PATHS.company.applicant(app.id)`.
   - **Posting performance** ("Applications received", link "Manage postings" → `PATHS.company.postings`): one horizontal bar per posting (teal bar, width relative to the max, number on the right). Simple `div`s are enough.
4. **Active postings** card ("Your currently published opportunities", link "View all postings"): the same table as the postings page (reuse your component, see 4.2) limited to your latest postings.

Empty company (no postings yet): `EmptyState` "You haven't posted any opportunities yet" + **+ New posting**.

### 4.2 My postings - `src/features/company/pages/PostingsPage.jsx`
Route `/company/postings` · FR-C3, FR-C4 · Prototype: Company flow → Listings

Layout (prototype "My postings"):
- `PageHeader` title "My postings", subtitle "Create and manage your training opportunities.", action **+ New posting**.
- `Tabs` with counts: **All**, **Open**, **Closed**, **Removed**.
- White card: search ("Search postings") + sort `Select` (Newest first, Deadline, Most applicants).
- `Table` columns: Posting (title, badges under it, "Type · City"), Status (`Badge`: Open = teal, Closed = neutral, Removed by admin = danger), Deadline, Applicants (`countActiveApplicants`), Short-listed (count or "—"), Actions.
- Put the table in `src/features/company/components/PostingsTable.jsx` so the dashboard can reuse it.

Badges under the title: **Shortlist approved** (teal, when `shortlistApprovedAt`), **Finalized** (`tone="dark"`, when `finalizedAt`).

Actions per row:
| Posting state | Buttons |
| --- | --- |
| Open | **Edit** → edit route · **Close** · **Applicants** → `PATHS.company.applicants(id)` |
| Closed | **Reopen** · **Applicants** (or **View shortlist** → `PATHS.company.shortlist(id)` when `shortlistApprovedAt` is set) |
| Removed by admin | **Edit** only, plus a red line under the title: "Removed by admin: <removedReason>" |

Close (FR-C4): `ConfirmDialog` "Close this posting?" message "It will stop accepting applications and leave search. Current applicants move to Under Review." → `transaction((db) => closePosting(db, listing.id, 'Closed by company'))`, toast "Posting closed."

Reopen (FR-C4): `Modal` "Reopen posting" with a **new deadline** date input (required, must be in the future, and before the start date - same rule as the form) → `update('listings', id, { status: POSTING_STATUS.OPEN, deadline })`, toast "Posting reopened." Note: applications stay in their current statuses.

Empty tab → short `EmptyState` (e.g. "No closed postings").

### 4.3 Posting form - `src/features/company/pages/PostingFormPage.jsx`
Routes `/company/postings/new` and `/company/postings/:listingId/edit` · FR-C2, FR-C3 · Prototype: Listings → + New posting ("Create a new posting")

Layout (prototype):
- `PageHeader` title "Create a new posting" (or "Edit posting"), subtitle "Provide clear details to attract the right students.", actions **Save draft** (secondary) and **Preview posting** (primary).
- Left: numbered steps list (1 Basic information, 2 Eligibility, 3 Opportunity details, 4 Screening questions) - clicking scrolls to the card.
- Right: one `Card` per section:
  1. **Basic information:** Posting title*, Training type* (`TRAINING_TYPES`), City* (`CITIES`), Work mode* (`WORK_MODES`), Duration* (select of weeks: 4, 6, 8, 10, 12, 16, 20, 24, 28 - show with `durationLabel`), Start date*, Application deadline*, Number of openings*.
  2. **Eligibility:** Eligible majors* (chips picker from `MAJORS`), Academic levels* (checkboxes from `ACADEMIC_LEVELS`).
  3. **Compensation & skills:** Paid / Unpaid radio, Monthly stipend (SAR, optional, only when Paid), Required skills (chips + "Add a skill").
  4. **Opportunity details:** Short summary (one line shown on cards), Description*, Responsibilities* (`Textarea`, "one per line" → save as array split by new lines), Requirements (same).
  5. **Screening questions** (optional): list of questions, each with text, type (`Short text` / `Yes / No`), Required checkbox, delete button; **+ Add question** (`id: makeId('q')`).

Validation (FR-C2, errors next to each field + toast "Please fix the highlighted fields."):
- all fields required except stipend, summary, requirements and screening questions
- deadline must be in the future **and before** the start date
- openings ≥ 1
- at least one major and one academic level
- each screening question needs text

Flow:
- **Preview posting** → validate → show a preview (a `Modal` size `lg`, or a preview mode on the page) that looks like the public listing page: title, company, meta, about, what you'll do, requirements, overview. Buttons **Back to edit** and **Publish** (or **Save changes** when editing).
- **Publish (new):** `insert('listings', { ...form, id: makeId('l'), source: LISTING_SOURCE.INTERNAL, companyId: user.id, status: POSTING_STATUS.OPEN, postedAt: now, removedReason: '', shortlistApprovedAt: null, finalizedAt: null, companyName: null, externalUrl: null })` → toast "Posting published." → navigate to `PATHS.company.postings`. It appears in search immediately.
- **Save changes (edit):** `update('listings', id, form)` → toast "Posting updated." If the posting was **removed by admin**, saving does not reopen it (only admin can).
- **Save draft:** keep it simple: save the form to `localStorage` under `internconnect-posting-draft-<companyId>` and load it back when opening the new posting form (offer "Continue your draft?"). Toast "Draft saved."
- **Edit rules (FR-C3):** load the existing values; if the posting already has at least one application, the screening questions section is **locked** (read-only, with the note "Screening questions can't be changed after the first application."). A new deadline must be in the future.
- Editing someone else's posting or an unknown id → `EmptyState` "Posting not found".

### 4.4 Company profile - `src/features/company/pages/CompanyProfilePage.jsx`
Route `/company/profile` · FR-C1 · Prototype: Company flow → Profile

- `PageHeader` title "Company profile", subtitle "This is what students see on your listings.", action **Save changes**.
- **Logo:** current logo (`Avatar src={logo} name={name} size="lg"`) + `FileUpload accept={['image/png','image/jpeg']} maxSizeMB={RULES.LOGO_MAX_MB} typeError="Logo must be a PNG or JPG under 2 MB."` + **Remove logo**.
- **Company details:** Company name and CR number shown **read-only** with the note "Only an admin can change these." Industry (`INDUSTRIES`), City (`CITIES`), Company size (text), Website (`validateUrl`), Description (`Textarea maxLength={600}`).
- **Contact details:** contact person*, official email (read-only), phone* (`validatePhone`).
- Save → `update('companies', profile.id, form)`, toast "Profile saved."
- A small preview card on the right: "How students see you" (logo, name, industry · size, description) - optional but nice.

### 4.5 Applicants (all postings) - `src/features/company/pages/AllApplicantsPage.jsx`
Route `/company/applicants` (navbar "Applicants")

- `PageHeader` title "Applicants", subtitle "Applications across all your postings."
- One card per posting of yours (open first, then closed): title, status badge, deadline, counts per status (Applied / Under Review / Short-Listed / Accepted / Rejected / Withdrawn as small badges), button **View applicants** → `PATHS.company.applicants(listing.id)`.
- Optional: a search box over student names that lists matching applications with links to their detail page.
- No postings → `EmptyState` + **+ New posting**.

### 4.6 Applicants of one posting - `src/features/company/pages/ApplicantsPage.jsx`
Route `/company/postings/:listingId/applicants` · FR-C5 · Prototype: postings → Applicants (screen 16)

**This screen is shared with Raed. Read carefully.** The placeholder file already contains the split logic - keep it:

```jsx
const workspaceMode = listing?.status === POSTING_STATUS.CLOSED && !listing?.shortlistApprovedAt
...
{/* your header always */}
{!workspaceMode && <YourApplicantsList ... />}
{listing && <ShortlistWorkspace listing={listing} applications={applications} />}
```

- `applications` must be **all** applications of this posting, each joined with its student: `getApplicationsForListing(db, listingId).map((app) => ({ ...app, student: getStudent(db, app.studentId) }))`.
- `ShortlistWorkspace` is imported from `'../shortlist/ShortlistWorkspace'` - **don't edit that file**, it is Raed's. When the posting is closed and not shortlisted yet, Raed's component shows the whole workspace (its own applicants table with checkboxes, the tables and the chat), so your list is hidden in that case.

What you build:
- Header (always): eyebrow "Company workspace", serif title = posting title, line "N applicants · M openings", link "← Back to My postings" → `PATHS.company.postings`, posting status badge.
- **Applicants list** (when not in workspace mode): `Card` titled "Applicants" with
  - status `Tabs` (All + each status that exists, with counts) or a status `Select`,
  - sort `Select`: Date applied (newest first, default) / Name (A-Z),
  - `Table` columns: Name (round `Avatar` + name), University, Major, Date applied, Status (`StatusBadge`), chevron. Clicking a row → `PATHS.company.applicant(app.id)`.
  - **Withdrawn** rows are greyed out (`opacity-50`) and not clickable (FR-C5).
  - Hide applications with `archived: true` (suspended students).
- No applications → `EmptyState` "No applicants yet."
- Wrong id / another company's posting → `EmptyState` "Posting not found" (NFR-6: a company sees only its own applicants).
- **Never show match labels or scores to companies** (Phase 3 rule).

### 4.7 Applicant detail - `src/features/company/pages/ApplicantDetailPage.jsx`
Route `/company/applicants/:applicationId` · FR-C6 · Prototype: click an applicant (screen 18)

Layout (prototype):
- `PageHeader` title = student name, subtitle "Applicant for <posting title>", action **Back to applicants** → `PATHS.company.applicants(listing.id)`.
- Left card: round avatar, name, university, major, academic level, expected graduation, GPA ("3.8 / 4.0"), preferred cities, skills as teal chips, and email / phone.
- Right column:
  - **Screening answers** card: "Submitted <date>", each question text (bold) + the answer. If the posting has no questions: "This posting had no screening questions."
  - **Resume** card: file name + **Download PDF** button (`<a href={src} download={fileName}>`), and a viewer: `<iframe src={src} title="Resume" className="h-[640px] w-full rounded-lg border border-line" />` where `src = student.resume?.dataUrl ?? '/sample-resume.pdf'`. No resume → "No resume uploaded."
  - **Status history** (small timeline from `application.history`) - optional.
- Current status shown as a `StatusBadge` near the title. **Opening this page never changes the status** (FR-C6). There are no status buttons here (statuses change only through Raed's shortlist steps).
- Withdrawn application → `Alert tone="warning"` "This applicant withdrew their application." at the top (still viewable, read-only).
- Access check: if the application's posting isn't this company's → `EmptyState` "Applicant not found".

---

## 5. Responsive checklist

Check every page at **390px** (Chrome DevTools device toolbar) and **1440px**:
- [ ] no sideways scrolling of the page (tables scroll inside their card - the `Table` component does it)
- [ ] the form's step list is hidden or moves above the form on mobile; form grids become one column
- [ ] dashboard cards stack on mobile
- [ ] action buttons in tables wrap or shrink nicely

## 6. Suggested commits (small, in your own words)

1. `postings table component`
2. `company dashboard`
3. `my postings page with tabs, close and reopen`
4. `posting form basic info and eligibility`
5. `posting form details, skills and screening questions`
6. `posting preview, publish and edit`
7. `company profile page`
8. `all applicants overview`
9. `applicants list for a posting`
10. `applicant detail with resume viewer`
11. `mobile fixes for company pages`
12. `ai usage note for company pages`

Commit only your files: `git add src/features/company/pages src/features/company/components src/features/company/utils AI_USAGE.md`. Never `git add .`.

## 7. Pull request checklist

Push: `git push origin bahaa`. GitHub → **Pull requests → New → base: main, compare: bahaa**. Title "Company screens". Paste and tick:

- [ ] I only changed `src/features/company/pages|components|utils` and my line in `AI_USAGE.md` (nothing in `shortlist/`)
- [ ] `npm run lint` shows no errors and `npm run build` works
- [ ] Dashboard: stats, recent applicants, posting performance, active postings
- [ ] Postings: tabs with counts, search, sort, close (applicants move to Under Review), reopen with new deadline, removed-by-admin reason
- [ ] Posting form: all fields + validation, screening questions, preview, publish (appears in search), edit, locked questions after first application, draft
- [ ] Company profile: logo upload (wrong file error), read-only name/CR, website validation, save
- [ ] All applicants overview
- [ ] Applicants list: status filter, sort, withdrawn greyed, row → detail, `ShortlistWorkspace` kept with the split logic
- [ ] Applicant detail: profile, answers, resume viewer + download, withdrawn alert, status never changes
- [ ] Only my company's data is shown anywhere
- [ ] Every page checked at 390px and 1440px

## 8. AI usage

If you use any AI tool (ChatGPT, Copilot, Claude, Cursor, even autocomplete), replace **only** the line `_To be completed by Bahaa ..._` in `AI_USAGE.md` with the tools, what you used them for, and the files affected. If you didn't use any, write "I did not use any AI tools." Keep copies of your AI conversations for the AI Evidence zip. You must be able to explain every line you commit.
