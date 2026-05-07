# Auth/RLS 005 Projects Policies Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Requires 004a + 004b PASS (both confirmed).

---

## 1. Purpose

This plan defines the application of RLS policies and a financial-field protection trigger to the `projects` table in `nexartwo-staging`. After this step, direct access to `projects` is restricted to `owner` and `admin` roles only. `field_user` and `viewer` roles will access project data via a restricted view (`project_status_summary`, created in migration 009).

---

## 2. Prerequisites

| Requirement | Status |
|---|---|
| 004a bootstrap (user_roles, is_owner, auth_role) | ✅ PASS |
| 004b user_roles policies | ✅ PASS |
| owner row confirmed | ✅ `1953318e-ff95-4073-abb5-e418f241b7e5` / `owner` |
| `projects` table exists in staging | ✅ Confirmed (created by earlier migrations) |
| RLS enabled on `projects` | ✅ Confirmed manually by owner (script also validates before applying) |

---

## 3. Policy Design

Based on `supabase/drafts/auth-rls/005_rls_projects.sql`:

| Policy Name | Operation | Definition | Rationale |
|---|---|---|---|
| `projects_select` | SELECT | `USING (auth_role() IN ('owner', 'admin'))` | `field_user`/`viewer` cannot access raw project data — financial columns would be exposed. They use `project_status_summary` (migration 009) instead. |
| `projects_insert` | INSERT | `WITH CHECK (auth_role() IN ('owner', 'admin'))` | Only authorized roles can create new projects. |
| `projects_update` | UPDATE | `USING (auth_role() IN ('owner', 'admin'))` | Combined with the financial-field trigger below, admins can only update operational fields. |
| (no DELETE policy) | DELETE | — | Absence of a DELETE policy means no authenticated user can delete projects when RLS is active. This is intentional. |

### Legacy Policy Cleanup
The following legacy policies from Migration 003 will be dropped before new policies are applied:
- `"Allow select projects"`
- `"Allow insert projects"`
- `"Allow update projects"`

---

## 4. Financial Field Protection Trigger

A critical companion to the SELECT/UPDATE policies is a BEFORE UPDATE trigger that enforces **column-level** financial field protection — which RLS cannot do natively.

**Function:** `prevent_non_owner_project_financial_update()`
- Type: `SECURITY DEFINER`, `BEFORE UPDATE ON projects`
- Behavior: If `auth_role() != 'owner'` AND any of the following columns changed, it raises an exception:
  - `purchase_price`, `down_payment`, `loan_amount`, `realtor_fee`, `title_company_fee`
  - `closing_costs`, `inspection_fee`, `insurance`, `sale_price`
  - `selling_agent_commission`, `seller_closing_costs`

> [!IMPORTANT]
> This trigger is the only mechanism protecting financial columns from admin modification. It is NOT optional. It must be applied alongside the policies.

---

## 5. Verification Steps (After Manual Execution)

### Primary Verification (service_role context)
```sql
-- 1. Confirm policies applied
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'projects';
-- Expected: 3 rows — projects_select, projects_insert, projects_update

-- 2. Confirm trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'projects';
-- Expected: trg_protect_project_financials (BEFORE UPDATE)
```

### Optional Authenticated Session Verification
> [!IMPORTANT]
> These require an authenticated session with `auth.uid()` set. Not valid with `service_role` in SQL Editor.
```
-- As owner: SELECT * FROM projects;     -> Returns rows
-- As owner: SELECT auth_role();         -> Returns 'owner'
-- As admin: UPDATE projects SET purchase_price = ... -> Should raise exception
```

---

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Legacy policies not dropped first | 🔴 Critical | Script includes idempotent `DROP POLICY IF EXISTS` for both old and new names. |
| Trigger not created | 🔴 Critical | Without trigger, admins can modify financial columns despite UPDATE policy. Script must run trigger creation as part of same transaction. |
| RLS not enabled on `projects` | 🔴 Critical | Pre-flight check must confirm `rowsecurity = true` on `projects` before policies can be effective. |
| `auth_role()` returning NULL | 🟡 Medium | `auth_role()` returns NULL for unauthenticated users — `IN ('owner', 'admin')` with NULL evaluates to false, blocking access correctly. |

---

## 7. Safety Confirmations

- **Production:** Strictly prohibited. Plan targets `nexartwo-staging`.
- **Investor Hub:** Remains disabled (`INVESTOR_HUB_ENABLED = false`).
- **Other Tables:** No policies applied to `project_expenses`, `project_refunds`, `project_disbursements`, or investor tables in this step.
- **Migrations 006–009:** Not applied.

---

## 8. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing any SQL against any database.
> - Applying RLS policies to production.
> - Enabling Investor Hub.
> - Applying migrations 006–009.
>
> This document only authorizes the creation and review of this plan and the staging SQL script.

---
*Created by: Antigravity Senior Security Engineer*
*Source draft: supabase/drafts/auth-rls/005_rls_projects.sql*
