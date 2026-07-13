# Phase 2N: Disposable Local Test Results

## Test Metadata

- Test date/time: 2026-07-05 00:54:20 -07:00
- Test type: disposable local Docker Postgres schema test
- Container name: `flipengine_phase2n_pg`
- Image used: `public.ecr.aws/supabase/postgres:17.6.1.140`
- Scope: local-only isolated database test for the FlipEngine MVP migration

## Production Safety Confirmation

Production was not touched.

The test did not use:

- `--linked`
- `db push`
- Supabase production commands
- Production Supabase URL
- Production Supabase credentials

No app code, UI files, or migration files were modified during this test.

## Commands Summary

The test used a disposable Docker Postgres container and executed only local commands:

1. Checked whether `flipengine_phase2n_pg` already existed.
2. Checked available local Docker images.
3. Created the disposable local container using `public.ecr.aws/supabase/postgres:17.6.1.140`.
4. Confirmed Postgres readiness with `pg_isready`.
5. Created or confirmed the minimal `auth.users` table required by the migration FKs.
6. Copied `scripts/local/flipengine_local_bootstrap.sql` into the container.
7. Ran the bootstrap with the safety setting active in the same `psql` session:

   ```sql
   SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';
   ```

8. Copied `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` into the container.
9. Applied the FlipEngine MVP migration inside the disposable container.
10. Verified the four FlipEngine MVP tables exist.
11. Verified critical ID and FK column types.
12. Captured constraint/FK evidence.
13. Removed the disposable container.
14. Confirmed the container was removed.

## Bootstrap Result

Result: PASS

The local-only bootstrap script completed successfully after the guard setting was applied in the same `psql` session.

The bootstrap created the local base tables needed for the isolated migration test, including:

- `projects`
- `work_orders`
- `documents`
- `project_expenses`
- `project_refunds`
- `project_disbursements`
- supporting local base tables such as `clients`, `services`, and `wo_line_items`

## FlipEngine Migration Result

Result: PASS

The unapplied migration file:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

applied successfully inside the disposable local Docker Postgres container.

No changes to the migration file were required by this isolated test.

## Tables Verified

The table existence check returned PASS for all four MVP tables:

| Table | Result |
| --- | --- |
| `project_acquisitions` | PASS |
| `project_budget_categories` | PASS |
| `project_document_links` | PASS |
| `project_receipts` | PASS |

## Critical Types Confirmed

The isolated local test confirmed these critical types:

| Table | Column | Type |
| --- | --- | --- |
| `projects` | `id` | `text` |
| `work_orders` | `id` | `uuid` |
| `work_orders` | `project_id` | `text` |
| `documents` | `id` | `uuid` |
| `documents` | `work_order_id` | `uuid` |
| `project_expenses` | `id` | `integer` |
| `project_expenses` | `project_id` | `text` |
| `project_expenses` | `work_order_id` | `uuid` |
| `project_acquisitions` | `id` | `bigint` |
| `project_acquisitions` | `project_id` | `text` |
| `project_budget_categories` | `id` | `bigint` |
| `project_budget_categories` | `project_id` | `text` |
| `project_receipts` | `id` | `bigint` |
| `project_receipts` | `project_id` | `text` |
| `project_receipts` | `work_order_id` | `uuid` |
| `project_receipts` | `project_expense_id` | `integer` |
| `project_receipts` | `budget_category_id` | `bigint` |
| `project_document_links` | `id` | `bigint` |
| `project_document_links` | `project_id` | `text` |
| `project_document_links` | `document_id` | `uuid` |

## Constraint Evidence

The test confirmed the expected primary keys, foreign keys, and the 1:1 acquisition rule:

- `project_acquisitions.project_id` references `projects(id)`
- `project_acquisitions.project_id` has `UNIQUE (project_id)`
- `project_budget_categories.project_id` references `projects(id)`
- `project_receipts.project_id` references `projects(id)`
- `project_receipts.work_order_id` references `work_orders(id)`
- `project_receipts.project_expense_id` references `project_expenses(id)`
- `project_receipts.budget_category_id` references `project_budget_categories(id)`
- `project_document_links.project_id` references `projects(id)`
- `project_document_links.document_id` references `documents(id)`
- `created_by` and `updated_by` FKs were created against the local `auth.users` table representation

## Error Encountered And Correction

An initial attempt to create `auth.users` with the `postgres` user failed because the `auth` schema in the Supabase Postgres image is owned by `supabase_admin`.

Observed issue:

- `postgres` could connect and inspect the database.
- Creating `auth.users` failed with a permission error on schema `auth`.

Correction:

- Used the local `supabase_admin` role inside the disposable container.
- Created or confirmed `auth.users (id uuid PRIMARY KEY)`.
- Continued the bootstrap and migration test successfully.

This was a local container permission issue only. It did not require changes to the FlipEngine migration.

## Container Cleanup

The disposable container was removed after evidence was captured:

- Removed container: `flipengine_phase2n_pg`
- Final check confirmed no container with that name remained.

## Remaining Risk

The full Supabase local migration chain is still not reproducible.

Reason:

- `npx.cmd supabase start` attempts to apply existing migrations.
- The chain fails before reaching the FlipEngine migration.
- Failure occurs in `20260506_projects_financial_system.sql` because `work_orders` does not exist yet.
- `work_orders` is part of the older/base NexArWO schema that is not fully represented before that point in `supabase/migrations`.

This means the isolated Docker Postgres test proves the FlipEngine migration can apply after the required base schema exists, but it does not prove the complete Supabase local migration chain is healthy.

## Conclusion

Based on this isolated disposable local Docker Postgres test, the FlipEngine MVP migration does not need changes.

The migration successfully created:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`

The critical FK-compatible types matched the verified schema assumptions.

## Recommended Next Steps

1. Do not apply to production yet.
2. Use a staging/restored database for the next real environment test if available.
3. If no staging environment exists, prepare a separate production deployment plan before applying anything.
4. Continue app development only behind safe checks or feature gating until the database migration is applied.

