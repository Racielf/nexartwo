# Auth/RLS 009 Restricted Views Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Step 009 of Auth/RLS Hardening.

---

## 1. Purpose

This plan defines the creation of the `project_status_summary` view in `nexartwo-staging`. This view provides high-level operational metrics (expense counts, activity dates) without exposing sensitive financial amounts. Access is strictly gated via a secure RPC, restricted to `owner` and `admin` roles, to prevent metadata leakage to unassigned users.

---

## 2. Prerequisites Verification

| Requirement | Status | Verification |
|---|---|---|
| 004a–008 Hardening | ✅ PASS | Confirmed in 008 record. |
| Core Tables (`projects`, etc.) | ✅ Exists | Verified in previous phases. |
| `auth_role()` function | ✅ PASS | Essential for RPC gate logic. |

---

## 3. Design Strategy: Operational Summary

This step follows the "Gated View" pattern established in Step 008:

1. **Operational View**: `project_status_summary` aggregates counts and dates from `project_expenses` and `project_refunds`. It explicitly **excludes** all currency/amount fields.
2. **Access Revocation**: Direct `SELECT` on the view is revoked for all standard roles.
3. **RPC Gateway**: Access is provided only through `get_project_status_summary()`.
4. **Initial Restriction**: Currently, only `owner` and `admin` roles can retrieve data. This is a deliberate choice until a `project_assignments` system is implemented (planned for 010+).

---

## 4. Operational Script (Staging Only)

The file `qa/auth_rls_009_restricted_views_staging.sql` contains:
1. **Pre-flight Checks**: Verify prerequisites and dependency tables.
2. **View Creation**: Implement the `project_status_summary` join logic.
3. **Revocation**: Remove direct view access.
4. **RPC Creation**: Implement `get_project_status_summary()` with `SECURITY DEFINER`.
5. **Granting**: Allow execution for authenticated users.
6. **Verification**: Confirm view and function metadata.

---

## 5. Verification Steps (After Manual Execution)

1. **Verify View exists:**
   ```sql
   SELECT table_name 
   FROM information_schema.views 
   WHERE table_name = 'project_status_summary';
   ```
2. **Verify Functions exist:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'get_project_status_summary';
   ```
3. **Access Check (service_role):**
   ```sql
   -- Direct select should work for superuser but fail for others
   SELECT * FROM project_status_summary LIMIT 1;
   ```

---

## 6. Safety Confirmations

- **Production:** Strictly prohibited.
- **Investor Hub:** Remains disabled.
- **Data Leakage:** No financial `amount` or `total` fields are present in this view.
- **JS Blockers:** None found. This view is new and not yet called by `js/supabase.js`.

---

## 7. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing SQL against any database.
> - Applying RLS to production.
>
> This document only authorizes the creation of the plan and the verification script for review.

---
*Created by: Antigravity Senior Security Engineer*
*Source draft: supabase/drafts/auth-rls/009_project_status_summary_view.sql*
