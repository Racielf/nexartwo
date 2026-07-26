# Reports Read-Only Snapshot Implementation

Status: Implemented locally. Not committed, pushed, deployed, or connected to new report tables or calculations.

## Purpose

Replace the generic locked Reports placeholder with a traceable snapshot of the existing NexArWO project financial summary.

This implementation follows `40_REPORTS_READ_ONLY_PLAN.md` and does not create a second financial model.

## Files Modified

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/40_REPORTS_READ_ONLY_PLAN.md`
- `docs/flipengine/41_REPORTS_READ_ONLY_IMPLEMENTATION.md`

## Files Intentionally Not Modified

- `js/supabase.js`
- `js/app.js`
- `css/`
- `index.html`
- existing dashboards
- `supabase/`
- `sql/`
- existing migrations
- Auth/RLS
- Investor Hub
- existing financial formulas
- `memory/CURRENT_TASK.md`
- existing untracked local work

## Implemented Behavior

The Property Hub `Reports` section now displays these existing summary values:

- Cost Basis
- Cash Invested
- Net Expenses
- Disbursements
- Net Proceeds
- Existing Profit
- Project Cash Position

The panel also displays:

- Financial summary availability
- Mode as existing values only
- Forecasts as not generated
- ROI as not calculated in this panel
- Budget actuals as not inferred
- Investor/funding data as excluded
- Receipt totals as not added
- Payment totals as not added
- Standard migration-required read-only notice

## Missing Summary Behavior

When `_currentProject._financials` is unavailable, every report metric displays as unavailable.

The panel does not convert missing values into `$0` because that could imply a valid zero-value financial result.

## Accounting Boundary

The Reports panel does not calculate or reinterpret:

- cost basis
- cash invested
- net expenses
- disbursements
- net proceeds
- profit
- cash position
- budget actuals or variance
- ROI or margin
- forecasts
- commissions
- receipts or payments
- loan/draw funding
- investor capital

It formats existing returned values only.

## Database And Interaction Boundary

The Reports branch contains:

- no `DB.*` call
- no `fetch()` call
- no Supabase call
- no new table reference
- no new formula assignment or aggregation
- no button, input, select, or textarea
- no export, print, email, save, share, edit, or approval action

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

### Complete-summary render

Tested with all seven approved summary fields populated.

Verified:

- All seven values render with the existing money formatter.
- The source is labeled as the existing financial summary.
- Snapshot mode is labeled as existing values only.
- Budget actuals are not inferred.
- Investor/funding data is excluded.
- Forecast and ROI states remain unavailable.
- No form controls, data calls, or new formula operations appear.

Result: PASS.

### Missing-summary render

Tested with a `fix_and_flip` project without `_financials`.

Verified:

- Financial summary displays as unavailable.
- Report values display as unavailable.
- No misleading `$0` values appear.

Result: PASS.

### Validation note

An initial static test matched the visible label `Forecasts` while looking for formula-related words. That was a test false positive, not an application defect.

The check was narrowed to actual formula operations and assignments, then rerun successfully.

### Full Property Hub regression

These five read-only panels were rendered together:

1. Acquisition
2. Budget
3. Loans / Draws
4. Sale / Exit
5. Reports

Verified:

- Each panel renders its approved existing values.
- Project text remains escaped.
- Accounting and funding boundaries remain visible.
- All five panels contain no form controls.
- The `fix_and_flip` gate remains true.
- A normal `new_construction` project remains excluded from FlipEngine.

Result: PASS.

## Current Code Scope

The combined local code diff for the five implemented read-only modules is:

```text
js/projects.js | 170 added lines
```

No existing code line was removed by these modules.

## Manual QA Checklist

When browser preview is available:

1. Confirm Property Hub remains unavailable for normal projects.
2. Open a `fix_and_flip` project without a financial summary.
3. Open Reports and confirm unavailable states rather than `$0`.
4. Open a `fix_and_flip` project with a financial summary.
5. Confirm all seven existing values display.
6. Confirm there is no ROI, forecast, export, filter, Edit, or Save action.
7. Confirm Acquisition, Budget, Loans / Draws, and Sale / Exit still open.
8. Confirm Overview, Expenses, Financials, Disbursements, and Work Orders remain unchanged.
9. Confirm no browser console errors.

## Recovery

This implementation is isolated to the `section.id === 'reports'` branch inside `renderPropertyHubSection()`.

To remove only Reports before commit, remove that branch. Do not revert the entire `js/projects.js` file.

## Safe UI Expansion Limit Reached

The Property Hub now uses all currently approved existing project/financial sources that can form useful read-only modules without opening a new data source:

- Acquisition: existing project acquisition summary
- Budget: existing context only, without budget actual reinterpretation
- Loans / Draws: existing project loan amount only
- Sale / Exit: existing sale and financial-summary results only
- Reports: existing financial-summary snapshot only

The following modules cannot become meaningfully data-backed under the current safe boundary:

- Receipts: requires `project_receipts` and receipt/accounting rules
- Documents: requires project document-link review and `project_document_links`
- Investors: protected Investor Hub boundary
- Contractors: no approved active data source
- Labor / Time: no approved active data source or labor-cost rules
- Payments: no approved active data source or payment/accounting rules

## Next Governance Gate

Further data-backed implementation requires a separate exact approval for a non-production environment plan covering:

1. Applying the reviewed FlipEngine migration to staging or a restored database.
2. Auth/RLS policies for the new tables.
3. Read-method behavior when tables are unavailable.
4. Source-of-truth rules for acquisition and budget data.
5. Receipt-to-expense and document-link rules.
6. Exact first CRUD module scope.

Production SQL, `db push`, linked migration apply, production data, and Investor Hub remain outside the current authorization.
