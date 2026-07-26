# QA Directory - NexArtWO

Status: Active execution-safety guide. Updated 2026-07-12.

## Critical Rule

Files in `qa/` are SQL. The folder name does not mean every file is read-only. Do not execute any QA SQL against a remote database without the exact target, purpose, backup/rollback expectations, and owner approval.

## Read-Only Diagnostics

These scripts contain only inspection queries:

- `auth_rls_production_preflight.sql`
- `auth_rls_schema_compatibility_queries.sql`

Read-only still requires target confirmation when production or sensitive schema metadata is involved.

## Transactional Smoke Tests

These scripts insert/update/delete temporary test records inside `BEGIN` and end with `ROLLBACK`:

- `financial_system_smoke_test.sql`
- `investor_hub_smoke_test.sql`

They are not passive queries. Use `ON_ERROR_STOP=1`, verify the final `ROLLBACK`, and run only in an approved disposable or staging environment. A failed connection normally rolls back an open transaction, but this is not a substitute for target approval.

## Mutating Staging Scripts

These files create or change tables, policies, functions, triggers, grants, or owner-role records and do not wrap the full script in a rollback transaction:

- `auth_rls_owner_bootstrap_staging.sql`
- `auth_rls_004b_user_roles_policies_staging.sql`
- `auth_rls_005_projects_policies_staging.sql`
- `auth_rls_006_expenses_refunds_policies_staging.sql`
- `auth_rls_007_disbursements_policies_staging.sql`
- `auth_rls_008_financial_summaries_rpc_staging.sql`
- `auth_rls_009_restricted_views_staging.sql`

They are staging execution artifacts, not ordinary tests. The owner bootstrap contains a staging-specific identity and must never be reused as a production identity.

## Workflow Relationship

- `.github/workflows/investor-hub-pr-qa.yml` uses an isolated ephemeral Postgres service and is the safest automated database test path by design.
- `.github/workflows/staging-db-qa.yml` is manual and staging-scoped, but it runs `supabase db push`; treat it as a protected migration operation.
- `.github/workflows/supabase-financial-qa.yml` links a generic remote project and runs `supabase db push`. It is restricted pending an explicit target/security review. See `memory/KNOWN_ISSUES.md`.

## Result Reporting

Record the exact environment, command or workflow, commit, output, PASS/FAIL result, residual-data check, and any rollback performed. Never report a database test as passed when it was not actually run.
