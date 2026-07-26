# Sale / Exit Read-Only Panel Plan

Status: Approved for safe local implementation under the owner's continuous phase-by-phase authorization.

Planning only in this document. No formula, SQL, migration, database method, CRUD flow, Auth/RLS, or Investor Hub change is authorized.

## Purpose

Define a useful Sale / Exit view inside the gated FlipEngine Property Hub using only values already stored or calculated by the existing NexArWO project financial system.

The panel must present existing results without recreating, changing, or extending their formulas.

## Existing Safe Sources

From `_currentProject`:

- `sale_price` when available
- project status

From `_currentProject._financials` when already loaded:

- `sale_price`
- `net_proceeds`
- `profit`
- `project_cash_position`

These values already belong to NexArWO's existing project and financial-summary model.

## Existing Formula Boundary

The existing database view calculates net proceeds, profit, and project cash position.

The new panel may display those returned values, but must not:

- duplicate their arithmetic in JavaScript
- change their database formulas
- present a new ROI formula
- calculate commission percentages
- calculate selling costs
- reconcile closing statements
- update any project or financial record

## Approved UI Scope

Modify `js/projects.js` only for implementation.

Display:

- Sale Price
- Net Proceeds
- Existing Profit
- Project Cash Position
- Existing project status
- Financial summary availability
- Sale / Exit extension availability
- Listing price as unavailable
- Sale date as unavailable
- Final ROI as not calculated in this panel
- Standard migration-required read-only notice

## Required Labels

The UI must make these boundaries clear:

- Values come from the existing NexArWO project/financial summary.
- Profit is the existing summary value, not a new FlipEngine calculation.
- Commission planning is not configured.
- No Sale / Exit extension record is loaded.

## Prohibited Behavior

- No Add, Edit, Save, Delete, Import, Close Deal, or Mark Sold controls.
- No input, select, textarea, or editable content.
- No call or reference to a future `project_sale_exit` table.
- No write to `projects.sale_price`.
- No commission or ROI calculation.
- No financial formula change.
- No use of Investor Hub data.
- No distribution or investor-return calculation.

## Files

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/36_SALE_EXIT_READ_ONLY_PLAN.md`
- A separate implementation record after validation

Intentionally unchanged:

- `js/supabase.js`
- `js/app.js`
- `css/`
- `supabase/`
- `sql/`
- existing migrations
- Auth/RLS
- Investor Hub
- project financial formulas
- `memory/CURRENT_TASK.md`

## Acceptance Criteria

- Sale / Exit renders only inside the existing gated Property Hub.
- Existing values are displayed without new calculations.
- Missing project or summary values show an unavailable state.
- The panel identifies its existing data sources.
- No write controls appear.
- Acquisition and Budget remain unchanged.
- Normal non-FlipEngine projects remain excluded.

## Validation Plan

1. Run JavaScript syntax validation.
2. Run diff formatting validation.
3. Render Sale / Exit with an existing completed sale summary.
4. Render Sale / Exit with no sale or financial summary.
5. Confirm no form controls appear.
6. Confirm no future Sale / Exit table reference appears.
7. Confirm no commission, ROI, or profit arithmetic appears in the new branch.
8. Re-run Acquisition and Budget render checks.
9. Confirm the `fix_and_flip` gate remains active and normal project gates remain false.

## Full Module Gate

A writable Sale / Exit module requires separate approval for:

1. Source-of-truth rules between `projects` and a future Sale / Exit extension.
2. Listing and sale date storage.
3. Percentage-based commission rules.
4. Selling-cost reconciliation.
5. Final profit and ROI specification.
6. Documents and settlement statement links.
7. Database schema, Auth/RLS, data methods, and CRUD behavior.
