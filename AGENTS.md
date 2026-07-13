# AGENTS.md — NexArtWO Universal Agent Rules

## Role

You are a controlled development agent for NexArtWO.

Your job is to make small, safe, reversible improvements without breaking existing features or financial data.

## Mandatory context

Before touching code, read:

1. `README.md`
2. `memory/PROJECT_STATE.md`
3. `memory/CURRENT_TASK.md`
4. `memory/DECISION_LOG.md`
5. `docs/00-governance/STOP_CONDITIONS.md`
6. `docs/00-governance/ERROR_RECOVERY.md`
7. Relevant module spec under `docs/03-modules/`

## Required response before coding

Before modifying files, respond with:

```md
FASE:
TAREA:
ARCHIVOS A MODIFICAR:
ARCHIVOS SOLO LECTURA:
ARCHIVOS PROHIBIDOS:
RIESGOS:
PLAN DE VALIDACIÓN:
¿CONFIRMAS QUE PUEDO CONTINUAR?
```

Do not code until explicit confirmation is received.

## Absolute prohibitions

- Do not change Supabase URL.
- Do not create a new database.
- Do not run `db push`.
- Do not execute SQL against production.
- Do not modify `supabase/migrations/` without owner approval.
- Do not modify Auth/RLS unless explicitly authorized.
- Do not enable Investor Hub unless explicitly authorized.
- Do not modify historical financial formulas without approved spec.
- Do not hard-delete financial records.
- Do not run automatic backfills.
- Do not rewrite full modules.
- Do not combine phases.
- Do not add dependencies without documented justification.
- Do not change architecture without recording the decision.
- Do not fix unrelated bugs during the assigned task.

## Release Guardrails

- UI-only releases must not include SQL files or database migrations.
- Do not apply migrations unless the owner explicitly approves that exact action.
- Do not run `db push` unless the owner explicitly approves that exact action.
- Do not touch the production database unless the owner explicitly approves that exact action.
- Do not activate Investor Hub unless the owner explicitly approves that exact action.
- Do not include untracked SQL files, bootstrap scripts, or local database helper files in UI commits.
- Phase 2 migration files and local bootstrap files must stay separate from UI releases unless the owner specifically approves including them.
- Before push or deploy, confirm the committed files contain only the intended release scope.
- After every release or deploy task, report committed files, checks run, risks, deploy status, and whether any database was touched.
- Future release prompts may reference `AGENTS.md` instead of repeating these rules.

## Required behavior

- Work on one task only.
- Change the smallest possible area.
- Preserve existing functionality.
- Validate manually.
- Document remaining risks.
- Update memory files if project state changes.
- Stop if instructions conflict.

## Protected files and areas

Critical:

```txt
js/supabase.js
supabase/
sql/
Auth/RLS
Investor Hub
Financial formulas
Historical financial records
```

High risk:

```txt
js/app.js
js/projects.js
projects.html
index.html
```

## Stop immediately if

- The task requires SQL.
- The task touches protected files not listed in `CURRENT_TASK.md`.
- The requested change conflicts with documentation.
- The agent cannot identify the affected functions.
- The fix requires broad refactoring.
- The issue cannot be reproduced.

## Bug fix skill

If the task involves a bug, console error, failed build, broken module, frontend issue, backend issue, Supabase issue, RLS issue, or unexpected behavior, the agent must read:

- `skills/codex-fix/SKILL.md`

before proposing or making code changes.

The agent must first verify the error, diagnose the root cause, and propose the smallest safe change. No broad refactor is allowed during bug repair.

## FlipEngine permanent context

FlipEngine work in this repository must follow the current FlipEngine planning docs. Before any FlipEngine implementation, schema work, UI work, or financial logic work, read the relevant files below:

1. `FLIPENGINE_CONTEXT.md`
2. `docs/flipengine/01_ADAPTATION_STRATEGY.md`
3. `docs/flipengine/02_EXISTING_REPO_MAP.md`
4. `docs/flipengine/03_MODULES_TO_ADD.md`
5. `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
6. `docs/flipengine/05_IMPLEMENTATION_PHASES.md`
7. `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`
8. `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`
9. `docs/flipengine/08_EXISTING_SCHEMA_AUDIT.md`

Permanent product rules:

- NexArWO is the existing main application.
- FlipEngine is a new layer/module inside NexArWO for selected fix-and-flip real estate investment workflows.
- FlipEngine is not a separate replacement app.
- NexArtEngine belongs to another project and must not be used as app name, branding, table prefix, module name, or repository identity here.
- NexArWO must keep working as a Work Orders, Projects, construction, documents, and operations system.
- Existing projects must not be forced to become investments.
- Only selected `projects` may represent properties/investments in the FlipEngine context.
- Do not rebuild the app from scratch.
- Do not delete or break existing modules.
- Do not change general NexArWO branding without owner approval.

## FlipEngine protected decisions

- Work by small phases following `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`.
- Do not combine schema, UI, financial formulas, and Investor Hub work in the same task unless explicitly approved.
- Do not modify existing migrations without owner approval.
- Do not apply SQL without owner approval.
- Do not execute SQL from an agent session.
- Do not run `db push`.
- Do not create a new database.
- Do not activate, expose, rework, or depend on Investor Hub behavior without owner approval.
- Do not change Auth/RLS without explicit owner approval.
- Do not change existing financial formulas, ROI, P&L, `project_financial_summaries`, expense/refund/disbursement semantics, or historical financial records without an approved spec.
- Keep investor capital, capital contributions, capital calls, private lender funding, and other funding views separate from operating expenses, ROI, P&L, and Work Order formulas.
- Do not automatically convert receipts, loans, draws, capital calls, or funding records into operating expenses without an approved accounting rule.

## FlipEngine schema rules

- `projects.id` is confirmed as `TEXT`.
- Any new table related to `projects` must use `project_id TEXT` unless a later owner-approved audit changes this decision.
- Future `project_id` relationships should reference `projects(id)` and must not assume UUID.
- Do not alter `projects` for the first FlipEngine MVP migration.
- Do not alter `work_orders`, `documents`, `project_expenses`, `project_refunds`, `project_disbursements`, `project_financial_summaries`, or Investor Hub tables for the first FlipEngine MVP migration.
- Prefer new non-destructive extension tables over adding fields to protected existing tables.
- For MVP Phase 2, the only approved draft scope is new tables for:
  - `project_acquisitions`
  - `project_budget_categories`
  - `project_receipts`
  - `project_document_links`
- `docs/flipengine/09_PHASE2B_MVP_SQL_DRAFT.sql` is a review draft only. It must not be applied or moved into `supabase/migrations/` without owner approval.

## Required workflow for FlipEngine tasks

Before implementing:

- Identify the exact phase from `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`.
- Re-read the relevant FlipEngine docs for that phase.
- Confirm the task does not conflict with Context Guardrails.
- Confirm whether the task is documentation-only, SQL draft, migration, app code, UI, QA, or deployment.
- Stop and ask for owner approval if the task requires SQL execution, migration files, existing schema changes, Auth/RLS, Investor Hub, financial formulas, production data, destructive actions, or deployment.

During implementation:

- Keep changes small, additive, and reversible.
- Prefer existing repo patterns and data access conventions.
- Do not rename existing docs, modules, tables, or branding unless the owner explicitly asks.
- Preserve current NexArWO Work Orders, Projects, Financials, Documents, Supabase data layer, and dashboard behavior.

After each task, report:

- Phase
- Files modified
- Files intentionally not touched
- Risks found
- Tests or checks performed
- Whether SQL/migrations/code/UI were avoided or changed
- Next recommended step
