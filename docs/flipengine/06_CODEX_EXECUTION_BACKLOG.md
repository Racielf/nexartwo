# FlipEngine Codex Execution Backlog

Source context:

- `FLIPENGINE_CONTEXT.md`
- `docs/flipengine/01_ADAPTATION_STRATEGY.md`
- `docs/flipengine/02_EXISTING_REPO_MAP.md`
- `docs/flipengine/03_MODULES_TO_ADD.md`
- `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
- `docs/flipengine/05_IMPLEMENTATION_PHASES.md`

## Purpose

Convert the current FlipEngine planning documents into an executable backlog for future Codex sessions.

This backlog is still Fase 1: documentation and planning only. It does not authorize code changes, SQL changes, migrations, UI changes, Investor Hub activation, branding changes, or destructive edits.

## Global Context Guardrails

- NexArWO remains the main app.
- FlipEngine is a module/layer inside NexArWO, not a separate app and not a replacement.
- NexArtEngine belongs to a different project and must not be used as app name, branding, table prefix, module name, or repo identity here.
- Existing projects must not all become investments.
- Selected `projects` can represent properties/investments only when they intentionally participate in FlipEngine.
- Existing Work Orders, Projects, construction workflows, financial formulas, documents, and Supabase behavior must continue working.
- New tables and modules must extend existing data non-destructively.
- Existing migrations must not be edited without owner approval.
- Investor Hub must not be activated, reworked, or exposed in new ways without owner approval.
- General NexArWO branding must not be changed without owner approval.

## Naming Decision For Future Work

Use `project_*` table names for the future Phase 2 SQL draft because FlipEngine extends selected NexArWO `projects` rather than creating a separate app identity.

Earlier `property_*` wording in planning docs is conceptual. Future migration drafts should prefer:

- `project_acquisitions`
- `project_budget_categories`
- `project_closing_costs`
- `project_loans`
- `project_loan_draws`
- `project_receipts`
- `project_document_links`
- `project_contractors`
- `project_employees`
- `project_time_entries`
- `project_payments`
- `project_sale_exit`

## Execution Rules For Codex

- Work one phase at a time.
- Before each phase, re-read the relevant docs and inspect current repo state.
- Do not assume schema types; verify existing Supabase migrations and current data access code before proposing SQL or code.
- Prefer additive changes.
- Keep each phase independently reviewable and manually testable.
- End each phase with files changed, risks, manual test steps, and what remains.
- Stop and request owner approval if a phase requires migrations, Auth/RLS changes, financial formula changes, Investor Hub behavior changes, destructive changes, or production deployment.

---

## Fase 0: Context Guardrails

### Objetivo

Lock the product boundary before implementation begins: NexArWO remains the existing app, and FlipEngine is only an internal module/layer for selected fix-and-flip investment projects.

### Archivos probables a modificar

- `FLIPENGINE_CONTEXT.md`
- `docs/flipengine/*.md`
- Optional future task brief files under `memory/`

### Tablas probables a crear

None.

### Riesgos

- Future agents may interpret FlipEngine as a replacement app.
- Future docs may accidentally use NexArtEngine naming.
- Existing Projects could be incorrectly treated as investments by default.

### Dependencias

- Owner confirmation of product naming and scope.
- Current documentation set must remain easy to discover from repo root.

### Como probar manualmente

- Search docs for `NexArtEngine`, `replacement`, `rebrand`, and `Project =`.
- Confirm every usage explains what not to do.
- Confirm docs say FlipEngine is inside NexArWO.

### Criterio de aceptacion

- Guardrails are present in the root context document and planning docs.
- No code, SQL, UI, migration, or branding files are touched.
- The next phase cannot be confused with app replacement.

### Que NO debe tocarse en esta fase

- No `js/` files.
- No `css/` files.
- No `index.html` or `projects.html`.
- No `supabase/` files.
- No SQL files.
- No Investor Hub activation.
- No branding assets or app identity changes.

---

## Fase 1: Documentation And Repo Map

### Objetivo

Document the existing NexArWO structure and map where FlipEngine can safely attach later.

### Archivos probables a modificar

- `FLIPENGINE_CONTEXT.md`
- `docs/flipengine/01_ADAPTATION_STRATEGY.md`
- `docs/flipengine/02_EXISTING_REPO_MAP.md`
- `docs/flipengine/03_MODULES_TO_ADD.md`
- `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
- `docs/flipengine/05_IMPLEMENTATION_PHASES.md`
- `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`
- `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`

### Tablas probables a crear

None.

### Riesgos

- Docs may become too broad and stop being actionable.
- Existing table names may be guessed instead of verified.
- Planning may accidentally imply permission to implement.

### Dependencias

- Current repo files must be readable.
- Existing migration history should be reviewed only for mapping, not modified.

### Como probar manualmente

- Confirm all expected docs exist under `docs/flipengine/`.
- Confirm `FLIPENGINE_CONTEXT.md` exists at repo root.
- Confirm docs include no executable SQL migration.
- Confirm docs include no instruction to activate Investor Hub.

### Criterio de aceptacion

- Documentation clearly defines phases, risks, acceptance criteria, and owner approval gates.
- Repo map identifies likely implementation files without changing them.
- Phase 2 has a planning document but no actual migration file.

### Que NO debe tocarse en esta fase

- No app code.
- No UI markup.
- No CSS.
- No migrations.
- No SQL execution.
- No deploy.
- No Investor Hub activation.

---

## Fase 2: Non-Destructive Database Extension Draft

### Objetivo

Draft a reviewed SQL migration proposal for the first FlipEngine tables without applying it.

### Archivos probables a modificar

- `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`
- Optional future review doc under `docs/flipengine/`
- Optional future draft file under a non-executed planning folder, only with owner approval

### Tablas probables a crear

Initial MVP candidates:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`

Later tables may be documented but not included in the first migration:

- `project_closing_costs`
- `project_loans`
- `project_loan_draws`
- `project_contractors`
- `project_employees`
- `project_time_entries`
- `project_payments`
- `project_sale_exit`

Future `project_sale_exit` requirement:

- Realtor commissions must be planned as editable percentages, not only fixed manual amounts.
- Future fields should include `listing_agent_commission_percent`, `buyer_agent_commission_percent`, `total_realtor_commission_percent`, `sale_price`, and `calculated_realtor_commission_amount`.
- Sale / Exit financials should calculate:

```text
calculated_realtor_commission_amount = sale_price * total_realtor_commission_percent / 100
```

- Actual closing statement amounts may be reconciled later, but the primary input should remain percentage-based because commission terms can vary by deal.

### Riesgos

- Existing `projects.id` type may differ from assumptions.
- Existing RLS/Auth patterns may require careful review.
- New relationships could accidentally affect existing financial summaries.
- Applying SQL too early could create schema drift.
- Sale / Exit commission calculations could be incorrect if percentage fields, sale price, and reconciled closing statement amounts are not clearly separated.

### Dependencias

- Owner approval to draft any migration file.
- Review of current Supabase migrations and production schema assumptions.
- Decision on MVP table subset.

### Como probar manualmente

- Review proposed table list and columns.
- Confirm SQL is non-destructive before any execution.
- Confirm no existing table is dropped, renamed, or backfilled.
- Confirm every new table has lifecycle/status fields where history matters.

### Criterio de aceptacion

- A future migration proposal is documented and owner-reviewed.
- No migration is applied.
- No existing migration is edited.
- SQL includes rollback thinking and manual QA steps before use.

### Que NO debe tocarse en esta fase

- No executed SQL.
- No `db push`.
- No destructive schema changes.
- No existing migration edits.
- No Auth/RLS activation unless separately approved.
- No Investor Hub activation.
- No app code or UI.

---

## Fase 3: Property Hub Shell

### Objetivo

Create a safe Property Hub shell inside the existing Projects workspace for selected FlipEngine projects.

### Archivos probables a modificar

- `js/projects.js`
- `css/styles.css`
- Possibly `projects.html` as reference only if still relevant
- Documentation updates under `docs/flipengine/`

### Tablas probables a crear

None in this phase if Phase 2 schema already exists or placeholders are used.

### Riesgos

- Existing project list or project detail behavior could break.
- Tabs may expose empty or confusing states.
- Investor Hub UI could be accidentally activated or changed.
- The shell could imply all projects are investments.

### Dependencias

- Owner approval to begin code changes.
- Phase 2 schema decision, or a deliberate mock/empty-state-only approach.
- Current project detail tab architecture must be inspected before edits.

### Como probar manualmente

- Open NexArWO Projects.
- Open an existing normal project and confirm it still behaves normally.
- Open a selected/demo FlipEngine project and confirm Property Hub shell appears only where intended.
- Switch all shell tabs and confirm no console errors.
- Confirm Work Orders tab still renders.

### Criterio de aceptacion

- Property Hub shell is visible only for selected FlipEngine context.
- Existing Projects workflows still work.
- Empty states are safe and clear.
- No database writes are introduced unless explicitly approved.

### Que NO debe tocarse en esta fase

- No financial formulas.
- No SQL or migrations.
- No Investor Hub activation or redesign.
- No global branding changes.
- No forced conversion of all projects.

---

## Fase 4: Acquisition Module

### Objetivo

Add acquisition data capture for selected FlipEngine projects: purchase price, earnest money, closing date, buyer entity, seller, escrow, lender, loan number, buyer funds to close, and related notes.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_acquisitions`

### Riesgos

- Acquisition values could be confused with operating expenses.
- Loan fields in acquisition could duplicate future loan records.
- Missing validation may allow bad money/date values.

### Dependencias

- Approved non-destructive migration for `project_acquisitions`.
- Owner decision on whether one project can have one or multiple acquisition records.
- Data access pattern in `js/supabase.js` reviewed before adding CRUD.

### Como probar manualmente

- Open selected demo project.
- Create acquisition record for 4134 NE 131st Place.
- Save and reload.
- Confirm existing Projects, Work Orders, and financial summaries are unchanged.
- Confirm normal non-FlipEngine projects are not forced into acquisition flow.

### Criterio de aceptacion

- Acquisition data can be created, read, updated, and displayed for selected projects.
- Empty state works before a record exists.
- Values persist after reload.
- Existing app behavior remains unchanged.

### Que NO debe tocarse en esta fase

- No project financial formula changes.
- No Investor Hub changes.
- No loan draw workflow.
- No payment workflow.
- No global project conversion.

---

## Fase 5: Budget Categories Module

### Objetivo

Add renovation budget categories for selected FlipEngine projects and prepare safe links to Work Orders, expenses, and receipts.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_budget_categories`

### Riesgos

- Actual spend could be manually duplicated instead of derived.
- Budget totals could conflict with existing project financial summaries.
- Work Orders could be incorrectly required to have budget categories.

### Dependencias

- Approved non-destructive migration for `project_budget_categories`.
- Decision on whether actual spend is read-only derived, manually entered, or hybrid.
- Existing expense and Work Order structures reviewed.

### Como probar manualmente

- Add budget categories for a selected demo project.
- Confirm estimated budget, actual spent, remaining, and variance render safely.
- Confirm Work Orders can still exist without budget category.
- Reload and confirm values persist.

### Criterio de aceptacion

- Budget categories can be managed for selected FlipEngine projects.
- Existing project financial summaries remain untouched.
- Work Orders and expenses keep existing behavior.
- Empty and zero-value states render correctly.

### Que NO debe tocarse en esta fase

- No financial formula rewrites.
- No expense schema changes unless separately approved.
- No required Work Order changes.
- No Investor Hub or funding logic.

---

## Fase 6: Receipts And Expenses Module

### Objetivo

Add receipt tracking and connect receipts carefully to selected projects, optional Work Orders, optional budget categories, and optional project expenses.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Possibly existing document upload/display code after review
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_receipts`
- Optional later extension fields on `project_expenses`, only after approval

### Riesgos

- Receipt amounts could be counted twice as expenses.
- Pending receipts could be treated as approved spend.
- File links could duplicate existing document behavior.

### Dependencias

- Approved non-destructive migration for `project_receipts`.
- Decision on receipt review statuses.
- Clear rule for when a receipt becomes an expense.
- Existing documents and expenses flows reviewed.

### Como probar manualmente

- Add demo Home Depot receipt metadata.
- Link it to project, optional Work Order, and optional budget category.
- Confirm pending receipt does not alter existing expense totals.
- Approve/review behavior only if explicitly implemented in this phase.

### Criterio de aceptacion

- Receipts can be tracked without double-counting expenses.
- Existing expenses remain valid and unchanged.
- Receipt review status is visible.
- Normal projects are unaffected.

### Que NO debe tocarse en esta fase

- No automatic expense creation unless explicitly approved.
- No financial summary rewrites.
- No payment automation.
- No document schema changes unless separately approved.
- No Investor Hub.

---

## Fase 7: Documents Extension

### Objetivo

Extend document associations so existing documents can be linked to FlipEngine entities without replacing the current Documents module.

### Archivos probables a modificar

- `js/projects.js`
- `js/app.js` only if existing Documents behavior requires a compatible display update
- `js/supabase.js`
- `css/styles.css`
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_document_links`

### Riesgos

- Existing Documents page could break if document assumptions change.
- Linked entity IDs could become ambiguous without `linked_type`.
- Upload behavior could be duplicated instead of reused.

### Dependencias

- Approved non-destructive migration for `project_document_links`.
- Current `documents` table and UI behavior reviewed.
- Decision on allowed document types.

### Como probar manualmente

- Link an existing document to a selected project.
- Link a document to acquisition, receipt, or loan placeholder if available.
- Confirm the existing Documents page still loads.
- Confirm deleting a link does not delete the document.

### Criterio de aceptacion

- Documents can be linked to FlipEngine entities.
- Existing Documents records remain stable.
- No document is deleted when a link is removed.
- Existing document search/list behavior remains unchanged.

### Que NO debe tocarse en esta fase

- No destructive document table changes.
- No forced document type changes for old records.
- No global upload rewrite.
- No Investor Hub document activation.

---

## Fase 8: Loans, Draws, Closing Costs

### Objetivo

Add lender financing, construction draw tracking, and closing costs for selected FlipEngine projects while keeping funding separate from operating expenses.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_loans`
- `project_loan_draws`
- `project_closing_costs`

### Riesgos

- Loan funds could be mixed into operating expenses or profit formulas.
- Closing costs could be double-counted with project expenses.
- Draw status could be confused with actual cash received.

### Dependencias

- Approved non-destructive migrations for loan, draw, and closing cost tables.
- Owner-approved definitions for funding, cost, reimbursement, and spend.
- Acquisition module complete or clear link strategy documented.

### Como probar manualmente

- Add Rain City Capital loan record.
- Add construction holdback and draw request.
- Add closing cost examples from demo property.
- Confirm loan/draw totals appear as financing views, not operating expense totals.

### Criterio de aceptacion

- Loans, draws, and closing costs display and persist for selected projects.
- Funding values remain separate from operating expenses.
- Existing financial summaries are unchanged.
- Closing costs have clear status and document link strategy.

### Que NO debe tocarse en esta fase

- No ROI/P&L formula changes unless separately approved.
- No Investor Hub activation.
- No automatic payment creation.
- No existing expense mutation.

---

## Fase 9: Contractors, Employees, Labor/Time

### Objetivo

Add people/company execution tracking around selected projects: contractors, employees, and labor time entries.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Possibly Work Order display code after review
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_contractors`
- `project_employees`
- `project_time_entries`

### Riesgos

- Contractors could conflict with existing clients or recipients.
- Time entries could alter labor cost formulas prematurely.
- Work Orders could be forced to require contractor/employee assignment.

### Dependencias

- Approved non-destructive migrations for people/labor tables.
- Decision on whether contractor/employee profiles are project-scoped or global.
- Work Order relationship reviewed.

### Como probar manualmente

- Add contractor to selected project.
- Add employee to selected project.
- Add time entry linked to project and optional Work Order.
- Confirm Work Orders still work without contractor or employee data.

### Criterio de aceptacion

- Contractor, employee, and time entry records can be created and read.
- Work Orders remain backward compatible.
- Labor costs are displayed only according to approved rules.
- No required fields are added to existing workflows.

### Que NO debe tocarse en esta fase

- No payroll automation.
- No accounting posting.
- No forced Work Order assignment.
- No financial summary rewrites.
- No Investor Hub changes.

---

## Fase 10: Payments And Accounting Reports

### Objetivo

Add payment tracking and early accounting reports for selected FlipEngine projects while preserving existing expense and disbursement behavior.

### Archivos probables a modificar

- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Possibly dashboard/report helpers after review
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

- `project_payments`

### Riesgos

- Payments could be double-counted with expenses or disbursements.
- Payment status could be mistaken for paid expense status.
- Accounting reports could imply final P&L before formulas are approved.

### Dependencias

- Approved non-destructive migration for `project_payments`.
- Owner-approved accounting definitions.
- Existing `project_expenses` and `project_disbursements` behavior reviewed.

### Como probar manualmente

- Add payment to contractor or employee.
- Link payment to optional expense, receipt, closing cost, or loan when applicable.
- Confirm payment does not automatically change existing totals unless approved.
- Review report totals against source records.

### Criterio de aceptacion

- Payments can be tracked with status and related entity links.
- Accounting reports clearly distinguish paid, pending, expense, funding, and disbursement concepts.
- Existing project financial summaries remain unchanged unless separately approved.

### Que NO debe tocarse en esta fase

- No automatic bookkeeping.
- No existing financial formula rewrite without approval.
- No destructive edits to disbursements or expenses.
- No Investor Hub funding merge.

---

## Fase 11: Executive Dashboard And Admin/Data Dashboard

### Objetivo

Build dashboard views for FlipEngine metrics and admin/data review without replacing the existing NexArWO dashboard.

### Archivos probables a modificar

- `index.html`
- `js/app.js`
- `js/projects.js`
- `js/supabase.js`
- `css/styles.css`
- Documentation and QA notes under `docs/flipengine/`

### Tablas probables a crear

None expected if prior phases created required source tables.

### Riesgos

- Dashboard metrics could be wrong if formulas are not approved.
- Existing NexArWO dashboard could be visually or functionally disrupted.
- Large data views could slow page load.

### Dependencias

- Stable source tables and read methods.
- Owner-approved metric definitions.
- Clear distinction between operating costs, funding, payments, estimated profit, and final sale performance.
- Owner-approved Sale / Exit commission calculation rules, including editable listing agent and buyer agent percentages.

### Como probar manualmente

- Open existing dashboard and confirm original behavior.
- Open FlipEngine dashboard/admin view.
- Compare each metric with source records.
- Test empty, partial, and demo data states.
- Confirm normal Projects/Work Orders navigation still works.

### Criterio de aceptacion

- FlipEngine dashboard is additive and discoverable.
- Existing dashboard remains usable.
- Metrics are traceable to source records.
- Sale / Exit dashboard values show calculated realtor commission from sale price and total realtor commission percent when available.
- Admin/data tables support review without mutating records unexpectedly.

### Que NO debe tocarse en esta fase

- No branding replacement.
- No hiding existing dashboard unless approved.
- No unapproved formula changes.
- No Investor Hub activation.
- No destructive data actions.

---

## Fase 12: QA, Demo Data, Cleanup

### Objetivo

Validate the full FlipEngine flow with demo data, clean up documentation, and prepare a safe release/deploy checklist.

### Archivos probables a modificar

- QA docs under `docs/flipengine/`
- Optional manual test scripts under a QA folder, only if approved
- Small bug fixes in files changed by prior phases
- No unrelated refactors

### Tablas probables a crear

None expected. Use already-approved tables only.

### Riesgos

- Demo data could leak into production unintentionally.
- Cleanup could remove useful docs or modules.
- Final fixes could expand beyond safe scope.

### Dependencias

- Prior implementation phases complete.
- Owner approves demo data location and whether it is local, staging, or production.
- Manual QA checklist is complete.

### Como probar manualmente

- Run full flow for 4134 NE 131st Place demo property.
- Confirm acquisition, budget, receipt, documents, loans/draws, contractors, labor, payments, and reports render coherently.
- Confirm normal NexArWO project and Work Order flows still work.
- Confirm no console errors in primary flows.
- Confirm deploy checklist is complete before production deploy.

### Criterio de aceptacion

- Full demo workflow passes manual QA.
- Existing NexArWO behavior remains intact.
- Known risks are documented.
- Owner approves release/deploy.

### Que NO debe tocarse en esta fase

- No destructive cleanup.
- No deletion of existing modules.
- No production demo data without approval.
- No unreviewed migrations.
- No branding changes.

---

## Owner Approval Gates

The owner must approve before any future task does any of the following:

- Creates or applies migrations.
- Modifies existing migrations.
- Changes Auth, RLS, or permissions.
- Changes financial formulas, ROI, P&L, project financial summaries, or accounting logic.
- Activates or changes Investor Hub behavior.
- Changes general NexArWO branding.
- Deploys production changes.
- Imports demo data into production.
- Makes destructive data, file, or schema changes.

## Recommended Next Step

After this Fase 1 backlog is reviewed, the next safe step is owner review of `docs/flipengine/07_PHASE2_SQL_DRAFT_PLAN.md`.

Only after approval should Codex draft an actual non-destructive migration file for the first MVP tables.
