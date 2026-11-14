# Team 14 · SWE 363-01 · Phase 4 – AI Evidence

Full copies of the AI conversations and intermediate artifacts for Phase 4 (Front-End), one folder per member.
Repository: https://github.com/mibnrashid/SWE363_Project_Phase4_Frontend (the `AI_USAGE.md` file at the root lists the tools and files affected).

## Musa ibn Rashid – `musa/`

Tool: Claude Code (Anthropic, Claude Opus 5.5) in VS Code.

- `raw/` – the complete, unmodified Claude Code conversation files (`.jsonl`, one JSON event per line).
  - `01-main-build-session.jsonl` – planning and building the project setup, shared code, guest/auth screens and team docs.
  - `02-push-and-declaration-session.jsonl` – pushing the member branches, writing the teammate prompt and preparing this AI declaration.
- `readable/` – the same conversations converted to Markdown so they are easy to read. Long tool outputs are shortened there; `raw/` has everything.
- `artifacts/` – intermediate files produced with AI: the declaration source (`declaration.html`), `musa.md`, the declaration template, and the script used to make the readable copies.
  The generated code itself is in the GitHub repository commit history on `main`.

## Asim Asiri – `asim/`

Tool: Claude Code (Anthropic, Claude Opus 5.5) in VS Code.

- `raw/` – the complete, unmodified Claude Code conversation files (`.jsonl`).
  - `01-run-cloned-project-session.jsonl` – getting the cloned project running.
  - `02-run-project-localhost-session.jsonl` – running the project on localhost.
  - `03-ide-rename-question-session.jsonl` – a quick VS Code question.
  - `04-student-screens-build-session.jsonl` – building, testing and committing the student screens, the AI declaration and the pull request.
- `readable/` – the same conversations as Markdown (long tool outputs shortened; `raw/` has everything).
  The generated code itself is in the repository history (the `asim` branch, merged into `main` in pull request #1).

## Raed Abumostafa – `raed/`

Tool: Claude Code (Anthropic, Claude Opus 5.5) in VS Code.

- `raw/01-shortlist-and-admin-session.jsonl` – the complete Claude Code conversation for the shortlist workspace, the Short-Listed page, the admin screens, testing and the declaration. The only change from the original is that Raed's personal email address is replaced with `[redacted-email]`.
- `readable/` – the same conversation as Markdown (long tool outputs shortened; `raw/` has everything).
  The generated code itself is in the repository history (the `raed` branch, pull request #2).

## Bahaa Najjar

Tool: OpenCode (AI coding assistant, model Claude Opus 5.5) in the terminal. His OpenCode conversations are not included in this zip.
The generated code itself is in the repository history (the `bahaa` branch, pull request #3).
