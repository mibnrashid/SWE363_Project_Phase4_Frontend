# AI Usage Declaration – Raed Abumostafa

**Team 14 · SWE 363-01 · Phase 4 – Front-End**
**Branch:** `raed` · **My part:** company shortlist workspace (tables, drag and drop, table assistant, reasons, use as shortlist), Short-Listed page (export and finalize), and all admin screens

## My choice

- [x] I used AI tools in this phase (details below)
- [ ] I did not use any AI tools in this phase

## Tools I used

| Tool | Model / version | Where I used it |
| --- | --- | --- |
| Claude Code (Anthropic) | Claude Opus 5.5 (`claude-opus-5-5`) | VS Code extension |

I did not use any other AI tools or code autocomplete for this phase.

## What I used it for

I used Claude Code to build my whole part of the front-end from my responsibilities file (`docs/responsibilities/raed.md`), the team docs (`CONTRIBUTING.md`, `docs/DATA_MODEL.md`, `docs/TOOLBOX.md`) and the prototype screenshots in `docs/prototype/`. It wrote the code for the shortlist workspace (applicant pool, shortlist tables, drag and drop, the rule-based table assistant with undo, the AI reason line and "Use as shortlist"), the Short-Listed page (CSV/Excel export and finalize), and the six admin pages (company requests, users, postings, imported listings, external sources and statistics). It also ran lint and build before every commit, made the commits and pushes on my branch, tested the screens in a headless browser, and helped me write this declaration and my line in `AI_USAGE.md`.

I gave the instructions, answered its questions (for example which identity to commit with and how to handle my personal email in the evidence file), and reviewed the screenshots and test results it produced.

## Files affected

- `src/features/company/shortlist/**` – `ShortlistWorkspace.jsx`, `ShortlistPage.jsx`, `ApplicantPool.jsx`, `TablesPanel.jsx`, `ShortlistTableCard.jsx`, `TableMenu.jsx`, `TableNameModal.jsx`, `AddToTableModal.jsx`, `AssistantChat.jsx`, `ExportModal.jsx`, `WorkspaceModes.jsx`, `assistant.js`, `reasons.js`, `tableActions.js`
- `src/features/admin/**` – `pages/CompanyRequestsPage.jsx`, `pages/UsersPage.jsx`, `pages/AdminPostingsPage.jsx`, `pages/ImportedListingsPage.jsx`, `pages/ExternalSourcesPage.jsx`, `pages/StatisticsPage.jsx`, `components/StatChip.jsx`, `components/DetailList.jsx`, `components/ImportEditModal.jsx`, `components/CompareModal.jsx`, `adminUtils.js`
- `docs/ai-declaration/raed.md`, `docs/ai-evidence/raed/`, and my line in `AI_USAGE.md`

## How I checked the output

- `npm run lint` (no errors) and `npm run build` (passes) before every commit; one screen or feature per commit.
- Compared each screen with the prototype screenshots in `docs/prototype/company` and `docs/prototype/admin`.
- Ran the app with `npm run dev` and tested every screen in a headless Edge browser: 42 checks on the company side (modes, table rules, drag and drop including multi-select, every assistant request type, limits, undo, AI outage state, use as shortlist, export, finalize) and 40 on the admin side (approve/reject, suspend/reactivate, remove posting, edit/publish/compare/reject imports, sources, statistics ranges), with no console errors. Also checked every screen at 390px width.
- The browser tests found two real problems, which were fixed in their own commits: dragging a wide applicant row onto a table did not register a drop, and on phones the applicants table pushed the page wider instead of scrolling inside its card.
- Tested the assistant's command parser separately against the demo data.

## Evidence

My full Claude Code conversation for this phase is in `docs/ai-evidence/raed/` and will be included in the team's AI Evidence zip. The only change from the original file is that my personal email address is replaced with `[redacted-email]`.

## Statement

I confirm this declaration is accurate and that I can explain all the code I committed, including the parts written with AI help.

**Name:** Raed Abumostafa · **Date:** 2026-11-14
