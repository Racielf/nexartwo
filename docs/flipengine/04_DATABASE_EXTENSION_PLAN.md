# FlipEngine Database Extension Plan

Source context: `FLIPENGINE_CONTEXT.md`

## Status

Planning only.

Do not execute SQL from this document.
Do not run `db push`.
Do not modify existing production migrations without owner approval.

## Context Guardrails

- NexArWO is the primary existing app. FlipEngine is a module/layer inside it.
- NexArtEngine belongs to another project and must not appear in table names, schemas, modules, or branding here.
- Existing `projects` remain normal NexArWO projects unless intentionally used in a FlipEngine property/investment workflow.
- New database structures must extend the current schema non-destructively.
- Do not change existing migrations, RLS, Auth behavior, or Investor Hub activation state without explicit approval.

## Database Strategy

Use a non-destructive extension strategy:

1. Keep existing tables.
2. Keep existing IDs and relationships.
3. Add new tables linked to `projects.id` for selected FlipEngine property/investment projects.
4. Add nullable or defaulted columns only when needed.
5. Preserve historical financial data.
6. Use status fields instead of hard delete.

## Existing Tables To Preserve

Existing tables already relevant to FlipEngine:

- `projects`
- `work_orders`
- `wo_line_items`
- `documents`
- `project_expenses`
- `project_refunds`
- `project_disbursements`
- `investors`
- `investor_companies`
- `project_investors`
- `capital_contributions`
- `capital_calls`

## Core Relationship

Most new tables should include:

```text
project_id -> projects.id
```

Current migration history uses `TEXT` project IDs in several areas. Future SQL must match the actual production schema before being applied.

## Proposed New Tables

### 1. `property_acquisitions`

Purpose:

Stores purchase and acquisition facts for one property/project.

Recommended fields:

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
- `insurance_amount`
- `title_fees`
- `recording_fees`
- `notes`
- `status`
- `created_at`
- `updated_at`

Relationship:

- One project can have one primary acquisition record.

### 2. `property_budget_categories`

Purpose:

Stores renovation budget categories for a property.

Recommended fields:

- `id`
- `project_id`
- `name`
- `estimated_budget`
- `actual_spent`
- `remaining_amount`
- `variance_amount`
- `status`
- `notes`
- `created_at`
- `updated_at`

Relationship:

- One project can have many budget categories.
- Work Orders, expenses, and receipts can optionally link to a budget category.

### 3. `property_closing_costs`

Purpose:

Stores closing costs separately from renovation expenses.

Recommended fields:

- `id`
- `project_id`
- `acquisition_id`
- `name`
- `category`
- `amount`
- `paid_by`
- `related_lender_id`
- `related_document_id`
- `notes`
- `status`
- `created_at`
- `updated_at`

### 4. `property_loans`

Purpose:

Stores lender loan records for a property.

Recommended fields:

- `id`
- `project_id`
- `lender_name`
- `loan_number`
- `loan_amount`
- `origination_fee`
- `processing_fee`
- `construction_holdback`
- `status`
- `notes`
- `created_at`
- `updated_at`

### 5. `property_draw_requests`

Purpose:

Stores construction draw requests against a loan.

Recommended fields:

- `id`
- `project_id`
- `loan_id`
- `requested_amount`
- `approved_amount`
- `draw_status`
- `requested_date`
- `approved_date`
- `funded_date`
- `related_document_id`
- `notes`
- `created_at`
- `updated_at`

### 6. `property_receipts`

Purpose:

Stores receipt review and reimbursement tracking.

Recommended fields:

- `id`
- `project_id`
- `work_order_id`
- `budget_category_id`
- `expense_id`
- `receipt_date`
- `vendor`
- `amount`
- `payment_method`
- `receipt_file_url`
- `review_status`
- `reimbursement_status`
- `notes`
- `created_at`
- `updated_at`

### 7. `document_links`

Purpose:

Allows documents to be attached to multiple business entities.

Recommended fields:

- `id`
- `document_id`
- `project_id`
- `linked_type`
- `linked_id`
- `document_type`
- `notes`
- `created_at`

Example `linked_type` values:

- `project`
- `acquisition`
- `loan`
- `draw`
- `closing_cost`
- `work_order`
- `expense`
- `receipt`
- `investor`
- `contractor`
- `employee`

### 8. `contractors`

Purpose:

Stores contractor/vendor profiles.

Recommended fields:

- `id`
- `name`
- `company`
- `phone`
- `email`
- `specialty`
- `license_number`
- `insurance_info`
- `notes`
- `status`
- `created_at`
- `updated_at`

### 9. `project_contractors`

Purpose:

Links contractors to properties and optionally Work Orders.

Recommended fields:

- `id`
- `project_id`
- `contractor_id`
- `work_order_id`
- `role`
- `status`
- `notes`
- `created_at`
- `updated_at`

### 10. `employees`

Purpose:

Stores employee/labor profile records.

Recommended fields:

- `id`
- `name`
- `phone`
- `email`
- `hourly_rate`
- `status`
- `notes`
- `created_at`
- `updated_at`

### 11. `labor_time_entries`

Purpose:

Stores labor time entries against projects and Work Orders.

Recommended fields:

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

### 12. `property_payments`

Purpose:

Tracks payments to vendors, contractors, employees, lenders, or other parties.

Recommended fields:

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
- `status`
- `notes`
- `created_at`
- `updated_at`

### 13. `property_sale_exits`

Purpose:

Stores sale and final exit performance data.

Recommended fields:

- `id`
- `project_id`
- `listing_price`
- `sale_price`
- `sale_date`
- `realtor_name`
- `listing_agent_commission_percent`
- `buyer_agent_commission_percent`
- `total_realtor_commission_percent`
- `calculated_realtor_commission_amount`
- `selling_costs`
- `net_proceeds`
- `final_profit`
- `final_roi`
- `related_document_id`
- `notes`
- `status`
- `created_at`
- `updated_at`

Commission calculation requirement:

- Realtor commission inputs should be percentage-based and editable per deal.
- The future Sale / Exit module should calculate `calculated_realtor_commission_amount` from `sale_price` and `total_realtor_commission_percent`.
- Required formula:

```text
calculated_realtor_commission_amount = sale_price * total_realtor_commission_percent / 100
```

- `listing_agent_commission_percent` and `buyer_agent_commission_percent` can support separate agent splits.
- `total_realtor_commission_percent` should represent the total percentage used for the calculated dollar amount.
- Actual closing statement amounts may be reconciled later, but fixed manual dollar entry should not be the only primary input.

## Existing Table Extension Candidates

Future non-destructive columns may be needed:

### `work_orders`

Possible optional columns:

- `budget_category_id`
- `contractor_id`
- `recipient_type`
- `recipient_id`
- `recipient_name`

Do not add until Work Order compatibility is reviewed.

### `project_expenses`

Possible optional columns:

- `budget_category_id`
- `receipt_id`
- `payment_id`

Do not add until receipt and payment flows are designed.

### `documents`

Possible optional columns:

- `document_type`
- `review_status`

Alternative preferred approach:

- Keep `documents` stable.
- Add `document_links` for flexible associations.

## Data Integrity Rules

- Use `status` fields instead of hard delete.
- Use `cancelled`, `void`, `inactive`, or equivalent lifecycle states where history matters.
- Do not mix investor capital contributions into operating expenses.
- Do not count pending receipts or payments as final spend until reviewed/approved.
- Do not overwrite existing project financial formulas without a separate approved financial formula spec.

## Migration Safety Rules

Future SQL should be:

- Non-destructive
- Idempotent where possible
- `CREATE TABLE IF NOT EXISTS`
- `ADD COLUMN IF NOT EXISTS`
- No dropping tables
- No deleting rows
- No automatic backfills without owner approval
- No Auth/RLS activation unless separately approved

## Proposed SQL Review Template

Every future migration proposal should include:

```md
Purpose:
Tables affected:
Read/write behavior:
Existing data impact:
Rollback plan:
Manual QA:
SQL:
```

## First Migration Candidate

The first database implementation phase should likely add only the minimum tables required for:

1. `property_acquisitions`
2. `property_budget_categories`
3. `property_receipts`
4. `document_links`

Reason:

These support the demo property and the first Property Hub workflow without touching investor formulas, sale formulas, or payment automation.
