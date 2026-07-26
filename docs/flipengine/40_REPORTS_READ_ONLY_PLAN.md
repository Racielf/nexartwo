# Reports Read-Only Snapshot Plan

Status: Approved for safe local implementation under the owner's continuous phase-by-phase authorization.

Planning only in this document. No report formula, forecast, ROI, SQL, migration, database method, CRUD, Auth/RLS, Investor Hub, payment, or accounting automation is authorized.

## Purpose

Define a useful Reports snapshot inside the gated FlipEngine Property Hub using only values already returned by the existing NexArWO project financial summary.

The panel must make each value traceable to the existing summary and must not create a second financial model.

## Existing Safe Source

From `_currentProject._financials` when already loaded:

- `cost_basis`
- `cash_invested`
- `net_expense_cost`
- `total_disbursements`
- `net_proceeds`
- `profit`
- `project_cash_position`

The panel may format these returned values with the existing `fmtMoney()` helper.

Formatting is not a new financial calculation.

## Approved UI Scope

Modify `js/projects.js` only for implementation.

Display:

- Financial summary availability
- Snapshot mode as existing values only
- Cost Basis
- Cash Invested
- Net Expenses
- Disbursements
- Net Proceeds
- Existing Profit
- Project Cash Position
- Budget actuals as not inferred
- Investor/funding data as excluded
- Receipt/payment totals as not added
- Forecasts as not generated
- ROI as not calculated in this panel
- Standard migration-required read-only notice

## Accounting Boundary

The Reports panel must not:

- sum or subtract financial fields
- calculate ROI
- calculate margin
- calculate budget variance
- calculate remaining budget
- calculate commission
- calculate draw availability
- add receipts to expenses
- add payments to disbursements
- add investor capital to operating totals
- treat current profit as a forecast
- present missing data as zero

## Prohibited Behavior

- No custom report builder.
- No date filters or category filters before approved data sources exist.
- No export, print, email, save, or share actions.
- No Add, Edit, Delete, or approval controls.
- No input, select, textarea, or button.
- No `DB.*`, `fetch()`, or Supabase call.
- No new table reference.
- No modification of existing financial formulas.

## Files

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/40_REPORTS_READ_ONLY_PLAN.md`
- A separate implementation record after validation

Intentionally unchanged:

- `js/supabase.js`
- `js/app.js`
- `css/`
- `index.html`
- dashboards
- `supabase/`
- `sql/`
- existing migrations
- Auth/RLS
- Investor Hub
- financial formulas
- `memory/CURRENT_TASK.md`

## Acceptance Criteria

- Reports renders only through the gated Property Hub.
- A loaded financial summary displays the seven approved values.
- A missing financial summary displays unavailable states, not `$0` assumptions.
- Every metric is labeled as an existing summary value.
- No calculation, control, data call, or table dependency is added.
- Acquisition, Budget, Loans / Draws, Sale / Exit, Expenses, Financials, and Work Orders remain unchanged.

## Validation Plan

1. Validate JavaScript syntax.
2. Validate diff formatting.
3. Render Reports with a complete existing summary.
4. Render Reports without a summary.
5. Confirm all seven fields display only when present.
6. Confirm no form/action controls.
7. Confirm no data calls or future table references.
8. Confirm no ROI, forecast, or arithmetic expression in the new branch.
9. Re-run all implemented Property Hub read-only panels.
10. Confirm normal projects remain outside the FlipEngine gate.

## Full Reports Gate

Advanced Reports remains blocked until separately approved decisions exist for:

1. Traceable source tables for each metric.
2. Budget actual and variance rules.
3. Receipt, payment, loan, draw, and funding accounting rules.
4. Sale commission, profit, and ROI specifications.
5. Date range, category, and status filters.
6. Export, sharing, and document-generation permissions.
7. Auth/RLS and tenant/user access.
8. Performance and pagination for admin data views.
