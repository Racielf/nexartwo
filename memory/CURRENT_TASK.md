# CURRENT_TASK — NexArtWO

## Task

ISSUE-013 Phase 2B — Update DB layer methods in js/supabase.js to use Phase 2A.2 canonical column names.

## Phase

Phase 2A.2 schema migration complete (staging + production). Next: Phase 2B DB layer.

## Objective

Update `js/supabase.js` DB methods to send the new KYC fields when creating/updating investors and companies:

### DB.investors.create() — add to INSERT payload
- first_name, last_name, address, city, state_addr, zip
- entity_type, investment_profile, accredited_investor
- capital_source, tax_id, signed_agreement, first_contact_date, owner_notes

### DB.investors.update() — expand allowlist
Current: name, email, phone, notes
Add: first_name, last_name, address, city, state_addr, zip, entity_type, investment_profile,
     accredited_investor, capital_source, tax_id, signed_agreement, first_contact_date, owner_notes

### DB.investorCompanies.create() — add to INSERT payload
- address, address2, city, zip, website, contact_role, ein_tax_id

### DB.investorCompanies.update() — expand allowlist
Current: company_name, contact_person, email, phone, license_number, state, notes
Add: address, address2, city, zip, website, contact_role, ein_tax_id

### DB.projectInvestors.attach() — add capital_commitment
- capital_commitment NUMERIC(12,2), default 0

## Canonical column names (owner-confirmed 2026-06-06)

| Field | Column | Table |
|---|---|---|
| Personal address | address | investors |
| Personal state | state_addr | investors |
| Source of capital | capital_source | investors |
| Personal tax ID | tax_id | investors |
| Company EIN | ein_tax_id | investor_companies |

Do NOT create: address_line1, state (on investors), source_of_capital, ein_tax_id (on investors).

## Code currently uncommitted

All in js/supabase.js (single file, multiple changes):
- BUG-001: DB.services.delete(id) — added
- Phase 2A.1: DB.investors.update(), DB.investorCompanies.update(), DB.projectInvestors.getByInvestor() — added
- BUG-005: DB.projectFinancialSummaries.getAll/getByProject() PGRST202 fallback — added

Also uncommitted:
- js/projects.js — ISSUE-013 Phase 1 Non-Destructive UI Alignment (3 label changes)
- supabase/migrations/20260606_phase2a2_schema_alignment.sql — new file (migration already applied to staging + production)

## Supabase schema status (as of 2026-06-06)

Phase 2A.2 migration applied to BOTH staging and production:
- project_investors.status default: 'pending' ✅
- project_investors.capital_commitment: NUMERIC(12,2) NOT NULL DEFAULT 0 ✅
- investor_companies: address, address2, city, zip, website, contact_role, ein_tax_id ✅
- CHECK constraint project_investors_status_check: pending/confirmed/cancelled ✅

## Allowed files for Phase 2B

- js/supabase.js — DB methods only
- memory/CURRENT_TASK.md
- memory/SESSION_LOG.md
- memory/AGENT_HANDOFF.md

## Forbidden files

- js/projects.js — no UI changes in Phase 2B
- js/app.js
- css/**
- index.html
- supabase/** — no new migrations until separate GO
- Auth/RLS, Financial formulas, Investor Hub activation

## Done when

js/supabase.js DB methods accept and send all Phase 2A.2 canonical column names.
node --check js/supabase.js passes.
No other files modified.
