# FlipEngine Phase 2F Preflight Schema Check

Status: Read-only preflight planning. No migrations were applied. No destructive SQL was written. No app code, UI, existing migration, or Phase 2C migration file was modified.

Preflight SQL:

- `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql`

Purpose:

- Confirm the approved local or staging target has the existing dependencies required by `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
- Confirm the new FlipEngine MVP tables do not already exist before testing the migration.

Phase 2G update:

- The first Phase 2F preflight was read-only and showed `work_orders.id = uuid` and `documents.id = uuid`.
- This preflight now expects those UUID types.
- Rerun this updated preflight before any local/staging migration test.

## Where To Run

Run this only against an approved local or staging Supabase database.

Do not run it against production unless the owner explicitly authorizes a production read-only inspection.

Safe places:

- Supabase local database.
- Staging Supabase project.
- Disposable restored staging copy.

Do not use:

- Production database.
- Plain Postgres without Supabase Auth schema, unless intentionally testing non-Supabase compatibility.
- Any environment where read-only schema inspection is not approved.

## What The SQL Checks

The SQL contains only `SELECT` queries against `information_schema`.

Dependency checks:

- `public.projects.id` exists and is `text`.
- `public.work_orders.id` exists and is `uuid`.
- `public.project_expenses.id` exists and is `integer`.
- `public.documents.id` exists and is `uuid`.
- `auth.users.id` exists and is `uuid`.

Table absence checks:

- `public.project_acquisitions` does not already exist.
- `public.project_budget_categories` does not already exist.
- `public.project_receipts` does not already exist.
- `public.project_document_links` does not already exist.

## PASS Results

The preflight passes only if every row in both result sets returns `PASS`.

Expected dependency result:

- `projects.id`: `PASS`, actual data type `text`
- `work_orders.id`: `PASS`, actual data type `uuid`
- `project_expenses.id`: `PASS`, actual data type `integer`
- `documents.id`: `PASS`, actual data type `uuid`
- `auth.users.id`: `PASS`, actual data type `uuid`

Expected FlipEngine table absence result:

- `project_acquisitions`: `PASS`
- `project_budget_categories`: `PASS`
- `project_receipts`: `PASS`
- `project_document_links`: `PASS`

If all rows return `PASS`, the target schema is ready for an owner-approved local/staging migration test.

## STOP Results

Stop before applying the Phase 2C migration if any row returns:

- `STOP_MISSING_COLUMN_OR_TABLE`
- `STOP_TYPE_MISMATCH`
- `STOP_TABLE_ALREADY_EXISTS`

Meaning:

- `STOP_MISSING_COLUMN_OR_TABLE`: the expected dependency table or ID column is missing from the target database.
- `STOP_TYPE_MISMATCH`: the dependency exists, but the ID type does not match the migration FK type.
- `STOP_TABLE_ALREADY_EXISTS`: one of the new FlipEngine MVP tables already exists, so applying the migration may be redundant or conflict with an existing partial/manual setup.

## If `work_orders` Is Missing

Do not apply Phase 2C.

Reason:

- The existing NexArWO app and earlier Supabase migrations already assume `work_orders` exists.
- `work_orders` is defined in `sql/schema.sql`, not clearly created by the visible `supabase/migrations/` chain.

Recommended action:

1. Confirm whether the local/staging database was created from the full base schema or only from `supabase/migrations/`.
2. If it was migration-only, load the approved base schema into the disposable local/staging database before testing Phase 2C.
3. If this is staging and `work_orders` is missing, treat the target DB as incomplete and stop.
4. Do not weaken or remove the Phase 2C `work_order_id` FK unless the owner approves a schema design change.

## If `documents` Is Missing

Do not apply Phase 2C.

Reason:

- `documents` is referenced by `project_document_links.document_id`.
- `documents` is defined in `sql/schema.sql` and `sql/phase2_migration.sql`, but not clearly created by visible `supabase/migrations/`.

Recommended action:

1. Confirm whether the target database was created from the full base schema.
2. If missing in local/staging, decide whether to load the approved base schema first or create a separate owner-approved baseline migration for `documents`.
3. If `documents` is intentionally absent from the target, stop and revisit the Phase 2C document FK design before applying.
4. Do not apply Phase 2C until `documents.id` exists as a UUID-compatible column.

## If A FlipEngine Table Already Exists

Do not apply Phase 2C yet.

Recommended action:

1. Determine whether the table came from a previous manual test, partial migration, or another branch.
2. Compare the existing table definition with `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
3. Decide whether to use a cleanup/reset path in disposable local only, or create a reviewed corrective migration for staging.
4. Do not drop tables from staging or production without explicit owner approval.

## Next Step If All Checks Pass

If every row returns `PASS`:

1. Save or screenshot the preflight results for the Phase 2F record.
2. Confirm again that the target is local/staging, not production.
3. Proceed to an owner-approved local/staging apply test of `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
4. After applying in local/staging, verify the four new tables, FKs, indexes, and `UNIQUE(project_id)` constraint.
5. Keep RLS/Auth policies, UI work, seed/demo data, and Investor Hub activation out of this apply test.

## Current Readiness

Ready for local/staging migration test: not yet.

Reason:

- The preflight SQL now exists, but it has not been run against an approved local/staging target.

Ready after:

- The owner runs or approves running the preflight in local/staging.
- Every preflight row returns `PASS`.
