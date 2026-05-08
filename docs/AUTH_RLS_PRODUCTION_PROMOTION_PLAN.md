# Auth/RLS Original Database Alignment Review — NexArtWO Original

## 1. Context & Objective
The `nexartwo-staging` environment has been successfully used as a laboratory for hardening the database security layer (Auth/RLS 004a–009). The "original" NexArtWO project (`udaeifoibydcokefcmbg`), which currently serves the GitHub Pages frontend, is currently desynchronized and lacks the latest RPC wrappers and fine-grained RLS policies.

**Objective:** Align the production project with the verified security architecture from staging without data migration or destructive operations.

## 2. Strategy: Idempotent Alignment
- **No Data Migration:** We will not copy user data or project records from staging.
- **Structural Synchronization:** Apply missing idempotent SQL (Policies, RPCs, Views) in the correct order.
- **Safety First:** Utilize read-only preflight checks to confirm the starting state before any modification.

## 3. Preflight Checklist (Production)
Run [auth_rls_production_preflight.sql](../qa/auth_rls_production_preflight.sql) in the Supabase SQL Editor and confirm:
- [ ] **Owner Guard:** At least one `owner` exists in `user_roles` (prevents lockout).
- [ ] **RLS Status:** Verify which tables already have RLS enabled (Phase 004a).
- [ ] **RPC Check:** Confirm whether `get_all_financial_summaries` and `get_project_financial_summary` exist.
- [ ] **View Integrity:** Confirm `project_financial_summaries` view exists.

## 4. Execution Roadmap (Phased Approach)

> [!IMPORTANT]
> Step 004a (Bootstrap) must be verified by preflight before any promotion.

### Phase A: Role & Core Access
1. **004b — user_roles Policies:** Lock down the roles table to owner-only edits.
   - Script: `qa/auth_rls_004b_user_roles_policies_staging.sql`
2. **005 — projects Policies:** Enable RLS on projects and implement team-based filtering.
   - Script: `qa/auth_rls_005_projects_policies_staging.sql`

### Phase B: Financial Hardening
3. **006 — expenses/refunds Policies:** Protect line-item financial data.
   - Script: `qa/auth_rls_006_expenses_refunds_policies_staging.sql`
4. **007 — disbursements Policies:** Extend protection to disbursement records.
   - Script: `qa/auth_rls_007_disbursements_policies_staging.sql`

### Phase C: Reporting Layer (RPC Gateways)
5. **008 — financial_summaries RPC:** Create secure wrappers for aggregated financial data.
   - Script: `qa/auth_rls_008_financial_summaries_rpc_staging.sql`
6. **009 — restricted_views:** Implement high-level reporting views (status summaries).
   - Script: `qa/auth_rls_009_restricted_views_staging.sql`

## 5. Risks & Mitigation
> [!CAUTION]
> The target project is marked as **PRODUCTION** in the Supabase Dashboard.

| Risk | Mitigation |
| :--- | :--- |
| **Lockout** | Preflight verifies owner existence before applying 004b policies. |
| **Data Regression** | No data migration is planned; risk is access regression if RLS/policies are applied incorrectly. |
| **Regression** | 100% of these scripts have passed QA in `nexartwo-staging`. |

## 6. Execution Protocol & Guardrails

> [!IMPORTANT]
> **Do not apply 004b-009 until the owner reviews the preflight output and explicitly approves a specific step list.**

1. **Backup:** Create a project snapshot in the Supabase Dashboard.
2. **Authorization:** Obtain explicit approval from the Owner for the alignment.
3. **Step-by-Step Execution:**
   - Run preflight audit.
   - Compare output against verified `nexartwo-staging` state.
   - Identify specific missing steps.
   - Apply only the identified missing scripts.
   - Verify application after each step (manual/console checks).
   - **Stop immediately on any first unexpected result.**
4. **Validation:** Verify the frontend 404s are resolved and data visibility is correct.

## 7. Operational Constraints
- **No Dump/Restore:** Database alignment is structural only.
- **No Data Copy:** Production records are preserved; no staging data is imported.
- **No Frontend Changes:** This plan covers database-only synchronization.
- **No Investor Hub:** Feature remains disabled (`INVESTOR_HUB_ENABLED = false`).


---
*Created: 2026-05-07*
*Author: Antigravity Senior Security Engineer*
