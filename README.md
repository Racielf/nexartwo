# NexArtWO - Documentation Index

Status: Active entry point. Updated 2026-07-12.

## Product Identity

NexArtWO is the main operations and project-control application.

FlipEngine is an internal NexArtWO layer for selected real-estate investment projects. It extends Projects, Work Orders, financial records, documents, and controlled investor workflows. It is not a separate app and does not convert every project into an investment.

## Read Before Work

Read in this order:

1. `AGENTS.md` - universal rules and protected operations.
2. `memory/PROJECT_STATE.md` - current product and environment state.
3. `memory/CURRENT_TASK.md` - exact active scope and current gates.
4. `memory/DECISION_LOG.md` - approved owner decisions.
5. `docs/00-governance/DOCUMENTATION_MAP.md` - document hierarchy and topic map.

Then use the context router in `AGENTS.md` to load only the documents required for the current kind of work. Re-read the core when scope, branch, phase, or protected operations change.

Tool-specific files such as `CLAUDE.md`, `.codex/instructions.md`, `.cursor/`, and `.github/instructions/` adapt these rules for each tool. They do not override `AGENTS.md`.

## Current Development State

The active task is the FlipEngine Property Hub read-only closeout before data-backed integration.

Current local work includes read-only Acquisition, Budget, Loans / Draws, Sale / Exit, and Reports panels in `js/projects.js`. The FlipEngine MVP migration has been drafted and tested in a disposable local database, but it has not been applied to a real staging/restored environment or production through the current task.

Use these current-state files:

- `memory/PROJECT_STATE.md`
- `memory/CURRENT_TASK.md`
- `memory/NEXT_ACTIONS.md`
- `memory/AGENT_HANDOFF.md`
- `docs/04-development/ACTIVE_PHASE.md`

## Main Documentation Areas

- `docs/00-governance/` - operating rules, stop conditions, recovery, and the document map.
- `docs/01-product/` - product boundaries, requirements, and module priority.
- `docs/02-architecture/` - repo map, state contracts, function index, Supabase, and financial boundaries.
- `docs/03-modules/` - module specifications, including Investor Hub.
- `docs/04-development/` - active phase, backlog, roadmap, and delivery workflow.
- `docs/05-qa/` - smoke, regression, financial, mobile, data, and release checks.
- `docs/flipengine/` - chronological FlipEngine plans, implementation records, and QA evidence.
- `memory/` - current task, decisions, known issues, handoff, and session history.
- `skills/` - repository-specific agent playbooks; see `skills/README.md`.
- `qa/` - read-only, transactional, and mutating SQL artifacts; see `qa/README.md` before execution.
- `.github/workflows/` - automated and manual QA/migration workflows with different risk levels.
- `design/` - static UX references, not production application code.
- `scripts/`, `sql/`, and `supabase/` - build, bootstrap, schema, migration, function, and security artifacts; protected by the current task gates.

## Historical Material

`Otros/` is a local, ignored recovery archive. Duplicate extracted packs were removed; original pack ZIPs, unique business documents, media, and dated snapshots remain. Agents must not read this archive by default or copy an old plan into active work without reconciling it with `AGENTS.md`, `memory/CURRENT_TASK.md`, and current code.

## Core Rule

Use the smallest evidence-based change that completes the approved task. Protected operations still require exact owner approval even when general development is authorized.
