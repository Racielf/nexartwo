# Auth/RLS Owner Decisions

> **Status:** Decisions recorded — NOT yet implemented.
> **Date:** 2026-05-07
> **Reference:** docs/AUTH_RLS_STAGING_GATE_PLAN.md (merged in PR #13)

---

## 1. Purpose

This document records the owner's formal decisions on the open questions identified in `AUTH_RLS_STAGING_GATE_PLAN.md` Section 13 before Auth/RLS is applied to the `nexartwo-staging` environment.

These decisions define the initial Auth/RLS strategy, scope, and staging rollout sequence. No decision recorded here authorizes any database change, code change, or production action. All implementation remains gated on subsequent explicit approvals.

---

## 2. Current Gate Status

| Gate | Status |
|---|---|
| Staging Backend Gate | ✅ PASSED |
| Phase 1 Financial Smoke Test | ✅ PASSED |
| Investor Hub Smoke Test | ✅ PASSED |
| Auth/RLS Staging Gate Plan | ✅ Merged to `main` (PR #13) |
| Auth/RLS Applied to Staging | ❌ NOT APPLIED |
| Auth/RLS Applied to Production | ❌ NOT APPLIED |
| Investor Hub Activated | ❌ NO |
| `INVESTOR_HUB_ENABLED` | ❌ `false` — unchanged |
| Production Touched | ❌ NO |

---

## 3. Owner Decisions Table

| # | Question | Decision | Status | Implementation Implication |
|---|---|---|---|---|
| 1 | What is the owner's `auth.uid()` in `nexartwo-staging`? | **Pending** — will be obtained when the owner creates/signs in to Supabase Auth staging | 🔴 Blocker | Cannot run `004a` bootstrap INSERT until this UUID is confirmed |
| 2 | Should the app require login for all access? | **Yes — phased rollout:** staging first, then production. Current production access must not break during staging phase. | ✅ Decided | A login gate will be added to the app; staging environment first, production gated separately |
| 3 | Which roles are in scope for the initial RLS rollout? | **Owner only.** `admin`, `field_user`, `viewer` are deferred to future phases. | ✅ Decided | Simplifies migrations 004a/004b/005-009: only `owner` policies need validation in initial gate. Policies for other roles can remain drafted but unused. |
| 4 | Should `services` table be publicly readable (anon)? | **No.** Keep `services` restricted until a public catalog use case is explicitly approved. | ✅ Decided | `services` SELECT policy will require `authenticated` role at minimum |
| 5 | Does `project_expenses` have a `created_by UUID` column? | **Pending technical verification** before migration 006 is applied. | 🔴 Blocker | Must run `SELECT column_name FROM information_schema.columns WHERE table_name='project_expenses'` in staging before applying migration 006 |
| 6 | Are non-owner staging test users set up? | **No.** Create after owner access is validated in staging. | 🟡 Deferred | Negative access tests for `admin`/`field_user`/`viewer` are deferred to Phase 2 of RLS gate |
| 7 | Should the `viewer` (external accountant) have P&L access via RPC? | **No.** Blocked until explicit owner approval. | ✅ Decided (block) | `get_all_financial_summaries()` and `get_project_financial_summary()` RPCs remain restricted to `owner` only in initial rollout |
| 8 | Is the `projectFinancialSummaries` RPC refactor in `js/supabase.js` authorized? | **Yes — authorized to plan and implement in staging.** Must be done before migration 008 is applied. Does NOT activate Investor Hub. Does NOT change `INVESTOR_HUB_ENABLED`. | ✅ Authorized (staging only) | `DB.projectFinancialSummaries.getAll()` and `.getByProject()` must be refactored from direct `SELECT` to RPC calls before `008_rls_financial_summaries.sql` is applied |

---

## 4. Approved Initial Auth/RLS Strategy

The owner has approved the following high-level strategy for the initial Auth/RLS staging gate:

### owner-first
Only the `owner` role will be bootstrapped and validated in the initial rollout. Policies for `admin`, `field_user`, and `viewer` exist in the drafts but will not be exercised in Phase 1 validation. This minimizes risk of breaking the app while establishing the foundational security layer.

### staging-first
All RLS migrations will be applied exclusively to `nexartwo-staging`. No migration will be applied to the production Supabase project until the Auth/RLS Staging Gate declares PASS with owner sign-off.

### no production changes
Production database, production secrets, and production GitHub Environment are off-limits until a separate production gate plan is created and approved.

### no Investor Hub activation
`INVESTOR_HUB_ENABLED` must remain `false` throughout the Auth/RLS staging gate process. Investor Hub activation requires a separate gate that depends on this gate passing first.

### no anonymous DB access long term
The app will ultimately require authentication for all database access. The `anon` role will not be granted meaningful table access after RLS is applied. The transition will be staged to avoid breaking existing workflows during rollout.

### login required — staged rollout
The app will be modified to require authentication, but this change will be applied in stages:
1. Staging environment first — validate login gate without impacting production users.
2. Production — only after staging validation passes and owner approves.

---

## 5. Blockers Remaining

The following items must be resolved before Auth/RLS can be applied to staging:

| # | Blocker | Type | Resolution Path |
|---|---|---|---|
| 1 | **Owner `auth.uid()` in staging not yet confirmed** | Config | Owner creates or signs in to a Supabase Auth account in `nexartwo-staging`; UUID retrieved via `SELECT id, email FROM auth.users` in staging SQL Editor |
| 2 | **`project_expenses.created_by` column existence not verified** | Schema | Run schema inspection query in staging before applying migration 006 |
| 3 | **Supabase Auth staging user not set up** | Config | Required for positive access tests with owner session; non-owner users deferred |
| 4 | **`projectFinancialSummaries` RPC refactor not yet implemented** | Code | Authorized (Decision #8); must be planned and applied before migration 008 |
| 5 | **`permission_smoke_test.sql` not yet validated against current schema** | QA | Review draft smoke test against actual table structure after migrations 004a-009 are applied |
| 6 | **Staging RLS application sequence not scheduled** | Process | Requires Blockers 1–3 resolved first |

---

## 6. Next Technical Step

Once the owner provides the staging `auth.uid()` (Blocker 1), the recommended sequence is:

1. **Schema compatibility check** — Verify current staging schema against all RLS draft files:
   - Confirm `project_expenses.created_by UUID` column exists (migration 006 dependency)
   - Confirm all tables targeted by migrations 004a–009 exist in staging
   - Identify any column or constraint conflicts

2. **`projectFinancialSummaries` RPC refactor** — Plan and implement the JS changes in `js/supabase.js`:
   - Replace `DB.projectFinancialSummaries.getAll()` → call `get_all_financial_summaries()` RPC
   - Replace `DB.projectFinancialSummaries.getByProject()` → call `get_project_financial_summary({ p_project_id })` RPC
   - Apply to staging app only initially
   - Does not activate Investor Hub
   - Does not change `INVESTOR_HUB_ENABLED`

3. **Staging RLS application** — Apply migrations in order per `AUTH_RLS_STAGING_GATE_PLAN.md` Section 7:
   - `004a` → bootstrap owner → `004b` → `005` → `006` → `007` → JS refactor → `008` → `009`

4. **Validation** — Run all positive/negative tests from `AUTH_RLS_STAGING_GATE_PLAN.md` Section 8 plus `permission_smoke_test.sql`

5. **Staging DB QA** — Run full Staging DB QA workflow after RLS is applied to confirm all 11 steps still PASS

---

## 7. Non-Authorization Clause

> [!CAUTION]
> **This document does not authorize applying RLS to any database (staging or production).**
>
> **This document does not authorize touching production.**
>
> **This document does not authorize enabling Investor Hub.**
>
> **`INVESTOR_HUB_ENABLED` must remain `false`.**
>
> Actions authorized by this document are limited to:
> - Recording owner decisions (this document)
> - Planning the `projectFinancialSummaries` RPC refactor (staging only)
> - Schema compatibility verification (read-only queries in staging)
>
> All RLS application, login gate implementation, and production changes require separate explicit owner approval recorded in writing before each action.

---

*Document created: 2026-05-07*
*Branch: docs/auth-rls-owner-decisions*
*Based on: docs/AUTH_RLS_STAGING_GATE_PLAN.md*
*Author: Antigravity Senior Security Engineer*
