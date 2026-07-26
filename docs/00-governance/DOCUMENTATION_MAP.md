# Documentation Map - NexArtWO / FlipEngine

Status: Active documentation hierarchy. Audit and conservative cleanup completed 2026-07-12.

## Purpose

This file tells people and coding agents which documents govern current work, which files provide technical evidence, and which files are historical only.

## Authority Order

1. `AGENTS.md` - universal rules and exact protected-operation gates.
2. `memory/CURRENT_TASK.md` - current implementation scope, allowed files, and done criteria.
3. `memory/DECISION_LOG.md` and `memory/PROTECTED_AREAS.md` - owner decisions and standing boundaries.
4. `memory/PROJECT_STATE.md`, `memory/NEXT_ACTIONS.md`, and `memory/AGENT_HANDOFF.md` - current continuity.
5. Relevant product, architecture, module, and QA documents.
6. Chronological phase plans and implementation/QA records.
7. `Otros/`, dated archives, exported task packs, and setup instructions - reference only.

When documents conflict, do not silently choose the convenient one. Follow the higher authority and newest exact owner decision. Protected operations still require exact approval even when a lower document says a phase is ready.

## Current Product And Phase

- NexArtWO is the main operations and project-control product.
- FlipEngine is an internal layer for selected fix-and-flip projects.
- The Property Hub shell passed earlier preview QA.
- Five additional read-only panels are implemented locally and await persistent responsive browser QA and release decisions.
- The four-table FlipEngine MVP migration was tested only in a disposable local database for this work; real staging/restored application and production are not authorized by the current task.

## Start Every Task Here

Read the five-file core and task-specific row defined in `AGENTS.md`. The core is:

1. `README.md`
2. `memory/PROJECT_STATE.md`
3. `memory/CURRENT_TASK.md`
4. `memory/DECISION_LOG.md`
5. this map

Do not preload all module, QA, phase, session, or archive documents. Re-read the core when scope, branch, phase, or protected operations change.

## FlipEngine Document Chain

| Area | Documents | Use |
|---|---|---|
| Product source | `FLIPENGINE_CONTEXT.md` | Business intent, modules, demo property, and product boundary |
| Architecture plan | `docs/flipengine/01` through `06` | Adaptation, repo map, modules, schema direction, phases, backlog |
| MVP schema evidence | `docs/flipengine/07` through `22` | Draft, audit, compatibility, local bootstrap, disposable test, Phase 2 closeout |
| Property Hub shell | `docs/flipengine/23` through `31` | Shell plan, implementation, cleanup, preview QA, release evidence |
| Current read-only work | `docs/flipengine/32` through `42` | Acquisition plan, five panels, validation, and task alignment |

The numbered documents are chronological evidence. A later implementation record can supersede an earlier plan's status without deleting the earlier plan.

## Other Active Documentation

| Topic | Primary documents |
|---|---|
| Product | `docs/01-product/` |
| Repo and JS contracts | `docs/02-architecture/` |
| Investor Hub | `docs/03-modules/INVESTOR_HUB.md`, `docs/PHASE_2*`, `docs/FEATURE_FLAGS.md` |
| Auth/RLS | `docs/AUTH_RLS_*`, `supabase/drafts/auth-rls/` |
| Delivery | `docs/04-development/`, `docs/RELEASE_GATES.md`, `docs/PRODUCTION_GATE_EXECUTION.md` |
| QA | `docs/05-qa/`, `qa/`, FlipEngine QA records |
| UI | `docs/UI_STYLE_GUIDE.md` and current app patterns |

Auth/RLS execution records describe individual historical steps. Never infer the current live security state from one record; verify the target environment before any future action.

## Operational Folders

| Folder | Classification | Rule |
|---|---|---|
| `skills/` | Agent playbooks | Read `skills/README.md`; only `codex-fix` has skill frontmatter, while the others are manual checklists |
| `qa/` | SQL diagnostics, smoke tests, and staging execution scripts | Read `qa/README.md`; the folder is not uniformly read-only |
| `.github/workflows/` | CI and manually triggered database workflows | Inspect trigger, environment, secrets, and mutation commands before use |
| `templates/` | Reusable task/report/PR structures | Safe writing aids; they do not set current phase |
| `design/investor/` | Static Investor Hub UX references | Not loaded by the app and not proof of implemented behavior |
| `scripts/` | Build/env generation and local bootstrap | Build scripts are operational; local SQL bootstrap is protected and disposable-only |
| `sql/` | Legacy/base schema scripts | Protected; some files contain assumptions superseded by later audits |
| `supabase/drafts/` | Proposed Auth/RLS SQL and rollback design | Draft/mutating; never apply by inference |
| `supabase/migrations/` | Migration history and pending migration artifacts | Critical protected area |
| `.vercel/` | Ignored local deployment metadata/environment files | Never use as documentation or commit secrets |

Workflow risk summary:

- `investor-hub-pr-qa.yml` uses ephemeral Postgres and no remote Supabase target by design.
- `staging-db-qa.yml` is manual and staging-scoped but performs `supabase db push`.
- `supabase-financial-qa.yml` uses generic remote Supabase secrets and performs `supabase db push`; it is restricted pending owner review.

## Audit And Cleanup Findings

The recursive 2026-07-12 inventory initially contained 360 Markdown/text files: 211 outside `Otros/` and 149 inside it.

After byte-for-byte comparison and conservative cleanup:

- 218 Markdown/text files remain: 187 active/current-history files outside `Otros/` and 31 unique/historical files inside it.
- No exact Markdown/text duplicate group remains outside `Otros/`.
- Extracted copies of three preserved pack ZIPs were removed after every entry matched by SHA-256.
- The obsolete active onboarding prompt directory and four installation/setup guides were removed; their original pack ZIP remains in `Otros/`.
- The duplicate Phase 2C package folder/ZIP was removed after its two files matched the retained `memory/` copies.
- One duplicate dated repo ZIP and one duplicate historical work-plan Markdown file were removed.
- Generated `dist/` output and a stale ignored log were removed; the build can recreate `dist/`.
- Nine ZIPs remain, all inside `Otros/`: four original agent/control packs, four unique dated repo snapshots, and one historical task archive.
- Two Word files, two PDFs, unique historical plans, media, and business/source documents remain untouched.
- No exact duplicate files exist inside `docs/flipengine/`.

## Historical And Reference Boundary

- `Otros/` is local and ignored by Git. Its four pack ZIPs preserve the removed installation files, starter prompts, and original control/skill packs.
- Dated `nexartwo-main*.zip` files are repository snapshots, not active source.
- `Otros/Redames/Plan de invercionista.docx` is a useful business-origin document whose main workflow is represented in `FLIPENGINE_CONTEXT.md` and the Investor Hub/FlipEngine plans.
- `Otros/Redames/Que es Change order.docx` is a historical Change Order specification for a separate module.
- The two corporate PDFs are legal/business reference records, not software architecture or phase authority.
- Active installation guides and starter prompts were retired because setup is complete and `AGENTS.md` now owns session routing.
- `docs/AGENT_OPERATING_GUIDE.md` and `docs/SYSTEM_ARCHITECTURE_AUDIT.md` are historical baselines; their status banners point to current authority.
- `docs/02-architecture/FUNCTION_INDEX.md` is a useful 2026-05-29 scan, but its line numbers must be rechecked in source.

Keep unique business, legal, media, and recovery evidence. Future cleanup may remove only generated output, proven exact duplicates, or material explicitly approved for retirement. Historical material never acts as current instruction.

## Conflicts Found And Handling

### Investor Hub flag

Policy and `origin/main` keep `INVESTOR_HUB_ENABLED = false`, while the current feature branch contains `true` from an Owner/Admin development commit. This audit documents the branch divergence but does not authorize a code change, merge, or deployment. See `docs/FEATURE_FLAGS.md`.

### Overlapping phase names

The original NexArtWO Phase A-K roadmap and the newer FlipEngine Phase 1-5 records are different planning tracks. `memory/CURRENT_TASK.md` and `docs/04-development/ACTIVE_PHASE.md` define current work.

### Deal Analyzer versus FlipEngine

Deal Analyzer is a possible future quick calculator. FlipEngine is the current internal project-lifecycle layer. They are not interchangeable names.

### Deployment descriptions

Older documents mention GitHub Pages; newer evidence records Vercel previews. Confirm the intended target before any release action. This audit does not declare a production platform.

## Maintenance Rule

After a meaningful phase or task change, update only what changed:

1. `memory/CURRENT_TASK.md`
2. `memory/PROJECT_STATE.md`
3. `memory/NEXT_ACTIONS.md`
4. `memory/AGENT_HANDOFF.md`
5. the relevant implementation/QA record
6. `memory/DECISION_LOG.md` only when an owner decision changed

Do not create a second master index. Update this map and `README.md` instead.
