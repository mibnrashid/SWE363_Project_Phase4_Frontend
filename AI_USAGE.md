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

_To be completed by Bahaa (tools used and files affected, or "I did not use any AI tools")._

### Raed Abumostafa

_To be completed by Raed (tools used and files affected, or "I did not use any AI tools")._

## Earlier phases

- **Phase 3:** the clickable desktop prototype was built in Figma Make (AI-assisted), from our annotated wireframes. It is the design reference for this phase.
