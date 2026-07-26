# Phase 3G: Project Workspace Shared Header Cleanup

Status: Completed for UI-only review.

Date: 2026-07-05

## Scope

Clean up duplicated Project Workspace header behavior and hide the Project Workspace `Investor Hub` tab unless an explicit owner-approved feature flag is present.

This phase modifies shared rendering logic only. It does not add database writes, change financial formulas, apply SQL, or remove the global Investor Hub module.

## Functions Located

### `projectsModuleShellHtml()`

Inspected area:

- `js/projects.js` lines 224-275

Responsible for:

- Projects list page shell.
- Project detail workspace container.
- Project detail hero/header markup through `proj-workspace-header`.
- Shared Project Workspace tab row through `proj-detail-tabs`.
- Shared tab buttons:
  - Overview
  - Property Hub
  - Financials
  - Expenses
  - Disbursements
  - Work Orders
  - Investor Hub

### `syncProjectRouteChrome()`

Inspected area:

- `js/projects.js` lines 414-430

Responsible for:

- Projects vs Investor Hub route body classes.
- Sidebar route active state.
- Topbar title/subtitle for route-level navigation.

### `openProjectDetail()`

Inspected area:

- `js/projects.js` lines 814-835

Responsible for:

- Opening the shared Project detail workspace.
- Resetting the active tab to Overview.
- Hiding the New Project button while in project detail.

### `updateProjectWorkspaceChrome()`

Inspected area:

- `js/projects.js` lines 917-957

Responsible for:

- Project detail hero title.
- Project detail subtitle.
- Project workspace kicker/eyebrow.
- Topbar title while viewing an opened project.
- Active tab label mapping.

### `switchProjTab()`

Inspected area:

- `js/projects.js` lines 972-996

Responsible for:

- Shared Project Workspace tab switching.
- Activating tab buttons/content containers.
- Calling tab renderers for Property Hub, Work Orders, and Investor Hub.

### `renderProjectDetail()`

Inspected area:

- `js/projects.js` lines 1162-1172

Responsible for:

- Rendering Overview and Financials content.
- Re-syncing Property Hub tab visibility.
- Re-applying shared Project Workspace chrome after content refresh.

## What Changed

### Shared Header Cleanup

`updateProjectWorkspaceChrome()` now keeps the topbar title focused on the selected project name and uses the project detail hero title for the active workspace section.

Before:

- Topbar title and project detail title could both show the same section label, such as `Property Hub`.

After:

- Topbar title shows the project name.
- Project detail title shows the active section, such as `Overview`, `Property Hub`, `Financials`, or `Work Orders`.
- The kicker is shorter and avoids repeating `Property Hub` in both the kicker and title.

This fixes the repeated page context across all Project Workspace modules because every tab flows through `updateProjectWorkspaceChrome()`.

### Shared Tab Row Cleanup

`projectsModuleShellHtml()` now renders the `Investor Hub` workspace tab as hidden unless the explicit feature flag allows it.

The feature flag check is centralized in:

```js
isInvestorHubWorkspaceTabEnabled()
```

The expected approved flag shape is:

```js
window.NEXARTWO_FEATURE_FLAGS = {
  investorHubWorkspaceTab: true
};
```

Without that flag, the Project Workspace tab/button is hidden.

## Why This Fixes All Project Modules

The affected UI is not rendered separately by each tab.

The shared source is:

- `projectsModuleShellHtml()` for the workspace shell and tab row.
- `updateProjectWorkspaceChrome()` for the active title/header state.
- `switchProjTab()` and `renderProjectDetail()` for applying the shared state after tab changes or refreshes.

Because the duplicated header and Investor Hub tab are controlled by those shared functions, the cleanup applies consistently to:

- Overview
- Property Hub
- Financials
- Expenses
- Disbursements
- Work Orders

No screen-by-screen patching was needed.

## Investor Hub Tab/Button Behavior

- The Project Workspace `Investor Hub` tab/button is hidden by default.
- The global Investor Hub page/module remains in the codebase.
- The sidebar was not changed.
- Existing Investor Hub route logic was not removed.
- Investor Hub is not activated by this cleanup.
- Showing the workspace tab later requires an explicit owner-approved feature flag.

## Guardrails Followed

- No SQL was run.
- No migrations were applied.
- No Supabase `db push` was run.
- No production database was touched.
- No financial formulas were changed.
- No FlipEngine database tables were read or written.
- No Investor Hub data flow was activated from Property Hub.
- Existing Projects, Financials, Expenses, Disbursements, and Work Orders renderers remain in place.

## Manual QA Steps

1. Open `index.html?page=projects`.
2. Open a normal non-Fix & Flip project.
3. Confirm the Project Workspace tab row shows:
   - Overview
   - Financials
   - Expenses
   - Disbursements
   - Work Orders
4. Confirm `Investor Hub` is not visible in the Project Workspace tab row.
5. Confirm the topbar shows the project name, not a duplicate of the active tab title.
6. Click Overview, Financials, Expenses, Disbursements, and Work Orders and confirm each still opens.
7. Open the `Coindo` Fix & Flip project.
8. Confirm `Property Hub` appears for the Fix & Flip project.
9. Click `Property Hub` and confirm:
   - The topbar shows the project name.
   - The workspace title shows `Property Hub`.
   - The kicker does not repeat `Property Hub`.
   - The Project Workspace `Investor Hub` tab remains hidden.
10. Confirm the existing global Investor Hub route/sidebar behavior was not tested or changed in this phase.
11. Check browser console for JavaScript errors.

## Checks

Run before release:

```powershell
node --check js\projects.js
npm.cmd run build
```

## Next Step

After local/preview QA passes, prepare a UI-only commit and preview deploy review. Do not include SQL, migrations, local bootstrap scripts, or untracked database files in the UI release.
