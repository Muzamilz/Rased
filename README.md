# Rased (رصد) — Arabic-First Workforce Compliance Agent

GCC private-sector employers (starting UAE) must comply with workforce nationalization quotas (Emiratization). Non-compliance triggers fines up to AED 120,000/year per unfilled position.

Rased gives HR leads predictive, plain-language visibility into their quota standing — before the fine hits.

## Problem

HR teams track compliance manually in spreadsheets against MOHRE rules, with no forward-looking visibility. Companies discover non-compliance *after* the fine, not before.

## MVP Features

- CSV upload of workforce data
- Deterministic Emiratization quota-band calculation (rules engine, not LLM)
- Plain-language report: current band, gap to next band, fine exposure
- Bilingual Arabic/English output — LLM narrates, code calculates
- Actionable recommendations (e.g., "hire 3 Emirati nationals in [role] to reach Green band")
- No-login web UI for single-session upload/report

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js + Tailwind |
| Backend | Node.js |
| Rules Engine | TypeScript (deterministic, unit-tested) |
| LLM | Hermes / Jais 2 (narrative only) |
| CSV Parsing | PapaParse |

## Getting Started

```bash
npm run dev    # start dev server
npm run test   # run rules-engine unit tests
```

## Project Status

**Phase:** MVP — Pre-build. Discovery complete, ready for implementation.

## License

Private — All rights reserved.
