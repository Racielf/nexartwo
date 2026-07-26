# PROJECT_STATE - NexArtWO / FlipEngine

Updated: 2026-07-26.

## Current Phase

FlipEngine Property Hub read-only closeout, before data-backed integration.

## Product Direction

NexArtWO remains the operations and project-control platform. FlipEngine is an internal layer for selected fix-and-flip projects and reuses existing Projects, Work Orders, financial records, documents, and guarded investor infrastructure.

## Current Local State

- Branch: `feat/activate-investor-hub-local`.
- Baseline commit: `fdafbe10bf60a874ea4442b33624d506f6e41e3a`.
- `js/projects.js` has five local read-only Property Hub panels.
- Syntax, diff, isolated render, eligibility, and no-new-data-call checks passed.
- Persistent browser QA and responsive QA passed 2026-07-25 (headless Chromium, desktop/tablet/phone, zero console errors). See `docs/flipengine/43_PROPERTY_HUB_RESPONSIVE_QA_PASS.md`.
- That pass surfaced one new, pre-existing, out-of-scope layout finding: `memory/KNOWN_ISSUES.md` `ISSUE-015` (Project Workspace horizontal overflow at 390px phone width, present on the Overview tab too — not introduced by the five panels, not fixed).
- Reviewed closeout scope (five panels, docs, memory) committed locally 2026-07-26. Not pushed, not deployed.

## Database State For FlipEngine

The migration `20260705000100_flipengine_mvp_extensions.sql` was drafted, reviewed, compatibility-fixed, and tested in a disposable local Postgres container. It is not confirmed applied to a real staging/restored Supabase target or production for this work.

No current Property Hub panel reads or writes the four future FlipEngine tables.

## Open Governance Risk

RESOLVED 2026-07-26. `INVESTOR_HUB_ENABLED` is now `false` on this branch, matching `origin/main` and production. See `memory/DECISION_LOG.md` 2026-07-26 entry. Re-diverging from production requires a new explicit owner decision.

## Protected Areas

- SQL execution, migration apply, and production database access.
- Auth/RLS and Supabase data-layer changes.
- Investor Hub activation or modification.
- Financial formulas and historical financial records.
- Commit, push, preview deploy, and production deploy without exact approval.

## Next Safest Action

Browser-level responsive QA is complete, the `INVESTOR_HUB_ENABLED` divergence is resolved, and the reviewed closeout scope is committed locally. Remaining: the owner's push decision, the owner's deployment decision, and scheduling the `ISSUE-015` CSS-only follow-up. Then replace `memory/CURRENT_TASK.md` with the approved staging/governance task before adding data-backed behavior.
