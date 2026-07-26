# FlipEngine Phase 2 SQL Draft Plan

Source context:

- `FLIPENGINE_CONTEXT.md`
- `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
- `docs/flipengine/06_CODEX_EXECUTION_BACKLOG.md`

## Status

Planning only.

This file describes a future non-destructive SQL migration strategy. It is not a migration, contains no executable SQL, and does not authorize schema changes.

## Purpose

Prepare the future Phase 2 SQL draft for FlipEngine tables that extend selected NexArWO `projects` into fix-and-flip property/investment workflows.

FlipEngine remains a module/layer inside NexArWO. These tables must not force every project to become an investment.

## Existing Data Protection Rules

- Do not modify existing tables destructively.
- Do not drop, rename, truncate, or rewrite existing tables.
- Do not edit existing migration files without owner approval.
- Do not run SQL from this planning phase.
- Do not run `db push` from this planning phase.
- Do not create automatic backfills without owner approval.
- Do not mix funding, investor capital, capital contributions, capital calls, or private lender funding with operating expenses.
- Do not break existing `project_financials`, project financial summaries, ROI, P&L, expenses, refunds, or disbursement formulas.
- Do not activate Investor Hub without explicit approval.
- Do not force all `projects` to be investments.
- Do not change general NexArWO branding.
- Preserve existing Work Orders, Projects, Documents, Supabase data access, and construction workflows.

## Naming Decision

Use `project_*` table names for future SQL because FlipEngine extends selected NexArWO `projects`.

Proposed names:

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

## Schema Audit Dependencies

Source audit:

- `docs/flipengine/08_EXISTING_SCHEMA_AUDIT.md`

The future SQL draft depends on these schema findings:

- `projects.id` is confirmed as `TEXT`, not UUID. Every future `project_id` relationship must use the same type.
- Existing `projects` already stores acquisition, loan summary, closing cost summary, property, and sale summary fields. Future `project_acquisitions` and `project_sale_exit` must define source-of-truth boundaries before implementation.
- `project_expenses`, `project_refunds`, and `project_disbursements` are historical financial tables with delete-blocking and historical-update-blocking triggers. Future receipt/payment logic must not mutate those tables automatically.
- `project_financial_summaries` is an existing financial view. It must not be changed by the first FlipEngine migration.
- Phase 2F preflight against the current target showed `work_orders.id` is `UUID`, not `TEXT`. Optional `work_order_id` columns in the Phase 2C migration must use `UUID`.
- Phase 2F preflight against the current target showed `documents.id` is `UUID`, not `SERIAL/INTEGER`. Optional `document_id` columns in the Phase 2C migration must use `UUID`.
- `project_expenses.created_by` references `auth.users(id)`, but broader `user_roles` and granular Auth/RLS are still draft-only in the repo. New FlipEngine tables must not depend on `user_roles` unless Auth/RLS activation is separately approved.
- Investor Hub tables exist, but their funding/capital records must remain separate from operating expenses and project financial formulas.
- `js/supabase.js` references richer Investor Hub columns than the visible migrations clearly create. Do not connect first-phase FlipEngine SQL to Investor Hub until that drift is resolved or explicitly accepted.
- Historical draft file `sql/PHASE_2B_SCHEMA.sql` uses `project_id UUID`; do not reuse that assumption for FlipEngine because `projects.id` is confirmed as `TEXT`.

Owner decisions applied after audit:

- `project_acquisitions` is one-to-one with `projects`; the Phase 2B SQL draft must enforce `UNIQUE(project_id)`.
- New MVP table primary keys stay `BIGSERIAL`.
- All new project relationships keep `project_id TEXT`.
- Receipts are supporting evidence/documents only. They must not automatically create expenses.
- `project_receipts.project_expense_id` is a nullable manual link to an accounting/operating expense record.
- All four MVP tables include nullable `created_by UUID REFERENCES auth.users(id)` and `updated_by UUID REFERENCES auth.users(id)`.
- RLS/Auth policies are deferred to a later approved phase and must not be included in this draft.

Decisions still depending on later approval:

- Whether existing `projects.purchase_price`, `projects.loan_amount`, `projects.closing_costs`, and related fields remain the summary source of truth.
- Whether budget actuals are stored, derived from approved expenses/receipts, or both.
- What manual workflow links a receipt to `project_expenses`, and under what approval state.
- Which app code path will populate `created_by` and `updated_by`.
- Whether first migration should include foreign keys immediately or stage them after live constraint verification.

## General Table Rules For Future SQL

Future migration draft should use these principles:

- Prefer create-if-missing behavior for new tables.
- Prefer additive fields only.
- Include `project_id` on all project-scoped tables.
- Match the actual type of `projects.id` from the current production schema.
- Include `status` or lifecycle fields where history matters.
- Include `created_at` and `updated_at` where records are editable.
- Include nullable `created_by` and `updated_by` only where owner-approved; these may reference `auth.users(id)` without adding RLS policies in this phase.
- Avoid hard delete assumptions.
- Add indexes only after relationships are confirmed.
- Add foreign keys only after type and delete behavior are reviewed.
- Do not enable or change RLS/Auth without separate approval.

## MVP Table Set Recommendation

Recommended first SQL draft should include only:

1. `project_acquisitions`
2. `project_budget_categories`
3. `project_receipts`
4. `project_document_links`

Reason:

These support the first safe Property Hub workflow without touching Investor Hub, final ROI/P&L formulas, sale exit calculations, payment automation, or accounting reports.

The other tables should remain planned for future phases unless the owner approves expanding the first migration.

## Phase 2B MVP SQL Draft Artifact

Draft file:

- `docs/flipengine/09_PHASE2B_MVP_SQL_DRAFT.sql`

Status:

- Reviewable draft only.
- Not placed under `supabase/migrations/`.
- Not applied.
- No SQL executed.
- No existing tables altered.
- No RLS policies, triggers, seed/demo data, UI changes, code changes, Investor Hub changes, or financial formula changes included.

Included tables:

1. `project_acquisitions`
2. `project_budget_categories`
3. `project_receipts`
4. `project_document_links`

Draft decisions:

- New table IDs use `BIGSERIAL`.
- All new `project_id` columns use `TEXT`.
- Required project relationships use `REFERENCES projects(id) ON DELETE RESTRICT`.
- `project_acquisitions` is one-to-one with `projects` and enforces `UNIQUE(project_id)`.
- Optional links to existing operational/financial/document tables are nullable.
- Optional `work_order_id` uses `UUID REFERENCES work_orders(id) ON DELETE SET NULL`.
- Optional `project_expense_id` uses `INTEGER REFERENCES project_expenses(id) ON DELETE SET NULL`.
- Optional `document_id` uses `UUID REFERENCES documents(id) ON DELETE SET NULL`.
- `project_receipts.budget_category_id` references `project_budget_categories(id)`.
- `project_document_links.related_record_id` is `TEXT` because related modules may use mixed ID types.
- All four MVP tables include nullable `created_by UUID REFERENCES auth.users(id)` and `updated_by UUID REFERENCES auth.users(id)`.
- `project_acquisitions` intentionally does not synchronize with existing `projects` acquisition/loan/closing fields.
- `project_receipts` intentionally does not create or mutate `project_expenses`; `project_expense_id` is a manual optional link only.
- `project_budget_categories.actual_spent`, `remaining_budget`, and `variance_amount` are manual or future-calculation-ready fields; no triggers are included.

Owner decisions already reflected in the Phase 2B draft:

- `project_acquisitions` is one-to-one with `projects`.
- `BIGSERIAL` remains the MVP primary key type for new tables.
- `project_id` remains `TEXT`.
- Receipts remain supporting evidence and do not automatically create expenses.
- Nullable `created_by` and `updated_by` audit fields are included.
- RLS/Auth policies remain out of scope for this draft.

Review still required before applying the migration:

- Final owner approval to apply `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`.
- Confirm source-of-truth boundaries between existing `projects` financial fields and the new extension tables.
- Confirm how future app code will populate `created_by` and `updated_by`.
- Confirm the manual receipt-to-expense linking workflow.
- Confirm future RLS/Auth policy requirements in a separate phase.

## Phase 2C Migration File Created

Migration file:

- `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql`

Status:

- Created from `docs/flipengine/09_PHASE2B_MVP_SQL_DRAFT.sql`.
- Not applied.
- No SQL executed.
- No existing migration files modified.
- No existing tables altered.
- No app code or UI changed.
- No Investor Hub activation.
- No RLS policies, triggers, seed/demo data, or financial formula changes included.

Tables included:

1. `project_acquisitions`
2. `project_budget_categories`
3. `project_receipts`
4. `project_document_links`

Key owner-approved decisions preserved:

- All new `project_id` columns use `TEXT`.
- New primary keys use `BIGSERIAL`.
- `project_acquisitions` enforces one-to-one behavior with `UNIQUE(project_id)`.
- All four tables include nullable `created_by UUID REFERENCES auth.users(id)` and `updated_by UUID REFERENCES auth.users(id)`.
- `project_receipts` does not create or mutate `project_expenses`; `project_expense_id` remains a nullable manual link.

## Phase 2G Schema Compatibility Fix

Trigger:

- Phase 2F read-only preflight returned `STOP_TYPE_MISMATCH` for `work_orders.id` and `documents.id`.

Confirmed preflight findings:

- `projects.id = text`: PASS
- `project_expenses.id = integer`: PASS
- `auth.users.id = uuid`: PASS
- `work_orders.id = uuid`: adjust migration from `TEXT` to `UUID`
- `documents.id = uuid`: adjust migration from `INTEGER` to `UUID`

Migration compatibility changes:

- `project_receipts.work_order_id` now uses `UUID REFERENCES work_orders(id) ON DELETE SET NULL`.
- `project_document_links.document_id` now uses `UUID REFERENCES documents(id) ON DELETE SET NULL`.

Preserved decisions:

- `project_id` remains `TEXT REFERENCES projects(id)`.
- `project_receipts.project_expense_id` remains `INTEGER REFERENCES project_expenses(id)`.
- `project_receipts.budget_category_id` remains `BIGINT REFERENCES project_budget_categories(id)`.
- `created_by` and `updated_by` remain nullable `UUID REFERENCES auth.users(id)`.
- No SQL was applied and no migration was run.

---

## 1. `project_acquisitions`

### Proposito

Store acquisition facts for a selected FlipEngine project/property: purchase details, buyer/seller, escrow, lender reference, initial funding facts, and closing context.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one selected project can have at most one acquisition record; enforce with `UNIQUE(project_id)`.

### Campos principales

- `id`
- `project_id`
- `purchase_price`
- `earnest_money`
- `closing_date`
- `buyer_entity`
- `seller_name`
- `escrow_company`
- `escrow_number`
- `lender_name`
- `loan_number`
- `loan_amount`
- `buyer_funds_to_close`
- `construction_holdback`
- `assignment_fee`
- `homeowner_insurance`
- `owner_title_insurance`
- `escrow_fee`
- `recording_fees`
- `total_closing_costs`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_loans`: future link may replace duplicated lender/loan summary fields.
- `project_closing_costs`: future closing cost breakdown can relate to acquisition.
- `project_document_links`: acquisition documents can be linked by `related_module`.
- `documents`: only through document links, not by mutating existing document records.
- `users`: nullable `created_by`/`updated_by` references to `auth.users(id)`.
- Investor tables: no direct relationship in MVP.

### MVP o fase futura

MVP.

### Riesgos de integracion

- Acquisition loan fields may duplicate future `project_loans` data.
- Buyer funds to close and loan amount must not be counted as operating expenses.
- Closing costs must not be double-counted when `project_closing_costs` is added.

### Validaciones necesarias

- Money fields must be numeric and non-negative unless owner approves exceptions.
- `closing_date` must accept empty/null for pending acquisitions.
- `project_id` must reference an existing project.
- `project_id` must be unique so one project has at most one acquisition extension record.

---

## 2. `project_budget_categories`

### Proposito

Store renovation budget categories for a selected FlipEngine project so estimated budget, actual spend, remaining budget, and variance can be tracked safely.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many budget category records.

### Campos principales

- `id`
- `project_id`
- `category_name`
- `category_type`
- `estimated_budget`
- `actual_spent`
- `remaining_budget`
- `variance_amount`
- `sort_order`
- `status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `work_orders`: future optional link from Work Orders to category, only after compatibility review.
- `project_expenses`: future optional link from expenses to category, only after approval.
- `project_receipts`: receipts can link to budget category.
- `documents`: no direct relationship; use `project_document_links` if documents are needed.
- `users`: nullable `created_by`/`updated_by` references to `auth.users(id)`.
- Investor tables: no direct relationship.

### MVP o fase futura

MVP.

### Riesgos de integracion

- `actual_spent` could conflict with existing project expense calculations.
- Manual actual spend can become stale if expenses/receipts are the source of truth.
- Required category links could break existing Work Orders or expenses.

### Validaciones necesarias

- `category_name` required.
- `estimated_budget` should be numeric and non-negative.
- `actual_spent`, `remaining_budget`, and `variance_amount` must follow an owner-approved rule: derived, manually stored, or hybrid.
- Category status should support active/inactive/archived without deleting history.

---

## 3. `project_closing_costs`

### Proposito

Store closing costs separately from renovation expenses and normal operating spend.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many closing cost records.

### Campos principales

- `id`
- `project_id`
- `acquisition_id`
- `loan_id`
- `name`
- `category`
- `amount`
- `paid_by`
- `paid_date`
- `payment_status`
- `related_document_id`
- `notes`
- `status`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_acquisitions`: optional `acquisition_id`.
- `project_loans`: optional `loan_id` if a lender/loan paid or charged the cost.
- `project_payments`: future optional relationship when payment tracking is implemented.
- `project_document_links` and `documents`: documents should be linked without mutating existing documents.
- `project_expenses`: no automatic relationship unless owner approves accounting behavior.
- Investor tables: no direct relationship unless private lender cost rules are approved.

### MVP o fase futura

Future phase. Candidate for Fase 8 unless owner moves it into MVP.

### Riesgos de integracion

- Closing costs could be incorrectly counted as renovation expenses.
- Costs could be duplicated between acquisition summary and closing cost detail.
- Paid-by values can be ambiguous without approved accounting definitions.

### Validaciones necesarias

- `amount` numeric and non-negative.
- `category` should use a controlled list after owner review.
- `paid_by` should be constrained or normalized later.
- Any impact on profit formulas must wait for approved formula spec.

---

## 4. `project_loans`

### Proposito

Store loan/lender records for a selected FlipEngine project, including loan amount, fees, construction holdback, and status.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have zero, one, or many loan records.

### Campos principales

- `id`
- `project_id`
- `lender_name`
- `loan_number`
- `loan_amount`
- `origination_fee`
- `processing_fee`
- `construction_holdback`
- `interest_rate`
- `loan_start_date`
- `loan_maturity_date`
- `loan_status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_acquisitions`: acquisition can reference or summarize a loan.
- `project_loan_draws`: child draw records.
- `project_closing_costs`: loan-related costs.
- `project_payments`: future loan payment records.
- `project_document_links` and `documents`: loan docs, deed of trust, lender docs.
- Investor tables: only if a private lender is modeled through existing investor tables, and only after approval.
- `users`: optional audit fields after verification.

### MVP o fase futura

Future phase. Candidate for Fase 8.

### Riesgos de integracion

- Loan amount may be mistaken for invested capital or operating income.
- Private lender data could overlap with Investor Hub.
- Fees may be counted twice if also tracked as closing costs.

### Validaciones necesarias

- Money fields numeric and non-negative.
- Loan status should distinguish draft, active, paid_off, cancelled, and closed.
- Private lender linkage must be explicitly approved before touching investor tables.

---

## 5. `project_loan_draws`

### Proposito

Store construction draw requests and funded draw events against project loans.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many draw records.
- Each draw should optionally or requiredly link to one `project_loans.id` after loan model is approved.

### Campos principales

- `id`
- `project_id`
- `loan_id`
- `draw_number`
- `requested_amount`
- `approved_amount`
- `funded_amount`
- `draw_status`
- `requested_date`
- `approved_date`
- `funded_date`
- `related_document_id`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_loans`: parent loan.
- `project_receipts`: possible support docs, no automatic relationship unless approved.
- `project_document_links` and `documents`: draw packages and approvals.
- `project_payments`: future relation only if draw funding affects payment workflow.
- Investor tables: no direct relationship unless approved private lender flow exists.

### MVP o fase futura

Future phase. Candidate for Fase 8.

### Riesgos de integracion

- Requested, approved, and funded amounts can be confused.
- Draw funding could be incorrectly counted as revenue or expense.
- Missing document links could make draw review incomplete.

### Validaciones necesarias

- Amount fields numeric and non-negative.
- `approved_amount` should not exceed `requested_amount` unless owner approves exception.
- `funded_amount` should not exceed `approved_amount` unless owner approves exception.
- Status transitions should be documented before automation.

---

## 6. `project_receipts`

### Proposito

Track receipt metadata, review status, reimbursement status, and optional relationships to Work Orders, budget categories, expenses, and documents.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many receipt records.

### Campos principales

- `id`
- `project_id`
- `work_order_id`
- `budget_category_id`
- `project_expense_id`
- `receipt_date`
- `vendor_name`
- `amount`
- `payment_method`
- `po_job_name`
- `receipt_file_url`
- `receipt_image_url`
- `review_status`
- `reimbursement_status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `work_orders`: optional link.
- `project_budget_categories`: optional link.
- `project_expenses`: nullable manual link only; receipts must not create expenses automatically.
- `project_document_links` and `documents`: proof file/document association.
- `project_payments`: future optional payment relation.
- `users`: nullable `created_by`/`updated_by` references to `auth.users(id)`.
- Investor tables: no direct relationship.

### MVP o fase futura

MVP.

### Riesgos de integracion

- Receipts could be double-counted with expenses if future UI treats receipt amount as spend; this draft avoids automatic conversion.
- Pending receipts could be treated as final spend.
- File URL storage could conflict with existing document upload/storage patterns.

### Validaciones necesarias

- `amount` numeric and non-negative.
- `review_status` should distinguish `needs_review`, `approved`, and `rejected`.
- `reimbursement_status` should distinguish `not_reimbursable`, `pending`, and `reimbursed`.
- Receipts must not alter financial summaries until approved.

---

## 7. `project_document_links`

### Proposito

Attach existing or future documents to FlipEngine entities without changing the existing Documents module destructively.

### Relacion con `projects.id`

- `project_id` should be included for project-scoped filtering.
- A link must also identify the related entity by type and ID.

### Campos principales

- `id`
- `project_id`
- `document_id`
- `related_module`
- `related_record_id`
- `document_type`
- `review_status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: project scope.
- `documents`: nullable existing document reference.
- `project_acquisitions`: acquisition documents.
- `project_loans`: loan documents.
- `project_loan_draws`: draw documents.
- `project_closing_costs`: closing statements or proof.
- `work_orders`: Work Order documents.
- `project_expenses`: expense backup.
- `project_receipts`: receipt files.
- `users`: nullable `created_by`/`updated_by` references to `auth.users(id)`.
- Investor tables: investor/private lender documents only after approved flow.

### MVP o fase futura

MVP.

### Riesgos de integracion

- Generic `related_module` can become inconsistent without a controlled list.
- Removing links could accidentally be confused with deleting documents.
- Existing document UI may assume a simpler relationship.

### Validaciones necesarias

- `document_id` must refer to an existing document when provided.
- `related_module` must be from an approved list.
- `related_record_id` must be present for entity links.
- Deleting a link must not delete the underlying document.

---

## 8. `project_contractors`

### Proposito

Track contractors/vendors connected to selected FlipEngine projects and optionally Work Orders.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many contractor records.

### Campos principales

- `id`
- `project_id`
- `work_order_id`
- `contractor_name`
- `company`
- `phone`
- `email`
- `specialty`
- `license_number`
- `insurance_info`
- `role`
- `status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `work_orders`: optional assignment.
- `project_payments`: future payments to contractor.
- `project_document_links` and `documents`: license, insurance, W-9, contract documents.
- `users`: no direct relation unless contractors become app users later.
- Investor tables: no direct relationship.

### MVP o fase futura

Future phase. Candidate for Fase 9.

### Riesgos de integracion

- Contractor records could duplicate clients, vendors, or recipients if those exist elsewhere.
- Work Orders could accidentally require contractor fields.
- License/insurance docs could expose private data without permissions review.

### Validaciones necesarias

- `contractor_name` or `company` required.
- Email format should be validated where entered.
- Status should support active, inactive, archived, and blocked if needed.
- Work Order link must remain optional.

---

## 9. `project_employees`

### Proposito

Track employees/labor resources connected to selected FlipEngine projects.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many employee/labor records.

### Campos principales

- `id`
- `project_id`
- `employee_name`
- `phone`
- `email`
- `hourly_rate`
- `role`
- `status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_time_entries`: time entry child records.
- `project_payments`: future employee payments.
- `project_document_links` and `documents`: employee docs only after permission review.
- `users`: optional relationship only if employee records map to app users.
- Investor tables: no direct relationship.

### MVP o fase futura

Future phase. Candidate for Fase 9.

### Riesgos de integracion

- Employee records may contain sensitive data.
- Hourly rate may affect labor cost formulas before approval.
- Employees may already exist in another user/auth model.

### Validaciones necesarias

- `employee_name` required.
- `hourly_rate` numeric and non-negative when provided.
- Employee status should preserve history instead of hard deleting.
- Any relation to Auth users must be reviewed separately.

---

## 10. `project_time_entries`

### Proposito

Track labor time entries against selected projects, optional Work Orders, and project employees.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many time entries.

### Campos principales

- `id`
- `project_id`
- `work_order_id`
- `employee_id`
- `work_date`
- `check_in_at`
- `check_out_at`
- `hours`
- `hourly_rate`
- `labor_cost`
- `status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `work_orders`: optional link.
- `project_employees`: optional or required employee relation after owner decision.
- `project_payments`: future payment relation.
- `project_budget_categories`: possible future link only if approved.
- `users`: optional submitter/approver audit fields after verification.
- Investor tables: no direct relationship.

### MVP o fase futura

Future phase. Candidate for Fase 9.

### Riesgos de integracion

- Labor cost could be counted as expense before accounting rules are approved.
- Manual hours and check-in/check-out timestamps could conflict.
- Payroll-like behavior could create compliance expectations.

### Validaciones necesarias

- `hours` numeric and non-negative.
- If `check_in_at` and `check_out_at` are used, checkout must be after check-in.
- `labor_cost` should be derived or validated against `hours * hourly_rate` according to approved rule.
- Status should support draft, submitted, approved, rejected, and paid if needed.

---

## 11. `project_payments`

### Proposito

Track payments related to selected FlipEngine projects, including contractors, employees, expenses, receipts, closing costs, loans, or other payees.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one project can have many payment records.

### Campos principales

- `id`
- `project_id`
- `payment_date`
- `amount`
- `payment_method`
- `paid_to_type`
- `paid_to_id`
- `paid_to_name`
- `related_expense_id`
- `related_receipt_id`
- `related_invoice_id`
- `related_contractor_id`
- `related_employee_id`
- `related_closing_cost_id`
- `related_loan_id`
- `payment_status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_expenses`: optional relation, no automatic mutation unless approved.
- `project_receipts`: optional relation.
- `project_contractors`: optional payee relation.
- `project_employees`: optional payee relation.
- `project_closing_costs`: optional relation.
- `project_loans`: optional relation.
- `project_document_links` and `documents`: proof of payment.
- Investor tables: no funding/capital relationship unless separately approved.
- `users`: optional creator/approver fields after verification.

### MVP o fase futura

Future phase. Candidate for Fase 10.

### Riesgos de integracion

- Payments can be double-counted with expenses or disbursements.
- Payment status can be confused with expense approval status.
- Payee polymorphism can become inconsistent without strict validation.

### Validaciones necesarias

- `amount` numeric and non-negative.
- `paid_to_type` must come from an approved list.
- At least one payee identifier or `paid_to_name` should be present.
- Payment should not alter financial summaries without approved accounting rules.

---

## 12. `project_sale_exit`

### Proposito

Store sale/exit data for selected FlipEngine projects, including listing, sale, selling costs, net proceeds, final profit, and final ROI.

### Relacion con `projects.id`

- Required `project_id`.
- Expected relationship: one selected project can have one current sale/exit record unless owner approves multiple sale attempts or versions.

### Campos principales

- `id`
- `project_id`
- `listing_price`
- `sale_price`
- `sale_date`
- `realtor_name`
- `selling_costs`
- `net_proceeds`
- `final_profit`
- `final_roi`
- `related_document_id`
- `status`
- `notes`
- `created_at`
- `updated_at`

### Relaciones aplicables

- `projects`: required parent.
- `project_document_links` and `documents`: listing agreement, settlement statement, final sale docs.
- `project_payments`: future selling cost payments only after accounting rules are approved.
- `project_closing_costs`: possible relationship for seller-side closing costs after owner decision.
- Investor tables: possible final distribution/reporting relationship only after Investor Hub approval.
- `users`: optional audit fields after verification.

### MVP o fase futura

Future phase. Candidate after payment/accounting rules are stable.

### Riesgos de integracion

- Final profit and ROI could conflict with existing project financial formulas.
- Selling costs could be counted twice.
- Investor distribution expectations could trigger Investor Hub scope.

### Validaciones necesarias

- Money fields numeric and non-negative unless owner approves exceptions.
- `sale_date` can be null until sold.
- Final profit and ROI should be derived from approved formulas, not guessed.
- Status should distinguish planned, listed, under_contract, sold, cancelled, and archived.

---

## Phase 2 SQL Draft Approval Checklist

Before Codex creates a migration file, the owner must approve:

- First migration table subset.
- Exact table names.
- Exact column names and data types.
- `projects.id` type and foreign key behavior. Current audit confirms `projects.id` is `TEXT`.
- Whether foreign keys should cascade, restrict, or set null.
- RLS/Auth policy design in a later approved phase.
- Nullable audit fields `created_by` and `updated_by` are included in the draft; future app population still needs approval.
- Whether any existing tables get additive columns.
- Manual QA steps.
- Rollback strategy.

## Recommended Phase 2 Scope

Recommended first migration draft:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`

Do not include loans, draws, payments, sale exit, contractors, employees, time entries, Investor Hub relationships, financial formula changes, or dashboard metrics in the first migration unless the owner explicitly expands scope.

## Stop Conditions

Stop before creating or applying SQL if:

- Current schema type for `projects.id` is unclear.
- Existing migration history conflicts with proposed names.
- A required relation would need destructive change.
- RLS/Auth behavior is required but not approved.
- Existing financial formulas would need modification.
- Investor Hub behavior would need activation or redesign.
- The owner has not approved the migration scope.

## Manual Review Questions

Before implementation, answer:

1. Which selected project flag or workflow determines that a project participates in FlipEngine?
2. Confirmed: `project_acquisitions` is one-to-one with `projects`; final migration must preserve `UNIQUE(project_id)`.
3. Are budget actuals stored, derived from expenses/receipts, or both?
4. What manual workflow links a receipt to an expense, if owner approves linking later?
5. Should documents be linked through one generic `project_document_links` table or specialized link fields?
6. Are contractors and employees project-scoped now, or should global profiles be planned later?
7. Are payments separate from expenses and disbursements, or do they update those records after approval?
8. Which formula source owns profit, ROI, and final sale metrics?

## Next Recommended Action

Owner should manually review `supabase/migrations/20260705000100_flipengine_mvp_extensions.sql` before any database apply step.

Only after explicit owner approval should Codex or the owner apply this migration in the approved environment.
