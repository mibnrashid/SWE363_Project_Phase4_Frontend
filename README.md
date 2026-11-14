# InternConnect - Front-End (Phase 4)

**The Ultimate Training & Co-op Platform.** One place for students in Saudi Arabia to find Co-op, internship and summer training, apply, and track every application. Companies post training roles and shortlist applicants; admins approve companies and moderate listings.

Team 14 · SWE 363-01 · KFUPM

This repository is the **React front-end prototype** for Milestone 4. There is no backend yet: all data is demo data stored in your browser (localStorage), so every screen and flow is fully interactive.

- Phase 3 annotated wireframes (Figma): https://www.figma.com/design/TTgWHwlEfcfQgtLAXtT716/InternConnect---Phase-3-Annotated-Wireframes?node-id=0-1
- Phase 3 clickable prototype (Figma Make): https://www.figma.com/make/Kq6KXCPbxBB8ZD8cK04Jdz/InternConnect-Desktop-Prototype
- Screenshots of every prototype screen: [docs/prototype/](docs/prototype/README.md)

---

## Features

| Role | What you can do |
| --- | --- |
| **Guest** | Browse and search open listings with typo-tolerant search and 7 filters, view listing details, get asked to log in when saving or applying. |
| **Student** | Dashboard with recommendations (Strong / Good match), profile with PDF resume, search, apply with screening questions, save listings with 2-day deadline reminders, track internal and external applications, withdraw / decline an offer, notifications and settings. |
| **Company** | Register (CR number + admin approval), company profile, create / edit / close / reopen postings with screening questions, view and review applicants, build shortlist tables by hand or with the chat assistant, approve a shortlist, export it (CSV / Excel) and finalize accepted applicants. |
| **Admin** | Approve or reject company requests, suspend / reactivate users, remove postings, review imported listings and duplicates, enable / disable the external source, view platform statistics. |

Automatic actions from Phase 3 (auto-closing postings at the deadline, deadline reminders, moving applicants to *Under Review*) run in the browser every minute while the app is open.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [React Router 7](https://reactrouter.com/) for pages and role-protected routes
- [Tailwind CSS 4](https://tailwindcss.com/) with design tokens taken from the Figma prototype (`src/index.css`)
- [lucide-react](https://lucide.dev/) icons, [Recharts](https://recharts.org/) for admin charts, [dnd-kit](https://dndkit.com/) for drag and drop in shortlist tables
- ESLint for code quality

## Getting started

**Requirements:** [Node.js](https://nodejs.org/) 18 or newer and npm.

```bash
git clone <repository-url>
cd SWE363_Project_Phase4_Frontend
npm install
npm run dev
```

Open http://localhost:5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production files into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with ESLint |

> **Tip (Windows / OneDrive):** if `npm run dev` crashes with `EPERM ... node_modules\.vite`, OneDrive is locking files. Delete `node_modules/.vite` and run it again, or keep the project outside a synced folder.

### Environment variables

None are needed for Phase 4. `.env.example` lists the variable the back-end phase will use. Copy it to `.env` when that happens; `.env` files are git-ignored and must never be committed.

## Demo accounts

The login page has buttons that fill these in for you.

| Role | Email | Password | What you'll see |
| --- | --- | --- | --- |
| Student | `nora@iau.edu.sa` | `Student123` | Dashboard, applications in every status, saved listings |
| Company | `hr@aramcodigital.sa` | `Company123` | Open postings, a closed posting ready for shortlisting, an approved shortlist |
| Company (pending) | `admin@naseej.sa` | `Company123` | "Waiting for approval" page |
| Company (rejected) | `careers@novaretail.sa` | `Company123` | Rejection reason + resubmit form |
| Admin | `admin@internconnect.sa` | `Admin1234` | Admin console |
| Unverified student | `new.student@ksu.edu.sa` | `Student123` | "Verify your email first" message |
| Suspended student | `suspended@ksu.edu.sa` | `Student123` | "Your account has been suspended" message |

Entering a wrong password 5 times locks the account for 15 minutes (FR-A3). Use **Reset demo data** in the footer to start again.

## Usage examples

1. **Find and save a listing as a guest:** search `aramko` on the landing page (the typo still finds Aramco Digital), then click the bookmark: you are asked to log in or sign up, and after logging in you return to the same listing.
2. **Apply as a student:** log in as Nora, open *Data Analytics Intern*, click **Apply now**, answer the screening question and submit. The application appears in *Applications* as **Applied**.
3. **Shortlist as a company:** log in as Aramco Digital, open *AI Engineer Trainee* (closed) → **Applicants**, build a table by dragging applicants or ask the assistant ("make a table of the 5 strongest Python applicants"), then **Use as shortlist**.
4. **Approve a company as admin:** log in as admin, open *Requests*, open *Naseej Technology* and approve it. Logging in as `admin@naseej.sa` now opens the company dashboard.

## Project structure

```
src/
  components/
    ui/          shared building blocks (Button, Input, Modal, Table, Badge ...)
    layout/      Navbar, layouts, notification bell, account menu
    listings/    ListingCard, FilterBar, LoginPromptModal (used by guest + student pages)
  context/       AuthProvider (fake login) and ToastProvider
  data/          seed.js - the demo data
  features/      one folder per area, each owned by one team member
    guest/       landing, listing detail, 404                 (Musa)
    auth/        sign up, login, password reset, pending       (Musa)
    student/     dashboard, profile, search, apply, tracker... (Asim)
    company/     dashboard, postings, applicants, profile      (Bahaa)
    company/shortlist/  shortlist tables, assistant, export   (Raed)
    admin/       requests, users, postings, imports, stats     (Raed)
  hooks/         shared hooks (saved listings, notifications, filters)
  lib/           constants, validation, search, matching, formatting, export
  routes/        all routes, route guard and URL helpers (PATHS)
  store/         data store (localStorage), shared actions, selectors, system jobs
public/          favicon and a sample resume PDF
```

## Team

| Member | ID | Role | Front-end responsibility |
| --- | --- | --- | --- |
| Musa ibn Rashid | 202437440 | Project Manager & Frontend Developer | Project setup, shared components, data store, routing, guest and auth screens, README |
| Asim Asiri | 202338490 | UI/UX Designer & QA Tester | Student screens (dashboard, profile, search, apply, saved, tracker, settings, notifications) |
| Bahaa Najjar | 202372990 | Backend Developer & API Specialist | Company screens (dashboard, postings, posting form, applicants, applicant detail, profile) |
| Raed Abumostafa | 202443380 | AI Integration & Database Admin | Shortlist tables + chat assistant, shortlist export / finalize, all admin screens |

How we work with branches and pull requests is described in [CONTRIBUTING.md](CONTRIBUTING.md). AI tool usage is declared in [AI_USAGE.md](AI_USAGE.md).
