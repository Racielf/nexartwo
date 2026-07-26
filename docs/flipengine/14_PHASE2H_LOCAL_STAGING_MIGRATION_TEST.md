# FlipEngine Phase 2H Local/Staging Migration Test

Status: Test instruction document only. No SQL was run, no migration was applied, no app code or UI was changed, and Investor Hub was not activated.

Target migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

## Production Preflight Confirmation

The owner reran the Phase 2F dependency preflight and confirmed all dependency rows now return `PASS`:

| Dependency check | Expected result |
|---|---|
| `auth.users.id` | `uuid` / `PASS` |
| `documents.id` | `uuid` / `PASS` |
| `project_expenses.id` | `integer` / `PASS` |
| `projects.id` | `text` / `PASS` |
| `work_orders.id` | `uuid` / `PASS` |

That production preflight was read-only only. It does not authorize applying the migration to production.

## Production Warning

Do not apply this migration to production during Phase 2H.

Phase 2H is only for preparing and running a local or staging migration test after owner approval. Production must remain read-only until:

1. Local or staging test results are captured.
2. The owner reviews the result evidence.
3. A separate production apply decision is explicitly approved.
4. Backup, rollback, and timing are confirmed for production.

## Test Scope

The migration test should create only these four new tables:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`

The test must not:

- Alter existing tables.
- Modify existing rows.
- Create RLS policies.
- Create triggers.
- Insert seed/demo data.
- Change Work Orders, Documents, Projects, Financials, or Investor Hub behavior.
- Convert receipts into expenses automatically.
- Mix investor capital or funding with operating expenses.

## Before Testing

Use only one of these targets:

- Supabase local database.
- Staging Supabase project.
- Disposable restored staging copy.

Do not use:

- Production.
- A plain Postgres database without Supabase `auth.users`.
- Any database where test rollback is not approved.

Required pre-test checks:

1. Confirm the target label clearly says local, staging, or disposable restored copy.
2. Confirm the target is not `main / PRODUCTION`.
3. Run `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql` against the test target.
4. Confirm every dependency row returns `PASS`.
5. Confirm every FlipEngine table absence row returns `not_found` / `PASS`.
6. Save or screenshot both preflight result sets.
7. Confirm the migration file being tested is exactly `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
8. Confirm the owner approves applying the migration to this local/staging target.

## Local Test Steps

Use the owner-approved local Supabase workflow for this repo. Do not use production credentials.

Recommended local sequence:

1. Start from a disposable local database or a local database that can be reset safely.
2. Run the Phase 2F preflight against local.
3. Confirm all preflight rows return `PASS`.
4. Apply only `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` through the approved local migration process.
5. Run the post-migration verification checks below.
6. Capture results.
7. Roll back or reset local only if needed.

If the local database was built only from `supabase/migrations/` and is missing `work_orders` or `documents`, stop. The target needs the approved base schema before this migration can be tested.

## Staging Test Steps

Use staging only after the owner confirms it is separate from production and backed up.

Recommended staging sequence:

1. Confirm staging is not production.
2. Confirm staging has a recent backup or a clear restore point.
3. Run the Phase 2F preflight against staging.
4. Confirm all preflight rows return `PASS`.
5. Apply only `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` through the owner-approved staging migration process.
6. Run the post-migration verification checks below.
7. Capture screenshots/results.
8. Do not expose the new tables in UI yet.
9. Do not add RLS/Auth policies in this phase.
10. Do not proceed to production apply without a separate owner decision.

## Confirm The Four Tables Were Created

After applying the migration in local/staging, verify table existence with read-only schema inspection.

Expected result:

| Table | Expected state |
|---|---|
| `public.project_acquisitions` | exists |
| `public.project_budget_categories` | exists |
| `public.project_receipts` | exists |
| `public.project_document_links` | exists |

Also verify these key compatibility points:

- Every new table has `id BIGSERIAL`.
- Every new table has `project_id TEXT REFERENCES projects(id)`.
- `project_acquisitions.project_id` is unique.
- `project_receipts.work_order_id` is `UUID REFERENCES work_orders(id)`.
- `project_receipts.project_expense_id` is `INTEGER REFERENCES project_expenses(id)`.
- `project_receipts.budget_category_id` is `BIGINT REFERENCES project_budget_categories(id)`.
- `project_document_links.document_id` is `UUID REFERENCES documents(id)`.
- Every new table has nullable `created_by UUID REFERENCES auth.users(id)`.
- Every new table has nullable `updated_by UUID REFERENCES auth.users(id)`.
- No RLS policies were added.
- No triggers were added.
- No seed/demo rows were inserted.

## Suggested Post-Migration Read-Only Checks

Use read-only catalog checks where possible.

Table existence:

```sql
SELECT
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'project_acquisitions',
    'project_budget_categories',
    'project_receipts',
    'project_document_links'
  )
ORDER BY table_name;
```

Column type spot-check:

```sql
SELECT
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'project_acquisitions',
    'project_budget_categories',
    'project_receipts',
    'project_document_links'
  )
  AND column_name IN (
    'id',
    'project_id',
    'work_order_id',
    'project_expense_id',
    'budget_category_id',
    'document_id',
    'created_by',
    'updated_by'
  )
ORDER BY table_name, ordinal_position;
```

Constraint spot-check:

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'project_acquisitions',
    'project_budget_categories',
    'project_receipts',
    'project_document_links'
  )
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
```

Index spot-check:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'project_acquisitions',
    'project_budget_categories',
    'project_receipts',
    'project_document_links'
  )
ORDER BY tablename, indexname;
```

## Optional Disposable Data Checks

Run these only in disposable local/staging data after owner approval.

Recommended checks:

1. Insert one `project_acquisitions` row for an existing test `projects.id`.
2. Attempt a second `project_acquisitions` row for the same `project_id` and confirm the unique constraint rejects it.
3. Insert one `project_budget_categories` row for the test project.
4. Insert one `project_receipts` row with `project_id` only and no `project_expense_id`.
5. Insert one `project_receipts` row manually linked to a valid `project_expense_id`, if safe test data exists.
6. Insert one `project_document_links` row manually linked to a valid UUID `documents.id`, if safe test data exists.
7. Confirm no row was automatically inserted into `project_expenses`.
8. Delete only the disposable rows created for the test.

Do not use real customer, investor, lender, or financial records for this check.

## Rollback In Local Or Staging

Rollback depends on the target and whether any real data was created.

### Disposable Local

Preferred local rollback:

1. Reset or recreate the disposable local database using the approved local workflow.
2. Re-run the preflight if another test is needed.

If a manual cleanup is approved for disposable local only, remove only the four new tables and only after confirming they contain no needed data.

### Staging

Preferred staging rollback:

1. Restore the staging backup or restore point taken before the test.
2. If a restore is not possible, stop and create a reviewed corrective migration.
3. Do not manually drop staging tables if they may contain real or reviewed test data.

Manual table drops in staging require explicit owner approval and a written confirmation that no production or important staging data is affected.

### Production

No rollback step is provided for production in Phase 2H because production apply is out of scope.

## Screenshots And Results To Capture

Capture these before and after the test:

1. Environment label showing local, staging, or disposable restored copy.
2. Phase 2F dependency preflight result with all rows `PASS`.
3. Phase 2F FlipEngine table absence result with all rows `not_found` / `PASS`.
4. Migration apply success output for `20260705000100_flipengine_mvp_extensions.sql`.
5. Post-migration table existence result showing the four new tables.
6. Post-migration column type spot-check.
7. Constraint/index spot-check showing `UNIQUE(project_id)` and expected FKs/indexes.
8. Optional disposable data test results, if performed.
9. Confirmation that no app UI was changed or exposed.
10. Confirmation that Investor Hub was not activated.
11. Confirmation that no existing financial formulas or records were modified.

## PASS Criteria

The local/staging migration test passes only if all of these are true:

- Target is confirmed local, staging, or disposable restored copy.
- Preflight dependency check returns all `PASS`.
- Preflight table absence check returns all `PASS`.
- Migration applies without errors.
- Exactly the four approved FlipEngine MVP tables are created.
- Existing tables are not altered.
- No existing data is updated or deleted.
- `project_id` is `TEXT` in all four new tables.
- `work_order_id` and `document_id` are `UUID` where used.
- `project_acquisitions` has `UNIQUE(project_id)`.
- No RLS policies, triggers, or seed/demo data are created.
- Receipts remain supporting evidence and do not automatically create expenses.
- Investor Hub remains unchanged and inactive.
- Owner has saved the required screenshots/results.

## STOP Criteria

Stop immediately if any of these happen:

- The target is production.
- The target cannot be clearly identified.
- Preflight returns any `STOP_*` result.
- Any FlipEngine MVP table already exists before the test.
- Migration apply fails.
- The migration attempts to alter or drop existing tables.
- Existing financial records change unexpectedly.
- `project_receipts.work_order_id` is not UUID-compatible.
- `project_document_links.document_id` is not UUID-compatible.
- `auth.users` is missing.
- Any RLS/Auth policy, trigger, seed data, UI change, or Investor Hub change appears in the test.
- Rollback path is unclear.

## Next Step After Successful Local/Staging Test

After a successful local/staging test:

1. Save the screenshots/results in the project record.
2. Document any deviations, warnings, or manual cleanup performed.
3. Ask the owner to review the local/staging evidence.
4. Decide whether a separate production apply plan should be prepared.
5. Keep Phase 3 UI work blocked until the owner approves the database state and the RLS/Auth plan.

Recommended next phase:

- Phase 2I: owner review of local/staging migration evidence and production apply decision.

Do not proceed to production apply, RLS/Auth policies, UI work, seed/demo data, or Investor Hub activation from this Phase 2H document alone.
