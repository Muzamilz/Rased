# Technical Requirements & Architecture Document (TRD)
## Rased MVP — Solo-Founder Buildable Architecture

---

## 1. Architecture Decision Record (ADR-001): Overall Pattern

**Decision:** Simple modular monolith. Not microservices, not event-driven — those add
complexity a solo founder doesn't need at MVP stage.

**Why:** One deploy target, one codebase, fast iteration. Split into services later only
if/when there's a real scaling reason (there won't be yet).

**Structure:**
```
/rased
  /frontend        → Next.js (React) — upload UI, bilingual, report display
  /backend
    /rules-engine   → deterministic compliance calculation (pure functions, unit-tested)
    /llm-service    → wraps calls to Hermes / Jais 2 for narrative generation
    /api            → REST endpoints tying it together
  /shared           → types, constants (quota bands, fine rates)
```

## 2. Why This Split Matters (Critical Design Decision)

**The rules-engine must NEVER call an LLM to "figure out" compliance math.**
Compliance percentages and fine exposure are deterministic — calculate them in plain code
(TypeScript/Python), unit test them against known MOHRE examples, and only pass the
*results* to the LLM to turn into natural bilingual language. This is the single most
important architectural decision in this product — it's what makes the tool trustworthy
instead of another "AI made something up" story.

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + Tailwind | Fast to build solo, good RTL/i18n support, deploys free on Vercel |
| Backend | Node.js (or Python/FastAPI if you're more comfortable there) | Simple REST API, one language across stack if using Node |
| Rules engine | Plain TypeScript module | Deterministic, unit-testable, no AI involved |
| LLM inference | Hermes (via OpenRouter or Together AI) or Jais 2 (via Core42/Inception API if accessible) | Open-source, Arabic-capable; OpenRouter gives you fast access to multiple models to A/B test Arabic quality |
| CSV parsing | PapaParse (frontend) or `csv-parse` (backend) | Standard, reliable |
| Hosting | Vercel (frontend) + Railway or Render (backend) | Free/cheap tiers, zero DevOps overhead for MVP |
| Database | None for v0 demo (stateless); Supabase (Postgres) when you add accounts in v1 | Don't build persistence you don't need yet |

**Note on data sovereignty:** For the MVP demo, avoid persisting real company data at all if
possible. Once you have paying pilot customers, revisit hosting (in-region UAE/Saudi cloud)
— this becomes a real requirement, not a v0 concern.

## 4. API Design (MVP)

```
POST /api/analyze
  Body: multipart CSV file
  Response: {
    company_summary: { total_employees, national_employees, percentage },
    current_band: string,
    gap_to_next_band: { employees_needed, role_category },
    fine_exposure_aed: number,
    recommendations: string[],
    narrative_ar: string,
    narrative_en: string
  }
```

Keep it to this one endpoint for MVP. Don't build auth, don't build multi-endpoint CRUD
until you have users who need saved history.

## 5. Data Model (Minimal)

```typescript
interface Employee {
  employee_id: string;
  role_category: string;   // maps to MOHRE-defined skilled/semi-skilled categories
  nationality: string;
  contract_status: 'active' | 'terminated';
}

interface QuotaRule {
  role_category: string;
  band: 'platinum' | 'high_green' | 'medium_green' | 'low_green' | 'red';
  min_percentage: number;
  fine_per_position_aed: number;
}
```

## 6. Testing Strategy

- **Unit tests on the rules engine are non-negotiable** — this is the trust layer of the
  whole product. Write test cases against known/published MOHRE examples before writing any
  UI.
- Manual QA on LLM narrative output — read every generated Arabic report yourself (or have a
  native speaker review) before showing it to a design partner.
- No need for load testing, E2E test suites, or CI/CD pipelines yet at MVP stage — that's
  premature for a pre-validation product.

## 7. Security Basics (Don't Skip These Even at MVP Stage)

- Don't log or persist uploaded CSVs beyond the request lifecycle unless the user opts in
- Strip/anonymize personally identifiable fields where not needed for calculation
- Use HTTPS everywhere (default on Vercel/Railway)
- Don't hardcode API keys — use environment variables from day one

---

## 8. Building This With OpenCode (Solo-Founder Workflow)

**What OpenCode is:** an open-source, terminal-based AI coding agent (similar in spirit to
Claude Code) that lets you delegate implementation work — you describe what you want, it
writes/edits files, runs commands, and iterates, all from your terminal.

**How to use it for this build:**

1. **Install** (check current instructions at the project's GitHub/docs page — install steps
   change, so verify exact command before running):
   ```
   npm install -g opencode-ai
   ```
   or via the installer script shown on their docs — always check their current README, as
   package names and flags do change over time.

2. **Set up your project folder** with this TRD and the PRD saved inside it (e.g.,
   `/docs/PRD.md`, `/docs/TRD.md`). Feeding it the actual requirements docs as context
   produces far better results than vague prompts.

3. **Work in small, reviewable increments** — don't ask it to "build the whole app." Ask for
   one module at a time:
   - "Implement the rules engine in `/backend/rules-engine` based on `/docs/TRD.md` section
     5, with unit tests"
   - "Build the CSV upload + validation endpoint per FR-1 and FR-2 in the PRD"
   - "Build the Next.js upload UI with AR/EN toggle"
   - "Wire the LLM narrative service — make sure it only receives pre-calculated numbers,
     never asked to compute them itself"

4. **Review every diff before accepting it**, especially in the rules engine — this is the
   part that has to be exactly right. Treat AI-generated code on the compliance math the same
   way you'd treat a junior engineer's PR: read it, don't just merge it.

5. **Test as you go.** After each module, run the unit tests before moving to the next piece.
   Don't let untested code compound.

6. **Use it for the boring stuff aggressively** — boilerplate, CSV parsing, Tailwind styling,
   API scaffolding. Use your own judgment (or a native Arabic speaker's) for anything
   touching legal/compliance accuracy or Arabic language quality.

**Realistic solo-founder timeline with this approach:** a working CSV-upload → report demo
is buildable in **5–10 focused days**, not weeks, if you stay disciplined about scope (see
PRD "Won't Have" list) and don't let the agent scope-creep you into building auth, accounts,
or integrations you don't need yet.
