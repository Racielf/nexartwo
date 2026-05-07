# Auth/RLS Staging Gate Plan

> **Status:** PLAN ONLY — No RLS applied. No production touched.
> **Gate:** STAGING BACKEND GATE — PASSED. This document governs the next gate: AUTH/RLS STAGING GATE.
> **Date:** 2026-05-07

---

## 1. Executive Summary

NexArtWO uses Supabase from client-side JavaScript with the **anon key** embedded in `js/supabase.js`. This means any user who opens the app in a browser can call the Supabase REST API directly — authenticated only by the anon key. Without Row Level Security (RLS), **every table in the database is fully exposed**: any unauthenticated browser session can read or write all projects, financial summaries, P&L data, investor records, and capital contributions.

The Investor Hub (Phase 2B) contains highly sensitive financial data — capital amounts, investor identities, profit splits, and capital calls. Enabling `INVESTOR_HUB_ENABLED = true` without RLS in place would expose this data to any anonymous session.

**RLS is not optional. It is the real security boundary for this application.**

This document defines the plan to apply and validate Auth/RLS exclusively in `nexartwo-staging` before any production changes.

---

## 2. Current Security Boundary

| Layer | Current State | Risk |
|---|---|---|
| Network | Supabase managed | ✅ |
| API Key | Anon key in client JS | ⚠️ Public by design — RLS must compensate |
| Auth | Supabase Auth available but not enforced | 🔴 No session required |
| RLS | Enabled on financial tables with `FOR ALL USING (true)` per migration 003 | 🔴 Effectively open — no real access control |
| Investor Hub tables | RLS **NOT enabled** in migration 004 | 🔴 Fully open |
| Draft RLS policies | Exist in `supabase/drafts/auth-rls/` | ⏳ Not applied |

**Core risk:** The app uses `supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` in `js/supabase.js:23`. All DB calls run as the `anon` role. Until RLS policies restrict what `anon` and `authenticated` can do per table, the database is effectively public read/write for anyone who discovers the URL and key.

---

## 3. Current Repo Evidence Reviewed

| File / Directory | Purpose |
|---|---|
| `supabase/drafts/auth-rls/DESIGN.md` | Full role model, access matrix, decisions, migration order |
| `supabase/drafts/auth-rls/004a_user_roles_bootstrap.sql` | `user_roles` table + `is_owner()` + `auth_role()` SECURITY DEFINER functions |
| `supabase/drafts/auth-rls/004b_user_roles_policies.sql` | RLS policies for `user_roles` table |
| `supabase/drafts/auth-rls/005_rls_projects.sql` | Granular policies for `projects` + financial field trigger |
| `supabase/drafts/auth-rls/006_rls_expenses_refunds.sql` | `project_expenses` (with `created_by`) + `project_refunds` policies |
| `supabase/drafts/auth-rls/007_rls_disbursements.sql` | `project_disbursements` policies + `paid` status owner-only trigger |
| `supabase/drafts/auth-rls/008_rls_financial_summaries.sql` | REVOKE on `project_financial_summaries` + SECURITY DEFINER RPCs |
| `supabase/drafts/auth-rls/009_project_status_summary_view.sql` | Safe view + RPC for operational status (no financial data) |
| `supabase/drafts/auth-rls/permission_smoke_test.sql` | Draft permission validation tests |
| `supabase/drafts/auth-rls/CHECKLIST.md` | Pre-application checklist |
| `supabase/drafts/auth-rls/ROLLBACK.md` | Rollback procedures |
| `supabase/migrations/20260506_projects_financial_system.sql` | Phase 1 — projects + financial tables (current RLS: `FOR ALL USING (true)`) |
| `supabase/migrations/202605070001_investor_entities.sql` | Phase 2B — Investor Hub tables (RLS status to be confirmed) |
| `js/supabase.js` | Full frontend DB API — direct table access via anon key |
| `.github/workflows/staging-db-qa.yml` | Staging QA pipeline (PASSED) |

---

## 4. Tables Requiring RLS Review

| Table | Feature Area | Current RLS | Risk | Expected Access Model | Staging Validation Required |
|---|---|---|---|---|---|
| `company_settings` | Core | Unknown / open | 🔴 High | owner/admin read-write | ✅ Yes |
| `clients` | Core | Unknown / open | 🔴 High | owner/admin CRUD | ✅ Yes |
| `services` | Core | Unknown / open | 🟡 Medium | owner/admin write, authenticated read | ✅ Yes |
| `work_orders` | Core | Unknown / open | 🔴 High | owner/admin CRUD, field_user own WOs | ✅ Yes |
| `wo_line_items` | Core | Unknown / open | 🟡 Medium | owner/admin/field_user scoped to their WO | ✅ Yes |
| `documents` | Core | Unknown / open | 🟡 Medium | owner/admin CRUD | ✅ Yes |
| `wo_communications` | Core | Unknown / open | 🟡 Medium | owner/admin/field_user scoped | ✅ Yes |
| `change_orders` | Core | Unknown / open | 🟡 Medium | owner/admin CRUD | ✅ Yes |
| `wo_photos` | Core | Unknown / open | 🟡 Medium | owner/admin/field_user scoped | ✅ Yes |
| `projects` | Phase 1 | `FOR ALL USING (true)` | 🔴 High | owner/admin SELECT+INSERT+UPDATE; field_user: blocked | ✅ Yes |
| `project_expenses` | Phase 1 | `FOR ALL USING (true)` | 🔴 High | owner/admin all; field_user own inserts only | ✅ Yes |
| `project_refunds` | Phase 1 | `FOR ALL USING (true)` | 🔴 High | owner/admin only | ✅ Yes |
| `project_disbursements` | Phase 1 | `FOR ALL USING (true)` | 🔴 High | owner/admin; `paid` status owner only | ✅ Yes |
| `project_financial_summaries` | Phase 1 (view) | `FOR ALL USING (true)` | 🔴 Critical | REVOKE all; access via SECURITY DEFINER RPC only | ✅ Yes |
| `investors` | Phase 2B | Unknown / open | 🔴 Critical | owner/admin only | ✅ Yes |
| `investor_companies` | Phase 2B | Unknown / open | 🔴 Critical | owner/admin only | ✅ Yes |
| `project_investors` | Phase 2B | Unknown / open | 🔴 Critical | owner/admin only | ✅ Yes |
| `capital_contributions` | Phase 2B | Unknown / open | 🔴 Critical | owner/admin only; immutability triggers active | ✅ Yes |
| `capital_calls` | Phase 2B | Unknown / open | 🔴 Critical | owner/admin only | ✅ Yes |
| `user_roles` | Auth | Not created yet | 🔴 Critical | `is_owner()` SECURITY DEFINER; no self-recursion | ✅ Yes |

---

## 5. Existing Draft RLS Inventory

All files are in `supabase/drafts/auth-rls/`. **None are applied to any database.**

| File | Status | Protects | Key Design Decision |
|---|---|---|---|
| `004a_user_roles_bootstrap.sql` | Draft — not applied | `user_roles`, `is_owner()`, `auth_role()` | SECURITY DEFINER + `search_path = public, pg_temp` to prevent recursion |
| `004b_user_roles_policies.sql` | Draft — not applied | `user_roles` table policies | Must run AFTER owner is manually bootstrapped in `user_roles` |
| `005_rls_projects.sql` | Draft — not applied | `projects` | Blocks `field_user`/`viewer` from direct SELECT; blocks non-owner from editing financial fields |
| `006_rls_expenses_refunds.sql` | Draft — not applied | `project_expenses`, `project_refunds` | `created_by` column enforcement; field_user sees only own expenses |
| `007_rls_disbursements.sql` | Draft — not applied | `project_disbursements` | `paid` status transition blocked for non-owner via trigger |
| `008_rls_financial_summaries.sql` | Draft — not applied | `project_financial_summaries` (view) | REVOKE all direct access; SECURITY DEFINER RPCs: `get_project_financial_summary()`, `get_all_financial_summaries()` |
| `009_project_status_summary_view.sql` | Draft — not applied | `project_status_summary` | Safe operational view without financial amounts; owner/admin via RPC |
| `permission_smoke_test.sql` | Draft — not applied | Validation | Permission-level tests for all roles |
| `DESIGN.md` | Reference | All | Full role model, access matrix, 14 closed decisions |
| `CHECKLIST.md` | Reference | All | Pre-application checklist |
| `ROLLBACK.md` | Reference | All | Rollback procedures per migration |

> **Critical dependency chain:** `004a` → bootstrap owner manually → `004b` → `005` → `006` → `007` → `008` → `009`. Each step must be verified before proceeding.

---

## 6. Frontend Query Dependency Map

All queries run via `SUPABASE_ANON_KEY` from client-side JS. After RLS is applied, these will break unless the user is authenticated **and** has the correct role.

### `js/supabase.js` — Direct Table Access

| DB Method | Table | Operation | Role Required After RLS | Breaking Risk |
|---|---|---|---|---|
| `DB.clients.getAll()` | `clients` | SELECT `*` | owner/admin | 🔴 Breaks for anon |
| `DB.clients.create()` | `clients` | INSERT | owner/admin | 🔴 Breaks for anon |
| `DB.clients.update()` | `clients` | UPDATE | owner/admin | 🔴 Breaks for anon |
| `DB.clients.delete()` | `clients` | DELETE | owner/admin | 🔴 Breaks for anon |
| `DB.services.getAll()` | `services` | SELECT `*` | authenticated or open | 🟡 Possible break |
| `DB.workOrders.getAll()` | `work_orders` | SELECT `*` | owner/admin | 🔴 Breaks for anon |
| `DB.workOrders.create/update/delete()` | `work_orders` | DML | owner/admin | 🔴 Breaks for anon |
| `DB.company.get()` | `company_settings` | SELECT | owner/admin | 🔴 Breaks for anon |
| `DB.company.save()` | `company_settings` | INSERT/UPDATE | owner/admin | 🔴 Breaks for anon |
| `DB.lineItems.*` | `wo_line_items` | CRUD | owner/admin/field_user | 🟡 Scoped break |
| `DB.documents.*` | `documents` | CRUD | owner/admin | 🔴 Breaks for anon |
| `DB.communications.*` | `wo_communications` | CRUD | owner/admin | 🔴 Breaks for anon |
| `DB.changeOrders.*` | `change_orders` | CRUD | owner/admin | 🔴 Breaks for anon |
| `DB.photos.*` | `wo_photos` | CRUD | owner/admin/field_user | 🟡 Scoped break |
| `DB.projects.getAll()` | `projects` | SELECT `*` | owner/admin | 🔴 Breaks for anon/field_user |
| `DB.projects.getById()` | `projects` | SELECT `*` | owner/admin | 🔴 Breaks for anon |
| `DB.projects.create/update/cancel()` | `projects` | DML | owner/admin | 🔴 Breaks for anon |
| `DB.projectExpenses.*` | `project_expenses` | CRUD | owner/admin/field_user | 🔴 Breaks for anon |
| `DB.projectRefunds.*` | `project_refunds` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.projectDisbursements.*` | `project_disbursements` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.projectFinancialSummaries.getAll()` | `project_financial_summaries` | SELECT `*` | **MUST CHANGE TO RPC** | 🔴 **Blocker** — direct SELECT will be REVOKED |
| `DB.projectFinancialSummaries.getByProject()` | `project_financial_summaries` | SELECT `*` | **MUST CHANGE TO RPC** | 🔴 **Blocker** — direct SELECT will be REVOKED |
| `DB.investors.*` | `investors` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.investorCompanies.*` | `investor_companies` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.projectInvestors.*` | `project_investors` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.capitalContributions.*` | `capital_contributions` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.capitalCalls.*` | `capital_calls` | CRUD | owner/admin only | 🔴 Breaks for anon |
| `DB.seedIfEmpty()` | `services`, `clients`, `work_orders` | SELECT count + INSERT | owner/admin | 🟡 Blocked for anon |

> **Critical pre-RLS JS task (documented, not implemented):**
> `DB.projectFinancialSummaries.getAll()` and `DB.projectFinancialSummaries.getByProject()` use direct `SELECT` on `project_financial_summaries`. After `008_rls_financial_summaries.sql` applies `REVOKE SELECT`, these calls will return 0 rows (or error). They **must be refactored** to call RPCs `get_all_financial_summaries()` and `get_project_financial_summary({ p_project_id })` before migration 008 is applied.

---

## 7. Recommended Staging Application Order

> Apply only to `nexartwo-staging`. Never to production.

| Step | Action | Verification |
|---|---|---|
| 1 | Review all draft files line by line against current migration state | Confirm no conflicts |
| 2 | Confirm `project_expenses` has `created_by UUID` column (required by 006) | Check migration 003 or current schema |
| 3 | Apply `004a_user_roles_bootstrap.sql` to staging via SQL Editor (service_role) | Verify `user_roles` table exists, `is_owner()` returns false |
| 4 | Bootstrap staging owner: `INSERT INTO user_roles VALUES ('<uuid>', 'owner')` | `SELECT is_owner()` returns `true` for that session |
| 5 | Apply `004b_user_roles_policies.sql` | Verify anon cannot read `user_roles` |
| 6 | Apply `005_rls_projects.sql` | Run Projects UI load test; verify owner sees all, anon sees 0 |
| 7 | Apply `006_rls_expenses_refunds.sql` | Run Phase 1 Financial Smoke Test; verify field_user scope |
| 8 | Apply `007_rls_disbursements.sql` | Verify `paid` transition blocked for admin role |
| 9 | **Refactor** `DB.projectFinancialSummaries.*` to use RPCs (JS change required) | Manual code review |
| 10 | Apply `008_rls_financial_summaries.sql` | Verify direct SELECT returns empty; RPC returns data for owner/admin |
| 11 | Apply `009_project_status_summary_view.sql` | Verify operational view accessible via RPC only |
| 12 | Run full Staging DB QA workflow | All 11 steps must PASS |
| 13 | Run `permission_smoke_test.sql` | All permission assertions PASS |
| 14 | Manual negative access checks (see Section 8) | All blocked operations return 0 rows or error |
| 15 | Record PASS and request owner approval for production gate | Do not proceed to production without explicit approval |

---

## 8. Required Staging Validation Tests

### Positive Tests (must succeed)
- Owner can SELECT all projects, financial summaries, investor data
- Owner can INSERT project, expense, refund, disbursement, investor, contribution
- Owner can UPDATE project financial fields
- Owner can mark disbursement as `paid`
- Owner can call `get_all_financial_summaries()` RPC and receive data
- Admin can approve/reject expenses and refunds
- Admin can view projects and financial summaries via RPC
- Field_user can INSERT own expense with correct `created_by`
- Staging DB QA workflow passes all 11 steps after RLS applied

### Negative Tests (must be blocked)
- Anon cannot SELECT `projects` (0 rows returned)
- Anon cannot SELECT `project_financial_summaries` (REVOKED)
- Anon cannot INSERT any financial record
- Field_user cannot SELECT `projects` directly (0 rows)
- Field_user cannot SELECT `project_refunds` or `project_disbursements`
- Field_user cannot INSERT expense with another user's `created_by`
- Field_user cannot approve own expense
- Admin cannot mark disbursement as `paid` (trigger block)
- Admin cannot UPDATE `purchase_price`, `down_payment`, or financial fields in `projects`
- Any role cannot DELETE from `project_expenses`, `project_refunds`, `project_disbursements`, or `capital_contributions` (trigger block)
- Any role cannot UPDATE `amount` or `tax` on financial records (trigger block)
- Direct SELECT on `project_financial_summaries` by anon/authenticated returns 0 rows (REVOKED)

### Frontend Load Tests
- Projects tab loads without JS error for authenticated owner session
- Financial summaries load via RPC (after JS refactor) for owner session
- Expense creation flow works end-to-end for owner
- Work Orders tab loads for owner session
- App does NOT crash if user is unauthenticated (graceful fallback to localStorage)

### Investor Hub Access Checks
- `investors` table: anon SELECT returns 0 rows
- `capital_contributions` table: anon SELECT returns 0 rows
- `capital_calls` table: anon SELECT returns 0 rows
- All Investor Hub smoke tests pass with authenticated owner session

### Phase 1 Regression Checks
- `qa/financial_system_smoke_test.sql` PASSES after each migration step
- `project_financial_summaries` view remains intact (STEP 9 of Staging DB QA)
- All 5 Phase 2B tables still exist (STEP 10 of Staging DB QA)

---

## 9. Blockers Before Applying RLS

The following decisions and prerequisites must be resolved before any RLS migration is applied to staging:

| # | Blocker | Type | Impact |
|---|---|---|---|
| 1 | **Owner UUID not confirmed for staging** | Config | Cannot bootstrap `user_roles` without the owner's `auth.uid()` in staging |
| 2 | **Auth not enforced in app** — app currently operates without login | Architecture | All RLS policies targeting `authenticated` role will block all current users |
| 3 | **`project_expenses.created_by` column existence** | Schema | Migration 006 requires this column; must verify it exists in current schema |
| 4 | **`DB.projectFinancialSummaries.*` JS refactor** | Code | Direct SELECT must be replaced with RPC calls before migration 008 |
| 5 | **Single-tenant vs multi-user model decision** | Design | Current app appears single-company; affects whether `viewer` and `field_user` roles are needed now |
| 6 | **Anonymous access policy** | Security | Is anon read access acceptable for any table (e.g., `services`)? |
| 7 | **Service role key management** | Security | Required for bootstrap step; must not be stored in client JS |
| 8 | **`viewer` role scope** | Design | DESIGN.md marks this as an open decision (#1) |

---

## 10. Risk Matrix

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Client-side DB access without RLS exposes all data | 🔴 Critical | Certain (current state) | Apply RLS staging gate before any feature activation |
| Investor Hub activated without RLS — investor + financial data exposed | 🔴 Critical | High if `INVESTOR_HUB_ENABLED` flipped | Gate: RLS staging gate must PASS before enabling |
| `project_financial_summaries` P&L data exposed to any anon session | 🔴 Critical | Certain (current state) | Apply 008 + JS refactor; REVOKE direct SELECT |
| RLS policies too restrictive — breaks existing UI flows | 🟠 High | Medium | Run frontend load tests after each migration step; have ROLLBACK.md ready |
| RLS policies too permissive — false confidence | 🟠 High | Low (drafts appear correct) | Run full negative test suite before declaring gate PASS |
| Self-recursion in `user_roles` policies | 🔴 Critical | Low (resolved in DESIGN.md) | `is_owner()` SECURITY DEFINER bypasses RLS — already designed |
| Migration applied to production before staging validation | 🔴 Critical | Low (gated by GitHub Environment) | Production GitHub Environment requires reviewer; never push migrations to production directly |
| `created_by` column missing from `project_expenses` | 🟠 High | Unknown | Verify schema before applying 006 |
| Owner UUID not available at bootstrap time | 🟡 Medium | Medium | Confirm auth.users in staging before beginning |
| JS `DB.projectFinancialSummaries.*` refactor not done before 008 | 🔴 Critical | High if order not followed | Enforce JS refactor as a gate before applying 008 |

---

## 11. Proposed RLS Gate Criteria

The AUTH/RLS STAGING GATE is declared **PASS** when ALL of the following are verified:

- [ ] All 6 RLS migrations (004a through 009) applied to `nexartwo-staging` only
- [ ] Owner manually bootstrapped in `user_roles` table in staging
- [ ] `is_owner()` returns `true` for the staging owner session
- [ ] `DB.projectFinancialSummaries.*` refactored to use RPCs in JS (before 008 applied)
- [ ] All positive tests pass (see Section 8)
- [ ] All negative tests pass — anon/field_user/admin cannot access restricted data
- [ ] Staging DB QA workflow passes all 11 steps with RLS active
- [ ] `permission_smoke_test.sql` passes all assertions
- [ ] Frontend core flows (Projects, Work Orders, Expenses) load without error for authenticated owner
- [ ] No production database touched
- [ ] Owner approval recorded in writing before production gate is planned

---

## 12. Explicit Non-Authorization Clause

> [!CAUTION]
> **Passing this planning document does NOT authorize applying RLS to production.**
>
> **Passing this planning document does NOT authorize enabling Investor Hub.**
>
> **`INVESTOR_HUB_ENABLED` must remain `false` until the Auth/RLS Staging Gate declares PASS and owner approval is recorded.**
>
> Production remains blocked until:
> 1. The Auth/RLS Staging Gate passes all criteria in Section 11.
> 2. Owner provides explicit written approval for each production action.
> 3. A separate Production RLS Gate plan is created and reviewed.

---

## 13. Owner Decisions Required

The following questions must be answered by the owner before RLS application begins:

| # | Question | Why It Matters |
|---|---|---|
| 1 | **What is the owner's `auth.uid()` in `nexartwo-staging`?** | Required for the `user_roles` bootstrap INSERT |
| 2 | **Is the app intended to require login for all access?** | If yes, all anon queries will break; a login gate must be added to the app first |
| 3 | **Are `admin`, `field_user`, and `viewer` roles needed now, or only `owner`?** | Determines scope of initial RLS rollout |
| 4 | **Should `services` be readable by anon (public catalog) or restricted?** | Affects policy for `services` table |
| 5 | **Does `project_expenses` have a `created_by` column in the current schema?** | Required for migration 006; if missing, a schema migration is needed first |
| 6 | **Is there a staging Supabase Auth user set up for testing non-owner roles?** | Required for negative access tests |
| 7 | **Should the viewer (external accountant) have P&L access via RPC?** | Open decision #1 in DESIGN.md |
| 8 | **When is the JS refactor for `projectFinancialSummaries` authorized?** | Must happen before migration 008 is applied |

---

## 14. Final Recommendation

The Auth/RLS drafts in `supabase/drafts/auth-rls/` are technically sound:
- Anti-recursion architecture via `SECURITY DEFINER` is correct
- Migration order dependency chain is well-defined
- All files are idempotent (safe for retries)
- Rollback procedures exist

**However, the following must happen before any migration is applied to staging:**

1. **Resolve Blocker #2 first:** The app currently operates without authentication. Applying RLS while the frontend still uses the anon key without a session will break every DB call. The owner must decide: add a login gate to the app first, or proceed with RLS knowing the app will be partially broken until auth is wired.

2. **Resolve Blocker #4:** The JS refactor for `project_financial_summaries` must be planned and authorized before migration 008 is applied.

3. **Confirm Blocker #3:** Verify `created_by UUID` column exists in `project_expenses` before applying migration 006.

**Recommended immediate next action:** Owner answers the questions in Section 13. No code changes until answers are received.

---

*Document created: 2026-05-07*
*Branch: docs/auth-rls-staging-gate-plan*
*Evidence reviewed: supabase/drafts/auth-rls/ (11 files), js/supabase.js (937 lines), supabase/migrations/ (2 files)*
*Author: Antigravity Senior DevOps/Security Engineer*
