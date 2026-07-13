# FlipEngine Phase 2H Local Migration Blocker

Status: Blocker documentation only. No SQL was run after the blocker, no `db reset` was executed, no production database was touched, no app code or UI was changed, and no migration file was modified.

## Summary

The Phase 2H local migration test was attempted against local Supabase/Docker only.

Local Supabase startup was able to begin correctly:

- Docker Desktop was running.
- `npx.cmd supabase start` connected to the local Docker engine.
- Supabase local images were pulled.
- The local database initialization process began.
- The local migration chain started applying migrations from `supabase/migrations`.

The local migration chain failed before reaching the FlipEngine migration.

## Blocker

The failure happened while applying:

- `supabase/migrations/20260506_projects_financial_system.sql`

Observed failure:

```text
Applying migration 20260506_projects_financial_system.sql...
ERROR: relation "work_orders" does not exist
At statement:
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT
```

Relevant statement in the failing migration:

- `supabase/migrations/20260506_projects_financial_system.sql` line 54:

```sql
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT;
```

## Root Cause

The local database created by Supabase local from `supabase/migrations` does not have `work_orders` before `20260506_projects_financial_system.sql` tries to alter it.

`work_orders` is defined in:

- `sql/schema.sql`

It is not created earlier in the visible `supabase/migrations` chain.

This means a migrations-only local reset is not currently reproducible from the `supabase/migrations` directory alone.

## What Was Not Run

The following command was not executed:

```powershell
npx.cmd supabase db reset
```

Reason:

- `npx.cmd supabase start` failed during local migration initialization before the local database reached a usable state.

## FlipEngine Migration Status

The FlipEngine migration was not reached.

Target FlipEngine migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

Because the chain failed earlier, this test did not verify creation of:

- `project_acquisitions`
- `project_budget_categories`
- `project_document_links`
- `project_receipts`

Do not modify the FlipEngine migration for this issue.

Reason:

- The blocker is an existing local baseline dependency problem.
- The failing statement is earlier than the FlipEngine migration.
- The FlipEngine migration depends on the real NexArWO base schema already containing `work_orders`, `documents`, `projects`, `project_expenses`, and `auth.users`.

## Production Safety Confirmation

No production changes were made.

Confirmed:

- No production SQL was executed.
- No production migration was applied.
- No `--linked` command was used.
- No `db push` command was used.
- No app code was changed.
- No UI was changed.
- No existing migration file was modified.
- Investor Hub was not activated or changed.

## Why This Matters

Production/read-only preflight already showed the real target schema has:

- `projects.id = text`
- `work_orders.id = uuid`
- `project_expenses.id = integer`
- `documents.id = uuid`
- `auth.users.id = uuid`

Local migrations-only startup does not recreate that same base schema because it lacks an earlier `work_orders` creation step.

Therefore, the local blocker does not prove the FlipEngine migration is invalid. It proves the local migration baseline is incomplete.

## Safe Paths

### Option A: Use Staging Or Restored Database With Real Base Schema

Use a staging database or disposable restored database that already contains the real NexArWO base schema.

Requirements:

- Confirm the target is not production.
- Confirm it contains `work_orders`, `documents`, `projects`, `project_expenses`, and `auth.users`.
- Rerun the Phase 2F preflight.
- Confirm all dependency rows return `PASS`.
- Confirm the four FlipEngine tables return `not_found` / `PASS` before applying the migration.

Benefits:

- Most closely matches the real production schema.
- Avoids inventing local baseline assumptions.
- Reduces risk from stale files under `sql/`.

Risks:

- Requires a safe staging or restored environment.
- Requires owner approval for any migration apply test in that environment.

### Option B: Create A Local-Only Bootstrap Process

Create a local-only bootstrap process that loads the missing base schema before running local migrations.

Requirements:

- Must be documented as local-only.
- Must not be applied to production.
- Must not be confused with production migration history.
- Must account for current real ID types, especially `work_orders.id = uuid` and `documents.id = uuid`.
- Must be reviewed before use because current `sql/schema.sql` contains older assumptions for some ID types.

Benefits:

- Allows repeatable local testing.
- Keeps production migration history untouched.

Risks:

- Current `sql/schema.sql` may not exactly match the live schema.
- A careless bootstrap could create a local schema that passes locally but does not match staging/production.

### Option C: Create An Approved Non-Destructive Baseline Migration Later

Create a formal baseline migration later, only after reviewing production risk and current schema drift.

Requirements:

- Owner approval required before creating any baseline migration.
- Must be non-destructive.
- Must not rewrite or replace existing production schema.
- Must compare live production/staging schema against repo files.
- Must not alter production without a separate approved production plan.

Benefits:

- Could make future local resets reproducible from `supabase/migrations`.
- Documents baseline dependencies clearly.

Risks:

- High risk if treated as a normal production migration without careful review.
- Could conflict with existing production tables if not written as a safe baseline.
- Requires deeper schema reconciliation beyond FlipEngine Phase 2H.

## Recommendation

Do not proceed with production.

Do not apply the FlipEngine migration manually to production.

Do not modify `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` for this blocker.

Next step should be an owner decision between:

1. Use a staging/restored database that already has the real NexArWO base schema.
2. Prepare a local-only bootstrap plan for missing base schema before testing local migrations.

Recommended path:

- Prefer Option A if a safe staging or restored database is available.
- Use Option B only if the owner wants repeatable local-only testing first.
- Defer Option C until the owner approves a broader baseline migration review.

## Current Phase 2H Status

Phase 2H local test status: blocked.

Reason:

- Local Supabase migrations-only startup fails before the FlipEngine migration because `work_orders` is missing from the earlier local migration chain.

Not blocked by:

- The FlipEngine migration file itself.
- The Phase 2G UUID compatibility fix.
- The Phase 2F production read-only preflight result.

Do not start Phase 2I until the owner provides successful local/staging test evidence or chooses an approved alternate test path.
