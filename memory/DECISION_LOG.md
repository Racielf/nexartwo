# DECISION_LOG — NexArtWO

## Format

```md
## YYYY-MM-DD — Decision title

Decision:
Reason:
Alternatives considered:
Impact:
Owner approval:
```

---

## Pending — Cash-In model

Decision pending.

Must define:
- capital contributions
- loan draws
- payments received
- sale proceeds
- refunds
- disbursements

## Pending — Investor Hub

Locked until Cash-In spec and owner approval.

## Pending — Auth/RLS

Locked until user roles and activation plan are approved.

## Recommended — Deal Analyzer

Fixflip-style calculator should become a NexArtWO module for fast field analysis.

---

## 2026-07-26 - Resolve INVESTOR_HUB_ENABLED Branch Divergence; Local Commit Of Reviewed Closeout

Decision:

- Set `INVESTOR_HUB_ENABLED = false` in `js/projects.js` on `feat/activate-investor-hub-local`, matching `origin/main` and production. The divergence recorded 2026-07-12 (branch `true` vs. production `false`) is resolved by adopting the production value.
- Commit locally (not pushed) the reviewed, QA-passed closeout scope already enumerated in `memory/CURRENT_TASK.md` under "Allowed Files For Current Closeout": the five Property Hub read-only panels in `js/projects.js`, the `docs/flipengine/` phase records, the completed documentation-audit files, and current memory/state files — including the 2026-07-25 responsive QA pass and `ISSUE-015`.
- Push, PR, migration apply, Auth/RLS changes, Investor Hub re-activation, and production/staging deployment remain separately gated and were not performed.

Reason:

- Investor Hub work is still incomplete per `ISSUE-013` (Investor Directory vs. Project Capital Workspace separation) and was explicitly confirmed uninvoked by the Property Hub shell during the 2026-07-25 QA pass. Shipping a branch with a WIP feature flag enabled while production keeps it disabled is a release risk with no offsetting benefit for this task's scope; reverting to the production value is the reversible, conservative default. Re-enabling later for a specific, approved Investor Hub milestone remains a one-line change.
- The UI/documentation diff already carried a "Passed" validation record before this session (syntax, `git diff --check`, isolated render, eligibility, no-new-data-call, build, and now browser/responsive QA). A local commit creates a clean, reversible checkpoint of already-reviewed work without exposing it remotely or triggering any CI workflow (`.github/workflows/investor-hub-pr-qa.yml` triggers only on `pull_request`/`workflow_dispatch`; `staging-db-qa.yml` and `supabase-financial-qa.yml` are `workflow_dispatch`-only) — confirmed by reading all three workflow files before deciding.

Alternatives considered:

- Leaving the flag divergence unresolved: rejected — it was the explicit blocker named in `memory/PROJECT_STATE.md`'s "Open Governance Risk," and leaving it `true` going into any future merge risks an accidental production activation.
- Setting the flag to match the branch's `true` instead: rejected — no approved Investor Hub milestone justifies diverging from production from this task.
- Also pushing the branch: not decided here — push was not part of the specific question the owner authorized ("el flag y el commit"); it remains open for an explicit follow-up decision, now de-risked by the workflow-trigger review above.
- Also fixing `ISSUE-015` (phone-width overflow) in this same commit: rejected — out of this task's scope, pre-existing, and per the `ISSUE-009` precedent should be its own CSS-only task with its own review.

Impact:

- `feat/activate-investor-hub-local` now matches production's Investor Hub posture. The next agent/session should not need to revisit this unless a new Investor Hub milestone is explicitly approved.
- The local commit gives a clean, named checkpoint (see commit message) that can be reviewed, amended, or reset before any push/PR is authorized.
- `ISSUE-015` remains open as its own follow-up candidate; it was not bundled into this commit.

Owner approval:

Owner asked directly whether the flag and commit decisions were needed, then replied "decide tú" (you decide) on 2026-07-26 — read as specific authorization to resolve exactly those two named items, not as blanket authorization for push, deploy, migrations, Auth/RLS, or the `ISSUE-015` fix.

---

## 2026-07-12 - Surgical Development Authorization

Decision:

- Continue building FlipEngine as an internal app/CRM layer inside NexArWO.
- Existing product and development documents may receive small, necessary updates when they no longer match the real implementation state.
- Code changes are authorized when they are evidence-based, function-scoped, reversible, and required for the approved module or workflow.
- Reuse existing modules, helpers, components, data sources, and patterns before adding new abstractions.
- Prefer the smallest complete implementation. Do not expand a correct 500-line module toward 1,000 lines when the same behavior can remain clear and complete with less code.
- Modernize and simplify the user experience without broad redesigns, speculative features, duplicated workflows, or unnecessary dependencies.
- Do not invent fields, formulas, records, schema state, permissions, or business rules. Missing decisions must remain explicit gates or unavailable states.
- Validate each change against current code, documentation, and real data contracts before treating it as complete.

Reason:

NexArWO and FlipEngine must evolve into a maintainable operational CRM without code inflation, duplicated systems, or AI-generated assumptions. Simpler code reduces regression risk in the shared Projects, Work Orders, financial, and Property Hub surfaces.

Alternatives considered:

- Large module rewrites: rejected because they increase regression and review risk.
- Adding parallel replacement modules: rejected because FlipEngine extends NexArWO rather than replacing it.
- Treating line count as progress: rejected because correctness, clarity, and complete behavior are the measures that matter.

Impact:

- Future agents may update existing planning/development documents when the change is narrowly scoped and documented.
- Future implementations should remove real duplication when safe, but must not refactor unrelated working code merely to make it shorter.
- Tests and documentation should scale with behavioral risk, not with the number of lines changed.
- Existing exact-approval gates remain in force for SQL execution, migration apply, production access, Auth/RLS, Investor Hub activation or modification, financial formula changes, destructive operations, commits, pushes, and deployments.

Owner approval:

Explicitly authorized by the owner on 2026-07-12.

---

## 2026-07-12 - Documentation Hierarchy And Archive Boundary

Decision:

- `AGENTS.md` remains the universal instruction authority.
- `memory/CURRENT_TASK.md` controls exact active scope.
- `docs/00-governance/DOCUMENTATION_MAP.md` is the single maintained map for active, evidentiary, and historical documents.
- `Otros/`, dated ZIP snapshots, setup packs, old prompts, and exported task packages are reference/recovery material only.
- Existing historical documents are preserved. Current-state gateway documents receive small updates instead of duplicating another planning system.
- The branch-local Investor Hub flag divergence is documented but remains an explicit owner decision before merge or deployment.

Reason:

The repository contains valuable history but several old entry-point files still directed agents to Phase 0 or described feature and deployment states that no longer match the current branch. A visible hierarchy prevents historical plans from silently overriding current work.

Impact:

- New sessions can find current scope without reading every archive first.
- Technical phase evidence remains available for audit and recovery.
- Future status changes should update the existing map and memory files rather than create another master index.
- No code, SQL, migration, Auth/RLS, Investor Hub behavior, formula, commit, push, or deployment is authorized by this documentation decision.

Owner approval:

Authorized through the owner's request to review recursive development documentation and make surgical, documented updates on 2026-07-12.
