# Phase 4A: Acquisition Module Plan

Status: Planning only.

No code was changed. No UI was changed. No SQL was run. No migrations were applied. No database writes were added. Investor Hub was not activated.

## Purpose

Plan the safest path for the first FlipEngine Acquisition module inside the existing NexArWO Property Hub.

The Acquisition module will eventually store purchase, closing, escrow, lender, and buyer-funds-to-close details for selected fix-and-flip projects. It must extend existing NexArWO project data without replacing `projects`, without changing existing financial formulas, and without forcing normal construction projects into an investment workflow.

## Current Phase Boundary

Phase 4A is planning only.

Do not implement Acquisition CRUD yet because the FlipEngine MVP migration has not been applied to a real approved environment.

Allowed now:

- Document the future Acquisition module behavior.
- Identify safe existing data that can be displayed read-only.
- Define readiness gates before any DB-backed reads or writes.
- Define the first small code step for later owner approval.

Not allowed now:

- No calls to `project_acquisitions`.
- No insert, update, delete, or upsert flows.
- No `js/supabase.js` data methods for Acquisition yet.
- No SQL execution.
- No migration apply.
- No RLS/Auth changes.
- No Investor Hub activation.
- No financial formula changes.

## Data Ownership Rules

`projects` remains the base source of truth for the existing NexArWO project identity and workspace.

`project_acquisitions` is planned as a detail extension table for selected FlipEngine projects only.

Rules:

- Do not move existing data out of `projects`.
- Do not delete existing project fields.
- Do not automatically sync overlapping fields between `projects` and `project_acquisitions` yet.
- Do not treat acquisition closing costs, loans, or buyer funds as operating expenses.
- Do not update `project_financial_summaries` from Acquisition data without a separately approved financial spec.

## Planned Table Dependency

Future table:

- `project_acquisitions`

Confirmed Phase 2 decisions:

- Primary key: `id BIGSERIAL`
- Project relationship: `project_id TEXT REFERENCES projects(id)`
- One-to-one project extension: `UNIQUE(project_id)`
- Audit fields: nullable `created_by UUID REFERENCES auth.users(id)` and `updated_by UUID REFERENCES auth.users(id)`
- RLS/Auth policies: deferred to a later approved phase

## Future Acquisition Fields

The future UI should support these planned fields from the Phase 2 SQL draft:

- `buyer_entity`
- `seller_name`
- `purchase_price`
- `earnest_money`
- `closing_date`
- `escrow_company`
- `escrow_number`
- `lender_name`
- `loan_number`
- `loan_amount`
- `construction_holdback`
- `buyer_funds_to_close`
- `assignment_fee`
- `homeowner_insurance`
- `owner_title_insurance`
- `escrow_fee`
- `recording_fees`
- `total_closing_costs`
- `notes`

## Safe Existing Data To Display Before Migration

Before the `project_acquisitions` table is applied, the Property Hub Acquisition tab can only display read-only existing project fields when available.

Safe existing sources:

- `_currentProject.id`
- `_currentProject.name`
- `_currentProject.address`
- `_currentProject.project_type`
- `_currentProject.status`
- existing purchase price field if present
- existing purchase date field if present
- existing down payment field if present
- existing loan amount field if present
- existing closing cost field if present
- existing notes field if present

Important:

- Label these values as existing project data, not as saved Acquisition records.
- Do not imply that the future `project_acquisitions` table is already populated.
- Do not write fallback values into any table.

## Recommended First Code Step After Approval

First safe implementation step:

Add a read-only Acquisition panel inside the existing gated Property Hub shell.

Scope:

- Modify `js/projects.js` only if possible.
- Reuse the existing `isFlipEngineProject(project)` gate.
- Show the Acquisition tab only for eligible fix-and-flip projects through the existing Property Hub shell.
- Render existing project values read-only.
- Keep the locked message for DB-backed editing:

```text
Requires FlipEngine database migration before editing.
```

Avoid:

- No new form fields.
- No save buttons.
- No network calls to `project_acquisitions`.
- No `js/supabase.js` methods.
- No financial calculations.

## Future CRUD Readiness Gates

Do not add DB-backed Acquisition create/update behavior until all gates pass:

1. Owner approves applying the Phase 2 migration to a real staging/restored environment.
2. The target environment confirms `project_acquisitions` exists.
3. RLS/Auth behavior is reviewed and approved, or a safe temporary policy is explicitly approved.
4. A read path is tested without breaking environments where the table is missing.
5. Owner approves the exact Acquisition CRUD scope.
6. Manual QA confirms existing Projects, Financials, Expenses, Disbursements, Work Orders, and Documents still work.

## Future Validation Rules

When CRUD is approved, validate:

- `project_id` is required and must reference an existing `projects.id`.
- Only one acquisition record per project.
- Money fields must be zero or positive unless a specific accounting rule allows otherwise.
- `closing_date` must be a valid date.
- Text fields should have reasonable length limits.
- `loan_amount`, `construction_holdback`, and `buyer_funds_to_close` must stay separate from operating expenses.
- `total_closing_costs` should either be manually entered or calculated by an approved formula, not both without clear UI.

## Risks

1. Existing project fields may overlap with future Acquisition fields and create source-of-truth confusion.
2. Acquisition loan data could be confused with future Loans / Draws module data.
3. Closing costs could be double-counted if they are later also entered as expenses.
4. Adding write paths before RLS/Auth approval could expose data incorrectly.
5. Reading `project_acquisitions` before migration exists could break current preview/prod UI.
6. A broad `js/projects.js` change could accidentally affect existing Work Orders or Financials.

## Manual QA Plan For Future Read-Only Panel

When the first read-only Acquisition panel is approved:

1. Open the Projects page.
2. Open a normal non-fix-and-flip project.
3. Confirm the Property Hub and Acquisition flow do not appear as active investment features.
4. Open the Coindo fix-and-flip project.
5. Open Property Hub.
6. Open Acquisition.
7. Confirm only read-only existing project data is shown.
8. Confirm the locked message says DB migration is required before editing.
9. Confirm no Add/Edit/Save action appears.
10. Confirm no network request is made to `project_acquisitions`.
11. Confirm Financials, Expenses, Disbursements, and Work Orders still open.
12. Confirm no console errors.

## Acceptance Criteria

For Phase 4A planning:

- Acquisition module scope is documented.
- Data ownership rules are clear.
- Future table dependency is documented.
- Read-only pre-migration behavior is defined.
- CRUD readiness gates are documented.
- No code, UI, SQL, migrations, production data, or Investor Hub behavior changed.

For the next approved code step:

- Acquisition appears only inside the gated Property Hub for eligible fix-and-flip projects.
- It is read-only.
- It uses only existing project data.
- It does not call new FlipEngine tables.
- It does not affect existing NexArWO modules.

## Recommended Next Step

Next safest step:

Owner decides whether to proceed with a Phase 4B read-only Acquisition panel inside Property Hub.

If approved, Phase 4B should be UI-only and should not add DB reads or writes yet.

CRUD should wait until a real staging/restored database migration test passes and the owner approves the Acquisition data access scope.
