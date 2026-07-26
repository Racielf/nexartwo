# FlipEngine Phase 2E Migration Dependency Check

Status: Documentation/review only. No SQL was applied. No SQL was executed. No production database was queried. No app code, UI, existing migrations, or the Phase 2C migration were modified.

Reviewed migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

Goal:

Verify from repo files whether the target database is expected to contain:

- `projects`
- `work_orders`
- `project_expenses`
- `documents`
- `auth.users`

## Summary Decision

Ready for local/staging apply: no, not until the Phase 2G-compatible preflight is rerun.

Reason:

- The Phase 2F read-only preflight confirmed the target database has `work_orders` and `documents`, but their `id` columns are `uuid`, not the older repo assumptions.
- Phase 2G updates the un-applied migration and preflight expectations to use `UUID` for optional `work_order_id` and `document_id`.

Migration changes recommended now: yes, applied in Phase 2G.

Reason:

- `project_receipts.work_order_id` must be `UUID REFERENCES work_orders(id)`.
- `project_document_links.document_id` must be `UUID REFERENCES documents(id)`.
- `project_id` remains `TEXT REFERENCES projects(id)`.
- `project_expense_id` remains `INTEGER REFERENCES project_expenses(id)`.

Exact next step:

- Rerun the updated Phase 2F preflight. If all rows return `PASS`, proceed only to an owner-approved local/staging migration test.

## Dependency Matrix

| Dependency | Needed by Phase 2C migration | Where defined in repo | Where referenced in repo | Status | Apply risk |
|---|---|---|---|---|---|
| `projects` | Required parent for all four new `project_id` FKs | `supabase/migrations/20260506_projects_financial_system.sql` lines 9-10 | Phase 2C lines 39, 85, 127, 181; app uses `DB.projects` | Safe | Low |
| `work_orders` | Optional FK from `project_receipts.work_order_id` | Phase 2F preflight target result; older `sql/schema.sql` shows stale `TEXT` assumption | Existing app uses `DB.workOrders`; Phase 2G migration uses UUID FK | Safe after Phase 2G preflight PASS | Low to medium |
| `project_expenses` | Optional FK from `project_receipts.project_expense_id` | `supabase/migrations/20260506_projects_financial_system.sql` lines 57-58 | Phase 2C line 130; app uses `DB.projectExpenses` | Safe if previous migrations already apply | Low to medium |
| `documents` | Optional FK from `project_document_links.document_id` | Phase 2F preflight target result; older `sql/schema.sql` / `sql/phase2_migration.sql` show stale integer assumption | Existing app uses `DB.documents`; Phase 2G migration uses UUID FK | Safe after Phase 2G preflight PASS | Low to medium |
| `auth.users` | Nullable audit FKs from all four new tables | Supabase-managed Auth schema, not repo-created | Existing migration `202605070002_project_expenses_created_by.sql` references it; Phase 2C lines 65, 66, 100, 101, 147, 148, 206, 207 | Safe in Supabase; uncertain in plain Postgres | Low in Supabase, high outside Supabase |

## Detailed Findings

### `projects`

Status: safe.

Evidence:

- Defined in `supabase/migrations/20260506_projects_financial_system.sql`.
- `projects.id` is `TEXT PRIMARY KEY`.
- Multiple existing migrations already reference `projects(id)`.
- The Phase 2C migration references `projects(id)` from all four new tables.

Risk level:

- Low for local/staging if existing Supabase migrations are applied.

Recommended action before applying:

- Confirm the target DB has `projects` and that `projects.id` is `TEXT`.

Migration adjustment needed before testing:

- No.

### `work_orders`

Status: confirmed by Phase 2F preflight as `uuid`.

Evidence:

- Phase 2F preflight returned `work_orders.id` actual type `uuid`.
- Older repo files under `sql/` show `id TEXT PRIMARY KEY`, but the current target preflight result is authoritative for the migration compatibility fix.
- The Phase 2G migration references `work_orders(id)` from `project_receipts.work_order_id` using `UUID`.
- App code uses `work_orders` heavily through `DB.workOrders`.

Risk level:

- Low to medium after the updated preflight returns PASS.

Recommended action before applying:

- Rerun the updated preflight and confirm `work_orders.id` returns `uuid` and `PASS`.

Migration adjustment needed before testing:

- Already adjusted in Phase 2G.

### `project_expenses`

Status: safe if prior financial migration applies successfully.

Evidence:

- Defined in `supabase/migrations/20260506_projects_financial_system.sql` as `CREATE TABLE IF NOT EXISTS project_expenses`.
- `project_expenses.id` is `SERIAL PRIMARY KEY`, so Phase 2C `project_expense_id INTEGER` is type-compatible.
- Existing app code uses `project_expenses`.
- Phase 2C uses a nullable FK: `project_receipts.project_expense_id INTEGER REFERENCES project_expenses(id) ON DELETE SET NULL`.

Risk level:

- Low when the existing migration chain has already succeeded.
- Medium for a fresh migrations-only local DB if `work_orders` is absent, because `project_expenses` itself references `work_orders`.

Recommended action before applying:

- Confirm `project_expenses` exists in the target DB.
- Confirm `project_expenses.id` is integer/serial-compatible.

Migration adjustment needed before testing:

- No.

### `documents`

Status: confirmed by Phase 2F preflight as `uuid`.

Evidence:

- Phase 2F preflight returned `documents.id` actual type `uuid`.
- Older repo files under `sql/schema.sql` and `sql/phase2_migration.sql` show `id SERIAL PRIMARY KEY`, but the current target preflight result is authoritative for the migration compatibility fix.
- App code uses `documents` through `DB.documents`.
- The Phase 2G migration references `documents(id)` from `project_document_links.document_id` using `UUID`.

Risk level:

- Low to medium after the updated preflight returns PASS.

Recommended action before applying:

- Rerun the updated preflight and confirm `documents.id` returns `uuid` and `PASS`.

Migration adjustment needed before testing:

- Already adjusted in Phase 2G.

### `auth.users`

Status: safe in a Supabase database; uncertain in non-Supabase Postgres.

Evidence:

- `auth.users` is a Supabase-managed Auth table, not created by this repo.
- Existing migration `supabase/migrations/202605070002_project_expenses_created_by.sql` already references `auth.users(id)`.
- Phase 2C uses nullable `created_by` and `updated_by` FKs to `auth.users(id)` on all four new tables.
- Draft Auth/RLS files reference `auth.users`, but those drafts are not part of this Phase 2E check and must not be treated as applied schema.

Risk level:

- Low in Supabase local/staging.
- High if someone tries to apply the migration to plain Postgres without Supabase Auth schema.

Recommended action before applying:

- Confirm the target is a Supabase database with the `auth` schema available.
- Do not apply this migration to a plain Postgres database unless `auth.users` compatibility is explicitly provided.

Migration adjustment needed before testing:

- No for Supabase local/staging.

## Cross-Dependency Notes

- `projects` and `project_expenses` are covered by visible Supabase migrations.
- `work_orders` and `documents` exist in the checked target, but their live ID types are `uuid`, not the older repo SQL assumptions.
- Existing Supabase migrations already assume `work_orders` exists. This suggests the project may rely on schema history outside the visible migration chain.
- Phase 2C does not use the old `sql/PHASE_2B_SCHEMA.sql`; that file should remain ignored for FlipEngine because it contains old UUID assumptions.

## Recommended Action Before Applying

Before applying Phase 2C in any approved local/staging environment:

1. Confirm the target is not production.
2. Confirm the target database is Supabase, not plain Postgres.
3. Inspect the target schema for:
   - `projects`
   - `work_orders`
   - `project_expenses`
   - `documents`
   - `auth.users`
4. Confirm expected ID types:
   - `projects.id` is `TEXT`
   - `work_orders.id` is `UUID`
   - `project_expenses.id` is integer/serial-compatible
   - `documents.id` is `UUID`
   - `auth.users.id` is `UUID`
5. If `work_orders` or `documents` is missing, or if either ID type is not `UUID`, stop before applying Phase 2C.
6. If all dependencies exist with the Phase 2G expected types, proceed with an owner-approved local/staging apply test only.

## Does The Migration Need Adjustment Before Testing?

Current answer: yes, completed in Phase 2G.

Reason:

- Phase 2F preflight found confirmed type mismatches for `work_orders.id` and `documents.id`.
- The migration now uses `UUID` for `work_order_id` and `document_id`.
- No FK was removed or weakened.

Potential future adjustments if target inspection fails:

- If `documents.id` is not `UUID`, do not apply Phase 2C; investigate target/schema drift.
- If `work_orders.id` is not `UUID`, do not apply Phase 2C; investigate target/schema drift.
- If `auth.users` is missing, the target is not a valid Supabase target for this migration.

## Final Phase 2E Answer

Ready for local/staging apply: no, not until the updated Phase 2F preflight returns all PASS.

Any migration changes recommended: yes, completed in Phase 2G.

Exact next step:

Rerun `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql` after the Phase 2G edits. If every row returns `PASS`, Phase 2C can move to an owner-approved local/staging apply test. If any row returns `STOP_*`, stop and resolve the schema mismatch first.
