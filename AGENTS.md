# AGENTS.md - NexArtWO Universal Agent Rules

Status: Active universal instruction source. Updated 2026-07-12.

## Role

Work as a controlled development agent for NexArtWO. Make the smallest complete, evidence-based change that preserves existing application behavior and financial history.

FlipEngine is an internal NexArtWO layer for selected fix-and-flip projects. It is not a separate application and does not replace Projects, Work Orders, Documents, Financials, or general operations.

## Authority Order

Use this order when instructions or documents differ:

1. The owner's current explicit instruction.
2. This file.
3. `memory/CURRENT_TASK.md` for exact active scope.
4. `memory/DECISION_LOG.md` for approved product and architecture decisions.
5. `docs/00-governance/DOCUMENTATION_MAP.md` for current versus historical documentation.
6. Relevant product, architecture, module, QA, and implementation evidence.
7. Historical material only when current evidence is incomplete.

Tool-specific files (`CLAUDE.md`, `.claude/`, `.codex/`, `.cursor/`, and `.github/instructions/`) adapt these rules but never override them.

## Context Router

### Read at the start of every new task or context reset

1. `README.md`
2. `memory/PROJECT_STATE.md`
3. `memory/CURRENT_TASK.md`
4. `memory/DECISION_LOG.md`
5. `docs/00-governance/DOCUMENTATION_MAP.md`

Do not preload the whole repository. After the five core files, load only the row that matches the task.

| Moment or task | Additional required reading |
|---|---|
| Bug, broken build, console error, or unexpected behavior | `skills/codex-fix/SKILL.md`, `memory/KNOWN_ISSUES.md`, `docs/00-governance/ERROR_RECOVERY.md`, and the relevant regression checklist |
| General app code or UI | `docs/01-product/PRODUCT_MASTER_SPEC.md`, `docs/02-architecture/CURRENT_REPO_MAP.md`, the relevant file contract/module spec, and the matching QA checklist |
| FlipEngine planning or implementation | `FLIPENGINE_CONTEXT.md`, the current task, `docs/flipengine/42_CURRENT_TASK_ALIGNMENT_2026-07-12.md`, and only the plan/implementation evidence for the active phase |
| Investor Hub | `docs/03-modules/INVESTOR_HUB.md`, `docs/FEATURE_FLAGS.md`, and `memory/KNOWN_ISSUES.md` |
| Financial formula or accounting behavior | `docs/02-architecture/FINANCIAL_FORMULAS_CONTRACT.md`, the relevant financial module spec, `skills/financial-formula-review/SKILL.md`, and `docs/05-qa/FINANCIAL_CALCULATION_TESTS.md` |
| Supabase, SQL, migration, Auth, or RLS review | `docs/02-architecture/SUPABASE_CONTRACT.md`, the relevant module/migration evidence, `qa/README.md`, and `skills/supabase-script-review/SKILL.md` |
| QA or regression-only task | `skills/qa-auditor/SKILL.md`, `skills/regression-auditor/SKILL.md`, `qa/README.md` when database artifacts are involved, and the relevant file under `docs/05-qa/` |
| Release, commit, push, preview, or deploy | `docs/05-qa/RELEASE_CHECKLIST.md`, `docs/FEATURE_FLAGS.md`, `docs/04-development/ACTIVE_PHASE.md`, current Git status/diff, and the exact release instruction |
| Resume, handoff, or recovery after interruption | `memory/AGENT_HANDOFF.md`, `memory/NEXT_ACTIONS.md`, the newest entry in `memory/SESSION_LOG.md`, and `docs/00-governance/ERROR_RECOVERY.md` when something failed |

### Re-read context when

- the owner changes scope, priority, module, or protected operation
- the branch or worktree changes
- a context reset or handoff occurs
- the task reaches a new implementation phase
- a protected/shared file becomes necessary
- observed code or schema conflicts with documentation
- a test fails for an unexplained reason
- before any commit, push, preview, deployment, migration, or remote database action

### Archive rule

Do not read `Otros/`, ZIP snapshots, old task packages, or historical session entries by default. Use them only for recovery, provenance, or a specific business question when a current document points there or current evidence is missing. Never let archive content silently replace current scope.

## Pre-Change Contract

Before modifying runtime code, workflows, database artifacts, protected configuration, or non-generated user files, state:

```md
PHASE:
TASK:
FILES TO MODIFY:
READ-ONLY FILES:
PROHIBITED FILES:
RISKS:
VALIDATION PLAN:
```

An explicit owner request that clearly names the task and scope counts as confirmation. Ask again only when the work expands beyond that scope or reaches a protected, destructive, database, formula, Investor Hub, commit, push, or deployment gate not already approved exactly.

## Required Engineering Behavior

- Work on one coherent task at a time.
- Identify exact functions, data contracts, call sites, and shared state before editing.
- Prefer existing helpers, components, patterns, and data sources.
- Keep changes surgical, reversible, and proportional to risk.
- Do not rewrite a working module merely to modernize style or increase line count.
- Do not invent schema, fields, formulas, records, permissions, or business rules.
- Do not add dependencies without documented need.
- Do not fix unrelated issues during the assigned task; record them separately.
- Validate the changed flow and at least one adjacent flow when shared behavior is involved.
- Update current memory and documentation when project state or decisions change.

## Protected Areas

Critical:

```text
js/supabase.js
supabase/
sql/
qa/*.sql
Auth/RLS
Investor Hub
financial formulas and summaries
historical financial records
```

High risk:

```text
js/app.js
js/projects.js
index.html
projects.html
.github/workflows/
```

## Stop Conditions

Stop and obtain exact owner direction when:

- the required file or operation is outside `memory/CURRENT_TASK.md`
- code and current documentation conflict and the correct contract cannot be proven
- the affected functions or data ownership cannot be identified
- the change would require a broad refactor or unrelated repair
- a reported bug cannot be reproduced or verified
- the task reaches SQL execution, `db push`, remote database mutation, production access, Auth/RLS, formula changes, Investor Hub activation/modification, destructive financial behavior, commit, push, or deployment without exact approval

## Database And Financial Rules

- Agent sessions may inspect SQL and prepare reviewable drafts only when the current task allows it.
- Do not execute SQL, run `db push`, link to mutate a remote project, create a database, or touch production from an agent session.
- Do not modify migrations, Auth/RLS, Supabase configuration, or remote workflows without exact owner approval and a separate scope.
- Do not hard-delete financial records or run automatic backfills.
- Do not change historical formulas, ROI, P&L, `project_financial_summaries`, or expense/refund/disbursement semantics without an approved specification, numeric examples, edge cases, and QA.
- Keep investor capital, contributions, capital calls, private lending, loans, draws, receipts, sale proceeds, and operating expenses separate until an approved accounting rule connects them.

## Release Rules

- UI-only releases must exclude SQL, migrations, local bootstrap files, and unrelated untracked artifacts.
- Commit, push, preview deploy, and production deploy are separate approval gates.
- Before release, verify the exact diff, feature flags, target branch/environment, tests, and rollback path.
- After release work, report committed files, checks, risks, deployment status, and whether any database was touched.

## Bug Workflow

For any bug or unexpected behavior, read `skills/codex-fix/SKILL.md`. Verify the issue and root cause before changing code. Apply the smallest safe correction and document validation; no broad repair is permitted under a bug task.

## FlipEngine Stable Rules

- NexArtWO remains the main application; FlipEngine extends selected property-investment workflows inside it.
- Existing projects must not be forced to become investments.
- Do not rebuild the app, duplicate existing modules, or change general branding without approval.
- Work from the current task and relevant phase evidence; do not read all chronological FlipEngine documents every session.
- `projects.id` is `TEXT`; future approved FlipEngine project relationships use `project_id TEXT` unless a later audited decision changes this.
- Prefer additive extension tables over altering protected operational/financial tables.
- The local MVP migration and bootstrap artifacts remain protected and separate from UI releases.
- Investor Hub activation/state remains an explicit owner decision.

## Completion Report

After each task, report:

- phase and outcome
- files changed and intentionally not touched
- checks performed and results
- risks or unresolved decisions
- whether code, UI, SQL, migrations, formulas, database, commit, push, or deployment were touched
- the next real gate, if one remains
