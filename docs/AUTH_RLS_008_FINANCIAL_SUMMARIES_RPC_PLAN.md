# Auth/RLS 008 Financial Summaries RPC Plan

> **Status:** PLAN ONLY — No SQL executed. No production touched.
> **Environment:** `nexartwo-staging`
> **Gate:** Step 008 of Auth/RLS Hardening.

---

## 1. Purpose

This plan defines the shift from direct table/view access to gated RPC access for `project_financial_summaries` in `nexartwo-staging`. This is a "Strong Protection" step: direct `SELECT` access is revoked for all standard roles, and data can only be retrieved via `SECURITY DEFINER` functions that explicitly check for `owner` or `admin` roles.

---

## 2. Prerequisites Verification

| Requirement | Status | Verification |
|---|---|---|
| 004a–007 Hardening | ✅ PASS | Confirmed in 007 record. |
| `project_financial_summaries` view | ✅ Exists | Confirmed in earlier schema migrations. |
| `auth_role()` function | ✅ PASS | Essential for RPC gate logic. |

---

## 3. Design Strategy: RPC Gating

Unlike standard RLS (which acts as a filter), this step uses **Revocation + Gateway**:

1. **REVOKE SELECT**: Direct access to `project_financial_summaries` is removed from `anon` and `authenticated` roles.
2. **SECURITY DEFINER Functions**:
   - `get_project_financial_summary(p_project_id TEXT)`
   - `get_all_financial_summaries()`
3. **Internal Auth Check**: Both functions contain `WHERE auth_role() IN ('owner', 'admin')`.
4. **Execution Permissions**: Only `authenticated` users are granted `EXECUTE` permission, but the internal check ensures only `owner`/`admin` actually see data.

---

## 4. Blocker Detection (Frontend)

> [!IMPORTANT]
> **BLOCKER IDENTIFIED:** The current frontend code in `js/supabase.js` (Lines 639–654) uses direct `.select()` calls:
> - `DB.projectFinancialSummaries.getAll()`
> - `DB.projectFinancialSummaries.getByProject()`
>
> These calls **will fail** immediately after the SQL script for 008 is applied.

### Required JS Mitigation (To be applied in Activation Phase)
The following refactoring will be required:
```javascript
// From:
var { data, error } = await sb.from('project_financial_summaries').select('*');
// To:
var { data, error } = await sb.rpc('get_all_financial_summaries');
```

*Note: Per protocol, no JS changes are implemented in this step. This is a documentation of required follow-up.*

---

## 5. Operational Script (Staging Only)

The file `qa/auth_rls_008_financial_summaries_rpc_staging.sql` contains:
1. **Pre-flight Checks**: Verify view and prerequisite functions.
2. **Revocation**: Remove direct view access.
3. **RPC Creation**: Implement the gated functions with `SECURITY DEFINER`.
4. **Granting**: Allow execution for authenticated users.
5. **Verification**: Confirm function metadata and permissions.

---

## 6. Verification Steps (After Manual Execution)

1. **Verify Revocation (As service_role):**
   ```sql
   -- This should always work for service_role, but checks permissions catalog
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'project_financial_summaries';
   -- Expected: No rows for 'anon' or 'authenticated'
   ```
2. **Verify Functions exist:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name IN ('get_project_financial_summary', 'get_all_financial_summaries');
   ```

---

## 7. Safety Confirmations

- **Production:** Strictly prohibited.
- **Investor Hub:** Remains disabled.
- **Application Table Policies (009):** Not applied.
- **Rollback:** `GRANT SELECT` can restore direct access if the blocker causes critical UI failure.

---

## 8. Non-Authorization Clause

> [!CAUTION]
> This document does NOT authorize:
> - Executing SQL against any database.
> - Applying RLS to production.
> - Modifying `js/supabase.js` yet.
>
> This document only authorizes the creation of the plan and the verification script for review.

---
*Created by: Antigravity Senior Security Engineer*
*Source draft: supabase/drafts/auth-rls/008_rls_financial_summaries.sql*
