# AGENT_HANDOFF — NexArtWO

## Last completed action

ISSUE-013 Phase 2A.2 — Schema alignment migration applied to staging and production (2026-06-06).
Migration file created locally: `supabase/migrations/20260606_phase2a2_schema_alignment.sql`

Changes applied to both staging (switwhrtgcooemaqlmbw) and production (udaeifoibydcokefcmbg):
- project_investors.status default fixed: 'active' → 'pending'
- project_investors.status SET NOT NULL
- project_investors CHECK constraint: ('pending','confirmed','cancelled') NOT VALID
- project_investors.capital_commitment NUMERIC(12,2) NOT NULL DEFAULT 0 — added
- investor_companies: address, address2, city, zip, website, contact_role, ein_tax_id — all added
- All 4 production rows (status='confirmed') confirmed untouched post-migration

## Code changes staged (not committed)

Four groups of changes in js/supabase.js + one in js/projects.js, all uncommitted:

1. `js/supabase.js` — BUG-001: DB.services.delete(id)
   - Method missing, caused TypeError on service delete. Added after bulkInsert.

2. `js/supabase.js` — ISSUE-013 Phase 2A.1: 3 new DB methods
   - DB.investors.update(id, changes) — allowlist: name/email/phone/notes
   - DB.investorCompanies.update(id, changes) — allowlist: 7 confirmed fields
   - DB.projectInvestors.getByInvestor(investorId) — read-only, joins projects(id,name,status)

3. `js/supabase.js` — BUG-005: PGRST202 fallback in projectFinancialSummaries
   - getAll(): if RPC 'get_all_financial_summaries' returns PGRST202, falls back to direct SELECT
   - getByProject(): same pattern, adds .eq('project_id', projectId).single()
   - Comment: TEMPORARY pre-008 fallback. Remove after Auth/RLS 008 is applied.

4. `js/projects.js` — ISSUE-013 Phase 1 Non-Destructive UI Alignment (3 label changes)
   - "Edit" → "Edit Project" in projectsModuleShellHtml()
   - openAddInvestorModal() label: "New Investor Name" → "Name"
   - openAddInvestorModal() note: now shows actual project name via projectDisplayName()

5. `supabase/migrations/20260606_phase2a2_schema_alignment.sql` — new file (untracked)
   - Records the Phase 2A.2 migration already applied to staging + production

Last code commit: f124e11 (ISSUE-009 modal width fix, pushed).

## Canonical column names (owner-confirmed 2026-06-06)

| Field | Column | Table |
|---|---|---|
| First name | first_name | investors |
| Last name | last_name | investors |
| Personal address | address | investors |
| Personal city | city | investors |
| Personal state | state_addr | investors |
| Personal ZIP | zip | investors |
| Entity type | entity_type | investors |
| Investment profile | investment_profile | investors |
| Accredited investor | accredited_investor | investors (boolean) |
| Source of capital | capital_source | investors |
| Personal tax ID / SSN | tax_id | investors |
| Signed agreement | signed_agreement | investors (boolean) |
| First contact date | first_contact_date | investors (date) |
| Owner private notes | owner_notes | investors |
| Company EIN | ein_tax_id | investor_companies |
| Company address | address | investor_companies |
| Company address 2 | address2 | investor_companies |
| Company city | city | investor_companies |
| Company ZIP | zip | investor_companies |
| Company website | website | investor_companies |
| Contact person role | contact_role | investor_companies |
| Capital committed | capital_commitment | project_investors |

Do NOT create: address_line1, state (on investors), source_of_capital, ein_tax_id (on investors).

## Next task: Phase 2B — DB layer update

Update js/supabase.js DB methods to send canonical column names:
- DB.investors.create() — add 14 new KYC fields
- DB.investors.update() allowlist — expand to include new fields
- DB.investorCompanies.create() — add 7 new address/contact fields
- DB.investorCompanies.update() allowlist — expand
- DB.projectInvestors.attach() — add capital_commitment

Requires GO before implementation.

## Open issues

### P1 — ISSUE-013: Add Investor Wizard v2
Schema Phase 2A.2 complete. Phase 2B (DB methods) next.
Phase 2C (Wizard UI in projects.js) blocked until Phase 2B complete.
Wizard v2 plan documented in session context.
KYC fields already in DB (applied by prior agent, adopted as canonical).
Company address fields now in DB (Phase 2A.2).
capital_commitment now in DB (Phase 2A.2).

### P1 — BUG-005: Missing Supabase RPC get_all_financial_summaries
PGRST202 error on financial summary load. JS fallback added (uncommitted).
Root cause: Auth/RLS 008 migration never applied to production.
The fallback is TEMPORARY — remove after Auth/RLS 008 is applied.
Full fix requires: Auth/RLS GO + apply supabase/drafts/auth-rls/008_rls_financial_summaries.sql.

### P2 — ISSUE-012: WO recipient must support Client or Investor
Business requirement documented. Future model: recipient_type / recipient_id / recipient_name.
Legacy wo.client / wo.clientId fields kept for backward compat until formal migration.
Do not implement until owner approves. Do not touch Supabase schema yet.

### P2 — ISSUE-011: INP ~3719ms on nav-item — AUDIT COMPLETE
Root cause: synchronous render pipeline + lucide.createIcons() called 3× (projects) / 2× (dashboard) per nav.
Redundant call at app.js:362 confirmed.
Fix 1 (safe): delete app.js:362 lucide.createIcons() — awaiting owner approval.
Fix 2 (medium risk): defer render in setTimeout — only if Fix 1 insufficient.

### P2 — ISSUE-008: Work Order delete failure
Supabase/database error when attempting WO delete.
NOT a regression. Separate investigation required.
Must read STOP_CONDITIONS and skills/codex-fix/SKILL.md before touching Supabase.

### P2 — ISSUE-010: No safe project archive/cancel action
Business rule: hard delete PROHIBITED for projects with history.
Requires owner spec on Archive/Cancel/Void workflow before implementation.

### P3 — BUG-001: DB.services.delete missing — FIXED (uncommitted)
Added in js/supabase.js. Awaiting commit GO.

## Do not do next

Do not implement ISSUE-011 Fix 1 or Fix 2 without explicit owner GO.
Do not investigate ISSUE-008 (Supabase) without reading STOP_CONDITIONS first.
Do not implement archive/delete for projects without owner spec.
Do not apply Auth/RLS 008 without explicit GO.
Do not remove BUG-005 fallback until Auth/RLS 008 is confirmed applied to production.
Do not touch tax_notes column (production-only, unknown origin, not propagated).
Do not create address_line1, state (on investors), source_of_capital — use canonical names.
