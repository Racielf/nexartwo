# Phase 5A: Budget Read-Only Context Plan

Status: Approved for safe local implementation under the owner's continuous phase-by-phase authorization.

Planning only in this document. No SQL, migration apply, database method, CRUD flow, financial formula, or Investor Hub change is authorized by this plan.

## Purpose

Define the smallest safe Budget step inside the existing gated FlipEngine Property Hub while `project_budget_categories` is unavailable in the active app environment.

The goal is to give the user useful context without presenting existing expenses, disbursements, cost basis, or Work Orders as if they were approved FlipEngine budget category totals.

## Current Findings

The existing `projects` record does not contain a renovation budget total or budget category collection.

The current project financial summary can contain:

- `net_expense_cost`
- `total_disbursements`
- `cost_basis`
- `cash_invested`
- `project_cash_position`

Those values are existing NexArWO accounting/financial-summary values. They are not automatically equivalent to:

- estimated renovation budget
- committed budget
- budget category actual spend
- remaining budget
- variance

Existing FlipEngine documentation explicitly prohibits reinterpreting these totals as FlipEngine budget actuals.

## Approved UI Scope

Modify `js/projects.js` only for the Budget UI implementation.

The Budget section may display:

- Existing net expenses, clearly labeled as financial-summary context.
- Existing disbursements, clearly labeled as financial-summary context.
- Whether a current financial summary is available.
- Budget category readiness state.
- Estimated budget state as unavailable.
- Remaining budget state as not calculated.
- Variance state as not calculated.
- Work Order independence.
- Receipt-to-budget status as not connected.
- The standard migration-required read-only notice.

## Prohibited UI Behavior

- Do not display net expenses as `Actual Budget` or `Actual Spent`.
- Do not calculate remaining budget.
- Do not calculate variance.
- Do not add estimated budget inputs.
- Do not add budget category rows, demo categories, or local fallback records.
- Do not add Add, Edit, Save, Delete, Import, or approval controls.
- Do not call `project_budget_categories`.
- Do not add `DB.projectBudgetCategories` methods.
- Do not require Work Orders to have a budget category.
- Do not alter expense, refund, disbursement, P&L, ROI, or cash-position formulas.

## Data Sources

Allowed:

- `_currentProject`
- `_currentProject._financials` when already loaded through the existing NexArWO flow

Not allowed:

- New Supabase requests
- New table reads
- LocalStorage budget records
- Hard-coded demo values
- Spreadsheet values copied into the app

## Files

Implementation file:

- `js/projects.js`

Documentation files:

- `docs/flipengine/34_PHASE5A_BUDGET_READ_ONLY_PLAN.md`
- A separate Phase 5B implementation record after code validation

Protected and unchanged:

- `js/supabase.js`
- `supabase/`
- `sql/`
- Auth/RLS
- Investor Hub
- Existing financial formulas
- Work Order data model
- Expense/refund/disbursement data model
- `memory/CURRENT_TASK.md`

## Acceptance Criteria

- Budget renders only through the existing gated Property Hub.
- Existing expense/disbursement values are labeled as context, not budget actuals.
- Estimated, remaining, and variance values are not invented.
- Missing financial summaries show a clear unavailable state.
- No interactive form controls appear.
- No new data source or network call is introduced.
- Existing Acquisition, Overview, Expenses, Work Orders, Financials, and Investor Hub behavior remains unchanged.

## Validation Plan

1. Run `node --check js/projects.js`.
2. Run `git diff --check -- js/projects.js`.
3. Execute an isolated Budget render with a financial summary.
4. Execute an isolated Budget render without a financial summary.
5. Confirm no form controls are present.
6. Confirm no `project_budget_categories` reference is present in rendered HTML or the new code branch.
7. Confirm no budget arithmetic is present.
8. Confirm the normal-project FlipEngine gate remains false.
9. Confirm only the approved code and documentation files changed during this phase.

## Future CRUD Gate

Budget category reads or writes must wait until:

1. The FlipEngine migration is applied to an approved non-production environment.
2. The target confirms `project_budget_categories` exists.
3. Auth/RLS exposure is reviewed and approved.
4. The owner decides whether actual spend is derived, manual, or hybrid.
5. Expense, receipt, and Work Order relationship rules are approved.
6. A separate data-access and CRUD plan is approved.
