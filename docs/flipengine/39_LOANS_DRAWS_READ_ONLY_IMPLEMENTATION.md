# Loans / Draws Read-Only Context Implementation

Status: Implemented locally. Not committed, pushed, deployed, or connected to formal loan/draw tables.

## Purpose

Replace the generic locked Loans / Draws placeholder with a safe read-only financing context while preserving the distinction between a project loan summary, formal lender records, draw requests, funded draws, cash, and operating expenses.

This implementation follows `38_LOANS_DRAWS_READ_ONLY_PLAN.md`.

## Files Modified

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/38_LOANS_DRAWS_READ_ONLY_PLAN.md`
- `docs/flipengine/39_LOANS_DRAWS_READ_ONLY_IMPLEMENTATION.md`

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
- expenses, disbursements, or payments
- `memory/CURRENT_TASK.md`
- existing untracked local work

## Implemented Behavior

The Property Hub `Loans / Draws` section now displays:

- Existing Loan Amount from the current project
- Project loan summary availability
- Construction Holdback as unavailable
- Draw Requested as unavailable
- Draw Funded as unavailable
- Formal lender record as not loaded
- Loan number as unavailable
- Loan balance as not calculated
- Draw records as not loaded
- Available to draw as not calculated
- Operating expenses as separately tracked
- Investor capital as unused by this panel
- Standard migration-required read-only notice

## Zero Or Missing Loan Behavior

The existing project loan field can default to zero.

The panel treats zero or missing values as unavailable rather than presenting a formal `$0` lender balance. A positive value is labeled as an existing project summary only.

No stored value is changed.

## Funding Boundary

The panel does not treat the existing loan amount as:

- cash received
- funded draw amount
- construction holdback
- available draw balance
- current principal balance
- lender commitment
- investor capital
- operating income
- negative operating expense

## Database And Interaction Boundary

The new branch contains:

- no `DB.*` call
- no `fetch()` call
- no Supabase call
- no formal loan, draw, or closing-cost table reference
- no Add, Edit, Save, Request, Approve, Fund, Pay, or Delete action
- no button, input, select, or textarea

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

### Positive-loan render

Tested with:

```text
loan_amount = 446040
```

Verified:

- `$446,040` renders through the existing money formatter.
- The value is labeled as existing project data.
- Draw and holdback values remain unavailable.
- Operating expenses remain explicitly separate.
- Loan balance and available-to-draw remain not calculated.

Result: PASS.

### Zero-loan render

Tested with:

```text
loan_amount = 0
```

Verified:

- The project loan summary displays as unavailable.
- No misleading `$0` formal loan balance appears.

Result: PASS.

### Code-boundary checks

Verified:

- No form controls.
- No data calls.
- No future financing table references.
- No draw action handlers.

Result: PASS.

### Property Hub regression

Acquisition, Budget, Loans / Draws, and Sale / Exit were rendered together.

Verified:

- Acquisition purchase values and escaping remain correct.
- Budget accounting boundaries remain correct.
- Existing loan amount renders correctly.
- Sale values remain correct.
- All four sections remain read-only.
- The `fix_and_flip` gate remains true.
- A normal `maintenance` project remains excluded.

Result: PASS.

## Current Code Scope

The combined local code diff for the four implemented read-only modules is:

```text
js/projects.js | 141 added lines
```

No existing code line was removed by these modules.

## Manual QA Checklist

When browser preview is available:

1. Confirm a normal project does not expose Property Hub.
2. Open a financed `fix_and_flip` project.
3. Open Loans / Draws.
4. Confirm Existing Loan Amount renders.
5. Confirm no lender, holdback, draw, or balance value is invented.
6. Confirm no Request Draw, Approve, Fund, Edit, or Save control appears.
7. Open a project with no loan and confirm the amount is unavailable rather than `$0`.
8. Confirm Acquisition, Budget, Sale / Exit, Expenses, Financials, and Work Orders remain operational.
9. Confirm no browser console errors.

## Recovery

This implementation is isolated to the `section.id === 'loans'` branch inside `renderPropertyHubSection()`.

To remove only this panel before commit, remove that branch. Do not revert the entire `js/projects.js` file.

## Full Module Gate

A writable Loans / Draws module remains blocked until separately approved decisions exist for:

1. Loan, draw, and closing-cost schema.
2. Existing project-field source-of-truth rules.
3. Lender and loan lifecycle.
4. Draw requested, approved, rejected, and funded states.
5. Construction holdback and draw availability.
6. Cash received, reimbursement, repayment, interest, and fee accounting.
7. Documents and payment relationships.
8. Auth/RLS, data methods, staging apply, and CRUD QA.

## Recommended Next Safe Module

The next safe candidate is a read-only Reports snapshot using only the existing project financial summary. It must display returned values without adding calculations, forecasts, ROI, or accounting reinterpretation.
