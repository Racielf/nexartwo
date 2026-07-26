# FlipEngine Implementation Phases

Source context: `FLIPENGINE_CONTEXT.md`

## Purpose

Define a safe path for adding FlipEngine inside NexArWO without breaking existing production workflows.

## Context Guardrails

- NexArWO remains the main application.
- FlipEngine is an internal module/layer for selected fix-and-flip property investments.
- NexArtEngine is a different project and must not be used here.
- Existing projects must not all become investments.
- Existing Work Orders, Projects, construction workflows, financials, and documents must continue working.
- No destructive changes, existing migration edits, Investor Hub activation, or general branding changes without explicit approval.

## Global Rules

- One phase at a time.
- Keep changes small and reversible.
- Keep FlipEngine scoped as a module inside NexArWO.
- Do not combine schema, UI, and financial formula changes in the same task unless explicitly approved.
- Do not run SQL directly from an agent session.
- Do not deploy unreviewed database migrations.
- Do not hard-delete financial or historical records.
- Validate manually after every phase.

## Fase 1 - Documentation And Technical Plan

Status:

```text
In progress
```

Scope:

- Create `FLIPENGINE_CONTEXT.md`.
- Create `docs/flipengine/`.
- Create technical planning documents.
- Map current repo to the future FlipEngine module architecture.
- Define non-destructive database extension plan.
- Define implementation phases.

Files:

- `FLIPENGINE_CONTEXT.md`
- `docs/flipengine/01_ADAPTATION_STRATEGY.md`
- `docs/flipengine/02_EXISTING_REPO_MAP.md`
- `docs/flipengine/03_MODULES_TO_ADD.md`
- `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
- `docs/flipengine/05_IMPLEMENTATION_PHASES.md`

No code changes.
No SQL execution.

Validation:

- Confirm docs exist.
- Confirm no app behavior changed.
- Confirm next implementation phase is explicit.

## Fase 2 - Non-Destructive SQL Migration Plan

Scope:

- Draft a migration for the first new tables.
- Do not run migration automatically.
- Owner reviews SQL before application.

Suggested first tables:

- `property_acquisitions`
- `property_budget_categories`
- `property_receipts`
- `document_links`

Files likely affected:

- New migration under `supabase/migrations/` only after owner approval
- Optional QA SQL under `qa/`
- Documentation updates

Stop conditions:

- Existing schema mismatch is unclear.
- Migration requires destructive changes.
- Migration needs Auth/RLS changes.
- Backfill is required.

Validation:

- SQL review completed.
- Migration is idempotent.
- Rollback plan documented.
- Manual QA script drafted.

## Fase 3 - Property Hub Shell

Scope:

- Build Property Hub using the existing Projects workspace as the base.
- Add or scaffold tabs without implementing all business logic at once.
- Preserve existing project list, project detail, Work Orders tab, financials, and Investor Hub behavior.

Files likely affected:

- `js/projects.js`
- `css/styles.css`
- Possibly `projects.html` if still used as a reference surface

Tabs to scaffold:

1. Overview
2. Acquisition
3. Budget
4. Work Orders
5. Expenses
6. Receipts
7. Documents
8. Loans / Draws
9. Investors
10. Contractors
11. Labor / Time
12. Payments
13. Sale / Exit
14. Reports

Validation:

- Existing Projects page still opens.
- Existing project detail still opens.
- Existing Work Orders tab still works.
- Existing Investor Hub tab still works.
- Empty new tabs show safe placeholder states.

## Fase 4 - Acquisition, Budget, Receipts, Documents

Scope:

- Implement first real Property Hub data modules.
- Use the demo property data for QA.
- Keep database writes behind explicit save actions.

Modules:

- Acquisition
- Budget Categories
- Receipts
- Document Links

Files likely affected:

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Approved migration files
- QA docs/scripts

Validation:

- Create or edit acquisition record.
- Add budget categories.
- Add receipt metadata.
- Link document records without breaking existing Documents page.
- Confirm Work Orders and project expenses still render.

## Fase 5 - Loans, Draws, Closing Costs, Payments

Scope:

- Add financing and payment workflow.
- Keep lender/draw logic separate from renovation expense formulas until approved.

Modules:

- Loans
- Draw Requests
- Closing Costs
- Payments

Files likely affected:

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Approved migration files

Validation:

- Add lender/loan record.
- Add draw request.
- Add closing cost.
- Add payment record.
- Confirm totals are displayed as funding/payment views unless a formula spec says otherwise.

## Fase 6 - Investors, Contractors, Employees, Time Tracking

Scope:

- Stabilize people/company relationships around each property.
- Reuse existing Investor Hub tables where possible.
- Add contractor and employee/labor data.

Modules:

- Investors
- Contractors
- Employees
- Labor / Time

Files likely affected:

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Approved migration files

Validation:

- Attach investor to property without duplicate global records.
- Add contractor and link to Work Order.
- Add employee.
- Add time entry.
- Confirm no hard-delete path exists for historical financial records.

## Fase 7 - Reports And Executive Dashboard

Scope:

- Build real FlipEngine reporting.
- Add executive dashboard metrics.
- Add Data/Admin dashboard tables and filters.

Executive dashboard should show:

- Active properties
- Total invested
- Total loan amount
- Total renovation budget
- Total spent
- Remaining budget
- Estimated profit
- ROI
- Open Work Orders
- Pending receipts review
- Pending payments
- Documents needing review

Data/Admin dashboard should show:

- Properties / Projects
- Acquisition records
- Budgets
- Budget categories
- Work Orders
- Expenses
- Receipts
- Loans
- Draws
- Closing costs
- Documents
- Investors
- Contractors
- Employees
- Time entries
- Payments

Validation:

- Dashboard loads without blocking navigation.
- Metrics match underlying records.
- Empty states are clear.
- No old dashboard behavior is broken.

## Standard Phase Completion Report

After every phase, report:

```md
Phase:
Files modified:
Tables added:
Risks:
What remains:
Manual test steps:
Build/check result:
Deploy status:
```

## Immediate Next Step

After Fase 1 is reviewed, the next safe task is:

```text
Draft Fase 2 non-destructive SQL migration proposal for property_acquisitions,
property_budget_categories, property_receipts, and document_links.
```

Do not apply that migration until the owner approves the SQL.
