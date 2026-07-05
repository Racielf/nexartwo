# Phase 3F: Property Hub UI Cleanup

Status: Completed for UI-only review.

Date: 2026-07-05

## Scope

Clean up the Phase 3B Property Hub shell based on Phase 3E preview QA findings, without adding database writes, changing financial logic, applying SQL, or activating Investor Hub.

## Guardrails Followed

- No SQL was run.
- No migrations were applied.
- No Supabase `db push` was run.
- No production database was touched.
- No FlipEngine table reads or writes were added.
- Investor Hub was not activated.
- Financial formulas were not changed.
- Existing Projects, Financials, Work Orders, and Expenses behavior was preserved.

## Files Modified

- `js/projects.js`
- `docs/flipengine/28_PHASE3F_PROPERTY_HUB_UI_CLEANUP.md`

Build command output also regenerates local build artifacts under `dist/` and `js/env.js` through the existing `scripts/build-vercel.js` process.

## UI Cleanup Completed

### Investor Hub Visibility Inside Property Hub

The top-level project `Investor Hub` tab is hidden while the `Property Hub` tab is active.

This does not remove Investor Hub globally and does not activate or connect Investor Hub to FlipEngine. It only prevents Investor Hub from appearing available inside the Property Hub flow.

### Duplicate Property Hub Header

The inner repeated `Property Hub` title was removed from the shell body.

The page now keeps the existing workspace title/header and uses a smaller `FlipEngine shell` label inside the module area.

### Shell Layout

The shell layout was compacted:

- Reduced header card padding.
- Added a dedicated module list panel.
- Added a dedicated active section panel.
- Added clear `Read-only shell`, `Locked`, and `Existing data` state labels.
- Kept locked modules read-only with the existing migration-required message.

## Read-Only Behavior Preserved

The following modules remain locked/read-only until the FlipEngine database migration is applied in a real environment:

- Acquisition
- Budget
- Receipts
- Documents
- Loans / Draws
- Investors
- Contractors
- Labor / Time
- Payments
- Sale / Exit
- Reports

The following areas may still show existing NexArWO data only:

- Overview
- Work Orders
- Expenses

## Checks Run

```powershell
node --check js\projects.js
npm.cmd run build
```

Results:

- `node --check js\projects.js`: PASS
- `npm.cmd run build`: PASS

Additional safety check:

- `js/projects.js` contains no references to `project_acquisitions`, `project_budget_categories`, `project_receipts`, or `project_document_links`.

## Manual QA Steps

1. Open the Projects page locally or in preview.
2. Open a non-Fix & Flip project and confirm the Property Hub tab does not appear.
3. Open the `Coindo` Fix & Flip project and confirm Property Hub appears.
4. Click Property Hub and confirm the top-level Investor Hub tab is not visible in that Property Hub flow.
5. Confirm only one main Property Hub page title is visible.
6. Click Overview, Work Orders, and Expenses inside the Property Hub shell and confirm they only use existing safe project data.
7. Click each locked FlipEngine module and confirm it stays read-only with the migration-required message.
8. Confirm there are no Add, Edit, or Save actions for FlipEngine tables.
9. Confirm existing Financials, Work Orders, and Expenses tabs still open from the project workspace.
10. Check the browser console for errors.

## Risks

- The top-level Investor Hub tab still exists elsewhere in the app by design; it is only hidden while the Property Hub tab is active.
- The layout cleanup is intentionally small and inline with the existing project UI; deeper visual polish should remain a separate phase.
- Mobile and narrow viewport QA should be repeated before a broad production UI release.

## Next Step

Recommended next step is Phase 3G preview QA for the cleaned Property Hub shell, followed by a UI-only commit/release review if the owner approves.
