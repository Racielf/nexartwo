# Auth/RLS 004b User Roles Policies Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Step 2 of 2 (User Roles Hardening)

---

## 1. Purpose

This plan defines the application of Row Level Security (RLS) policies to the `user_roles` table in `nexartwo-staging`. At this stage, user_roles has RLS enabled and owner bootstrap completed, but owner-only policies are not applied yet. Applying these policies will transform it into a protected administrative table where only users with the `owner` role can manage permissions.

---

## 2. Current State Verification (Staging)

| Requirement | Status | Verification Method |
|---|---|---|
| `user_roles` table | ✅ Exists | `SELECT table_name FROM information_schema.tables...` |
| RLS Enabled | ✅ True | `SELECT rowsecurity FROM pg_tables...` |
| Owner Bootstrapped | ✅ Confirmed | `SELECT count(*) FROM user_roles WHERE role = 'owner'` |
| `is_owner()` function | ✅ Exists | `SELECT is_owner()` (SECURITY DEFINER) |
| `auth_role()` function | ✅ Exists | `SELECT auth_role()` (SECURITY DEFINER) |

---

## 3. Policy Design

Based on `supabase/drafts/auth-rls/004b_user_roles_policies.sql`, the following policies will be applied:

| Policy Name | Operation | Definition | Rationale |
|---|---|---|---|
| `user_roles_select` | SELECT | `USING ( is_owner() )` | Only owners can list all roles. Non-owners use `auth_role()` (SecDef) to check their own role. |
| `user_roles_insert` | INSERT | `WITH CHECK ( is_owner() )` | Only owners can grant roles to new users. |
| `user_roles_update` | UPDATE | `USING ( is_owner() )` | Only owners can change user roles. |
| `user_roles_delete` | DELETE | `USING ( is_owner() )` | Only owners can revoke roles. |

### Technical Decision: Recursion Prevention
The `is_owner()` function is defined with `SECURITY DEFINER` and `SET search_path = public`. This is critical because:
1. It bypasses RLS when checking the `user_roles` table.
2. It prevents infinite recursion (RLS policy calling a function that triggers RLS).

---

## 4. Operational Script (Staging Only)

The file `qa/auth_rls_004b_user_roles_policies_staging.sql` contains the idempotent commands to apply these policies.

### Pre-flight Gate
Before execution, the script verifies that at least one owner exists. **Applying policies without an owner would lock the table permanently for all authenticated users.**

---

## 5. Verification Steps

After manual application in Supabase SQL Editor:

1. **Verify Policies and Data (Primary Verification):**
   - Execute the following to confirm policies are active:
     ```sql
     SELECT policyname, cmd, qual, with_check 
     FROM pg_policies 
     WHERE tablename = 'user_roles';
     ```
   - Execute the following to confirm the owner row exists (using `service_role` or authorized context):
     ```sql
     SELECT user_id, role FROM user_roles;
     ```

2. **Optional Authenticated Owner-Session Verification:**
   > [!IMPORTANT]
   > The following queries require an active authenticated session as the owner (e.g., via a frontend login or a test session with `auth.uid()` set). They will NOT return expected results when run in the Supabase SQL Editor using the `service_role` key because `auth.uid()` is null in that context.
   - Execute `SELECT * FROM user_roles;` -> Should return rows only for the owner.
   - Execute `SELECT is_owner();` -> Should return `true`.
   - Execute `SELECT auth_role();` -> Should return `'owner'`.

3. **Negative Test (as Anon/Non-Owner):**
   - Anonymous SELECT should return 0 rows once policies are active.
   - (Optional) Use a second staging user without role -> SELECT should return 0 rows.

---

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| No owner found | 🔴 Critical | Pre-flight check in SQL script blocks execution. |
| Recursion Error | 🔴 Critical | `is_owner()` must be `SECURITY DEFINER` (confirmed in 004a). |
| Locking yourself out | 🔴 High | `service_role` key can always bypass RLS to fix policies. |

---

## 7. Safety Confirmations

- **Production:** Strictly prohibited. This plan targets `nexartwo-staging`.
- **Investor Hub:** Remains disabled (`INVESTOR_HUB_ENABLED = false`).
- **Application Tables:** No policies will be applied to `projects`, `investors`, or others in this step.
- **Rollback:** Policies can be dropped using the `DROP POLICY` commands included in the script.

---

## 8. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing SQL against any database.
> - Applying RLS to production.
> - Enabling Investor Hub.
> - Modifying `js/supabase.js`.
>
> This document only authorizes the creation of the plan and the verification script for review.

---
*Created by: Antigravity Senior Security Engineer*
