# AI Usage Declaration – Asim Asiri

**Team 14 · SWE 363-01 · Phase 4 – Front-End**
**Branch:** `asim` · **My part:** student screens (dashboard, profile, search, apply, saved, applications tracker, settings, notifications)

## My choice (tick one)

- [x] I used AI tools in this phase (details below)
- [ ] I did not use any AI tools in this phase

## Tools I used

| Tool | Model / version | Where I used it |
| --- | --- | --- |
| Claude Code (Anthropic) | Claude Opus 5.5 | VS Code |

## What I used it for

I used Claude Code to build my part of the front-end from my responsibilities file (`docs/responsibilities/asim.md`). I gave it the task and the rules (only my feature folder, reuse the shared components, small commits), and it read the team docs and the prototype screenshots, then wrote the eight student pages and the helper components and utilities they need. It also ran lint and build after each screen, made the commits and pushes on my branch, tested the screens in a browser (including at phone width, which found some layout overflow and a log-out redirect problem that were then fixed), and helped me prepare this declaration and the pull request. I also used it once to ask a quick VS Code question while editing my prompt file.

## Files affected

- `src/features/student/pages/` – `StudentDashboardPage.jsx`, `StudentProfilePage.jsx`, `SearchPage.jsx`, `ApplyPage.jsx`, `SavedPage.jsx`, `ApplicationsPage.jsx`, `SettingsPage.jsx`, `NotificationsPage.jsx`
- `src/features/student/components/` – `ActivityRow.jsx`, `ApplicationDrawer.jsx`, `ApplicationTimeline.jsx`, `ChipGroup.jsx`, `ExternalApplicationModal.jsx`, `FilterSidebar.jsx`, `ProfileCompletionBanner.jsx`, `ResumeSection.jsx`, `SearchResultRow.jsx`
- `src/features/student/utils/profileCompletion.js`
- `AI_USAGE.md` (my line only), `docs/ai-declaration/asim.md`, `docs/ai-evidence/asim/`

## How I checked the output

Every screen was checked with `npm run lint` and `npm run build` before it was committed. I ran the app with the demo student account and went through each screen against the prototype screenshots: recommendations and the profile banner, profile validation and the resume upload states (wrong file type, pending, analysed, unreadable), search filters, the no-results state and keyword-only results with the AI outage switch on, applying with required questions and the "already applied" state, saved listing states, the tracker drawer (withdraw, decline offer and the company notification, adding an external application from `?addExternal=`), changing password and logging out, and the notifications tabs. I also checked every page at 390px and 1440px wide for sideways scrolling and checked the browser console for errors.

## Evidence

My full AI conversations are in `docs/ai-evidence/asim/` and will be included in the team's AI Evidence zip.

## Statement

I confirm this declaration is accurate and that I can explain all the code I committed, including the parts written with AI help.

**Name:** Asim Asiri · **Date:** 2026-11-14
