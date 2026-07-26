# Phase 2M: Local Bootstrap Execution Plan

## Scope

This document is a guarded execution plan only. No SQL has been executed, no migrations have been applied, and production must not be touched.

The plan is based on:

- `scripts/local/flipengine_local_bootstrap.sql`
- `docs/flipengine/19_PHASE2L_LOCAL_BOOTSTRAP_SCRIPT.md`

The goal is to define how the local-only bootstrap could be executed later, with owner approval, so the NexArWO base schema exists before testing the FlipEngine MVP migration.

## Safety Rules

- Run only against local Supabase/Docker.
- Do not connect to production.
- Do not use `--linked`.
- Do not use `db push`.
- Do not apply anything to `main` / PRODUCTION.
- Do not run ordinary `npx.cmd supabase db reset` until the bootstrap order problem is solved.
- Do not move the bootstrap script into `supabase/migrations`.
- Do not modify existing migrations.
- Do not use production environment variables for this test.
- Stop immediately if the target database cannot be proven local.

## Why This Plan Is Guarded

The previous local test showed that local Supabase starts applying migrations before the missing base schema exists. The chain failed before reaching the FlipEngine migration:

- Failing migration: `20260506_projects_financial_system.sql`
- Failure reason: `work_orders` did not exist yet
- Root cause: some base NexArWO tables are defined in `sql/schema.sql`, not earlier in `supabase/migrations`

Because `npx.cmd supabase db reset` recreates the local database and then applies `supabase/migrations`, running a normal reset after a manual bootstrap would erase the bootstrap before migrations run. The local test therefore needs an approved bootstrap-first execution path.

## Exact Local-Only Execution Steps

These steps are for a future approved run only.

### 1. Confirm Repo Root

Run from PowerShell:

```powershell
Get-Location
Test-Path AGENTS.md
Test-Path docs\flipengine
Test-Path scripts\local\flipengine_local_bootstrap.sql
Test-Path supabase\migrations\20260705000100_flipengine_mvp_extensions.sql
```

PASS:

- Current path is the NexArWO repo root.
- All `Test-Path` checks return `True`.

STOP:

- The command is running outside the repo.
- `AGENTS.md`, `docs\flipengine`, the bootstrap script, or the FlipEngine migration file is missing.

### 2. Confirm Docker Is Running

Run:

```powershell
docker --version
docker info
```

PASS:

- Docker returns a version.
- `docker info` succeeds.

STOP:

- Docker Desktop is not running.
- Docker commands fail.

### 3. Confirm Supabase CLI Is Available

Run:

```powershell
npx.cmd supabase --version
```

PASS:

- Supabase CLI returns a version.

STOP:

- `npx.cmd` or Supabase CLI is unavailable.

### 4. Confirm This Is Not Production

Before any SQL execution, confirm all of the following:

- No command includes `--linked`.
- No command includes `db push`.
- No command targets `https://udaeifoibydcokefcmbg.supabase.co`.
- No command uses `NEXT_PUBLIC_SUPABASE_URL`.
- No command uses production publishable, service, or database keys.
- The database host is `127.0.0.1` or `localhost`.
- The database port comes from local Supabase status, commonly `54322`.

When local Supabase is running, use:

```powershell
npx.cmd supabase status
```

PASS:

- URLs are local, such as `http://127.0.0.1` or `http://localhost`.
- Database connection points to local Docker, not Supabase Cloud.

STOP:

- Output references the production Supabase project.
- The command is linked to a remote project.
- The database host is not local.

### 5. Start Or Access A Local Database In Bootstrap-First Mode

The normal local startup/reset path is not enough yet, because it starts applying migrations before the bootstrap has created missing base tables.

Approved future execution must use one of these local-only approaches:

- A local Supabase startup mode that allows the local database to accept SQL before replaying migrations.
- A disposable local Postgres/Supabase database container where the bootstrap script is applied first, then repo migrations are replayed locally in order.
- A future approved local runner script outside `supabase/migrations` that performs bootstrap first, then applies migrations in order.

PASS:

- The local database is reachable before migration replay.
- The execution path is documented and approved.

STOP:

- The only available path is ordinary `npx.cmd supabase db reset`.
- Supabase immediately starts migration replay and fails before bootstrap can run.
- The process requires modifying existing migrations.

## Setting The Bootstrap Guard

The bootstrap script has a safety gate. It will stop unless this setting is present in the same local database session:

```sql
SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';
```

This must be set only inside a disposable local database session.

PASS:

- The setting is applied in the same session that runs `scripts/local/flipengine_local_bootstrap.sql`.

STOP:

- The setting would be applied to production, staging, or an unknown database.
- The setting cannot be applied in the same session as the bootstrap script.

## Running The Bootstrap Script Locally

Future approved local execution can use `psql` once the local database connection is proven local.

Example local-only command pattern:

```powershell
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -c "SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';" -f "scripts/local/flipengine_local_bootstrap.sql"
```

Before using this command, confirm the local database port with:

```powershell
npx.cmd supabase status
```

PASS:

- The script runs against `127.0.0.1` or `localhost`.
- The script completes with no errors.
- Base tables such as `projects`, `work_orders`, `documents`, and `project_expenses` exist locally afterward.

STOP:

- `psql` is missing.
- The connection string is not local.
- The bootstrap safety gate fails.
- Any table/type mismatch appears.

## Rerunning The Migration Test After Bootstrap

Do not run ordinary `npx.cmd supabase db reset` after manual bootstrap, because reset recreates the database and removes the bootstrap.

The approved future migration test must do this in one local-only flow:

1. Create or access a disposable local database.
2. Run `scripts/local/flipengine_local_bootstrap.sql` with the local guard enabled.
3. Replay the repo migrations from `supabase/migrations` in timestamp order against the same local database.
4. Confirm the chain reaches `20260705000100_flipengine_mvp_extensions.sql`.
5. Confirm the four FlipEngine MVP tables exist.

PASS:

- All existing migrations replay successfully after bootstrap.
- The FlipEngine migration is reached.
- The FlipEngine migration succeeds locally.

STOP:

- The migration chain fails before the FlipEngine migration.
- The migration runner skips files or changes their order.
- Any migration must be edited to pass.
- Any step requires production access.

## Confirming FlipEngine Tables Were Created

After the approved local migration replay, run this read-only check against the local database only:

```sql
SELECT
  expected.table_name,
  CASE
    WHEN tables.table_name IS NULL THEN 'STOP_MISSING'
    ELSE 'PASS'
  END AS result
FROM (
  SELECT 'project_acquisitions'::text AS table_name
  UNION ALL
  SELECT 'project_budget_categories'
  UNION ALL
  SELECT 'project_document_links'
  UNION ALL
  SELECT 'project_receipts'
) expected
LEFT JOIN information_schema.tables tables
  ON tables.table_schema = 'public'
  AND tables.table_name = expected.table_name
ORDER BY expected.table_name;
```

PASS:

- All four rows return `PASS`.

STOP:

- Any table returns `STOP_MISSING`.
- The query was run against production.

## Rollback And Reset Steps

Rollback is local-only.

Preferred reset for a disposable local database:

```powershell
npx.cmd supabase stop --no-backup
```

Then restart local Supabase only when ready for another approved test.

STOP before rollback:

- There is any uncertainty about whether the target is local.
- Logs or screenshots have not been captured.
- The command could affect production or a linked project.

## STOP Conditions

Stop immediately if any of these occur:

- The target database is production, staging, linked, or unknown.
- A command includes `--linked`.
- A command includes `db push`.
- A command uses the production Supabase URL.
- A command uses production keys.
- Docker is unavailable.
- Supabase CLI is unavailable.
- Local Supabase cannot expose a local database before migration replay.
- The bootstrap guard cannot be set in the same session as the script.
- The bootstrap script fails.
- Migration replay fails before the FlipEngine migration.
- Any existing migration must be modified to continue.
- Any FlipEngine table already exists before the migration test.

## Evidence To Capture

Capture screenshots or terminal output for:

- Current repo path.
- Docker version and `docker info` success.
- Supabase CLI version.
- `npx.cmd supabase status` showing local URLs only.
- Local database connection string with only `127.0.0.1` or `localhost`.
- Bootstrap guard and bootstrap execution result.
- Migration replay result showing the FlipEngine migration was reached.
- Final table-existence query showing all four FlipEngine tables as `PASS`.
- Any error output if the run fails.

## Next Step After Success

Create a Phase 2N evidence review document with:

- Commands run.
- Proof the test was local-only.
- Bootstrap result.
- Migration replay result.
- FlipEngine table verification result.
- Remaining risks before staging.

After that, the owner can decide whether to test in staging/restored database or continue improving local reproducibility.

## Next Step After Failure

Do not retry blindly.

Capture the failure evidence, then create a blocker note documenting:

- Exact command that failed.
- Whether failure happened during bootstrap or migration replay.
- First failing migration file.
- Error message.
- Whether the database was confirmed local.
- Recommended adjustment before another attempt.

Do not modify production, app code, UI, or existing migrations as part of failure recovery.

## Recommendation

This plan is ready for owner review, but not ready for execution until the owner approves the exact local bootstrap-first runner path.

The safest next technical step is to create a local-only runner plan or script outside `supabase/migrations` that can prove this order:

1. Start disposable local database.
2. Run guarded bootstrap.
3. Replay migrations in order.
4. Verify FlipEngine MVP tables.

