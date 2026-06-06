# CURRENT_TASK — NexArtWO

## Task

ISSUE-013 Phase B: Design implementation plan — Investor Hub separation.

## Phase

Phase A — Design documentation only (no code changes).

## Objective

Produce a complete technical implementation plan covering current state map,
target architecture, routing design, data model, 5 implementation phases,
file impact, risk analysis, and QA checklist. No code until owner approves.

## Allowed files to modify

- `memory/CURRENT_TASK.md`
- `memory/KNOWN_ISSUES.md`
- `memory/SESSION_LOG.md`
- `memory/AGENT_HANDOFF.md`
- `docs/03-modules/INVESTOR_HUB.md`

## Forbidden files

- `js/**`
- `css/**`
- `index.html`
- `sql/**`, `supabase/**`
- Auth/RLS, Financial formulas, Investor Hub activation

## Done when

`docs/03-modules/INVESTOR_HUB.md` updated with full ISSUE-013 Phase B plan including:
- Current state map (routing + active functions)
- Target architecture (two surfaces)
- Routing change design (renderInvestorDirectory vs openInvestorHubEntry)
- Data model gaps identified (DB.investors.update, getByInvestor, investorCompanies.update)
- 5 implementation phases with file impact per phase
- Risk table
- Manual QA checklist (8 areas)

## Previous task completed

ISSUE-013 documented — committed bf6b6e6 (2026-06-05)
