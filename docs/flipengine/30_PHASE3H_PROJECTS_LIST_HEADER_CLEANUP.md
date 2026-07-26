# Phase 3H: Projects List Header Cleanup

Status: Completed for UI-only review.

Date: 2026-07-05

## Scope

Clean up duplicated Projects page context in the shared Projects list rendering.

The issue was:

- Topbar/header already showed `Projects`.
- Inner list hero/header also showed `Projects`.

This phase keeps the Projects list functionality intact and only compacts the inner list header.

## Current Commit Verified

Before changes, local history showed:

```text
1074ac7 fix: clean shared project workspace header and hide investor tab
6e1da85 docs: add realtor commission percentage requirement
6954ef7 fix: clean up gated FlipEngine Property Hub shell
0fd5d34 feat: add gated FlipEngine Property Hub shell
4fb51f9 fix: stabilize investor hub data actions
```

Local was on `1074ac7`, so it included the shared Project Workspace cleanup before Phase 3H started.

## Function Located

### `projectsModuleShellHtml()`

Inspected area:

- `js/projects.js` lines 224-240

Responsible for:

- Projects list page shell.
- Inner Projects list header through `projects-list-header`.
- Inner Projects list title block through `projects-list-title-block`.
- `New Project` button.
- Summary KPI container.
- P&L bar container.
- Project card grid container.
- Project detail workspace shell below the list shell.

Related functions inspected:

- `syncProjectRouteChrome()` lines 423-438: sets route-level topbar context for Projects vs Investor Hub.
- `showProjectList()` lines 858-865: switches back to Projects list and sets topbar title to `Projects`.

## What Changed

In `projectsModuleShellHtml()`, the duplicated inner `<h3>Projects</h3>` was removed.

The inner list header now keeps:

- `Project Control` kicker.
- A compact subtitle: `Project records, financial snapshots, and linked work orders.`
- Existing `New Project` button.

## Why This Fixes The Duplication

The page already has route-level context from the app topbar:

- `syncProjectRouteChrome('projects')`
- `showProjectList()`

Because that topbar already says `Projects`, the inner list header should not repeat the same title. Removing the inner duplicate keeps one clear page context while preserving local operational context.

## Behavior Preserved

This phase does not change:

- Project cards.
- Summary KPI cards.
- Search behavior.
- `New Project` button.
- Project type selector.
- Project detail opening.
- Existing Project Workspace cleanup from `1074ac7`.
- Financials, Expenses, Disbursements, Work Orders, or Property Hub logic.

## Guardrails Followed

- No SQL was run.
- No migrations were applied.
- No Supabase `db push` was run.
- No production database was touched.
- No financial formulas were changed.
- No Investor Hub behavior was activated.
- No FlipEngine database tables were read or written.

## Manual QA Steps

1. Open `index.html?page=projects`.
2. Confirm the app topbar shows `Projects`.
3. Confirm the inner list area no longer repeats a large `Projects` title.
4. Confirm the inner list still shows compact operational context.
5. Confirm the `New Project` button is visible and opens the project type selector.
6. Confirm search still filters projects.
7. Confirm KPI cards and P&L bar still render.
8. Open a project card and confirm Project Workspace still opens.
9. Return with `Back` and confirm the Projects list state remains clean.
10. Check browser console for JavaScript errors.

## Checks

Run before release:

```powershell
node --check js\projects.js
npm.cmd run build
```

## Next Step

If manual QA passes, prepare a UI-only commit with:

- `js/projects.js`
- `docs/flipengine/30_PHASE3H_PROJECTS_LIST_HEADER_CLEANUP.md`

Do not include SQL, migrations, local bootstrap scripts, build output, or unrelated untracked files.
