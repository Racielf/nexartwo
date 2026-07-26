# FlipEngine Phase 2J Local Bootstrap Draft

Status: Draft only. No SQL was run, no migrations were applied, no production database was touched, no app code or UI was changed, and no existing migration file was modified.

Source:

- `docs/flipengine/16_PHASE2I_LOCAL_BOOTSTRAP_PLAN.md`

Related SQL draft:

- `docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.sql`

## Goal

Draft a local-only bootstrap approach so a disposable Supabase local database can have the missing NexArWO base schema needed before testing:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

This is not a production migration and must not be placed in `supabase/migrations`.

## Why This Bootstrap Is Needed

The Phase 2H local test showed that `npx.cmd supabase start` can begin local Docker initialization, but the local migration chain fails before reaching the FlipEngine migration.

The failure happens in:

- `supabase/migrations/20260506_projects_financial_system.sql`

The failing statement assumes `work_orders` already exists:

```sql
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT;
```

In a fresh Supabase local database built only from `supabase/migrations`, `work_orders` has not been created yet.

## What Existing Migrations Require

The visible migration chain requires these tables or relations before the FlipEngine migration can be tested locally:

| Object | Why it is needed |
|---|---|
| `projects` | Created by `20260506`; parent for project financial tables and FlipEngine tables |
| `work_orders` | Required by `20260506` before it can add `project_id` and create financial work-order FKs |
| `project_expenses` | Created by `20260506`; required by FlipEngine `project_receipts.project_expense_id` |
| `project_refunds` | Created by `20260506`; required by the existing financial summary view/triggers |
| `project_disbursements` | Created by `20260506`; required by the existing financial summary view/triggers |
| `documents` | Required by FlipEngine `project_document_links.document_id` |
| `auth.users` | Supabase-managed; required by audit fields and existing `project_expenses.created_by` migration |

The Work Order base schema also references:

| Object | Why it may be needed |
|---|---|
| `clients` | Parent for `work_orders.client_id` if the local base table includes that relationship |
| `services` | Parent for `wo_line_items.service_id` if line items are included |
| `wo_line_items` | Not required by the visible migration chain, but useful for a minimal Work Order base local schema |

## Important Type Compatibility Finding

The real target preflight showed:

- `work_orders.id = uuid`
- `documents.id = uuid`
- `projects.id = text`
- `project_expenses.id = integer`
- `auth.users.id = uuid`

Older repo SQL under `sql/schema.sql` uses older assumptions:

- `work_orders.id TEXT`
- `documents.id SERIAL`
- `work_order_id TEXT` in Work Order child tables

The local bootstrap draft must not copy `sql/schema.sql` blindly.

## Draft Strategy

The SQL draft uses a reconciled local-only strategy:

1. Create a minimal local base schema before the normal migration chain runs.
2. Use UUID primary keys for `work_orders.id` and `documents.id` to match the real target preflight and the Phase 2G FlipEngine migration.
3. Precreate the project financial tables that `20260506` would otherwise create with stale `work_order_id TEXT` references.
4. Keep the same project financial column shape expected by `20260506`, so its view, functions, triggers, RLS enablement, and policies can still be created later by the existing migration.
5. Avoid RLS policies, triggers, seed data, storage buckets, and app/UI changes in the bootstrap draft.

This strategy is more than simply creating `work_orders`, because creating only `work_orders.id UUID` would make the old `work_order_id TEXT REFERENCES work_orders(id)` declarations fail later in `20260506`.

## What The SQL Draft Would Create Locally

Base/support tables:

- `company_settings`
- `clients`
- `services`
- `projects`
- `work_orders`
- `wo_line_items`
- `documents`

Compatibility financial tables:

- `project_expenses`
- `project_refunds`
- `project_disbursements`

The compatibility financial tables are included only because the current visible `20260506` migration creates them with `work_order_id TEXT`, while the real target schema and FlipEngine Phase 2G require UUID work-order references.

## What This Bootstrap Must Not Do

It must not:

- Run in production.
- Be placed in `supabase/migrations`.
- Replace the real production schema.
- Use `db push`.
- Use `--linked`.
- Modify existing migration files.
- Modify `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
- Add seed/demo data.
- Add RLS policies.
- Add triggers.
- Add storage buckets.
- Activate Investor Hub.
- Change financial formulas.
- Change app code or UI.
- Force all projects to become FlipEngine investments.

## Why This Is Not For Production

This draft is designed to repair local replayability only.

It precreates some tables that production already has, and it intentionally reconciles old repo assumptions with the schema confirmed by preflight. Applying this to production could conflict with existing tables, constraints, policies, triggers, or live data.

Production must be handled only through a separate owner-approved production apply plan after local/staging evidence exists.

## How It Would Be Used Later If Approved

If the owner approves this local-only path, a future phase could:

1. Move the draft into a clearly local-only location, such as `supabase/local/bootstrap/001_nexarwo_base_schema.sql`.
2. Create a guarded local script, such as `scripts/supabase-local-bootstrap.ps1`.
3. Confirm Docker and Supabase CLI are available.
4. Confirm the repo is not linked to production.
5. Start Supabase local.
6. Apply the local-only bootstrap to the disposable local database.
7. Run or replay the local migration chain.
8. Run `docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql` locally.
9. Apply/test the FlipEngine migration locally only if every preflight row returns `PASS`.
10. Capture results using `docs/flipengine/14_PHASE2H_LOCAL_STAGING_MIGRATION_TEST.md`.

This Phase 2J task does not authorize those execution steps.

## Risks

1. The draft may still drift from the real production schema if the live database has constraints not represented in repo files.
2. Precreating project financial tables is a local workaround for stale migration assumptions, not a production solution.
3. If a future agent moves this into `supabase/migrations`, it could become dangerous.
4. If `work_orders.project_id` delete behavior matters, the local bootstrap may not perfectly match production because migration history has both `ON DELETE RESTRICT` and `ON DELETE SET NULL` intent.
5. RLS is intentionally omitted from the bootstrap; app behavior should not be validated from this bootstrap alone.
6. This draft does not include `wo_communications`, `change_orders`, or `wo_photos`; those may be needed for broader local UI testing but are not required for the FlipEngine migration schema test.
7. Local success would not equal production approval.

## PASS Criteria

The draft is acceptable for later owner review only if:

- It stays outside `supabase/migrations`.
- It is clearly labeled local-only.
- It creates `work_orders.id` as UUID.
- It creates `documents.id` as UUID.
- It keeps `projects.id` as TEXT.
- It keeps `project_expenses.id` as integer/serial-compatible.
- It avoids seed data, RLS policies, triggers, storage changes, app code, UI, and Investor Hub.
- It documents that no SQL should be run without a later approval step.

## STOP Criteria

Stop and do not use the bootstrap if:

- The target is production or unclear.
- The repo is linked to production.
- A future version is placed inside `supabase/migrations` without owner approval.
- The draft uses stale `work_orders.id TEXT` or `documents.id SERIAL` assumptions.
- The draft changes financial formulas or existing migration files.
- The draft adds seed/demo data.
- The draft adds RLS/Auth policies or Investor Hub behavior.
- Any Phase 2F preflight row fails after bootstrap.

## Is This Enough To Attempt A Local Test Later?

Not yet.

This is enough as a candidate draft for owner review, but not enough to run another local test immediately. Before attempting a local test later, the owner should approve:

1. Whether this reconciled bootstrap strategy is acceptable.
2. Whether to create a local-only bootstrap file under a non-migration folder.
3. Whether to create a guarded local script.
4. Whether local tests should proceed before staging/restored database testing.

Recommended next step:

- Review this draft and decide whether Phase 2K should convert it into a guarded local-only bootstrap implementation.
