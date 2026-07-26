# Phase 3D: UI Shell Release Checklist

Status: Ready for owner review before commit/build/deploy.

Date/time: 2026-07-05 10:57:00 -07:00

## Scope

Prepare the Phase 3B Property Hub shell and Phase 3C manual QA evidence for a controlled UI-only release review.

This phase does not authorize any database deployment.

## Release Intent

Release only the gated, read-only Property Hub shell inside the existing NexArWO Projects experience.

The UI shell:

- Shows only for projects where `project_type === 'fix_and_flip'`.
- Uses existing project and financial summary data only where already available.
- Does not write to new FlipEngine tables.
- Does not require the new FlipEngine MVP tables to exist.
- Keeps FlipEngine-specific modules locked/read-only until the database migration is applied in an approved environment.

## Files Changed For Phase 3B/3C UI Shell

Release candidate files:

- `js/projects.js`
- `docs/flipengine/24_PHASE3B_PROPERTY_HUB_SHELL_IMPLEMENTATION.md`
- `docs/flipengine/25_PHASE3C_PROPERTY_HUB_MANUAL_QA.md`
- `docs/flipengine/26_PHASE3D_UI_SHELL_RELEASE_CHECKLIST.md`

Related earlier file present in the worktree but not part of this UI-only deploy unless owner separately approves:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

That migration file must not be applied as part of this UI shell release.

## Git Diff Review Summary

`js/projects.js` contains the Phase 3B app change:

- Adds `isFlipEngineProject(project)`.
- Adds `syncPropertyHubTabVisibility()`.
- Adds a hidden-by-default top-level `Property Hub` project detail tab.
- Adds `#proj-tab-propertyhub`.
- Adds Property Hub shell section metadata and render helpers.
- Adds read-only internal sections:
  - Overview
  - Acquisition
  - Budget
  - Work Orders
  - Expenses
  - Receipts
  - Documents
  - Loans / Draws
  - Investors
  - Contractors
  - Labor / Time
  - Payments
  - Sale / Exit
  - Reports
- Keeps locked modules read-only with:

```text
Requires FlipEngine database migration before editing.
```

No `js/supabase.js`, SQL, CSS, financial formula, or Investor Hub module changes were made for Phase 3B/3C.

## Changed Files Currently Visible In Worktree

Phase 3 release-related:

- Modified: `js/projects.js`
- New: `docs/flipengine/24_PHASE3B_PROPERTY_HUB_SHELL_IMPLEMENTATION.md`
- New: `docs/flipengine/25_PHASE3C_PROPERTY_HUB_MANUAL_QA.md`
- New: `docs/flipengine/26_PHASE3D_UI_SHELL_RELEASE_CHECKLIST.md`

Other pending worktree items from earlier phases or repo setup must be reviewed separately before commit selection.

Important caution:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` is present as an untracked migration file from Phase 2 work.
- Do not apply it or treat it as deployed.
- Do not include it in a UI-only release unless the owner intentionally wants the migration file committed for later review.

## Build/Test Command Identification

`package.json` scripts:

```json
{
  "build": "node scripts/build-vercel.js",
  "generate-env": "node scripts/generate-env.js",
  "vercel-build": "node scripts/build-vercel.js"
}
```

`vercel.json`:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Correct build command for this repo:

```powershell
npm.cmd run build
```

Note:

- `npm run build` through PowerShell attempted to invoke `npm.ps1` and was blocked by local execution policy.
- `npm.cmd run build` runs the same package script and avoids the PowerShell script policy issue.
- No test script is defined in `package.json`.

## Tests And Checks Run

| Check | Result | Notes |
| --- | --- | --- |
| `node --check js/projects.js` | PASS | JavaScript syntax check passed. |
| `rg` search for unintended new FlipEngine table calls in `js/projects.js` | PASS | No references found for `project_acquisitions`, `project_budget_categories`, `project_receipts`, `project_document_links`, or new `DB.project*` helpers. |
| `node --check scripts/build-vercel.js` | PASS | Build script syntax passed. |
| `node --check scripts/generate-env.js` | PASS | Env generation script syntax passed. |
| `npm run build` | BLOCKED BY LOCAL SHELL POLICY | PowerShell blocked `npm.ps1`; this is a local shell policy issue, not an app build failure. |
| `npm.cmd run build` | PASS | Generated `js/env.js`, generated `dist/js/env.js`, and built static output in `dist`. |

## Manual QA Result

Phase 3C manual QA result:

- PASS.

Owner-confirmed local test:

- Local URL: `http://localhost:4173/index.html?page=projects`
- Project: `Coindo`
- Status: `Active`
- Type: `Fix & Flip`
- `Property Hub` was visible.
- Internal shell sections rendered.
- FlipEngine-specific modules remained locked/read-only.
- Required migration placeholder message appeared.
- No Add/Edit/Save actions were exposed for new FlipEngine tables.

## Deploy Risk

Low to moderate for UI-only release.

Lower-risk factors:

- The shell is gated by `project_type === 'fix_and_flip'`.
- Non-fix-and-flip projects should keep the current Projects UI behavior.
- No new DB reads/writes were added for FlipEngine tables.
- No `js/supabase.js` changes were made.
- No existing financial formulas were changed.
- No SQL is required for the shell to render.

Remaining risks:

1. `js/projects.js` is large and already contains Projects, Financials, Work Orders, and Investor Hub logic.
2. The existing top-level Investor Hub tab is still present as pre-existing app behavior; future work must not accidentally connect Property Hub Investors to it without approval.
3. Mobile/tablet layout has not been separately verified for the Property Hub shell.
4. The `project_type === 'fix_and_flip'` gate is practical for this shell but may need a future dedicated eligibility flag.
5. Production Vercel has not yet been updated with this UI shell.

## Production DB Warning

Do not apply database changes as part of this UI release.

Specifically, do not run:

- Supabase SQL editor apply/run for the FlipEngine migration.
- `supabase db push`
- `supabase migration up` against linked or production environments.
- Any manual production SQL for `project_acquisitions`, `project_budget_categories`, `project_receipts`, or `project_document_links`.

The UI shell must remain read-only until a separate owner-approved database deployment plan exists.

## Confirmation: New FlipEngine DB Tables Are Not Required

The Phase 3B/3C UI shell does not require these tables to exist:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`

Reason:

- No reads or writes to those tables were added.
- No new `DB.*` helpers for those tables were added.
- Locked modules display placeholders only.

## Vercel / Deploy Notes

Vercel configuration uses:

- Build command: `npm run build`
- Output directory: `dist`

Local build equivalent confirmed:

```powershell
npm.cmd run build
```

Expected deploy behavior:

- Vercel runs the static build.
- Static files are copied to `dist`.
- `js/env.js` and `dist/js/env.js` are generated at build time.
- No database migrations are applied by this build.

Before Vercel deploy:

1. Confirm the commit contains only intended UI/docs files.
2. Exclude or separately approve any migration file from the UI-only release.
3. Run `npm.cmd run build` again from a clean worktree or release branch.
4. Confirm no deploy hook applies Supabase migrations.
5. Deploy UI only.

## Rollback Plan

UI rollback options:

1. Revert the commit containing `js/projects.js` Property Hub shell changes.
2. Redeploy the previous known-good Vercel deployment.
3. If an urgent hotfix is needed, hide the shell by reverting or disabling the `Property Hub` tab gate in `js/projects.js`.

Database rollback:

- Not applicable for this UI release because no database migration should be applied.

## What Must Not Be Deployed Yet

Do not deploy or apply:

- Production database migration execution.
- Supabase `db push`.
- Auth/RLS changes.
- Investor Hub activation or rewiring.
- New CRUD for `project_acquisitions`.
- New CRUD for `project_budget_categories`.
- New CRUD for `project_receipts`.
- New CRUD for `project_document_links`.
- Any financial formula changes.
- Any automatic receipt-to-expense behavior.
- Any investor/funding merge into operating expenses, ROI, P&L, or existing project financial summaries.

## Commit Readiness

Safe to commit after owner review:

- Yes, for UI shell and documentation only.

Recommended commit content:

- `js/projects.js`
- `docs/flipengine/24_PHASE3B_PROPERTY_HUB_SHELL_IMPLEMENTATION.md`
- `docs/flipengine/25_PHASE3C_PROPERTY_HUB_MANUAL_QA.md`
- `docs/flipengine/26_PHASE3D_UI_SHELL_RELEASE_CHECKLIST.md`

Do not include unrelated worktree files unless separately reviewed.

Do not include/apply the Phase 2 migration in a UI-only deploy unless the owner explicitly approves committing it as a non-applied migration artifact.

## UI-Only Deploy Readiness

Safe to deploy UI only after owner approval:

- Yes, with the production DB warning above.

Required pre-deploy confirmations:

1. `npm.cmd run build` passes.
2. Commit excludes unintended files.
3. No SQL execution is part of the deploy.
4. No Supabase migration command is run.
5. Owner understands the shell is read-only until the database migration is applied later through a separate approved process.

## Next Step After Successful UI Deploy

After Vercel UI deploy:

1. Open production Projects.
2. Confirm existing normal projects still work.
3. Confirm `Property Hub` appears only for `Fix & Flip` projects.
4. Confirm locked modules remain read-only.
5. Confirm no console errors in the main Projects flow.
6. Keep Phase 4/CRUD work blocked until the FlipEngine database migration is approved and applied in a real environment.

