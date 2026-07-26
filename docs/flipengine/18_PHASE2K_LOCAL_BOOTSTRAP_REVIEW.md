# FlipEngine Phase 2K Local Bootstrap Safety Review

Status: Review only. No SQL was run, no migrations were applied, no `supabase/migrations` files were modified, no app code or UI was changed, and production was not touched.

Reviewed files:

- `docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.md`
- `docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.sql`

Related context:

- `docs/flipengine/16_PHASE2I_LOCAL_BOOTSTRAP_PLAN.md`
- `docs/flipengine/15_PHASE2H_LOCAL_MIGRATION_BLOCKER.md`
- `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql`
- `supabase/migrations/20260506_projects_financial_system.sql`
- `supabase/migrations/202605070002_project_expenses_created_by.sql`
- `supabase/migrations/202605070003_work_orders_project_id.sql`

## Executive Verdict

The Phase 2J bootstrap draft is directionally useful, but it is not safe to run locally yet.

Reason:

- It matches the most important preflight-confirmed ID types.
- It stays outside `supabase/migrations`.
- It is clearly marked draft/local-only.
- But it still needs a guarded local execution path, a tighter minimum-table scope decision, and one more schema check around financial `work_order_id` compatibility before any execution.

Recommended path: B. Create a local-only bootstrap script outside `supabase/migrations`, after revising the draft and adding local-only guards.

Staging/restored DB remains safer for schema fidelity, but it does not solve the local reproducibility problem. A formal baseline migration is not recommended yet.

## Match Against Verified Preflight Schema

The Phase 2F/2G preflight confirmed these target ID types:

| Object | Verified type | Bootstrap draft type | Review |
|---|---:|---:|---|
| `projects.id` | `text` | `TEXT` | Matches |
| `work_orders.id` | `uuid` | `UUID` | Matches |
| `documents.id` | `uuid` | `UUID` | Matches |
| `project_expenses.id` | `integer` | `SERIAL` | Compatible, because `SERIAL` creates integer-backed IDs |
| `auth.users.id` | `uuid` | Not created by draft | Correct; Supabase local should provide `auth.users` |

Result:

- The draft matches the ID types required by the FlipEngine MVP migration for `projects`, `work_orders`, `documents`, and `project_expenses`.
- The draft correctly avoids the stale `work_orders.id TEXT` and `documents.id SERIAL` assumptions from older `sql/` files.

Remaining gap:

- The preflight confirmed `project_expenses.id`, but it did not confirm the live target type for:
  - `project_expenses.work_order_id`
  - `project_refunds.work_order_id`
  - `project_disbursements.work_order_id`
- The draft assumes these should be `UUID` to remain compatible with `work_orders.id UUID`. That is logically consistent, but it should be confirmed or explicitly accepted before running.

## Minimum Local Schema Review

The draft creates:

- `company_settings`
- `clients`
- `services`
- `projects`
- `work_orders`
- `wo_line_items`
- `documents`
- `project_expenses`
- `project_refunds`
- `project_disbursements`

Minimum required to get past the known `20260506` local failure and preserve UUID compatibility:

- `projects`
- `work_orders`
- `project_expenses`
- `project_refunds`
- `project_disbursements`

Minimum required for the FlipEngine MVP migration:

- `projects`
- `work_orders`
- `project_expenses`
- `documents`
- `auth.users`

Conditionally useful:

- `clients`, if `work_orders.client_id` remains in the local base table.
- `services`, only if `wo_line_items.service_id` is included.
- `wo_line_items`, only for broader local Work Order compatibility testing.

Probably not needed for the first schema-only FlipEngine migration test:

- `company_settings`
- `services`
- `wo_line_items`

Review result:

- The draft is slightly broader than the minimum required for a schema-only FlipEngine migration test.
- Before execution, the owner should decide whether the bootstrap is intended only to unblock migration replay or also to provide a broader local Work Order base schema.

## Conflict Review Against Existing Migrations

### `20260506_projects_financial_system.sql`

Potential conflict:

- This migration creates `projects`, alters `work_orders`, creates financial tables, then creates the financial view, triggers, RLS enablement, and policies.

Draft behavior:

- Precreates `projects`, so `CREATE TABLE IF NOT EXISTS projects` should skip.
- Precreates `work_orders.project_id`, so `ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id ...` should skip.
- Precreates `project_expenses`, `project_refunds`, and `project_disbursements`, so their old `CREATE TABLE IF NOT EXISTS` blocks should skip.
- Allows the existing migration to continue creating the financial view, functions, triggers, RLS enablement, and policies.

Risk:

- If the precreated financial table shapes differ from the migration's expected column names, later view/function/trigger statements can fail.
- The draft currently appears aligned with the columns used by the view and triggers in `20260506`, but this should be reviewed again before execution.

### `202605070002_project_expenses_created_by.sql`

Potential conflict:

- This migration adds `project_expenses.created_by UUID REFERENCES auth.users(id)`.

Draft behavior:

- Does not precreate `created_by`, so the later migration can add it.

Review:

- This is acceptable for local Supabase because `auth.users` should exist.

### `202605070003_work_orders_project_id.sql`

Potential conflict:

- This migration attempts to add `work_orders.project_id TEXT REFERENCES projects(id) ON DELETE SET NULL`.

Draft behavior:

- Precreates `work_orders.project_id` with `ON DELETE SET NULL`.
- The later `ADD COLUMN IF NOT EXISTS` should skip.

Review:

- This aligns with the later dedicated migration intent.
- It may not match the earlier `20260506` `ON DELETE RESTRICT` intent, but that conflict already exists in the visible migration history.

## Should Financial Tables Be Included?

Review answer: include them only for local bootstrap compatibility, not as a production or baseline migration pattern.

Why include:

- If `work_orders.id` is UUID, the old `20260506` definitions with `work_order_id TEXT REFERENCES work_orders(id)` can fail.
- Precreating `project_expenses`, `project_refunds`, and `project_disbursements` with `work_order_id UUID` lets `20260506` skip the stale `CREATE TABLE IF NOT EXISTS` blocks while still creating its view/triggers/policies.
- `project_expenses` is also required later by the FlipEngine receipt table.

Why this is risky:

- It is a local compatibility workaround.
- It encodes a corrected assumption that should be verified against the live schema before broader use.
- It changes the local migration replay shape compared with a pure migration-only replay.

Decision:

- Include these tables in a local-only bootstrap if the goal is to test local replay with UUID-compatible `work_orders`.
- Avoid including them in any production baseline migration until a full schema audit confirms the live financial table foreign-key types.

## Docs-Only SQL Or Local Script Later?

The SQL should remain docs-only for now.

Before it can be executed, it should become part of a guarded local-only process outside `supabase/migrations`.

Recommended future files, if approved:

- `supabase/local/bootstrap/001_nexarwo_base_schema.sql`
- `scripts/supabase-local-bootstrap.ps1`
- `docs/flipengine/19_PHASE2L_LOCAL_BOOTSTRAP_EXECUTION_PLAN.md`

The script should:

- Refuse to run if the target is production or unclear.
- Refuse to use `--linked`.
- Refuse to run `db push`.
- Confirm Docker is running.
- Print the local Supabase URL/port.
- Apply bootstrap only to the local database.
- Run Phase 2F preflight after bootstrap.
- Stop if any preflight row returns `STOP_*`.
- Require a separate approval before running the FlipEngine migration test.

## Is Staging/Restored DB Safer?

Yes.

A staging or restored database with the real NexArWO base schema is safer for schema fidelity because it avoids inventing a local reconstruction of Work Orders, Documents, and financial tables.

However:

- It does not make local Supabase reproducible from the repo.
- It may require staging access, backup/restore controls, and owner-approved apply windows.

Safety ranking:

1. Safest for schema fidelity: A. Use staging/restored DB.
2. Best for repeatable local development: B. Create local-only bootstrap script outside `supabase/migrations`.
3. Highest governance risk: C. Create a baseline migration later.

Recommended path for the stated local reproducibility goal:

- B. Create a local-only bootstrap script outside `supabase/migrations`, but only after revising the draft.

## Exact Risks Before Running Anything

1. The draft may still not match live production constraints beyond the ID types already checked.
2. `project_expenses.work_order_id`, `project_refunds.work_order_id`, and `project_disbursements.work_order_id` live types were not included in the Phase 2F preflight.
3. The draft currently includes tables that are not strictly required for the first schema-only FlipEngine test.
4. The execution order is not yet proven. Supabase local currently applies migrations during startup/reset, so a bootstrap runner must define exactly how bootstrap SQL runs before the failing migration path.
5. Precreating tables causes later `CREATE TABLE IF NOT EXISTS` migration blocks to skip, so the bootstrap table shape must be exact enough for later views/triggers/policies.
6. RLS policies are intentionally omitted from the draft, which is good for bootstrap scope but means local app behavior is not fully validated by this step.
7. If this draft is moved into `supabase/migrations`, it could become dangerous for production or staging.
8. Local success would not prove production safety.
9. The project has known schema drift between `sql/`, `supabase/migrations`, and the live target.
10. A bootstrap run against the wrong database would be a serious data governance failure.

## What Must Change Before Running

Before any local execution, do all of the following:

1. Keep the current draft in docs and do not run it directly.
2. Decide whether to remove `company_settings`, `services`, and `wo_line_items` from the first bootstrap execution path, or keep them explicitly for broader Work Order local compatibility.
3. Add a read-only check or owner decision for financial `work_order_id` types:
   - `project_expenses.work_order_id`
   - `project_refunds.work_order_id`
   - `project_disbursements.work_order_id`
4. Create a local-only bootstrap file outside `supabase/migrations`.
5. Create a guarded local script that cannot use production, `--linked`, or `db push`.
6. Document the execution order that applies bootstrap before the failing migration path.
7. Add a local post-bootstrap preflight using `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql`.
8. Require owner approval before the first local execution.

## Recommendation

Choose path B:

Create a local-only bootstrap script outside `supabase/migrations`.

Reason:

- It directly addresses the local reproducibility problem.
- It keeps production migration history untouched.
- It lets the owner review and control a local-only execution path.
- It avoids the larger governance risk of a formal baseline migration.

Important caveat:

- If the goal shifts from local reproducibility to lowest-risk schema validation, use path A instead: staging/restored DB.
- Do not choose path C yet. A baseline migration should wait until a full schema drift audit is complete.

## Final Answers

Is the bootstrap safe to run locally now: no.

What must be changed before running:

- It needs a guarded local-only script and a non-migration execution location.
- The minimum table scope should be tightened or explicitly approved.
- The financial `work_order_id` type assumption should be verified or accepted.
- The execution order must be documented and reviewed.

Recommended next step:

- Phase 2L: create a local bootstrap execution plan and guarded script draft, still without running SQL.
