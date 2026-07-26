# AGENT_HANDOFF - NexArtWO / FlipEngine

Updated: 2026-07-12.

## Active Task

Close and review the five local Property Hub read-only panels, then obtain the next governance decision before any data-backed integration.

## Repository State

- Branch: `feat/activate-investor-hub-local`.
- HEAD/origin branch baseline: `fdafbe10bf60a874ea4442b33624d506f6e41e3a`.
- Main implementation diff: `js/projects.js`, 170 added lines for five read-only panels.
- Documentation: `docs/flipengine/33` through `42` plus current memory alignment.
- Agent context: use the five-file core and task-specific router in `AGENTS.md`; do not preload all FlipEngine history or `Otros/`.
- Cleanup: obsolete setup/prompts, redundant task packages, generated output, and verified duplicate archive extractions were retired; unique ZIP recovery and business evidence remain locally in ignored `Otros/`.
- No commit, push, migration apply, or deployment is authorized by this handoff.

## Validation Passed

- JavaScript syntax and diff checks.
- Isolated render checks for Acquisition, Budget, Loans / Draws, Sale / Exit, and Reports.
- `fix_and_flip` eligibility and normal-project exclusion.
- No forms, save controls, new DB/Supabase calls, or future-table references in the new branches.
- Agent-router paths, documentation inventory, duplicate scan, JavaScript syntax, diff checks, and the static build pass after cleanup.

## Validation Pending

- Persistent browser QA.
- Desktop, tablet, and phone responsive QA.
- Browser console and adjacent Project Workspace regression check.

## Decision Required Before Release

This branch has `INVESTOR_HUB_ENABLED = true`; `origin/main` has `false`. The current value came from commit `e8b24271` for Owner/Admin development. Do not change or promote it by inference. The owner must decide the target state before merge or deployment.

## Next Safe Task

After closeout, create one approved non-production plan for the FlipEngine migration, rollback, Auth/RLS, safe read behavior, data ownership, and first CRUD module. Production remains out of scope.

## Historical Handoff Recovery

The previous 2026-06-06 Investor Hub/schema handoff is preserved in Git history. Its pre-alignment SHA-256 is:

```text
77A20C530E7A9653D11FA5EF26202838469F653DF17EA4354D148D2B36F513F2
```

Treat that handoff as historical evidence, not as the active task. The preserved Investor Hub Phase 2C task brief remains in `memory/TASK_BRIEF.md`.
