# Feature Flags

Status: Active policy and branch-state record. Updated 2026-07-26.

## Current Flags

| Flag | Production/main policy | Current feature branch | Purpose |
|---|---|---|---|
| `INVESTOR_HUB_ENABLED` | `false` | `false` in `feat/activate-investor-hub-local` (resolved 2026-07-26) | Controls the global Investor Hub development surface |
| `window.NEXARTWO_FEATURE_FLAGS.investorHubWorkspaceTab` | absent / `false` | absent / `false` | Separately controls the Investor Hub tab inside Project Workspace |

## Investor Hub Branch Divergence — RESOLVED 2026-07-26

`origin/main` keeps `INVESTOR_HUB_ENABLED = false`.

The feature branch previously inherited `INVESTOR_HUB_ENABLED = true` from commit `e8b24271`, whose code comment identified it as intentional Owner/Admin development. That branch-specific development state has been rolled back — see `memory/DECISION_LOG.md` 2026-07-26 entry. Re-diverging from production requires a new explicit owner decision, following the same Activation Gate below.

The Project Workspace Investor Hub tab remains hidden unless `window.NEXARTWO_FEATURE_FLAGS.investorHubWorkspaceTab === true`. No active definition enabling that second flag was found during the 2026-07-12 audit.

## Activation Gate

Do not promote or newly activate Investor Hub without all of the following:

1. The target environment and schema are verified.
2. Required migrations are confirmed for that environment.
3. Auth/RLS and access boundaries are reviewed.
4. Investor Hub smoke and manual UI checks pass.
5. A rollback plan exists.
6. The owner approves the exact merge/deploy target.

## Current Decision Required

None open. The branch matches production as of 2026-07-26. A future re-activation still requires an explicit owner decision naming the exact merge/deploy target, and must not be changed as a side effect of unrelated FlipEngine work.

## Deactivation

The narrow rollback — set `INVESTOR_HUB_ENABLED = false` in `js/projects.js` and verify that Investor Hub entries are hidden — was performed 2026-07-26 with owner approval. Verified in browser: flag reads `false`, Property Hub still renders for a `Fix & Flip` project, zero console errors.
