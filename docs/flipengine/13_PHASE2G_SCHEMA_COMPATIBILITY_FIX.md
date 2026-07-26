# FlipEngine Phase 2G Schema Compatibility Fix

Status: Schema compatibility fix only. No SQL was applied. No migrations were run. No app code, UI, RLS/Auth policy, seed/demo data, financial formula, or Investor Hub behavior was changed.

Migration updated:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

## Preflight Findings

The Phase 2F read-only preflight showed:

| Check | Result |
|---|---|
| `projects.id = text` | PASS |
| `project_expenses.id = integer` | PASS |
| `auth.users.id = uuid` | PASS |
| `work_orders.id = uuid` | STOP against old `text` expectation |
| `documents.id = uuid` | STOP against old `integer` expectation |

The production preflight was read-only. Do not apply the migration to production.

## Migration Changes Made

Updated the un-applied Phase 2C migration to match the real checked schema:

- Changed `project_receipts.work_order_id` from `TEXT` to `UUID`.
- Changed `project_document_links.document_id` from `INTEGER` to `UUID`.
- Updated schema dependency comments in the migration.

Preserved without change:

- `project_id TEXT REFERENCES projects(id)`
- `project_receipts.project_expense_id INTEGER REFERENCES project_expenses(id)`
- `project_receipts.budget_category_id BIGINT REFERENCES project_budget_categories(id)`
- `created_by UUID REFERENCES auth.users(id)`
- `updated_by UUID REFERENCES auth.users(id)`
- `BIGSERIAL` primary keys for the new FlipEngine tables
- `UNIQUE(project_id)` on `project_acquisitions`

## Documentation Updated

Updated:

- `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`
- `docs/flipengine/10_PHASE2D_MIGRATION_REVIEW.md`
- `docs/flipengine/11_PHASE2E_DEPENDENCY_CHECK.md`
- `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql`
- `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.md`

The preflight SQL now expects:

- `public.work_orders.id = uuid`
- `public.documents.id = uuid`

## Confirmation

- No SQL was applied.
- No migration was run.
- No production write occurred.
- No existing table was altered.
- No app code was changed.
- No UI was changed.
- Investor Hub was not activated or modified.
- RLS/Auth policies were not added or changed.

## Remaining Risks

1. The updated preflight must be rerun before any local/staging apply test.
2. The screenshot target was labeled production; production should remain read-only for this stage.
3. Repo base files under `sql/` still contain older assumptions for `work_orders.id` and `documents.id`; future schema work should rely on the updated preflight result for this migration.
4. New FlipEngine tables still have no RLS policies by design and should not be exposed in UI until the approved Auth/RLS phase.
5. Future app code must intentionally populate nullable `created_by` and `updated_by` if audit tracking is required.

## Readiness

Ready for local/staging migration test: not yet.

Ready after:

1. Rerun `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql`.
2. Confirm every dependency row returns `PASS`.
3. Confirm all new FlipEngine tables still return `not_found` / `PASS`.
4. Confirm the target is local or staging, not production.

If the updated preflight returns all `PASS`, the migration is ready for an owner-approved local/staging apply test.

If any row returns `STOP_*`, do not apply the migration. Resolve the schema mismatch first.
