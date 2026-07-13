# Product Requirements Document (PRD)
## Rased (رصد) — Arabic-First Workforce Compliance Agent
**Version:** 0.1 (MVP)
**Owner:** [Founder]
**Status:** Draft — Discovery complete, ready for build

---

## 1. Problem Statement

GCC private-sector employers (starting UAE) must comply with workforce nationalization
quotas (Emiratization). Non-compliance triggers fines up to **AED 120,000/year per unfilled
position** (2026 rate). Today, HR teams track this manually in spreadsheets against MOHRE
rules, with no forward-looking visibility — companies discover non-compliance *after* the
fine is issued, not before.

There is no Arabic-first, GCC-native software product that gives HR leads predictive,
plain-language visibility into their quota standing.

## 2. Goals

| Goal | Metric |
|---|---|
| Validate real demand | 10+ HR leads say "I would use this" after seeing the demo |
| Ship a usable MVP | HR lead can upload workforce data and get an accurate compliance report in <2 minutes |
| Generate a YC-ready story | 1 design partner using it with real (even if small) usage data |

## 3. Non-Goals (explicitly out of scope for MVP)

- Live government API integration (Qiwa/MOHRE/GOSI)
- Saudi Nitaqat support (v2)
- Payroll processing
- Full HRIS features (leave, benefits, recruiting)
- Multi-tenant enterprise SSO / permissions

## 4. Target User (Primary Persona)

**"Fatima, HR Manager"**
- Works at a 50–300 employee UAE private company
- Owns Emiratization compliance reporting to leadership
- Currently uses Excel + manual MOHRE portal checks
- Pain: doesn't know current quota-band risk until it's too late; spends hours manually
  cross-referencing nationality/role data against quota rules
- Bilingual (Arabic/English), expects both in any tool

## 5. Scope — MoSCoW

**Must Have (MVP)**
- CSV upload of workforce data (name/role/nationality/contract status — anonymizable)
- Deterministic calculation of current Emiratization quota-band standing (rules engine, not LLM)
- Plain-language report: current status, gap to next band, projected fine exposure
- Bilingual output (Arabic + English) generated via LLM (Hermes/Jais 2) from the
  deterministic calculation — **LLM explains, code calculates**
- Actionable recommendations (e.g., "hire 3 more Emirati nationals in [role category] to
  reach Green band")
- Simple web UI, no login required for v0 demo (single-session upload/report)

**Should Have (v1, post-validation)**
- Saved company profiles (login, multi-report history)
- Downloadable PDF report
- Basic user accounts

**Could Have (v2+)**
- Saudi Nitaqat support
- Live Qiwa integration (requires partnership)
- Multi-user org accounts, role-based access

**Won't Have (this phase)**
- Payroll, benefits, recruiting modules
- Government-facing filing/submission features

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall accept CSV upload with columns: employee_id, role_category, nationality, contract_status |
| FR-2 | System shall validate CSV structure and flag missing/malformed rows before processing |
| FR-3 | System shall calculate current Emiratization percentage by role category using public MOHRE rules |
| FR-4 | System shall determine current compliance band and gap to next band |
| FR-5 | System shall estimate potential fine exposure if non-compliant |
| FR-6 | System shall generate a bilingual (AR/EN) plain-language report via LLM, grounded strictly in the calculated numbers (no LLM-invented figures) |
| FR-7 | System shall provide at least 2 actionable recommendations per report |

## 7. Non-Functional Requirements

- **Accuracy:** Compliance math must be 100% deterministic (code-based), LLM only used for
  narrative/translation — never for the arithmetic itself
- **Data handling:** Treat uploaded workforce data as sensitive; no persistent storage in v0
  demo unless user opts in; anonymized processing where possible
- **Performance:** Report generation <10 seconds for files up to 1,000 employees
- **Language quality:** Arabic output must read as natural Gulf-appropriate business Arabic,
  not machine-translated MSA

## 8. User Flow (MVP)

1. HR lead lands on simple web page (bilingual toggle AR/EN)
2. Uploads CSV (or uses provided sample template)
3. System validates + calculates compliance status
4. System displays: current band, gap, fine exposure, recommendations
5. HR lead can download report / share link
6. CTA: "Want this connected live to your MOHRE data? Join the pilot"

## 9. Success Criteria for Moving to v1

- 5+ real companies test with real (or realistic anonymized) data
- At least 1 company says they'd pay for a live/automated version
- Report accuracy validated against manual calculation by an HR professional

## 10. Risks

| Risk | Mitigation |
|---|---|
| MOHRE public rules change/are unclear | Build rules engine as isolated, easily updatable module; verify with an HR/legal advisor before launch |
| LLM hallucinates numbers in report | Strict prompt architecture: LLM only receives pre-calculated numbers to narrate, never asked to compute |
| No one wants to upload real workforce data to an unknown tool | Offer anonymized sample template first; get design partner under NDA |
| Arabic output quality is weak from LLM | Use Jais 2 or Falcon-H1 Arabic for the narrative layer, not a generic English-first model |
