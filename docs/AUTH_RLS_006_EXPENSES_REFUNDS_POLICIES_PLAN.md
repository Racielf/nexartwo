# Auth/RLS 006 Expenses and Refunds Policies Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Step 006 of Auth/RLS Hardening.

---

## 1. Purpose

This plan defines the application of Row Level Security (RLS) policies to the `project_expenses` and `project_refunds` tables in `nexartwo-staging`. This step introduces role-based filtering where `field_user` can manage their own expenses, while sensitive financial data in `project_refunds` remains restricted to `owner` and `admin`.

---

## 2. Prerequisites Verification

| Requirement | Status | Verification |
|---|---|---|
| 004a Owner Bootstrap | ✅ PASS | Confirmed in 005 record. |
| 004b User Roles Policies | ✅ PASS | Confirmed in 005 record. |
| 005 Projects Policies | ✅ PASS | Confirmed in 005 record. |
| `project_expenses.created_by` | ✅ Confirmed | Applied in schema patch 202605070002. |
| RLS enabled on `project_expenses` | ✅ Confirmed manually | Hardened check in script validates before applying. |
| RLS enabled on `project_refunds` | ✅ Confirmed manually | Hardened check in script validates before applying. |

---

## 3. Policy Design

### Table: `project_expenses`
| Policy Name | Operation | Definition | Rationale |
|---|---|---|---|
| `expenses_select` | SELECT | `owner/admin` OR `(field_user AND created_by = auth.uid())` | Field users only see their own recorded expenses. Viewers have no access. |
| `expenses_insert` | INSERT | `owner/admin` OR `(field_user AND created_by = auth.uid())` | Field users can only record expenses on their own behalf. |
| `expenses_update` | UPDATE | `owner/admin` | Field users cannot modify expenses once recorded (requires admin/owner review). |

### Table: `project_refunds`
| Policy Name | Operation | Definition | Rationale |
|---|---|---|---|
| `refunds_select` | SELECT | `owner/admin` | Refunds are internal accounting corrections; restricted to high-privilege roles. |
| `refunds_insert` | INSERT | `owner/admin` | Only owner/admin can create refunds. |
| `refunds_update` | UPDATE | `owner/admin` | Only owner/admin can update refunds. |

---

## 4. Operational Script (Staging Only)

The file `qa/auth_rls_006_expenses_refunds_policies_staging.sql` contains the commands to:
1. **Verify** schema and prerequisites.
2. **Clean up** legacy MVP policies (`Allow select...`).
3. **Apply** new role-based policies.
4. **Verify** policy creation via `pg_policies`.

---

## 5. Verification Steps (After Manual Execution)

1. **Verify Policies exist:**
   ```sql
   SELECT policyname, tablename, cmd, qual, with_check 
   FROM pg_policies 
   WHERE tablename IN ('project_expenses', 'project_refunds')
   ORDER BY tablename, policyname;
   ```
2. **Positive Test (Owner/Admin):**
   - SELECT should return all rows.
3. **Field User Test:**
   - SELECT should only return rows where `created_by = auth.uid()`.

---

## 6. Safety Confirmations

- **Production:** Strictly prohibited.
- **Investor Hub:** Remains disabled (`INVESTOR_HUB_ENABLED = false`).
- **Application Tables (007–009):** Not applied in this scope.
- **Rollback:** `DROP POLICY` commands included in the script for idempotency and reversal if needed.

---

## 7. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing SQL against any database.
> - Applying RLS to production.
> - Enabling Investor Hub.
> - Applying steps 007–009.
>
> This document only authorizes the creation of the plan and the verification script for review.

---
*Created by: Antigravity Senior Security Engineer*
