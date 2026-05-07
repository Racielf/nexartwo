# Auth/RLS 007 Disbursements Policies Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Step 007 of Auth/RLS Hardening.

---

## 1. Purpose

This plan defines the application of Row Level Security (RLS) policies and a status-transition trigger to the `project_disbursements` table in `nexartwo-staging`. This step ensures that financial outflows are restricted to `owner` and `admin` roles, with an additional safety check that only the `owner` can mark a disbursement as `paid`.

---

## 2. Prerequisites Verification

| Requirement | Status | Verification |
|---|---|---|
| 004a Owner Bootstrap | ✅ PASS | Confirmed in 006 record. |
| 004b User Roles Policies | ✅ PASS | Confirmed in 006 record. |
| 005 Projects Policies | ✅ PASS | Confirmed in 006 record. |
| 006 Expenses/Refunds Policies | ✅ PASS | Confirmed in 006 record. |
| RLS enabled on `project_disbursements` | Must verify | Hardened check in script validates before applying. |

---

## 3. Policy Design

### Table: `project_disbursements`
| Policy Name | Operation | Definition | Rationale |
|---|---|---|---|
| `disbursements_select` | SELECT | `auth_role() IN ('owner', 'admin')` | Disbursements represent actual cash outflows; restricted to administrative roles. |
| `disbursements_insert` | INSERT | `auth_role() IN ('owner', 'admin')` | Only owner/admin can record new disbursements. |
| `disbursements_update` | UPDATE | `auth_role() IN ('owner', 'admin')` | Only owner/admin can modify disbursement details. |

### Technical Decision: 'Paid' Status Lockdown
While both `owner` and `admin` can update a disbursement, a dedicated trigger (`trg_restrict_paid_to_owner`) enforces that only the `owner` role can transition a disbursement from any status to `'paid'`. This prevents admins from self-approving actual payments.

---

## 4. Operational Script (Staging Only)

The file `qa/auth_rls_007_disbursements_policies_staging.sql` contains the commands to:
1. **Verify** prerequisites and table RLS status.
2. **Clean up** legacy MVP policies (`Allow select project_disbursements`).
3. **Apply** new role-based policies.
4. **Apply** the `paid` status protection trigger.
5. **Verify** creation via `pg_policies` and `information_schema`.

---

## 5. Verification Steps (After Manual Execution)

1. **Verify Policies exist:**
   ```sql
   SELECT policyname, tablename, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'project_disbursements';
   ```
2. **Verify Trigger exists:**
   ```sql
   SELECT trigger_name 
   FROM information_schema.triggers 
   WHERE event_object_table = 'project_disbursements';
   ```
3. **Positive Test (Owner):**
   - Can select, insert, and update to `'paid'`.
4. **Negative Test (Admin):**
   - Can select and insert, but updating `status` to `'paid'` should raise an exception.

---

## 6. Safety Confirmations

- **Production:** Strictly prohibited.
- **Investor Hub:** Remains disabled (`INVESTOR_HUB_ENABLED = false`).
- **Application Tables (008–009):** Not applied in this scope.
- **Rollback:** `DROP POLICY` and `DROP TRIGGER` commands included for idempotency.

---

## 7. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing SQL against any database.
> - Applying RLS to production.
> - Enabling Investor Hub.
> - Applying steps 008–009.
>
> This document only authorizes the creation of the plan and the verification script for review.

---
*Created by: Antigravity Senior Security Engineer*
*Source draft: supabase/drafts/auth-rls/007_rls_disbursements.sql*
