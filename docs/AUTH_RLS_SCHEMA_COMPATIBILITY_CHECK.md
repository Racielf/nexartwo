# Auth/RLS Schema Compatibility Check

## 1. Executive Summary
- **Staging Readiness:** STAGING IS **NOT READY** FOR RLS APPLICATION.
- **Key Blockers:**
  1. **Owner Auth User:** No automated access to `auth.users` confirmed. Owner must manually verify the existence of a testing user in staging.
  2. **`project_expenses.created_by`:** Column presence is unconfirmed.
  3. **JS RPC Refactor:** Frontend still uses direct `SELECT` on financial views, which will break upon RLS application.
- **Recommended Next Step:** Owner manual verification using the provided SQL script in the Supabase SQL Editor.

## 2. Scope
- **Read-only / Documentation-only:** This check identifies dependencies without making changes.
- **No RLS applied:** Existing RLS states remain untouched.
- **No production touched:** All analysis is targeted at `nexartwo-staging`.
- **No Investor Hub activation:** `INVESTOR_HUB_ENABLED` remains `false`.

## 3. Evidence Reviewed
- `docs/AUTH_RLS_STAGING_GATE_PLAN.md`
- `docs/AUTH_RLS_OWNER_DECISIONS.md`
- `supabase/drafts/auth-rls/` (004a–009)
- `js/supabase.js`
- `supabase/migrations/`

## 4. Staging Read-Only Verification Status
- **Automated execution:** FAILED (Local `psql` client not available in current environment).
- **Owner Manual Verification Required:** ✅ **YES**.
- **Queries prepared:** `qa/auth_rls_schema_compatibility_queries.sql` contains the exact read-only queries for the owner.

## 5. Required Schema Compatibility Matrix

| Requirement | Source Draft | Expected Object | Current Status | Blocker | Notes |
|---|---|---|---|---|---|
| auth.users owner exists | 004a (Bootstrap) | Record in `auth.users` | UNKNOWN | 🔴 YES | Required for `user_roles` INSERT |
| user_roles table | 004a | `public.user_roles` | UNKNOWN | 🔴 YES | Created by 004a |
| is_owner() function | 004a | `public.is_owner()` | UNKNOWN | 🔴 YES | Created by 004a |
| auth_role() function | 004a | `public.auth_role()` | UNKNOWN | 🔴 YES | Created by 004a |
| projects table | 005 | `public.projects` | ✅ LIKELY | ❌ No | Exists since Migration 003 |
| created_by column | 006 | `project_expenses.created_by` | UNKNOWN | 🔴 YES | Required for RLS scope |
| project_refunds table | 006 | `public.project_refunds` | ✅ LIKELY | ❌ No | Exists since Migration 003 |
| project_disbursements | 007 | `public.project_disbursements` | ✅ LIKELY | ❌ No | Exists since Migration 003 |
| project_financial_summaries | 008 | `public.project_financial_summaries` | ✅ LIKELY | ❌ No | View exists since Migration 003 |
| get_all_financial_summaries() | 008 | RPC (Function) | UNKNOWN | 🔴 YES | Created by 008 |
| get_project_financial_summary() | 008 | RPC (Function) | UNKNOWN | 🔴 YES | Created by 008 |
| investors table | Migr. 20260507 | `public.investors` | ✅ LIKELY | ❌ No | Created in latest migration |
| investor_companies | Migr. 20260507 | `public.investor_companies` | ✅ LIKELY | ❌ No | Created in latest migration |
| project_investors | Migr. 20260507 | `public.project_investors` | ✅ LIKELY | ❌ No | Created in latest migration |
| capital_contributions | Migr. 20260507 | `public.capital_contributions` | ✅ LIKELY | ❌ No | Created in latest migration |
| capital_calls | Migr. 20260507 | `public.capital_calls` | ✅ LIKELY | ❌ No | Created in latest migration |

## 6. Draft Migration Dependency Review
- **004a Dependency:** Requires a valid `UUID` from `auth.users`. **RISK:** If applied without an owner UUID, the database remains locked for the frontend.
- **006 Dependency:** Requires `project_expenses.created_by`. **RISK:** If missing, migration 006 will FAIL during deployment.
- **008 Dependency:** Requires frontend refactor. **RISK:** If applied before JS refactor, the Financial Summary UI will show empty data.

## 7. Frontend Compatibility Notes
- **Direct SELECT Refactor:** `DB.projectFinancialSummaries.getAll()` and `.getByProject()` in `js/supabase.js` MUST be updated to use the new RPCs provided in migration 008.
- **No JS changes:** No frontend modifications are made in this task.
- **Investor Hub:** Remains disabled (`INVESTOR_HUB_ENABLED = false`).

## 8. Blockers
1. **Staging Owner auth.uid():** Missing UUID for `user_roles` bootstrap.
2. **Column Verification:** `project_expenses.created_by` presence not confirmed via SQL.
3. **JS RPC Refactor:** Frontend code not yet compatible with RLS view restrictions.
4. **Environment Check:** `psql` unavailable for automated local verification.

## 9. Recommended Next Step
**B. BLOCKED — OWNER MANUAL AUTH SETUP REQUIRED**

The owner should execute the queries in `qa/auth_rls_schema_compatibility_queries.sql` within the Supabase SQL Editor for the staging project and report the findings.

## 10. Non-Authorization Clause

> [!CAUTION]
> **This document does not authorize applying RLS.**
>
> **This document does not authorize touching production.**
>
> **This document does not authorize enabling Investor Hub.**
>
> **`INVESTOR_HUB_ENABLED` must remain `false`.**

---
*Created: 2026-05-07*
*Author: Antigravity Senior Security Engineer*
