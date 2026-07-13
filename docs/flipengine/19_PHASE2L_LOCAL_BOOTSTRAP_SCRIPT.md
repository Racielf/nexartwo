# FlipEngine Phase 2L Local Bootstrap Script

Status: Script draft only. No SQL was run, no migrations were applied, no `supabase/migrations` files were modified, no app code or UI was changed, and production was not touched.

Created script draft:

- `scripts/local/flipengine_local_bootstrap.sql`

Source review:

- `docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.sql`
- `docs/flipengine/18_PHASE2K_LOCAL_BOOTSTRAP_REVIEW.md`

## What The Script Does

The script is a local-only SQL bootstrap draft for a disposable Supabase local database.

It prepares the missing NexArWO base schema needed before testing the FlipEngine MVP migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

The script creates local-only versions of:

- `projects`
- `company_settings`
- `clients`
- `services`
- `work_orders`
- `wo_line_items`
- `documents`
- `project_expenses`
- `project_refunds`
- `project_disbursements`

It preserves the verified ID type decisions needed by FlipEngine:

- `projects.id` is `TEXT`
- `work_orders.id` is `UUID`
- `documents.id` is `UUID`
- `project_expenses.id` is integer-compatible through `SERIAL`

It also includes a SQL safety gate. If someone runs the file directly, it raises an exception unless an approved local runner sets:

```sql
SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';
```

That `SET` statement is intentionally not included in the script.

## Why It Exists

The Phase 2H local Supabase test failed before the FlipEngine migration because the local migration chain reached:

- `supabase/migrations/20260506_projects_financial_system.sql`

That migration assumes `work_orders` already exists.

The visible `supabase/migrations` chain does not create the original Work Order base schema before that point. Those base tables are represented in older `sql/` files, but those files include stale ID assumptions that do not match the verified target schema.

This script exists to support a later approved local-only bootstrap path without touching production or rewriting migration history.

## Why It Is Local-Only

This script precreates tables that production already has.

Running it against production, staging, or any linked Supabase project could conflict with existing tables, constraints, policies, triggers, or live data.

It is not a baseline migration. It must not be added to:

- `supabase/migrations`

It must never be run through:

- `db push`
- `--linked`
- production SQL editor
- staging SQL editor without a separate staging-specific approval

## How It Should Be Used Later If Approved

This Phase 2L task does not authorize execution.

If the owner approves a later local-only execution phase, a guarded local runner should:

1. Confirm the repo is the NexArWO repo root.
2. Confirm Docker Desktop is running.
3. Confirm Supabase CLI is available.
4. Confirm the target is disposable local Supabase only.
5. Confirm the repo is not using a linked production target.
6. Start or prepare local Supabase in a way that allows bootstrap before the failing migration path.
7. Set the SQL safety gate in the same local session:
   - `SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';`
8. Run `scripts/local/flipengine_local_bootstrap.sql` against the local database only.
9. Run the existing local migration chain or approved migration test process.
10. Run `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql` locally.
11. Stop if any preflight row returns `STOP_*`.
12. Test the FlipEngine migration only after local preflight returns all `PASS`.

The exact command sequence is intentionally not finalized in this file because the previous local test showed Supabase local applies migrations during startup/reset. A future execution plan must prove how the bootstrap runs before the failing migration path.

## What Must Be Checked Before Running

Before any execution, confirm:

- Owner explicitly approved a local-only run.
- Target is disposable local Supabase, not production.
- No `--linked` target is used.
- `db push` will not be used.
- The script is still outside `supabase/migrations`.
- Docker Desktop is running.
- Supabase CLI is available.
- `work_orders.id` should remain `UUID`.
- `documents.id` should remain `UUID`.
- `projects.id` should remain `TEXT`.
- `project_expenses.id` should remain integer-compatible.
- The owner accepts the local compatibility assumption that financial `work_order_id` columns should be `UUID`.
- A rollback/reset path exists for local only.

## STOP Conditions

Stop immediately if:

- The target is production, staging, or unclear.
- The repo is linked to a remote Supabase project.
- The command path uses `db push`.
- The script is moved into `supabase/migrations`.
- The owner has not approved execution.
- Docker or Supabase CLI is missing.
- The local database is not disposable.
- Any command would affect production credentials or production URL.
- Any preflight row returns `STOP_*`.
- The script needs RLS/Auth policy, trigger, storage bucket, seed/demo data, app code, UI, or Investor Hub changes to proceed.

## Rollback Notes

Rollback is local-only.

Preferred rollback after a failed local bootstrap attempt:

1. Stop local Supabase.
2. Remove or reset only the disposable local database/volumes using an owner-approved local cleanup path.
3. Do not clean up anything in production or staging.
4. Do not drop tables manually in production or staging.
5. Document the failure before retrying.

If the script is accidentally run against a non-local target:

- Stop immediately.
- Do not run cleanup commands.
- Preserve logs and output.
- Escalate to the owner for database recovery planning.

## Remaining Risks

1. The execution order is not yet proven.
2. The script precreates financial tables to work around old migration assumptions.
3. It does not create RLS policies or triggers.
4. It does not prove app UI behavior.
5. It may not perfectly match production constraints beyond the preflight-verified ID types.
6. It must be treated as local bootstrap infrastructure, not product schema.

## Next Step

Recommended next phase:

- Phase 2M: create a guarded local execution plan for this script, still requiring owner approval before running any SQL.

Do not run this script yet.

Do not proceed to production.
