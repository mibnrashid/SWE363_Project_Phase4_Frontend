# RESPONSIBILITIES - Asim Asiri (`asim` branch)

**Your part:** all **student** screens (Phase 3 screens 6-12 + the notifications page).
**Requirements you cover:** FR-S1 to FR-S10, FR-AI1 (simulated), FR-AI2, FR-AI5 (student side), FR-AI6 (search page), FR-A5 (log out in settings).

Read this whole file once before you start. If anything here is unclear, ask Musa **before** guessing.

---

## 0. Setup (do this once)

```bash
git clone <repository-url>
cd SWE363_Project_Phase4_Frontend
git checkout asim
git config user.name "Asim Asiri"          # your GitHub name
git config user.email "<your GitHub email>" # the email on your GitHub account
npm install
npm run dev                                 # open http://localhost:5173
```

Log in with the demo student: **nora@iau.edu.sa / Student123** (button on the login page). Every page you build is already reachable from the navbar; right now it shows "This screen is being built".

Before you start each day: `git pull origin main` (gets Musa's latest shared code).

## 1. Golden rules (these keep us free of merge conflicts)

**You may create and edit ONLY these:**

```
src/features/student/**          (everything inside, including new files and folders)
AI_USAGE.md                      (ONLY the line under "### Asim Asiri")
```

**Never edit** anything else - not `src/components`, `src/store`, `src/lib`, `src/hooks`, `src/context`, `src/routes`, `src/data`, `src/index.css`, `package.json`, `package-lock.json`, `README.md`, and not the other members' folders. Don't run `npm install <something>`.

- Your pages already exist as placeholder files and are already registered in `AppRoutes.jsx`. You **replace the content** of each placeholder file. Keep the file name and the `export default function <Name>()` name exactly as they are.
- New helpers / components you need go in `src/features/student/components/` or `src/features/student/utils/`.
- If you think a shared file needs a change, message Musa with what and why. He changes it on `main`, you `git pull origin main`.

## 2. Design reference

- **Screenshots of every screen are in this repo: [`docs/prototype/`](../prototype/README.md)** (start here - no Figma login needed). Each screen below lists its screenshot. If you use an AI assistant (e.g. Claude Code), point it at the image, for example: *"Build `src/features/...` to match `docs/prototype/...jpg`, following docs/responsibilities/asim.md section 4.x"*. Read `docs/prototype/README.md` first: it lists what to ignore in the images (the Figma top bar and the grey PROTOTYPE STATES bars).
- **Figma Make prototype:** https://www.figma.com/make/Kq6KXCPbxBB8ZD8cK04Jdz/InternConnect-Desktop-Prototype → click **Student flow**. Match these screens as closely as you can (spacing, sizes, texts, order of sections).
- **Annotated wireframes:** https://www.figma.com/design/TTgWHwlEfcfQgtLAXtT716/InternConnect---Phase-3-Annotated-Wireframes?node-id=0-1 → boards 6-12 have the notes for each state.
- The prototype has grey "PROTOTYPE STATES" / "RESULTS STATES" bars with buttons to switch states. **Do not copy those bars.** In our app the states must come from the real data (e.g. "no results" appears when the filters really return nothing).
- Look at the pages Musa already built (`src/features/guest/pages/LandingPage.jsx`, `ListingDetailPage.jsx`) - copy their patterns.

## 3. Tools you will use

Everything is documented with examples in **`docs/TOOLBOX.md`** (components, hooks, store, helpers) and **`docs/DATA_MODEL.md`** (fields of every collection). The most important for you:

| Need | Use |
| --- | --- |
| Logged-in student | `const { user, profile } = useAuth()` → `profile` is the student record, `user.id` is the studentId |
| Read data | `const { db } = useStore()` → `db.listings`, `db.applications`, `db.saved`, `db.externalApplications`, `db.notifications` |
| Change data | `insert`, `update`, `remove`, `transaction` from `useStore()` |
| Change an application's status | `transaction((db) => setApplicationStatus(db, [id], APP_STATUS.WITHDRAWN, 'Withdrawn by student'))` (from `store/actions`) |
| Notify a company | `addNotification(db, { userId: listing.companyId, ... })` inside `transaction` |
| Save / unsave + reminder switch | `useSavedListings()` |
| Notifications | `useNotifications()` |
| Search + filters | `searchListings()`, `useListingFilters('best')`, `FilterBar`, `SORT_OPTIONS`, `EMPTY_FILTERS` |
| Recommendations | `recommendListings(profile, getOpenListings(db), { excludeIds, limit: RULES.MAX_RECOMMENDATIONS })` → `[{ listing, label }]` |
| AI down? | `const { aiAvailable } = useAiStatus()` (footer switch "Simulate AI outage") |
| Messages | `const toast = useToast()` → `toast.success('Profile saved.')` |
| URLs | `PATHS.student.*`, `PATHS.listing(id)` |

Demo data you will see as Nora: applications in **every status** (Under Review, Short-Listed, Applied, Accepted, Withdrawn), 2 external applications, 4 saved listings (one closes in 2 days, one removed), 3 notifications. Use **Reset demo data** in the footer whenever you want the original data back.

---

## 4. Screens

For every screen: call `useDocumentTitle('<title>')`, start with `<PageHeader eyebrow="Student workspace" title=... subtitle=... />`, and make sure every action shows a toast.

### 4.1 Dashboard - `src/features/student/pages/StudentDashboardPage.jsx`
**Screenshot:** `docs/prototype/student/01-dashboard-top.jpg`, `docs/prototype/student/02-dashboard-bottom.jpg`
Route `/student` · FR-S3, FR-AI2, FR-AI5 · Prototype: Student flow → Dashboard

Layout (top to bottom, like the prototype):
1. `PageHeader` eyebrow "Student workspace", title `${greeting()}, ${firstName}` (use `greeting()` from `lib/format`), subtitle "Here's what's happening with your internship search."
2. **Profile completion banner** (dark `bg-night` card): a circular percentage, title "Complete your profile to improve your matches", a progress bar, "N of 5 sections complete", button **Complete profile** → `PATHS.student.profile`. Only show it while completion < 100%. Calculate completion in a helper `src/features/student/utils/profileCompletion.js` from 5 sections: personal (name + phone + bio), academic (university + major + academicLevel + graduationDate), skills (≥1), preferences (≥1 city and ≥1 type), resume (not null). The profile page uses the same helper.
3. **Recommended for you** (title + "Based on your major, skills, and preferences", link "View all opportunities" → search). Grid of `ListingCard` with `matchLabel` and `showDeadline` and the bookmark (`useSavedListings`). Max 10, best first, from `recommendListings(...)`, excluding listings the student already applied to.
   States:
   - no resume (`profile.resume == null`) → card "Upload your resume to get recommendations" + button to profile.
   - resume analysis pending (`profile.resume.status === 'pending'`) → `Spinner` "We're analysing your resume" and show the newest open listings for the student's major instead (no labels).
   - recommendations still work when AI is down (they use stored data) - don't hide them when `aiAvailable` is false.
4. Two cards side by side (stack on mobile):
   - **Closing soon** ("Saved opportunities nearing their deadline", link "View saved"): saved listings that are still open, sorted by deadline, max 3, each row: avatar, title, company · city, deadline label in red when ≤ 3 days, chevron → listing detail.
   - **Recent applications** ("Your latest activity", link "View tracker"): latest 3 internal applications, row: avatar, title, company, `StatusBadge`, chevron → tracker.
   Empty rows: short text + link (e.g. "No applications yet").

### 4.2 My profile - `src/features/student/pages/StudentProfilePage.jsx`
**Screenshot:** `docs/prototype/student/12-profile-top.jpg`, `docs/prototype/student/13-profile-bottom.jpg`
Route `/student/profile` · FR-S1, FR-AI1 · Prototype: Dashboard → Complete profile ("Your profile")

Layout: `PageHeader` title "Your profile", subtitle "Keep your information current to get more relevant matches.", action **Save changes**. Left column: section links (Personal details, Academic information, Skills & interests, Resume - clicking scrolls to the section) and a **Profile strength** bar (same helper as the dashboard). Right column: one `Card` per section.

- **Personal details:** full name, email (read-only), phone, short bio (`Textarea maxLength={300}`).
- **Academic information:** university (`Select` `UNIVERSITIES`), academic level (`ACADEMIC_LEVELS`), major (`MAJORS`), expected graduation (`type="month"` input), GPA (number), GPA scale (Select 4.0 / 5.0).
- **Skills & interests:** skills as removable chips + "Add a skill" input + **Add** button (Enter also adds, no duplicates, ignore empty). Preferred cities (multi-select chips from `CITIES`), preferred training types (chips from `TRAINING_TYPES`).
- **Resume:** `FileUpload accept={['application/pdf']} maxSizeMB={RULES.RESUME_MAX_MB} typeError="Please upload a PDF under 5 MB."`. When a resume exists show a box with file name, "PDF · Uploaded <date>", status line, and a **Replace file** button.

Behaviour:
- Keep the form in local state; **Save changes** validates then `update('students', profile.id, form)` and `toast.success('Profile saved.')`. Also update the account name: `update('accounts', user.id, { name })`.
- Validation (errors next to fields): university, major and graduation date required; GPA `validateGpa(gpa, scale)` (0-4 or 0-5); phone optional but valid if entered (`validatePhone`).
- Resume upload (simulated FR-AI1):
  1. wrong type / too big → error from `FileUpload` (it shows the message itself).
  2. valid PDF → save `resume: { fileName, dataUrl, uploadedAt, status: 'pending' }` → show "Analysis pending" with a `Spinner`.
  3. after ~2.5 seconds (`setTimeout`) set `status: 'analysed'` → "Resume analysed" with a check icon, toast "Resume analysed. Your recommendations were refreshed."
  4. if the file name contains `scan` (e.g. `my_scan.pdf`), set `status: 'unreadable'` instead → `Alert tone="danger"` "We couldn't read your resume. Try a text-based PDF."
  5. if the AI is down (`!aiAvailable`), keep `pending` and show "Analysis pending - we'll analyse it when the service is back."
- If the browser can't store a big PDF, it still works (the store catches the error); don't worry about it.

### 4.3 Find opportunities - `src/features/student/pages/SearchPage.jsx`
**Screenshot:** `docs/prototype/student/04-search-top.jpg`, `docs/prototype/student/05-search-bottom.jpg`
Route `/student/search` · FR-S2, FR-S6, FR-AI6 · Prototype: Student flow → Find opportunities

Layout (prototype):
- `PageHeader` title "Find opportunities", subtitle "Explore training opportunities that fit your goals."
- White card: search input ("Search by role, company, or keyword") + **Sort by** select (`SORT_OPTIONS`: Best match, Newest, Closest deadline).
- Below: **left filter sidebar** (Filters + Clear all; Training type, City, Work mode, Duration selects; Major select; Compensation; Start date) and **right results list** ("N opportunities" on the left, "Updated today" on the right). Result cards in the prototype are **wide rows** (logo, company, title, city · duration, tags, deadline label, bookmark + View details). Build that row as `src/features/student/components/SearchResultRow.jsx`. (The shared `FilterBar` is horizontal; for the sidebar build your own `src/features/student/components/FilterSidebar.jsx` using the same `filters` object and `Select`/`Checkbox` components.) On mobile the sidebar goes above the results (or behind a "Filters" button that opens it).

Behaviour:
- `const { filters, setFilters, sort, setSort, clearAll } = useListingFilters('best')` (filters live in the URL).
- Results: `searchListings(getOpenListings(db), filters, { companyNameOf: (l) => companyNameOf(db, l), sort, scoreOf: (l) => scoreListing(profile, l) })`. Results update as you type (no submit button needed).
- Bookmark: `useSavedListings().toggleSave(id)`.
- External listings show the "External" badge (already in the data, `listing.source === 'external'`).

States:
- No results → `EmptyState` "No listings match your filters" + **Clear filters** button.
- Sort = Best match but no resume → small `Alert` "Upload your resume to sort by best match" (with link to profile) and sort by newest instead.
- AI down (`!aiAvailable`) and there is a search text → small note "Showing keyword results only" and **only keyword results**: use `keywordCount` from `searchListings` and show `results.slice(0, keywordCount)`.
- Never show match labels or percentages on this page (Phase 3 rule).

### 4.4 Apply - `src/features/student/pages/ApplyPage.jsx`
**Screenshot:** `docs/prototype/student/11-apply.jpg`
Route `/student/apply/:listingId` · FR-S4 · Prototype: listing → Apply now (the popup)

The prototype shows this as a popup on the listing page. In our app it is its own page (the listing page's **Apply now** button already navigates here). Make the page look like the popup: a centered white card (max width ~720px) with:
- eyebrow "Application", serif title = listing title, "Company · City".
- **Profile summary** card: Student, University, Major, GPA (e.g. "4.6 / 5.0"), link **Edit profile**.
- **Resume** card: file name + "Resume analysed" + check icon.
- **Screening questions** card (only if the listing has questions): `type: 'text'` → `Textarea maxLength={500}`; `type: 'yesno'` → `Select` with Yes / No. Required ones show `*`.
- Footer: "By applying, you agree to share your profile with <Company>." + buttons **Cancel** (back to listing) and **Review & submit**.

Behaviour:
- Get the listing: `getListing(db, listingId)`.
- Before showing the form, check in this order:
  1. listing missing or `source === 'external'` → message + link back.
  2. already applied (`getStudentApplication(db, user.id, listingId)` exists, any status) → "You already applied" + button to tracker. (The listing page also shows "Applied" disabled.)
  3. listing not open (`!isListingOpen(listing)`) → "This posting is no longer accepting applications."
  4. missing university, major, graduationDate or resume → `Alert` "Complete your profile before applying" + button **Complete profile** (FR-S4: "sent to complete profile").
- **Review & submit**: required questions must be answered (error under each one). Then `ConfirmDialog` "Submit application?" → on confirm:
  ```js
  insert('applications', {
    id: makeId('app'), listingId, studentId: user.id, status: APP_STATUS.APPLIED,
    appliedAt: now, answers, history: [{ status: APP_STATUS.APPLIED, at: now, note: '' }], external: false,
  })
  ```
  then `toast.success('Application submitted.')` and show a success state: check icon, "Application submitted", "You can follow its status in your tracker", buttons **View my applications** and **Browse more**.

### 4.5 Saved listings - `src/features/student/pages/SavedPage.jsx`
**Screenshot:** `docs/prototype/student/09-saved.jpg`
Route `/student/saved` · FR-S6, FR-S7 · Prototype: Student flow → Saved

Layout: `PageHeader` title "Saved opportunities", subtitle "Keep track of opportunities you're considering." Then one wide card per saved listing (newest saved first):
- top part: avatar, small badge (e.g. "CLOSES SOON · 2 DAYS" in red, or "CLOSED" grey, or "EXTERNAL"), serif title, "Company · City · Type", tags (duration, work mode, paid).
- bottom bar: `Toggle` **Remind me 2 days before** + small text "We'll send an in-app notification" (left), buttons **View listing** and a trash icon button (right).

Rules:
- Use `useSavedListings()` → `savedRows`, `setReminder(saved.id, on)`, `toggleSave(listingId)` to remove.
- Closed or removed listing (`!isListingOpen(listing)`) → whole card greyed (`opacity-60`), badge "Closed", **View listing** replaced by a disabled "Listing closed" button, reminder toggle hidden, text "Applications closed on <date>".
- Less than 2 days left → badge "Closes soon" and text "Too close to the deadline for a reminder" instead of the toggle (FR-S7).
- Already applied → show `StatusBadge` instead of the reminder toggle (no reminder when already applied).
- Empty → `EmptyState` icon `Bookmark`, "You haven't saved any listings yet", button **Search listings** → `PATHS.student.search`.

### 4.6 My applications (tracker) - `src/features/student/pages/ApplicationsPage.jsx`
**Screenshot:** `docs/prototype/student/06-applications.jpg`, `docs/prototype/student/07-application-drawer.jpg`, `docs/prototype/student/08-add-external-modal.jpg`
Route `/student/applications` · FR-S5, FR-S8, FR-S9 · Prototype: Student flow → Applications

Layout (prototype):
- `PageHeader` title "My applications", subtitle "Track every application and stay on top of next steps.", action **Add external application**.
- 4 `StatCard`s (no icons): Total applications, In progress (Applied + Under Review), Short-Listed, Accepted. Count internal + external.
- White card: search input "Search applications" (title or company) + status `Select` ("All statuses" + `APP_STATUS_LIST`).
- `Table` columns: Opportunity (avatar, title, "Company · City"), Date applied, Status (`StatusBadge`), Source ("InternConnect" text, or an outlined "External" badge), chevron. Newest first. Clicking a row opens the **detail drawer**. On mobile the table scrolls sideways (the `Table` component does this).

Detail drawer (`Drawer`, prototype screenshot "Data Analytics Intern"):
- avatar, title, company · city, `StatusBadge`.
- **Application progress**: vertical timeline from `application.history` (status + date + note), next steps greyed.
- **Application details**: application id, resume file name, source (Internal / External), date applied; for internal applications also the screening answers.
- Buttons at the bottom:
  - internal + status Applied / Under Review / Short-Listed → **Withdraw application** (`danger-outline`). `ConfirmDialog` "Withdraw application?" message "You won't be able to apply to this posting again." → `transaction((db) => setApplicationStatus(db, [app.id], APP_STATUS.WITHDRAWN, 'Withdrawn by student', { notify: false }))`, toast "Application withdrawn."
  - internal + Accepted → **Decline offer**. Confirm → same as withdraw (status Withdrawn, note 'Offer declined') **plus** notify the company: `addNotification(next, { userId: listing.companyId, type: 'status', title: 'Offer declined', message: `${profile.name} declined the offer for ${listing.title}.`, link: PATHS.company.applicants(listing.id) })`.
  - Rejected / Withdrawn → no button.
  - external → **Update status** (`Select` with all statuses except Withdrawn... you may include Withdrawn) + **Notes** (`Textarea`) + **Save** → `update('externalApplications', id, { status, notes, history: [...] })`. Also a **Delete** (trash) with confirm → `remove('externalApplications', id)`.

Add external application (`Modal`, prototype "Add external application"):
- fields: Role title*, Company*, Link (optional), Date applied* (`type="date"`), Status (`Select`, default Applied), Notes (optional).
- validation: title and company required, date required and `validatePastDate`, link `validateUrl`.
- save → `insert('externalApplications', { id: makeId('ext'), studentId: user.id, company, title, link, appliedAt, status, notes, fromListingId, history: [{ status, at: now, note: '' }] })`, toast "Application added.", close modal.
- **Prefill:** the listing page's "Add to tracker" button for external listings sends you to `/student/applications?addExternal=<listingId>`. When that query param is there, open the modal automatically with title, company (`listing.companyName`) and link (`listing.externalUrl`) filled in, and save `fromListingId`. Remove the param after opening (`setSearchParams({})`).

Empty state (no internal and no external) → `EmptyState` "No applications yet" + button **Search listings**.

### 4.7 Settings - `src/features/student/pages/SettingsPage.jsx`
**Screenshot:** `docs/prototype/student/14-settings.jpg`
Route `/student/settings` · FR-S10, FR-A5 · Prototype: avatar → Settings

Layout: `PageHeader` title "Settings", subtitle "Manage your account and notification preferences." Left: menu (Notifications, Account, Privacy). Right: card for the selected section.
- **Notifications** (default): "Notification preferences" with `Toggle` rows: **Email notifications** (application updates, reminders - visual only), **In-app status updates** (this one is real: `profile.notifyStatusUpdates`), **Weekly recommendations** (visual only). **Save preferences** → `update('students', profile.id, { notifyStatusUpdates, ... })`, toast "Preferences saved." Below: a light red box "Log out of InternConnect" / "You'll return to the guest landing page." + **Log out** button → `logout()`, `navigate(PATHS.home)`, toast.
- **Account**: show email (read-only) and a **Change password** form (current, new, confirm; `validatePassword`, `validateConfirm`; current must equal `user.password`) → `update('accounts', user.id, { password })`.
- **Privacy**: short text: who can see the resume (only you, companies you applied to, admins - NFR-7) and that name, email, phone etc. are never sent to the AI (NFR-12).

### 4.8 Notifications - `src/features/student/pages/NotificationsPage.jsx`
**Screenshot:** `docs/prototype/student/03-notifications-dropdown.jpg` (the dropdown - there is no full-page design, reuse its look)
Route `/student/notifications` · FR-S10 · reached from the bell → "View all notifications"

- `PageHeader` title "Notifications", action **Mark all as read** (only when there are unread ones).
- `Tabs`: All / Unread / Reminders / Status updates (with counts).
- List from `useNotifications().items`: unread dot, title, message, `timeAgo`, icon by type (`BellRing` reminder, `ListChecks` status). Clicking: `markRead(id)` then `navigate(n.link)` if it has one.
- Empty → `EmptyState` "You're all caught up."

---

## 5. Responsive checklist (Phase 4 grades mobile)

Check every page at **390px** wide (Chrome DevTools → device toolbar → iPhone 12/13) and at **1440px**:
- [ ] no sideways scrolling of the whole page (tables may scroll inside their card)
- [ ] two-column layouts (`lg:grid-cols-...`) stack into one column on mobile
- [ ] buttons wrap instead of overflowing (`flex-wrap`)
- [ ] modals/drawers fit the screen (the shared ones already do)
- [ ] text is readable, nothing is cut off

## 6. Suggested commits (small, in your own words)

Commit after each piece works and `npm run lint` shows no errors. For example:
1. `profile completion helper`
2. `student dashboard with recommendations`
3. `profile page - personal and academic sections`
4. `profile skills and resume upload`
5. `search page with filters sidebar`
6. `apply page with screening questions`
7. `saved listings page`
8. `applications tracker table and drawer`
9. `withdraw / decline and external applications`
10. `settings page`
11. `notifications page`
12. `mobile fixes for student pages`
13. `ai usage note for student pages`

Always `git add src/features/student AI_USAGE.md` (not `git add .`) so you never commit other files by accident.

## 7. Pull request checklist

Push: `git push origin asim`. Then on GitHub: **Pull requests → New → base: main, compare: asim**. Title "Student screens". Paste this list in the description and tick it:

- [ ] I only changed files in `src/features/student/` and my line in `AI_USAGE.md`
- [ ] `npm run lint` shows no errors and `npm run build` works
- [ ] Dashboard: recommendations with labels, no-resume state, analysing state, closing soon, recent applications
- [ ] Profile: all sections save, validation messages, resume upload (wrong file, pending → analysed, unreadable)
- [ ] Search: filters, sort, no results + Clear filters, no-resume sort note, keyword-only note when AI is off
- [ ] Apply: profile check, required questions, confirm, success, already applied, closed posting
- [ ] Saved: reminder toggle, closes soon, closed card, unsave, empty state
- [ ] Tracker: stats, search + status filter, drawer timeline, withdraw, decline offer (company notified), add / edit / delete external, prefill from `?addExternal=`
- [ ] Settings: notification toggle saved, change password, log out
- [ ] Notifications page: tabs, mark as read, empty state
- [ ] Every page checked at 390px and 1440px

Musa reviews and merges. If he asks for changes, commit them on `asim` and push again.

## 8. AI usage

If you use any AI tool (ChatGPT, Copilot, Claude, Cursor, even autocomplete), replace **only** the line `_To be completed by Asim ..._` in `AI_USAGE.md` with: the tools, what you used them for, and the files affected. If you didn't use any, write "I did not use any AI tools." Keep copies of your AI conversations for the AI Evidence zip. You must be able to explain every line you commit.
