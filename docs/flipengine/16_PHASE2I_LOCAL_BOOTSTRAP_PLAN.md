# FlipEngine Phase 2I Local Bootstrap Plan

Status: Planning only. No SQL was run, no migrations were applied, no `supabase/migrations` files were modified, no app code or UI was changed, and production was not touched.

## Goal

Plan a safe way to make Supabase local reproducible for NexArWO so the FlipEngine Phase 2C migration can be tested locally without touching production.

Target FlipEngine migration:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

## Why The Local Migration Chain Currently Fails

The Phase 2H local test started Supabase local with Docker, but the local migration chain failed before reaching the FlipEngine migration.

Failure point:

- `supabase/migrations/20260506_projects_financial_system.sql`

Failure reason:

```text
ERROR: relation "work_orders" does not exist
```

Failing statement:

```sql
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT;
```

This migration assumes `work_orders` already exists. In a fresh Supabase local database built only from `supabase/migrations`, that table has not been created yet.

Because the chain fails at this earlier migration, the FlipEngine migration is never reached locally.

## Missing Base Tables In `supabase/migrations`

The visible `supabase/migrations` chain creates project financial and investor-related tables, but it does not create the full original NexArWO Work Order base schema before the project financial migration tries to use it.

Base tables defined in `sql/schema.sql` but not created earlier in `supabase/migrations` include:

- `company_settings`
- `clients`
- `services`
- `work_orders`
- `wo_line_items`
- `documents`
- `wo_communications`
- `change_orders`
- `wo_photos`

Additional base document/work-order extension tables are also present in `sql/phase2_migration.sql`, not as earlier Supabase migrations:

- `wo_line_items`
- `documents`
- `wo_communications`
- `change_orders`
- `wo_photos`

For the FlipEngine MVP migration specifically, the most important missing base dependencies are:

- `work_orders`
- `documents`

`work_orders` is required before existing financial migrations can complete. `documents` is required before `project_document_links.document_id UUID REFERENCES documents(id)` can be tested.

## How `sql/schema.sql` Relates To `supabase/migrations`

`sql/schema.sql` appears to be an older or separate base schema reference for the original Work Order application.

`supabase/migrations` appears to contain later schema changes for:

- Projects
- Project expenses, refunds, disbursements
- Project financial summaries
- Investor Hub tables
- Capital calls and capital contributions
- Later alignment/repair migrations
- FlipEngine MVP extension tables

The current local problem is that `supabase/migrations` assumes some base tables from `sql/schema.sql` already exist, but it does not create them first.

Important caution:

- `sql/schema.sql` should not be copied blindly into a local bootstrap.
- The read-only preflight against the real target showed `work_orders.id = uuid` and `documents.id = uuid`.
- Older repo SQL under `sql/schema.sql` shows older assumptions for those tables.
- Any local bootstrap must match the real target schema needed by the current migration, not stale assumptions.

## Local-Only Bootstrap Options

### Option A: Use A Restored Local Copy From A Real Schema

Create a local database from a safe dump or restored copy of staging/production schema, then test the FlipEngine migration locally against that restored structure.

Requirements:

- Owner-approved source for the schema dump.
- No production writes.
- No `db push`.
- No `--linked` operation from this repo to production.
- Confirm the restored local schema has:
  - `projects.id = text`
  - `work_orders.id = uuid`
  - `project_expenses.id = integer`
  - `documents.id = uuid`
  - `auth.users.id = uuid`
- Run Phase 2F preflight after restore.
- Apply the FlipEngine migration only after local preflight returns all `PASS`.

Benefits:

- Most faithful local target.
- Avoids inventing missing table definitions.
- Best chance of matching the production schema without touching production.

Risks:

- Requires safe schema export/restore process.
- Must avoid bringing sensitive production data into local unless explicitly approved and sanitized.
- Must clearly separate local restore commands from production commands.

### Option B: Create A Local-Only Bootstrap SQL File

Create a local-only bootstrap SQL file that builds only the missing base tables needed before `supabase/migrations` can run.

This file should not live in `supabase/migrations` unless the owner later approves a formal baseline migration.

Possible future location:

- `supabase/local/bootstrap/001_nexarwo_base_schema.sql`

Expected scope:

- Create missing base tables required by local migration replay.
- Match real target ID types where confirmed:
  - `work_orders.id UUID`
  - `documents.id UUID`
- Avoid seed/demo data.
- Avoid RLS policy changes unless separately approved.
- Avoid Investor Hub activation.
- Avoid financial formula changes.

Benefits:

- Keeps production migration history untouched.
- Can make local testing repeatable.
- Allows the team to document exactly which base assumptions local requires.

Risks:

- If bootstrap definitions drift from staging/production, local tests can pass while real apply still fails.
- Requires careful reconciliation against the real schema, not just `sql/schema.sql`.
- May require adapting older table definitions that used `TEXT` or `SERIAL` IDs.

### Option C: Create A Local Bootstrap Script

Create a script that starts local Supabase, loads a local-only bootstrap schema, then runs or tests migrations.

Possible future file:

- `scripts/supabase-local-bootstrap.ps1`

Expected behavior:

- Refuse to run if Supabase is linked to production.
- Print the local Supabase URL/port before any action.
- Load only local bootstrap SQL.
- Never run `db push`.
- Never use production credentials.
- Stop if Docker is unavailable.
- Stop if any required dependency check fails.

Benefits:

- Makes local setup safer and repeatable.
- Provides guardrails for future agents.

Risks:

- Scripts can be misused if they accept arbitrary target URLs.
- Needs strict local-only checks.
- Must not hide SQL execution from the owner.

### Option D: Use Staging Instead Of Local Bootstrap

Use a staging or disposable restored database that already has the real NexArWO base schema.

Requirements:

- Staging must be clearly separate from production.
- Staging must have a backup or restore point.
- Phase 2F preflight must return all `PASS`.
- FlipEngine tables must return `not_found` / `PASS` before apply.

Benefits:

- Avoids local baseline drift.
- Tests against an environment closer to the real app.

Risks:

- Requires a staging database and owner-approved apply process.
- Still must not be treated as production approval.

## Risks Of Creating A Baseline Migration

A formal baseline migration inside `supabase/migrations` is higher risk than a local-only bootstrap.

Risks:

- It may run against production later if not carefully gated.
- It may conflict with tables that already exist in production.
- It may encode old `sql/schema.sql` assumptions that differ from the real schema.
- It may accidentally alter or replace existing Work Order or Document behavior.
- It may create Auth/RLS drift if policies are included prematurely.
- It may create false confidence if it only works locally.

If a baseline migration is ever considered, it must be:

- Owner-approved.
- Non-destructive.
- Reviewed against the current staging/production schema.
- Written with `IF NOT EXISTS` and compatibility checks where safe.
- Kept separate from FlipEngine MVP migration decisions.
- Tested in local and staging before any production discussion.

## Recommended Path For Testing FlipEngine Locally

Recommended path:

1. Prefer a restored local copy or staging-derived schema over hand-building from stale SQL.
2. If restored local is not available, create a local-only bootstrap plan and review it before writing SQL.
3. The local bootstrap should create only missing base schema needed for migration replay.
4. The bootstrap must match the current verified schema types:
   - `work_orders.id = uuid`
   - `documents.id = uuid`
   - `projects.id = text`
   - `project_expenses.id = integer`
   - `auth.users.id = uuid`
5. After bootstrap, run the Phase 2F preflight locally.
6. Only if every row returns `PASS`, rerun the local migration test for `20260705000100_flipengine_mvp_extensions.sql`.
7. Capture evidence using `docs/flipengine/14_PHASE2H_LOCAL_STAGING_MIGRATION_TEST.md`.

Do not proceed to production from local bootstrap success alone.

## Files To Create Later If Approved

No files should be created yet beyond this planning document.

If the owner approves a local-only bootstrap path, future files may include:

- `docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_SPEC.md`
- `supabase/local/bootstrap/001_nexarwo_base_schema.sql`
- `scripts/supabase-local-bootstrap.ps1`
- `docs/flipengine/18_PHASE2K_LOCAL_BOOTSTRAP_REVIEW.md`

If the owner approves a staging/restored database path instead, future files may include:

- `docs/flipengine/17_PHASE2J_STAGING_TEST_EVIDENCE.md`
- `docs/flipengine/18_PHASE2K_PRODUCTION_APPLY_DECISION.md`

None of these future files should modify app code, UI, existing migrations, financial formulas, Auth/RLS, or Investor Hub behavior unless separately approved.

## What Must Not Be Done

Do not:

- Run SQL from this planning phase.
- Apply migrations from this planning phase.
- Run `npx.cmd supabase db reset` again until a local bootstrap or restored schema plan is approved.
- Run `db push`.
- Use `--linked`.
- Touch production.
- Modify `supabase/migrations`.
- Modify `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` for the local baseline issue.
- Copy `sql/schema.sql` blindly into `supabase/migrations`.
- Create a production baseline migration without owner approval.
- Change app code.
- Change UI.
- Activate or modify Investor Hub.
- Change Auth/RLS policies.
- Change existing financial formulas.
- Add seed/demo data.
- Force all projects to become FlipEngine investments.

## Decision Needed From Owner

Before any more local migration testing, the owner should choose one path:

1. Restored local/staging-derived schema for the safest schema match.
2. Local-only bootstrap SQL and script for repeatable local development.
3. Later formal baseline migration review, with production risk analysis.

Recommended owner decision:

- Choose restored local/staging-derived schema if available.
- Choose local-only bootstrap if repeatable local development is the immediate priority.
- Defer formal baseline migration until after schema drift is fully reviewed.

## Current Status

Phase 2I status: planning complete.

Local migration test status: blocked until the owner approves a local bootstrap or restored schema path.

Production status: untouched and not approved for migration apply.
