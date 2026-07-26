# Loans / Draws Read-Only Context Plan

Status: Approved for safe local implementation under the owner's continuous phase-by-phase authorization.

Planning only in this document. No financing formula, SQL, migration, database method, CRUD, payment, expense, Auth/RLS, or Investor Hub change is authorized.

## Purpose

Define the smallest useful Loans / Draws panel that can render before formal FlipEngine loan and draw tables exist in an approved active environment.

The panel will display the existing project loan amount as a project-level summary only. It will not present that amount as a complete lender account, available construction balance, funded draw total, or cash receipt.

## Existing Safe Source

From `_currentProject`:

- `loan_amount`

Legacy compatibility:

- `loanAmount`

The existing value belongs to the NexArWO project record. It is not a formal FlipEngine `project_loans` record.

## Approved UI Scope

Modify `js/projects.js` only for implementation.

Display:

- Existing Loan Amount when greater than zero
- Project loan summary availability
- Formal lender record as unavailable
- Loan number as unavailable
- Loan balance as not calculated
- Construction holdback as unavailable
- Draw requested as unavailable
- Draw funded as unavailable
- Draw records as not loaded
- Available-to-draw balance as not calculated
- Operating expense separation
- Investor capital separation
- Standard migration-required read-only notice

## Funding Boundary

The panel must not treat:

- loan amount as cash received
- loan amount as available construction funds
- construction holdback as funded cash
- draw request as approved cash
- approved draw as funded cash without a funding record
- investor contributions as lender draws
- lender funding as operating expense
- loan repayment as a project expense without an approved accounting rule

## Prohibited Behavior

- No Add Lender, Add Loan, Request Draw, Approve Draw, Fund Draw, or Record Payment action.
- No input, select, textarea, button, or editable content.
- No loan balance, draw availability, interest, fee, repayment, or cash-position calculation.
- No `DB.*`, `fetch()`, or Supabase call.
- No future loan, draw, or closing-cost table reference in the rendered branch.
- No use of Investor Hub funding data.
- No modification of expenses, disbursements, or financial summaries.

## Files

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/38_LOANS_DRAWS_READ_ONLY_PLAN.md`
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
- expenses and disbursements
- `memory/CURRENT_TASK.md`

## Acceptance Criteria

- Loans / Draws renders only through the existing gated Property Hub.
- A positive existing loan amount renders as a project summary.
- Zero or missing loan values render as unavailable, not as a formal zero-balance loan.
- All draw, holdback, lender-record, and balance values remain unavailable or not calculated.
- Funding and operating costs remain explicitly separate.
- No form controls or data calls appear.
- Acquisition, Budget, Sale / Exit, Expenses, and Work Orders remain unchanged.

## Validation Plan

1. Validate JavaScript syntax.
2. Validate diff formatting.
3. Render with a positive existing project loan amount.
4. Render with a zero/missing loan amount.
5. Confirm no form controls.
6. Confirm no data calls or future table references.
7. Confirm no financing arithmetic.
8. Run Property Hub regressions for Acquisition, Budget, and Sale / Exit.
9. Confirm normal projects remain outside the FlipEngine gate.

## Full Module Gate

A writable Loans / Draws module requires separate approval for:

1. Loan, draw, and closing-cost schema.
2. Source-of-truth rules with existing `projects.loan_amount` and closing-cost fields.
3. Loan lifecycle and balance rules.
4. Draw requested, approved, and funded status definitions.
5. Construction holdback behavior.
6. Cash-received and reimbursement accounting rules.
7. Interest, fees, repayment, and payment rules.
8. Documents and lender relationships.
9. Auth/RLS, data methods, staging apply, and CRUD QA.
