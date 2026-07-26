-- ============================================================
-- FlipEngine MVP Extensions
-- ============================================================
-- Purpose:
--   Add the first non-destructive FlipEngine extension tables for
--   selected NexArWO projects.
--
-- Scope:
--   Creates only new tables:
--     1. project_acquisitions
--     2. project_budget_categories
--     3. project_receipts
--     4. project_document_links
--
-- Guardrails:
--   - Does not alter existing tables.
--   - Does not modify existing financial formulas.
--   - Does not activate Investor Hub.
--   - Does not create RLS policies.
--   - Does not create triggers.
--   - Does not create seed/demo data.
--   - Does not mix investor capital/funding with operating expenses.
--
-- Schema audit dependencies:
--   - projects.id is TEXT, so all project_id references use TEXT.
--   - work_orders.id is UUID in the preflight target, so optional work_order_id uses UUID.
--   - project_expenses.id is SERIAL/INTEGER, so optional project_expense_id uses INTEGER.
--   - documents.id is UUID in the preflight target, so optional document_id uses UUID.
-- ============================================================

-- ============================================================
-- 1. project_acquisitions
-- Detailed purchase/closing facts for selected FlipEngine projects.
-- One project can have at most one acquisition extension record.
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

  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
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

  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

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
