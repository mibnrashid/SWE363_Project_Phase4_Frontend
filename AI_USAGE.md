# AI Usage Declaration

Every team member lists the AI tools they used (including code autocomplete) and the files affected. Full conversations and intermediate artifacts are submitted separately on Blackboard in the AI Evidence zip.

## Phase 4 – Front-End

### Musa ibn Rashid

- **Tool:** Claude Code (Anthropic, model Claude Opus 5.5) in VS Code.
- **Used for:** analysing the Phase 1–3 documents and the Figma prototype, planning the front-end structure, generating the project setup, the shared components, the demo data store, routing, the guest and authentication screens, the README / CONTRIBUTING files and the responsibility files for each member branch (`docs/responsibilities/*.md`). I reviewed, tested and adjusted the output before each commit.
- **Files affected:**
  - Project setup: `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `.gitignore`, `.gitattributes`, `.env.example`, `public/*`
  - Styles: `src/index.css`
  - Shared code: `src/components/**`, `src/context/**`, `src/hooks/**`, `src/lib/**`, `src/routes/**`, `src/store/**`, `src/data/seed.js`, `src/App.jsx`, `src/main.jsx`
  - Guest and auth screens: `src/features/guest/**`, `src/features/auth/**`
  - Placeholder pages in `src/features/student/**`, `src/features/company/**`, `src/features/admin/**` (later replaced by each owner)
  - Documentation: `README.md`, `CONTRIBUTING.md`, `AI_USAGE.md`, `docs/responsibilities/*.md` on each member branch, `docs/TOOLBOX.md`, `docs/DATA_MODEL.md`

### Asim Asiri

- **Tool:** Claude Code (Anthropic, model Claude Opus 5.5) in VS Code. No other AI tools or autocomplete.
- **Used for:** building the student screens from `docs/responsibilities/asim.md` and the prototype screenshots (dashboard, profile, search, apply, saved, applications tracker, settings, notifications), running lint/build, making the commits on the `asim` branch, testing the screens in the browser at desktop and phone width, and preparing my AI declaration and pull request. I reviewed and tested every screen before it was committed.
- **Files affected:**
  - Student screens: `src/features/student/pages/*.jsx`, `src/features/student/components/*.jsx`, `src/features/student/utils/profileCompletion.js`
  - Documentation: my line in `AI_USAGE.md`, `docs/ai-declaration/asim.md`, `docs/ai-evidence/asim/`

### Bahaa Najjar

- **Tool:** OpenCode (AI coding assistant) in the terminal.
- **Used for:** building the company screens from `docs/responsibilities/bahaa.md` and the prototype screenshots (dashboard, postings list and close/reopen, posting form and preview, company profile, all applicants, applicants for one posting, applicant detail), the focused helper tests and running lint/build. I reviewed and tested every screen and the data rules before committing.
- **Files affected:**
  - Company screens: `src/features/company/pages/*.jsx`, `src/features/company/components/*.jsx`, `src/features/company/utils/postings.js`, `src/features/company/utils/postings.test.js`
  - Documentation: this line in `AI_USAGE.md`

### Raed Abumostafa

- **Tool:** Claude Code (Anthropic, model Claude Opus 5.5) in VS Code. No other AI tools or autocomplete.
- **Used for:** building my part from `docs/responsibilities/raed.md` and the prototype screenshots: the shortlist workspace (applicant pool, tables, drag and drop, rule-based table assistant with undo, AI reasons, use as shortlist), the Short-Listed page (export and finalize) and all admin screens; running lint/build before each commit, committing and pushing on the `raed` branch, and testing every screen in a headless browser. I reviewed the screenshots and test results before submitting.
- **Files affected:**
  - Shortlist: `src/features/company/shortlist/**`
  - Admin: `src/features/admin/**`
  - Declaration and evidence: `docs/ai-declaration/raed.md`, `docs/ai-evidence/raed/`

## Earlier phases

- **Phase 3:** the clickable desktop prototype was built in Figma Make (AI-assisted), from our annotated wireframes. It is the design reference for this phase.
