# CURRENT_TASK - NexArWO / FlipEngine

## Task

FlipEngine Property Hub read-only module closeout and next governance gate.

## Phase

Post read-only UI implementation. Pre data-backed integration.

## Objective

Keep the repository aligned with the FlipEngine work that is actually active:

- Review and preserve the five new Property Hub read-only panels.
- Complete browser-level manual QA when a usable preview environment is available.
- Prepare a clean review/commit boundary for the UI and its documentation.
- Define the exact non-production migration and Auth/RLS decision required before any new-table read or write path.

This task does not authorize SQL execution, migration apply, production access, Auth/RLS changes, Investor Hub changes, or financial formula changes.

## Current Local Implementation

Implementation file:

- `js/projects.js`

Read-only Property Hub panels implemented:

1. Acquisition
2. Budget
3. Loans / Draws
4. Sale / Exit
5. Reports

Current tracked code scope:

```text
js/projects.js | 170 added lines
```

No existing code line was removed by these panels.

## Documentation Created

- `docs/flipengine/33_PHASE4B_ACQUISITION_READ_ONLY_IMPLEMENTATION.md`
- `docs/flipengine/34_PHASE5A_BUDGET_READ_ONLY_PLAN.md`
- `docs/flipengine/35_PHASE5B_BUDGET_READ_ONLY_IMPLEMENTATION.md`
- `docs/flipengine/36_SALE_EXIT_READ_ONLY_PLAN.md`
- `docs/flipengine/37_SALE_EXIT_READ_ONLY_IMPLEMENTATION.md`
- `docs/flipengine/38_LOANS_DRAWS_READ_ONLY_PLAN.md`
- `docs/flipengine/39_LOANS_DRAWS_READ_ONLY_IMPLEMENTATION.md`
- `docs/flipengine/40_REPORTS_READ_ONLY_PLAN.md`
- `docs/flipengine/41_REPORTS_READ_ONLY_IMPLEMENTATION.md`
- `docs/flipengine/42_CURRENT_TASK_ALIGNMENT_2026-07-12.md`
- `docs/flipengine/43_PROPERTY_HUB_RESPONSIVE_QA_PASS.md` (2026-07-25)

## Documentation Governance Alignment

The owner also requested a recursive documentation audit. That completed audit:

- created `docs/00-governance/DOCUMENTATION_MAP.md`
- updated the root documentation index and current product/development gateways
- aligned `memory/PROJECT_STATE.md`, `memory/NEXT_ACTIONS.md`, and `memory/AGENT_HANDOFF.md`
- added historical-status notices to older architecture/operating audits
- preserved `Otros/`, dated archives, old task packs, and detailed phase evidence without deleting them
- documented the unresolved branch-local Investor Hub flag divergence without changing code
- extended the map through `skills/`, `qa/`, `.github/workflows/`, `templates/`, `design/`, `scripts/`, `sql/`, and `supabase/`; the obsolete active `agent-starter-prompts/` copy was then retired after archive verification
- classified QA SQL by execution risk and recorded `ISSUE-014` for the legacy workflow that can push to a generic remote Supabase target
- recursively reviewed all 10 files under `skills/`, documented each subfolder, and corrected the installed-versus-optional file description in `codex-fix`
- removed only generated output, proven exact duplicates, completed setup material, and redundant exported task packages while preserving ZIP recovery packs and unique historical/business evidence
- replaced broad repeated reading lists with the task-based context router in `AGENTS.md` and synchronized the Claude, Codex, Cursor, and Copilot adapters

This documentation alignment does not expand the future code scope of this task.

## Validation Status

Passed:

- `node --check js/projects.js`
- `git diff --check -- js/projects.js`
- Acquisition render with representative data
- Budget render with and without a financial summary
- Loans / Draws render with positive and zero loan values
- Sale / Exit render with sold and unsold projects
- Reports render with and without a financial summary
- Combined regression of all five panels
- `fix_and_flip` eligibility gate
- Normal-project exclusion
- No form controls in the five new panels
- No new `DB.*`, `fetch()`, or Supabase calls in the new branches
- No future FlipEngine table references in `js/projects.js`
- Documentation map literal path references resolve
- Current documentation inventory and duplicate counts reproduce
- Operational folder guides exist at `skills/README.md` and `qa/README.md`
- Documentation cleanup inventory reproduces at 218 Markdown/text files: 187 outside `Otros/` and 31 inside it
- No exact Markdown/text duplicate group remains outside `Otros/`
- All 30 explicit paths used by the agent router/archive notes resolve
- `npm.cmd run build` passes; generated `dist/` was removed again after validation
- No tracked workflow, SQL, migration, or QA SQL diff was introduced by cleanup
- Gateway documents have one H1 and ASCII-only replacement content
- `git diff --check` passes for the combined working diff
- No tracked SQL, migration, QA SQL, or workflow diff was introduced by the documentation audit

Passed (2026-07-25, AI-driven headless-browser QA — see `docs/flipengine/43_PROPERTY_HUB_RESPONSIVE_QA_PASS.md`):

- Browser-level manual QA in a persistent local environment (headless Chromium against `python -m http.server`, no `chromium-cli` available in-session so Playwright was installed to a scratch directory outside the repo)
- Responsive QA on desktop (1440px), tablet (768px), and phone (390px) for all five panels against the real `Coindo` (`Fix & Flip`) project
- Browser console check across all 15 panel/viewport combinations — zero errors or warnings

New finding from this pass (not caused by the five panels; logged, not fixed): `memory/KNOWN_ISSUES.md` `ISSUE-015` — pre-existing horizontal overflow (~751px content in a 390px phone viewport) on the Property Hub grid and on the pre-existing Overview tab of the same Project Workspace page.

Passed (2026-07-26, owner decision on the flag and local-commit boundary — see `memory/DECISION_LOG.md`):

- `INVESTOR_HUB_ENABLED` resolved to `false` in `js/projects.js`, matching `origin/main` and production. Re-verified in browser: flag reads `false`, Property Hub still works for `Coindo`, zero console errors.
- `ISSUE-015` decision: scheduled as a separate CSS-only follow-up task (not deferred indefinitely, not fixed in this task).
- Reviewed closeout scope committed locally (not pushed).

Pending:

- Push decision (not yet authorized; workflow-trigger review shows push alone would not run any CI workflow, but the decision itself is still separate)
- Deployment decision
- Scheduling/assigning the `ISSUE-015` CSS-only follow-up task

## Previous Investor Hub Task Preservation

The previous local `CURRENT_TASK.md` described:

```text
ISSUE-013 Phase 2C - Add Investor Wizard UI
```

That complete task brief remains preserved at:

- `memory/TASK_BRIEF.md`

Preserved SHA-256:

```text
66D7A0D041C80A39D13A78BFB714B97FC315D6BCDF6EA3CFF568509CD5B70CB9
```

Investor Hub Phase 2C is not deleted, completed, or implicitly authorized by this alignment update.

## Allowed Files For Current Closeout

Implementation review or narrow bug fix:

- `js/projects.js`

Documentation and task alignment:

- `docs/flipengine/`
- `memory/CURRENT_TASK.md`

Completed owner-requested documentation audit only:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md` and tool-specific instruction adapters
- `docs/00-governance/DOCUMENTATION_MAP.md`
- `docs/02-architecture/CURRENT_REPO_MAP.md`
- `skills/README.md`
- `qa/README.md`
- current product/development gateway documents
- current memory handoff/state documents
- historical-status banners on older operating/architecture audits

Read-only inspection:

- `js/supabase.js`
- existing migrations
- existing financial view definitions
- existing project and Work Order code
- Investor Hub documentation

## Protected / Prohibited Operations

Do not perform without a separate exact owner approval:

- SQL execution
- migration apply
- `db push`
- linked Supabase commands
- remote database workflows, including `.github/workflows/supabase-financial-qa.yml`
- production database access or changes
- Auth/RLS changes
- new Supabase data methods
- FlipEngine CRUD
- Investor Hub activation or modification
- project financial formula changes
- receipt-to-expense automation
- payment or draw accounting automation
- commit, push, preview deploy, or production deploy

## Remaining Data-Backed Modules

These cannot move beyond placeholders/read-only boundaries without approved data sources and accounting rules:

- Receipts
- Documents
- Investors
- Contractors
- Labor / Time
- Payments

## Next Governance Gate

Before data-backed work begins, the owner must approve an exact non-production plan covering:

1. Target staging or restored database environment.
2. Exact migration apply procedure.
3. Backup/restore and rollback procedure.
4. Auth/RLS policies for the new FlipEngine tables.
5. Read behavior when tables are unavailable.
6. Source-of-truth rules for acquisition and budget data.
7. Receipt-to-expense and document-link rules.
8. First approved CRUD module.

Production remains outside this task.

## Done When

- The current UI/documentation diff is reviewed.
- Browser manual QA is recorded, or its environment blocker is documented.
- The owner decides whether to commit and push the read-only release.
- The next exact staging/governance task is approved and replaces this file.
