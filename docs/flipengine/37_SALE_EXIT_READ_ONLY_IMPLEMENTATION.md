# Sale / Exit Read-Only Panel Implementation

Status: Implemented locally. Not committed, pushed, deployed, or connected to a new Sale / Exit table.

## Purpose

Replace the generic locked Sale / Exit placeholder with a useful read-only view of existing NexArWO project and financial-summary results.

This implementation follows `36_SALE_EXIT_READ_ONLY_PLAN.md` and does not add or duplicate financial formulas.

## Files Modified

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/36_SALE_EXIT_READ_ONLY_PLAN.md`
- `docs/flipengine/37_SALE_EXIT_READ_ONLY_IMPLEMENTATION.md`

## Files Intentionally Not Modified

- `js/supabase.js`
- `js/app.js`
- `css/`
- `index.html`
- `projects.html`
- `supabase/`
- `sql/`
- existing migrations
- Auth/RLS
- Investor Hub
- project financial formulas
- `memory/CURRENT_TASK.md`
- existing untracked local work

## Implemented Behavior

The Property Hub `Sale / Exit` section now displays:

- Existing Sale Price
- Existing Net Proceeds
- Existing Profit
- Existing Project Cash Position
- Project status
- Existing sale summary availability
- Existing financial summary availability
- Listing price as unavailable
- Sale date as unavailable
- Sale / Exit extension record as not loaded
- Commission planning as not configured
- Final ROI as not calculated in this panel
- Standard migration-required read-only notice

## Unsold Project Behavior

The existing `projects.sale_price` field defaults to zero.

To avoid presenting a default zero as a completed sale result, the panel treats Sale Price, Net Proceeds, and Existing Profit as unavailable unless Sale Price is greater than zero.

This is a display-state decision only. It does not change stored data or financial formulas.

Project Cash Position may still display when an existing financial summary is available because it is a current project-level value, not a newly calculated final-sale value.

## Financial Boundary

The implementation does not calculate:

- net proceeds
- profit
- project cash position
- realtor commission
- selling costs
- final ROI
- investor returns or distributions

It displays values already returned by the existing NexArWO project financial summary.

## Database Boundary

The Sale / Exit branch:

- Contains no `DB.*` call.
- Contains no `fetch()` call.
- Contains no Supabase call.
- Contains no future Sale / Exit table reference.
- Does not write to `projects.sale_price`.
- Does not create local or demo Sale / Exit records.

## Interaction Boundary

The rendered panel contains no:

- button
- input
- select
- textarea
- Add action
- Edit action
- Save action
- Delete action
- Close Deal action
- Mark Sold action

## Validation Performed

### JavaScript syntax

```text
node --check js/projects.js
PASS
```

### Diff formatting

```text
git diff --check -- js/projects.js
PASS
```

Git reported only the existing working-copy LF-to-CRLF warning.

### Sold-project render

Tested with:

- `sale_price = 625000`
- `net_proceeds = 580000`
- `profit = 70926.70`
- `project_cash_position = 60926.70`

Verified:

- Existing sale values render through the existing money formatter.
- Existing project and financial-summary sources are identified.
- No new ROI value is displayed.
- The migration-required notice appears.
- No form controls appear.
- No future Sale / Exit table reference appears.
- No commission-percentage inputs or formula fields appear.
- No data call appears in the new code branch.

Result: PASS.

### Unsold-project render

Tested with an active `fix_and_flip` project where `sale_price = 0` and no financial summary was present.

Verified:

- Sale summary displays as unavailable.
- Final sale metrics do not display misleading `$0` values.
- Listing price and sale date remain unavailable.

Result: PASS.

### Property Hub regression

Acquisition, Budget, and Sale / Exit were rendered together against one representative sold `fix_and_flip` project.

Verified:

- Acquisition still renders purchase values and escapes project text.
- Budget still renders existing context and preserves its accounting boundary.
- Sale / Exit renders existing sale values.
- All three panels contain no form controls.
- The `fix_and_flip` gate remains true.
- A normal `residential_project` gate remains false.

Result: PASS.

## Current Code Scope

The combined local code diff for Acquisition, Budget, and Sale / Exit is:

```text
js/projects.js | 112 added lines
```

No existing line was removed by these three read-only modules.

## Manual QA Checklist

When a normal browser preview is available:

1. Open a normal project and confirm Property Hub remains unavailable.
2. Open an active `fix_and_flip` project with no sale.
3. Open Property Hub and Sale / Exit.
4. Confirm final sale values show as unavailable rather than `$0`.
5. Open a sold `fix_and_flip` project with an existing financial summary.
6. Confirm Sale Price, Net Proceeds, Existing Profit, and Project Cash Position display.
7. Confirm no commission, ROI, Edit, Save, or Close Deal control appears.
8. Confirm Acquisition and Budget still open.
9. Confirm Expenses, Financials, and Work Orders remain unchanged.
10. Confirm no browser console errors.

## Recovery

This implementation is isolated to the `section.id === 'sale'` branch inside `renderPropertyHubSection()`.

To remove only this panel before commit, remove that branch. Do not revert the entire `js/projects.js` file.

## Full Module Gate

A writable Sale / Exit module remains blocked until separately approved decisions exist for:

1. Sale / Exit data ownership and schema.
2. Listing price and sale date.
3. Percentage-based commission inputs.
4. Selling-cost and closing-statement reconciliation.
5. Final profit and ROI definitions.
6. Document links.
7. Auth/RLS and user permissions.
8. Data-access and CRUD methods.
9. Staging migration and manual QA.

## Recommended Next Safe Module

The next safe candidate is a read-only Loans / Draws context panel using only the existing project loan amount, while explicitly leaving lender detail, construction holdback, draw requests, balances, and funding calculations unavailable.
