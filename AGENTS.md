# Rased — Project Rules for OpenCode

## Git Workflow (MANDATORY — follow for every task)

Branch structure:
- `main` — production, always deployable. Never commit directly.
- `development` — integration branch. All features merge here first.
- `feature/*` — one branch per task, always branched FROM `development`.

Before starting ANY coding task:
1. Run `git checkout development && git pull` first.
2. Create a new branch: `git checkout -b feature/<short-task-name>`
   (e.g. `feature/rules-engine`, `feature/csv-upload-api`)
3. Never write code directly on `main` or `development`.

While working:
- Commit in small, logical units — not one giant commit at the end.
- Use Conventional Commits format:
  - `feat:` new functionality
  - `fix:` bug fix
  - `test:` adding/fixing tests
  - `refactor:` restructuring without behavior change
  - `docs:` documentation updates
  - `chore:` tooling/config/deps

When a task is complete and tests pass:
1. Run the test suite and confirm it passes before merging anything.
2. Merge back to `development`: `git checkout development && git merge feature/<name>`
3. Do NOT merge to `main` unless explicitly told to — main only gets updated for
   demo-ready milestones.
4. Ask for confirmation before any `git push --force` or history-rewriting command.

## Project-Specific Rules
- The compliance/quota calculation logic must always be deterministic code
  (TypeScript functions), never computed by an LLM call. See docs/02-TRD-Architecture.md
  section 2.
- LLM calls are only used for bilingual (Arabic/English) narrative generation of
  already-calculated results.
- Read docs/01-PRD-Rased.md and docs/02-TRD-Architecture.md before implementing any
  new feature — they define scope (Must/Should/Could/Won't Have).
- Do not implement anything marked "Won't Have" in the PRD without being asked first.

## Commands
- `npm run test` — run rules-engine unit tests
- `npm run dev` — start local dev server
