# FlipEngine Existing Schema Audit

Phase: 2A - Existing Schema Audit

Status: Planning only. No SQL executed. No migrations created. No code, UI, tables, RLS, or Investor Hub behavior changed.

## Purpose

Review the existing NexArWO schema artifacts before drafting any new FlipEngine SQL, so future changes extend the app safely and do not break existing Projects, Work Orders, Documents, financial formulas, Auth/RLS, or Investor Hub data.

## Sources Reviewed

Primary migration sources:

- `supabase/migrations/20260506_projects_financial_system.sql`
- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/202605070002_project_expenses_created_by.sql`
- `supabase/migrations/202605070003_work_orders_project_id.sql`
- `supabase/migrations/202605070004_investor_realtime_publication.sql`
- `supabase/migrations/202605070005_project_investor_private_lender_role.sql`
- `supabase/migrations/202605170001_repair_capital_calls.sql`
- `supabase/migrations/20260606_phase2a2_schema_alignment.sql`

Secondary reference sources:

- `sql/schema.sql`
- `sql/phase2_migration.sql`
- `supabase/drafts/auth-rls/004a_user_roles_bootstrap.sql`
- `supabase/drafts/auth-rls/DESIGN.md`
- `js/supabase.js`

Important source boundary:

- `supabase/migrations/` is the primary source for applied migration intent.
- `sql/schema.sql` and `sql/phase2_migration.sql` define base Work Order and Document structures that are not fully recreated inside the visible Supabase migrations.
- `supabase/drafts/auth-rls/` contains draft-only Auth/RLS plans and must not be treated as applied production schema unless separately confirmed.
- `js/supabase.js` confirms what the app currently reads/writes, but it is not schema authority by itself.

## Executive Findings

- `projects.id` is `TEXT`, not UUID.
- New FlipEngine tables that reference projects must use `project_id TEXT` if they add foreign keys to `projects(id)`.
- `projects` already contains financial acquisition, sale, parties, and property fields.
- `project_financial_summaries` is a view that derives cost basis, cash invested, expenses, refunds, disbursements, net proceeds, profit, and project cash position.
- `project_expenses`, `project_refunds`, and `project_disbursements` are protected by no-delete triggers and no-historical-update triggers.
- `project_expenses.created_by` exists in a later migration and references `auth.users(id)`.
- `work_orders.id` is `TEXT` from `sql/schema.sql`; migrations add `work_orders.project_id TEXT`.
- There are two migration definitions for `work_orders.project_id` delete behavior: an earlier financial migration uses `ON DELETE RESTRICT`, while a later dedicated migration uses `ON DELETE SET NULL`. Future SQL should not depend on project deletion behavior without checking the live constraint.
- `documents.id` is `SERIAL` from `sql/schema.sql` / `sql/phase2_migration.sql`; documents currently link directly to `work_orders.id`.
- Investor Hub tables exist in migration history: `investor_companies`, `investors`, `project_investors`, `capital_contributions`, and `capital_calls`.
- Investor/capital tables are funding views and must remain separate from operating expenses and project financial formulas.
- Draft Auth/RLS files describe future `user_roles`, `is_owner()`, and `auth_role()` but are explicitly draft-only.

## Existing Tables Relevant To FlipEngine

### `projects`

Confirmed in:

- `supabase/migrations/20260506_projects_financial_system.sql`

Primary key:

- `id TEXT PRIMARY KEY`
- Default pattern: `PROJ-YYYY-####` generated from `project_seq`

Main fields:

- `name TEXT NOT NULL`
- `address TEXT DEFAULT ''`
- `purchase_date DATE`
- `status TEXT DEFAULT 'planning'`
- `responsible TEXT DEFAULT ''`
- `purchase_price NUMERIC DEFAULT 0`
- `down_payment NUMERIC DEFAULT 0`
- `loan_amount NUMERIC DEFAULT 0`
- `realtor_fee NUMERIC DEFAULT 0`
- `title_company TEXT DEFAULT ''`
- `title_company_fee NUMERIC DEFAULT 0`
- `closing_costs NUMERIC DEFAULT 0`
- `inspection_fee NUMERIC DEFAULT 0`
- `insurance NUMERIC DEFAULT 0`
- `sale_price NUMERIC DEFAULT 0`
- `selling_agent_commission NUMERIC DEFAULT 0`
- `seller_closing_costs NUMERIC DEFAULT 0`
- `buying_agent TEXT DEFAULT ''`
- `buying_agent_company TEXT DEFAULT ''`
- `selling_agent TEXT DEFAULT ''`
- `lender_name TEXT DEFAULT ''`
- `lender_contact TEXT DEFAULT ''`
- `property_type TEXT DEFAULT 'residential'`
- `beds INTEGER DEFAULT 0`
- `baths NUMERIC DEFAULT 0`
- `sqft INTEGER DEFAULT 0`
- `year_built INTEGER DEFAULT 0`
- `notes TEXT DEFAULT ''`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ DEFAULT now()`

Existing relationships:

- Parent table for `project_expenses.project_id`
- Parent table for `project_refunds.project_id`
- Parent table for `project_disbursements.project_id`
- Parent table for Investor Hub `project_investors.project_id`, `capital_contributions.project_id`, and `capital_calls.project_id`
- Linked from `work_orders.project_id`

Integration risks:

- It already stores acquisition-like and sale-like fields. Future `project_acquisitions` and `project_sale_exit` must avoid duplicate truth.
- Existing project financial formulas read directly from `projects` acquisition and sale fields.
- Do not add required columns to `projects` for FlipEngine. Use extension tables.
- Do not force all projects to become investments.

### `project_expenses`

Confirmed in:

- `supabase/migrations/20260506_projects_financial_system.sql`
- `supabase/migrations/202605070002_project_expenses_created_by.sql`

Primary key:

- `id SERIAL PRIMARY KEY`

Main fields:

- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT`
- `vendor TEXT DEFAULT ''`
- `description TEXT DEFAULT ''`
- `amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0)`
- `tax NUMERIC DEFAULT 0 CHECK (tax >= 0)`
- `category TEXT DEFAULT 'materials'`
- `type TEXT DEFAULT 'expense'`
- `receipt_date DATE`
- `receipt_image_url TEXT DEFAULT ''`
- `receipt_items JSONB DEFAULT '[]'`
- `status TEXT DEFAULT 'pending'`
- `approved_by TEXT DEFAULT ''`
- `approved_at TIMESTAMPTZ`
- `rejection_reason TEXT DEFAULT ''`
- `notes TEXT DEFAULT ''`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()`

Existing relationships:

- Belongs to `projects`
- Optionally belongs to `work_orders`
- Referenced by `project_refunds.expense_id`
- Aggregated by `project_financial_summaries` when status is `approved`

Protection rules:

- Delete blocked by trigger.
- Historical updates blocked for `amount`, `tax`, `project_id`, `work_order_id`, `receipt_date`, and `vendor`.

Integration risks:

- New receipts must not automatically create or mutate `project_expenses` without owner approval.
- Pending receipts must not count as approved spend.
- Adding columns to this table is higher risk than creating extension tables.

### `project_refunds`

Confirmed in:

- `supabase/migrations/20260506_projects_financial_system.sql`

Primary key:

- `id SERIAL PRIMARY KEY`

Main fields:

- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT`
- `expense_id INTEGER REFERENCES project_expenses(id) ON DELETE RESTRICT`
- `vendor TEXT DEFAULT ''`
- `description TEXT DEFAULT ''`
- `amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0)`
- `receipt_date DATE`
- `receipt_image_url TEXT DEFAULT ''`
- `status TEXT DEFAULT 'pending'`
- `approved_by TEXT DEFAULT ''`
- `approved_at TIMESTAMPTZ`
- `notes TEXT DEFAULT ''`
- `created_at TIMESTAMPTZ DEFAULT now()`

Existing relationships:

- Belongs to `projects`
- Optionally belongs to `work_orders`
- Optionally references `project_expenses`
- Aggregated by `project_financial_summaries` when status is `approved`

Protection rules:

- Delete blocked by trigger.
- Historical updates blocked for `amount`, `project_id`, `work_order_id`, `expense_id`, `receipt_date`, and `vendor`.

Integration risks:

- Future refund/reimbursement logic must not bypass current trigger model.
- Do not use refunds as generic lender draw or investor funding records.

### `project_disbursements`

Confirmed in:

- `supabase/migrations/20260506_projects_financial_system.sql`

Primary key:

- `id SERIAL PRIMARY KEY`

Main fields:

- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT`
- `payment_type TEXT DEFAULT 'check'`
- `beneficiary TEXT DEFAULT ''`
- `description TEXT DEFAULT ''`
- `amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0)`
- `payment_date DATE`
- `reference_number TEXT DEFAULT ''`
- `receipt_image_url TEXT DEFAULT ''`
- `status TEXT DEFAULT 'pending'`
- `approved_by TEXT DEFAULT ''`
- `approved_at TIMESTAMPTZ`
- `notes TEXT DEFAULT ''`
- `created_at TIMESTAMPTZ DEFAULT now()`

Existing relationships:

- Belongs to `projects`
- Optionally belongs to `work_orders`
- Aggregated by `project_financial_summaries` when status is `approved` or `paid`

Protection rules:

- Delete blocked by trigger.
- Historical updates blocked for `amount`, `project_id`, `work_order_id`, `payment_date`, `beneficiary`, and `payment_type`.

Integration risks:

- Future `project_payments` must be carefully defined against this table to prevent double counting.
- Payment status must not be confused with disbursement status.
- Do not rewrite disbursement semantics without owner-approved accounting spec.

### `project_financial_summaries`

Confirmed in:

- `supabase/migrations/20260506_projects_financial_system.sql`

Type:

- View.

Main computed fields:

- `project_id`
- `name`
- `status`
- `purchase_price`
- `down_payment`
- `loan_amount`
- `cost_basis`
- `cash_invested`
- `total_expenses`
- `total_refunds`
- `total_disbursements`
- `net_expense_cost`
- `sale_price`
- `selling_agent_commission`
- `seller_closing_costs`
- `net_proceeds`
- `profit`
- `project_cash_position`

Formula sources:

- `projects`
- Approved `project_expenses`
- Approved `project_refunds`
- Approved or paid `project_disbursements`

Integration risks:

- Do not include investor capital, lender funding, draws, or capital calls in this view without a separate approved formula spec.
- Future dashboard metrics must identify whether they use this existing view or separate FlipEngine reports.
- Auth/RLS drafts plan to replace direct selects with RPC later, but this is not active from the current migrations alone.

### `work_orders`

Primary definition source:

- `sql/schema.sql`

Migration links:

- `supabase/migrations/20260506_projects_financial_system.sql`
- `supabase/migrations/202605070003_work_orders_project_id.sql`

Primary key:

- `id TEXT PRIMARY KEY`

Main fields from base schema:

- `title TEXT NOT NULL`
- `client_name TEXT DEFAULT ''`
- `client_id INT REFERENCES clients(id) ON DELETE SET NULL`
- `property TEXT DEFAULT ''`
- `type TEXT DEFAULT 'A'`
- `status TEXT DEFAULT 'draft'`
- `priority TEXT DEFAULT 'medium'`
- `created_date DATE DEFAULT CURRENT_DATE`
- `target_date DATE`
- `items INT DEFAULT 0`
- `total NUMERIC DEFAULT 0`
- `completed INT DEFAULT 0`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ DEFAULT now()`
- `project_id TEXT REFERENCES projects(id)` added by migrations

Delete behavior note:

- One migration adds `project_id` with `ON DELETE RESTRICT`.
- A later dedicated migration adds `project_id` with `ON DELETE SET NULL`.
- Because the column is `ADD COLUMN IF NOT EXISTS`, live constraint behavior may depend on which migration first created the column in the target environment.

Existing relationships:

- Optional link to `projects`
- Parent for `wo_line_items`
- Parent for `documents`
- Parent for `wo_communications`
- Parent for `change_orders`
- Parent for `wo_photos`
- Optional relation from project financial tables

Integration risks:

- Future FlipEngine modules may safely reference `work_orders.id` as optional `TEXT`, but must not make Work Orders require FlipEngine fields.
- Do not change existing Work Order delete behavior without confirming live constraint.
- Existing Work Orders must survive even when not connected to a FlipEngine project.

### `documents`

Primary definition sources:

- `sql/schema.sql`
- `sql/phase2_migration.sql`

Primary key:

- `id SERIAL PRIMARY KEY`

Main fields:

- `doc_number TEXT NOT NULL`
- `type TEXT DEFAULT 'completion'`
- `work_order_id TEXT REFERENCES work_orders(id) ON DELETE SET NULL`
- `client_name TEXT DEFAULT ''`
- `generated_at TIMESTAMPTZ DEFAULT now()`
- `status TEXT DEFAULT 'draft'`
- `style TEXT DEFAULT 'classic'`
- `hide_prices BOOLEAN DEFAULT false`
- `notes TEXT DEFAULT ''`
- `created_at TIMESTAMPTZ DEFAULT now()`

Existing relationships:

- Optional link to `work_orders`
- No current direct `project_id` in the base document table

Integration risks:

- Do not add many direct FK columns to `documents` unless approved.
- Safer path: create `project_document_links` as a linking table.
- Removing a link must not delete the underlying document.

### `wo_line_items`

Primary definition sources:

- `sql/schema.sql`
- `sql/phase2_migration.sql`

Main fields:

- `id SERIAL PRIMARY KEY`
- `work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE`
- `service_id INT REFERENCES services(id) ON DELETE SET NULL`
- `name TEXT NOT NULL`
- `name_es TEXT DEFAULT ''`
- `description TEXT DEFAULT ''`
- `category TEXT DEFAULT ''`
- `sub TEXT DEFAULT ''`
- `price NUMERIC DEFAULT 0`
- `qty NUMERIC DEFAULT 1`
- `unit TEXT DEFAULT 'each'`
- `negotiable TEXT DEFAULT 'yes'`
- `labor_hrs NUMERIC DEFAULT 1`
- `status TEXT DEFAULT 'pending'`
- `completed_at TIMESTAMPTZ`
- `completed_by TEXT DEFAULT ''`
- `notes TEXT DEFAULT ''`
- `sort_order INT DEFAULT 0`
- `created_at TIMESTAMPTZ DEFAULT now()`

Integration risks:

- Budget-category mapping could eventually relate to line items, but adding direct columns here should wait until Work Order compatibility is reviewed.

### `clients`, `services`, and `company_settings`

Primary definition source:

- `sql/schema.sql`

Relevance:

- `clients` links to `work_orders.client_id`.
- `services` links to `wo_line_items.service_id`.
- `company_settings` controls business identity/settings and must not be repurposed for FlipEngine branding changes.

Integration risks:

- FlipEngine should not change general NexArWO company settings or branding.
- Contractor/vendor modeling should not be forced into `clients` without a separate data decision.

## Investor Hub Tables

Important rule:

These tables are present in migration history but must not be activated, reworked, or mixed into operating formulas without owner approval.

### `investor_companies`

Confirmed in:

- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/20260606_phase2a2_schema_alignment.sql`

Main fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `company_name TEXT NOT NULL`
- `contact_person TEXT NOT NULL DEFAULT ''`
- `email TEXT NOT NULL DEFAULT ''`
- `phone TEXT NOT NULL DEFAULT ''`
- `license_number TEXT NOT NULL DEFAULT ''`
- `state TEXT NOT NULL DEFAULT ''`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `address TEXT NOT NULL DEFAULT ''`
- `address2 TEXT NOT NULL DEFAULT ''`
- `city TEXT NOT NULL DEFAULT ''`
- `zip TEXT NOT NULL DEFAULT ''`
- `website TEXT NOT NULL DEFAULT ''`
- `contact_role TEXT NOT NULL DEFAULT ''`
- `ein_tax_id TEXT NOT NULL DEFAULT ''`

### `investors`

Confirmed in:

- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/202605170001_repair_capital_calls.sql`

Main fields confirmed by migrations:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name TEXT NOT NULL`
- `type TEXT NOT NULL DEFAULT 'person'`
- `company_id UUID REFERENCES investor_companies(id) ON DELETE RESTRICT`
- `email TEXT NOT NULL DEFAULT ''`
- `phone TEXT NOT NULL DEFAULT ''`
- `status TEXT NOT NULL DEFAULT 'active'`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Code/schema mismatch risk:

- `js/supabase.js` writes additional fields such as `first_name`, `last_name`, `address`, `city`, `state_addr`, `zip`, `entity_type`, `investment_profile`, `accredited_investor`, `capital_source`, `tax_id`, `signed_agreement`, `first_contact_date`, and `owner_notes`.
- The visible migrations reviewed here do not add those columns to `investors`.
- Do not touch this mismatch in FlipEngine Phase 2A. Document it as Investor Hub/schema alignment risk only.

### `project_investors`

Confirmed in:

- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/202605070005_project_investor_private_lender_role.sql`
- `supabase/migrations/202605170001_repair_capital_calls.sql`
- `supabase/migrations/20260606_phase2a2_schema_alignment.sql`

Main fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE RESTRICT`
- `role TEXT NOT NULL DEFAULT 'equity_partner'`
- `ownership_percentage NUMERIC(5,2)`
- `profit_split_percentage NUMERIC(5,2)`
- `status TEXT NOT NULL DEFAULT 'pending'`
- `agreement_notes TEXT NOT NULL DEFAULT ''`
- `capital_commitment NUMERIC(12,2) NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Unique constraint on `project_id`, `investor_id`, `role`

Role values:

- Includes `private_lender` after later migration.

### `capital_contributions`

Confirmed in:

- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/202605170001_repair_capital_calls.sql`

Main fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `investor_id UUID REFERENCES investors(id) ON DELETE RESTRICT`
- `amount NUMERIC(12,2) NOT NULL CHECK (amount > 0)`
- `date DATE`
- `method TEXT NOT NULL DEFAULT 'wire'`
- `type TEXT NOT NULL DEFAULT 'initial'`
- `status TEXT NOT NULL DEFAULT 'pending'`
- `evidence_reference TEXT NOT NULL DEFAULT ''`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Protection rules:

- Delete blocked by trigger.
- Historical updates blocked for `amount`, `date`, `investor_id`, and `project_id`.

Integration risk:

- Must remain funding/capital tracking only. Do not include in operating expenses or project financial summaries.

### `capital_calls`

Confirmed in:

- `supabase/migrations/202605070001_investor_entities.sql`
- `supabase/migrations/202605170001_repair_capital_calls.sql`

Main fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT`
- `requested_amount NUMERIC(12,2) NOT NULL CHECK (requested_amount > 0)`
- `reason TEXT NOT NULL`
- `due_date DATE`
- `status TEXT NOT NULL DEFAULT 'pending'`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Integration risk:

- Capital calls are funding requests, not operating spend.

## Auth / Users / RLS Related Schema

Confirmed in applied migrations:

- `project_expenses.created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()`
- RLS is enabled on `projects`, `project_expenses`, `project_refunds`, `project_disbursements`, and Investor Hub tables.
- Current applied policies in migrations are broad allow/select/insert/update patterns.

Draft-only:

- `user_roles`
- `is_owner()`
- `auth_role()`
- granular owner/admin/field_user/viewer policies
- RPC-based access to `project_financial_summaries`

Risk:

- Future FlipEngine SQL should not depend on `user_roles` unless Auth/RLS draft activation is approved and confirmed.
- If new tables are created before Auth/RLS hardening, their RLS model must match the current app behavior or be explicitly staged.

## Existing Relationships Summary

Confirmed project relationships:

- `project_expenses.project_id -> projects.id`
- `project_refunds.project_id -> projects.id`
- `project_disbursements.project_id -> projects.id`
- `work_orders.project_id -> projects.id`
- `project_investors.project_id -> projects.id`
- `capital_contributions.project_id -> projects.id`
- `capital_calls.project_id -> projects.id`

Confirmed Work Order relationships:

- `work_orders.client_id -> clients.id`
- `wo_line_items.work_order_id -> work_orders.id`
- `documents.work_order_id -> work_orders.id`
- `wo_communications.work_order_id -> work_orders.id`
- `change_orders.work_order_id -> work_orders.id`
- `wo_photos.work_order_id -> work_orders.id`

Confirmed financial relationships:

- `project_refunds.expense_id -> project_expenses.id`
- `project_financial_summaries` aggregates approved expenses/refunds and approved/paid disbursements.

## Safe `project_id` Connection Candidates

Future FlipEngine tables that can likely connect safely with `project_id TEXT`:

- `project_acquisitions`
- `project_budget_categories`
- `project_receipts`
- `project_document_links`
- `project_closing_costs`
- `project_loans`
- `project_loan_draws`
- `project_contractors`
- `project_employees`
- `project_time_entries`
- `project_payments`
- `project_sale_exit`

Conditions:

- Keep `project_id` nullable only if the record can exist before project selection. Otherwise use required `project_id TEXT`.
- Use the same type as `projects.id`: `TEXT`.
- Do not add required columns to `projects`.
- Do not change existing project financial formulas.
- Do not make these tables imply all projects are investments.

## Tables Requiring More Care

Highest care:

- `projects`: already feeds financial formulas and project UI.
- `project_financial_summaries`: formula/view must not be changed without approved spec.
- `project_expenses`: protected historical financial table.
- `project_refunds`: protected historical financial table.
- `project_disbursements`: protected historical financial table.
- `capital_contributions`: immutable funding history.
- Investor Hub tables: present and used by app code, but must not be activated or reworked without approval.

Medium care:

- `work_orders`: core operational table; project link exists, but delete behavior needs live verification.
- `documents`: should be extended through link table rather than direct mutation.
- `wo_line_items`: possible budget linkage later, but not required for MVP.

## What Must Not Be Modified

- Do not edit existing migrations.
- Do not execute SQL.
- Do not run `db push`.
- Do not modify `projects` financial fields or status model.
- Do not change `project_financial_summaries`.
- Do not alter triggers protecting expenses, refunds, disbursements, or capital contributions.
- Do not modify Auth/RLS or `user_roles` drafts.
- Do not activate Investor Hub.
- Do not merge funding/capital records into operating expense formulas.
- Do not force all projects into FlipEngine.
- Do not change Work Orders, Documents, or UI in Phase 2A.

## Integration Risks Detected

### 1. `projects.id` type is `TEXT`

Future SQL must not use UUID for `project_id`. Older reference SQL under `sql/PHASE_2B_SCHEMA.sql` used UUID in some project references and should not be copied for FlipEngine migrations.

### 2. Existing `projects` already stores acquisition/sale data

Future `project_acquisitions` and `project_sale_exit` must define source-of-truth rules:

- Either mirror/summarize existing `projects` fields carefully.
- Or store richer detail while leaving existing financial formulas untouched.

### 3. Work Order `project_id` delete behavior is ambiguous from migration history

The same column appears in two migrations with different intended delete behavior. Because both use add-if-missing behavior, the live constraint must be verified before writing SQL that depends on cascade/restrict/set-null semantics.

### 4. Financial tables are protected by triggers

New receipt/payment flows must not update historical fields on existing financial tables. Use extension records and approved status flows.

### 5. Investor Hub schema may have drift

`js/supabase.js` references richer `investors` fields than visible migrations create. This is out of scope for FlipEngine Phase 2A but should be considered before connecting FlipEngine to Investor Hub.

### 6. Auth/RLS is partially planned but not fully applied

The repo has draft Auth/RLS files with `user_roles` and granular policies, but current migrations mainly show broad allow policies. Future FlipEngine table RLS must be owner-approved.

## Recommendation For Future Migration

Not ready to apply a migration yet.

Ready to draft a non-destructive migration proposal only after these decisions are confirmed:

1. `project_id` columns must use `TEXT`.
2. MVP migration should start with extension tables only:
   - `project_acquisitions`
   - `project_budget_categories`
   - `project_receipts`
   - `project_document_links`
3. Do not add columns to `projects`, `project_expenses`, `project_refunds`, `project_disbursements`, `work_orders`, or `documents` in the first FlipEngine migration.
4. Do not alter `project_financial_summaries`.
5. Do not connect to Investor Hub in the first FlipEngine migration.
6. Use optional relationships to `work_orders`, `project_expenses`, and `documents` from new tables, not required back-links from existing tables.
7. Before any actual SQL is written, verify live production constraints for `work_orders.project_id`.
8. Owner must decide source-of-truth boundaries for acquisition fields already present in `projects`.

## Phase 2A Completion Status

Completed:

- Existing migrations reviewed.
- `projects.id` type identified.
- Existing financial tables and fields documented.
- Work Orders and Documents current fields documented from base schema references.
- Investor Hub tables documented without activation.
- Auth/RLS draft dependencies documented without activation.

Still required before implementation:

- Owner approval for MVP SQL scope.
- Live schema verification for constraints if available.
- Source-of-truth decision for acquisition/sale summary fields.
- RLS strategy for any new FlipEngine tables.
