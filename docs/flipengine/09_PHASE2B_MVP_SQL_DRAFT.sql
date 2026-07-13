-- ============================================================
-- FlipEngine Phase 2B MVP SQL Draft
-- ============================================================
-- STATUS: DRAFT ONLY. DO NOT APPLY WITHOUT OWNER REVIEW.
--
-- Purpose:
--   Draft a non-destructive SQL proposal for the first FlipEngine
--   MVP extension tables inside NexArWO.
--
-- Scope:
--   Creates only new tables:
--     1. project_acquisitions
--     2. project_budget_categories
--     3. project_receipts
--     4. project_document_links
--
-- Guardrails:
--   - Do not run this SQL yet.
--   - Do not place this file in supabase/migrations yet.
--   - Do not alter projects.
--   - Do not alter work_orders.
--   - Do not alter documents.
--   - Do not alter project_expenses.
--   - Do not alter project_financial_summaries.
--   - Do not alter Investor Hub tables.
--   - Do not create triggers yet.
--   - Do not create RLS policies yet.
--   - Do not create seed/demo data yet.
--   - Do not mix investor capital/funding with operating expenses.
--
-- Source of truth:
--   - projects remains the existing base table.
--   - project_acquisitions is a detailed acquisition/closing extension.
--   - Existing data is not moved from projects.
--   - Existing fields in projects are not deleted or renamed.
--   - Similar fields may exist in projects and project_acquisitions.
--     No automatic synchronization is proposed in this draft.
--
-- Schema audit dependencies:
--   - projects.id is TEXT, so all project_id references use TEXT.
--   - work_orders.id is TEXT, so optional work_order_id uses TEXT.
--   - project_expenses.id is SERIAL/INTEGER, so optional project_expense_id uses INTEGER.
--   - documents.id is SERIAL/INTEGER, so optional document_id uses INTEGER.
--
-- Owner decisions applied in this revision:
--   - project_acquisitions is 1:1 with projects and enforces UNIQUE(project_id).
--   - New table primary keys remain BIGSERIAL.
--   - Receipts are supporting evidence/documents only; they do not automatically create expenses.
--   - created_by and updated_by are nullable audit fields that reference auth.users(id).
--   - RLS/Auth policies are deferred to a separate approved phase.
-- ============================================================

-- ============================================================
-- 1. project_acquisitions
-- Detailed purchase/closing facts for selected FlipEngine projects.
-- Does not replace projects.purchase_price, projects.loan_amount,
-- projects.closing_costs, or other existing project summary fields.
-- ============================================================

CREATE TABLE IF NOT EXISTS project_acquisitions (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,

  buyer_entity TEXT NOT NULL DEFAULT '',
  seller_name TEXT NOT NULL DEFAULT '',

  purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  earnest_money NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (earnest_money >= 0),
  closing_date DATE,

  escrow_company TEXT NOT NULL DEFAULT '',
  escrow_number TEXT NOT NULL DEFAULT '',

  lender_name TEXT NOT NULL DEFAULT '',
  loan_number TEXT NOT NULL DEFAULT '',
  loan_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (loan_amount >= 0),
  construction_holdback NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (construction_holdback >= 0),
  buyer_funds_to_close NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (buyer_funds_to_close >= 0),

  assignment_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (assignment_fee >= 0),
  homeowner_insurance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (homeowner_insurance >= 0),
  owner_title_insurance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (owner_title_insurance >= 0),
  escrow_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (escrow_fee >= 0),
  recording_fees NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (recording_fees >= 0),
  total_closing_costs NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_closing_costs >= 0),

  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_acquisitions_project_id_unique UNIQUE (project_id)
);

-- The UNIQUE(project_id) constraint above creates the project lookup index
-- and enforces one acquisition extension record per project.

CREATE INDEX IF NOT EXISTS idx_project_acquisitions_closing_date
  ON project_acquisitions(closing_date);

-- ============================================================
-- 2. project_budget_categories
-- Renovation budget buckets for selected FlipEngine projects.
-- actual_spent, remaining_budget, and variance_amount are manual
-- or future-calculation-ready columns for now. No triggers here.
-- ============================================================

CREATE TABLE IF NOT EXISTS project_budget_categories (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,

  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL DEFAULT 'renovation'
    CHECK (category_type IN ('renovation', 'acquisition', 'closing', 'holding', 'selling', 'other')),

  estimated_budget NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_budget >= 0),
  actual_spent NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (actual_spent >= 0),
  remaining_budget NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (remaining_budget >= 0),
  variance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'cancelled')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_budget_categories_project_id
  ON project_budget_categories(project_id);

CREATE INDEX IF NOT EXISTS idx_project_budget_categories_status
  ON project_budget_categories(status);

CREATE INDEX IF NOT EXISTS idx_project_budget_categories_category_type
  ON project_budget_categories(category_type);

-- ============================================================
-- 3. project_receipts
-- Receipt metadata for selected FlipEngine projects.
-- Receipt = supporting evidence/document.
-- Expense = accounting/operating cost record.
-- This table does not automatically create or update project_expenses.
-- project_expense_id is only a nullable manual link when approved later.
-- Receipt approval does not change project_financial_summaries.
-- ============================================================

CREATE TABLE IF NOT EXISTS project_receipts (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,

  work_order_id TEXT REFERENCES work_orders(id) ON DELETE SET NULL,
  project_expense_id INTEGER REFERENCES project_expenses(id) ON DELETE SET NULL,
  budget_category_id BIGINT REFERENCES project_budget_categories(id) ON DELETE SET NULL,

  receipt_date DATE,
  vendor_name TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  payment_method TEXT NOT NULL DEFAULT '',
  po_job_name TEXT NOT NULL DEFAULT '',
  receipt_file_url TEXT NOT NULL DEFAULT '',
  receipt_image_url TEXT NOT NULL DEFAULT '',

  review_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (review_status IN ('needs_review', 'approved', 'rejected')),
  reimbursement_status TEXT NOT NULL DEFAULT 'not_reimbursable'
    CHECK (reimbursement_status IN ('not_reimbursable', 'pending', 'reimbursed')),

  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_receipts_project_id
  ON project_receipts(project_id);

CREATE INDEX IF NOT EXISTS idx_project_receipts_work_order_id
  ON project_receipts(work_order_id);

CREATE INDEX IF NOT EXISTS idx_project_receipts_project_expense_id
  ON project_receipts(project_expense_id);

CREATE INDEX IF NOT EXISTS idx_project_receipts_budget_category_id
  ON project_receipts(budget_category_id);

CREATE INDEX IF NOT EXISTS idx_project_receipts_review_status
  ON project_receipts(review_status);

CREATE INDEX IF NOT EXISTS idx_project_receipts_reimbursement_status
  ON project_receipts(reimbursement_status);

-- ============================================================
-- 4. project_document_links
-- Flexible links between existing documents and FlipEngine modules.
-- This table does not alter documents and does not delete documents.
-- related_record_id is TEXT because related modules may use different
-- ID types across current and future tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS project_document_links (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,

  document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,

  related_module TEXT NOT NULL DEFAULT 'general'
    CHECK (related_module IN (
      'acquisition',
      'budget',
      'receipt',
      'work_order',
      'expense',
      'loan',
      'draw',
      'closing_cost',
      'investor',
      'contractor',
      'employee',
      'sale_exit',
      'general'
    )),
  related_record_id TEXT,
  document_type TEXT NOT NULL DEFAULT 'other',
  review_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (review_status IN ('needs_review', 'approved', 'rejected')),
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_document_links_project_id
  ON project_document_links(project_id);

CREATE INDEX IF NOT EXISTS idx_project_document_links_document_id
  ON project_document_links(document_id);

CREATE INDEX IF NOT EXISTS idx_project_document_links_related_module
  ON project_document_links(related_module);

CREATE INDEX IF NOT EXISTS idx_project_document_links_related_record_id
  ON project_document_links(related_record_id);

CREATE INDEX IF NOT EXISTS idx_project_document_links_review_status
  ON project_document_links(review_status);

-- ============================================================
-- Manual review checklist
-- ============================================================
-- [ ] Owner confirms this draft should become a real migration.
-- [x] Owner confirms only four MVP tables are included.
-- [x] Owner confirms project_id must remain TEXT.
-- [x] Owner confirms BIGSERIAL is acceptable for new table IDs.
-- [x] Owner confirms project_acquisitions is 1:1 with projects.
-- [ ] Owner confirms project_acquisitions can coexist with existing projects fields.
-- [ ] Owner confirms no automatic sync from projects to project_acquisitions.
-- [x] Owner confirms no automatic expense creation from project_receipts.
-- [x] Owner confirms nullable created_by/updated_by audit fields are included.
-- [x] Owner confirms RLS/policies are intentionally deferred.
-- [ ] Owner confirms triggers are intentionally deferred.
-- [ ] Owner confirms no seed/demo data belongs in this migration.
-- [ ] Owner confirms no Investor Hub table is touched.
-- [ ] Owner confirms existing financial formulas remain unchanged.

-- ============================================================
-- Open questions before applying
-- ============================================================
-- 1. Source-of-truth boundary: when projects and project_acquisitions
--    contain similar acquisition/loan/closing fields, which field is
--    displayed or edited in each UI context?
--
-- 2. Should total_closing_costs be manually entered, calculated in UI,
--    or eventually derived from future project_closing_costs?
--
-- 3. Should project_budget_categories actual_spent, remaining_budget,
--    and variance_amount stay manual, or become derived later?
--
-- 4. When a receipt is approved, should it remain only a receipt,
--    or can it link manually to an approved project_expenses record later?
--
-- 5. Should document links require document_id, or allow future external
--    document references without an existing documents row?
--
-- 6. Which future RLS/Auth policy model will protect these tables after
--    owner approval?
--
-- 7. Which future app code path will populate created_by and updated_by?

-- ============================================================
-- Rollback notes
-- ============================================================
-- This is a draft only. If a future migration based on this draft is
-- applied and must be rolled back before production data exists, the
-- safest rollback would be to remove only the new FlipEngine MVP tables
-- in dependency order.
--
-- If production data exists, do not drop tables. Prefer disabling UI
-- access, exporting/backing up rows, and creating a reviewed corrective
-- migration.
--
-- This draft intentionally does not include DROP statements.
-- ============================================================
