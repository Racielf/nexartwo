# FlipEngine Phase 2D Migration Safety Review

Status: Documentation/review only. No SQL was applied. No SQL was executed. No app code, UI, existing migrations, existing tables, RLS, triggers, seeds, or Investor Hub behavior were changed.

Reviewed migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

Source context reviewed:

- `AGENTS.md`
- `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`
- `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`
- `docs/flipengine/08_EXISTING_SCHEMA_AUDIT.md`
- `docs/flipengine/09_PHASE2B_MVP_SQL_DRAFT.sql`

## Line-by-Line Review Summary

- Lines 1-29: Header, scope, guardrails, and schema audit dependency comments. No executable SQL in this section.
- Lines 31-74: `project_acquisitions` table and closing-date index. Uses `BIGSERIAL`, `project_id TEXT`, nullable audit fields, and `UNIQUE(project_id)`.
- Lines 76-113: `project_budget_categories` table and project/status/category indexes. Uses `BIGSERIAL`, `project_id TEXT`, nullable audit fields, and manual/future-calculation budget fields.
- Lines 115-169: `project_receipts` table and lookup/status indexes. Keeps receipts separate from expenses, uses `project_expense_id` only as a nullable manual link, and uses `work_order_id UUID` after Phase 2G.
- Lines 171-225: `project_document_links` table and lookup indexes. Links existing documents without altering or deleting document records, and uses `document_id UUID` after Phase 2G.

## Tables Created

The migration creates exactly four new tables:

1. `project_acquisitions`
2. `project_budget_categories`
3. `project_receipts`
4. `project_document_links`

No existing table is altered.

## Foreign Keys

Project relationships:

- `project_acquisitions.project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT`
- `project_budget_categories.project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT`
- `project_receipts.project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT`
- `project_document_links.project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT`

Optional operational/document relationships:

- `project_receipts.work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL`
- `project_receipts.project_expense_id INTEGER REFERENCES project_expenses(id) ON DELETE SET NULL`
- `project_receipts.budget_category_id BIGINT REFERENCES project_budget_categories(id) ON DELETE SET NULL`
- `project_document_links.document_id UUID REFERENCES documents(id) ON DELETE SET NULL`

Audit relationships:

- Each new table includes nullable `created_by UUID REFERENCES auth.users(id)`.
- Each new table includes nullable `updated_by UUID REFERENCES auth.users(id)`.

## Indexes

`project_acquisitions`:

- `idx_project_acquisitions_closing_date` on `closing_date`
- Project lookup is covered by `project_acquisitions_project_id_unique UNIQUE(project_id)`

`project_budget_categories`:

- `idx_project_budget_categories_project_id` on `project_id`
- `idx_project_budget_categories_status` on `status`
- `idx_project_budget_categories_category_type` on `category_type`

`project_receipts`:

- `idx_project_receipts_project_id` on `project_id`
- `idx_project_receipts_work_order_id` on `work_order_id`
- `idx_project_receipts_project_expense_id` on `project_expense_id`
- `idx_project_receipts_budget_category_id` on `budget_category_id`
- `idx_project_receipts_review_status` on `review_status`
- `idx_project_receipts_reimbursement_status` on `reimbursement_status`

`project_document_links`:

- `idx_project_document_links_project_id` on `project_id`
- `idx_project_document_links_document_id` on `document_id`
- `idx_project_document_links_related_module` on `related_module`
- `idx_project_document_links_related_record_id` on `related_record_id`
- `idx_project_document_links_review_status` on `review_status`

## Destructive Statements Check

Static search found no executable destructive statements in the reviewed migration:

- No `DROP`
- No `ALTER`
- No `UPDATE`
- No `DELETE`
- No `TRUNCATE`
- No `CREATE FUNCTION`
- No `GRANT` or `REVOKE`

The migration uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` only.

## RLS, Triggers, and Seeds Check

Static search found:

- No `CREATE POLICY`
- No `ENABLE ROW LEVEL SECURITY`
- No `CREATE TRIGGER`
- No `INSERT INTO`
- No seed/demo data

RLS/Auth policy design remains deferred to a separate approved phase.

## Dependency Check

Confirmed dependencies from current repo artifacts:

- `projects.id` is `TEXT PRIMARY KEY` in `supabase/migrations/20260506_projects_financial_system.sql`.
- `project_expenses.id` is `SERIAL PRIMARY KEY` in `supabase/migrations/20260506_projects_financial_system.sql`, so `project_expense_id INTEGER` is type-compatible.
- Phase 2F preflight against the current target confirmed `work_orders.id` is `UUID`, so `project_receipts.work_order_id UUID` is type-compatible after Phase 2G.
- Phase 2F preflight against the current target confirmed `documents.id` is `UUID`, so `project_document_links.document_id UUID` is type-compatible after Phase 2G.
- `auth.users(id)` is already referenced by the existing `project_expenses.created_by` migration.

Dependency caution:

- Repo base schema files under `sql/` still show older `TEXT`/`SERIAL` assumptions for `work_orders` and `documents`; the Phase 2F preflight result overrides those assumptions for the current target.
- Rerun the updated Phase 2F preflight before any local/staging apply test.

## Confirmations

- No DROP statements: confirmed.
- No ALTER existing tables: confirmed.
- No UPDATE or DELETE existing data: confirmed.
- `project_id` is `TEXT` everywhere it appears as a table column: confirmed.
- `project_acquisitions` has `UNIQUE(project_id)`: confirmed.
- No use of old `sql/PHASE_2B_SCHEMA.sql`: confirmed.
- No Investor Hub table or behavior is changed: confirmed.
- No existing financial formula is changed: confirmed.
- Receipts do not automatically create expenses: confirmed.

## Risks

1. The updated preflight must be rerun before any local/staging migration test.
2. New tables currently have no RLS policies by design; they should not be exposed in UI until the owner approves the Auth/RLS phase.
3. `created_by` and `updated_by` are nullable and have no defaults; future app code must populate them if audit tracking is required.
4. `project_acquisitions` overlaps conceptually with acquisition/loan/closing summary fields already present in `projects`; source-of-truth UI rules are still needed.
5. Budget actuals are manual/future-calculation-ready and should not be treated as final accounting until formulas are approved.
6. `project_receipts.project_expense_id` is a manual link only. Future UI must avoid double-counting receipts as operating expenses.

## Exact Manual Steps to Test Later

Do not run these steps until the owner explicitly approves a local or staging test.

### Local test path

1. Confirm the target is a disposable local database, not production.
2. Confirm local schema contains these dependency tables before applying this migration:
   - `projects`
   - `work_orders`
   - `project_expenses`
   - `documents`
   - `auth.users`
3. Run the updated Phase 2F preflight and confirm `work_orders.id` and `documents.id` both return `uuid`/`PASS`.
4. Apply the single migration in the approved local workflow.
5. Verify all four tables exist:
   - `project_acquisitions`
   - `project_budget_categories`
   - `project_receipts`
   - `project_document_links`
6. Verify `project_acquisitions.project_id` rejects duplicate records for the same project.
7. Verify a receipt can be inserted with only `project_id` and without `project_expense_id`.
8. Verify a receipt can optionally link to an existing UUID `work_orders.id`, integer `project_expenses.id`, and `project_budget_categories.id`.
9. Verify a document link can optionally link to an existing UUID `documents.id`.
10. Verify no rows were inserted into existing financial tables as a side effect.
11. Verify no existing Project, Work Order, Document, Investor Hub, or financial summary UI is changed by this migration alone.

### Staging test path

1. Confirm staging is backed up and clearly separate from production.
2. Run the updated Phase 2F preflight and confirm staging has the expected dependency types, including `work_orders.id = uuid` and `documents.id = uuid`.
3. Apply the migration through the owner-approved staging migration process.
4. Run schema inspection for the four new tables and their indexes.
5. Insert and delete only disposable test rows for a staging test project.
6. Confirm `project_acquisitions` uniqueness by attempting a second acquisition row for the same project and expecting rejection.
7. Confirm deleting or nulling optional linked records follows the expected `ON DELETE SET NULL` behavior in staging test data only.
8. Confirm existing project financial summaries and Investor Hub records are unchanged.
9. Record results before approving any production apply.

## Recommendation

Conditionally ready for an owner-approved local or staging apply test after rerunning the updated Phase 2F preflight.

Not ready for production apply until:

- The owner confirms the updated preflight returns PASS for `documents.id = uuid` and `work_orders.id = uuid`.
- A local or staging test passes.
- The owner accepts that RLS/Auth policies are intentionally deferred and that the tables should not be exposed in UI until that phase is approved.
