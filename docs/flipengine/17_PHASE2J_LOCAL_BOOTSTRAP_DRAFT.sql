-- ============================================================
-- FlipEngine Phase 2J Local Bootstrap Draft
-- ============================================================
--
-- STATUS:
--   Draft only.
--   Do not run this SQL yet.
--   Do not place this file in supabase/migrations.
--   Do not apply to production.
--
-- PURPOSE:
--   Draft a local-only bootstrap shape for a disposable Supabase local
--   database so the existing local migration chain can be tested before
--   the FlipEngine MVP migration.
--
-- SOURCE:
--   docs/flipengine/16_PHASE2I_LOCAL_BOOTSTRAP_PLAN.md
--   docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.md
--
-- IMPORTANT:
--   This draft intentionally does not copy sql/schema.sql blindly.
--   The real target preflight showed:
--     - projects.id = text
--     - work_orders.id = uuid
--     - project_expenses.id = integer
--     - documents.id = uuid
--     - auth.users.id = uuid
--
--   Older repo SQL uses work_orders.id TEXT and documents.id SERIAL.
--   This local-only draft uses UUID for work_orders/documents to match
--   the current verified target and the Phase 2G FlipEngine migration.
--
-- DO NOT:
--   - Run against production.
--   - Run through db push.
--   - Use with --linked.
--   - Add to supabase/migrations.
--   - Add seed/demo data.
--   - Add RLS policies, triggers, or storage buckets here.
--   - Modify app code, UI, financial formulas, or Investor Hub behavior.
--
-- WHY PROJECT FINANCIAL TABLES ARE INCLUDED:
--   supabase/migrations/20260506_projects_financial_system.sql creates
--   project_expenses/project_refunds/project_disbursements with
--   work_order_id TEXT REFERENCES work_orders(id). If local work_orders.id
--   is UUID, those stale FK definitions would fail.
--
--   This draft precreates those financial tables with UUID work_order_id
--   so 20260506 can skip CREATE TABLE IF NOT EXISTS and still create its
--   view/functions/triggers/policies later.
--
-- ============================================================

-- Local Supabase normally provides pgcrypto/gen_random_uuid().
-- Kept here for local-only completeness.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Project ID sequence required by projects.id default.
-- Mirrors existing migration intent.
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS project_seq START 1000;

-- ------------------------------------------------------------
-- Minimal project parent table.
-- Shape is aligned with 20260506 because later financial views read
-- these columns directly.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT 'PROJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('project_seq')::text, 4, '0'),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  purchase_date DATE,
  status TEXT DEFAULT 'planning',
  responsible TEXT DEFAULT '',
  purchase_price NUMERIC DEFAULT 0 CHECK (purchase_price >= 0),
  down_payment NUMERIC DEFAULT 0 CHECK (down_payment >= 0),
  loan_amount NUMERIC DEFAULT 0 CHECK (loan_amount >= 0),
  realtor_fee NUMERIC DEFAULT 0 CHECK (realtor_fee >= 0),
  title_company TEXT DEFAULT '',
  title_company_fee NUMERIC DEFAULT 0 CHECK (title_company_fee >= 0),
  closing_costs NUMERIC DEFAULT 0 CHECK (closing_costs >= 0),
  inspection_fee NUMERIC DEFAULT 0 CHECK (inspection_fee >= 0),
  insurance NUMERIC DEFAULT 0 CHECK (insurance >= 0),
  sale_price NUMERIC DEFAULT 0 CHECK (sale_price >= 0),
  selling_agent_commission NUMERIC DEFAULT 0 CHECK (selling_agent_commission >= 0),
  seller_closing_costs NUMERIC DEFAULT 0 CHECK (seller_closing_costs >= 0),
  buying_agent TEXT DEFAULT '',
  buying_agent_company TEXT DEFAULT '',
  selling_agent TEXT DEFAULT '',
  lender_name TEXT DEFAULT '',
  lender_contact TEXT DEFAULT '',
  property_type TEXT DEFAULT 'residential',
  beds INTEGER DEFAULT 0 CHECK (beds >= 0),
  baths NUMERIC DEFAULT 0 CHECK (baths >= 0),
  sqft INTEGER DEFAULT 0 CHECK (sqft >= 0),
  year_built INTEGER DEFAULT 0 CHECK (year_built >= 0),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Original app support tables.
-- These are local-only scaffolding for Work Orders.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT '',
  owner TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  ccb TEXT DEFAULT '',
  founded TEXT DEFAULT '',
  address TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  app_logo_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Residential',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  referral TEXT DEFAULT '',
  lang TEXT DEFAULT 'English',
  payment TEXT DEFAULT 'Net 30',
  tags TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  properties INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT DEFAULT '',
  category TEXT DEFAULT 'General Repairs',
  sub TEXT DEFAULT 'General',
  price NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'each',
  description TEXT DEFAULT '',
  negotiable TEXT DEFAULT 'yes',
  labor_hrs NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Work Orders.
-- Uses UUID id to match the current verified target schema.
-- Includes project_id so existing ADD COLUMN IF NOT EXISTS migrations
-- do not attempt to own that column later.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_name TEXT DEFAULT '',
  client_id INT REFERENCES clients(id) ON DELETE SET NULL,
  property TEXT DEFAULT '',
  type TEXT DEFAULT 'A',
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  created_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  items INT DEFAULT 0,
  total NUMERIC DEFAULT 0,
  completed INT DEFAULT 0,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_project_id
  ON work_orders(project_id);

-- ------------------------------------------------------------
-- Work Order line items.
-- Not required for the existing migration failure, but included as
-- minimal Work Order base structure for local-only testing.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wo_line_items (
  id SERIAL PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_es TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  sub TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  qty NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'each',
  negotiable TEXT DEFAULT 'yes',
  labor_hrs NUMERIC DEFAULT 1,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Documents.
-- Uses UUID id to match the current verified target schema and
-- FlipEngine project_document_links.document_id.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL,
  type TEXT DEFAULT 'completion',
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft',
  style TEXT DEFAULT 'classic',
  hide_prices BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Compatibility financial tables.
-- These preserve the 20260506 column shape but correct work_order_id
-- to UUID so the local schema can match the verified target.
-- Existing 20260506 should skip these CREATE TABLE IF NOT EXISTS blocks
-- and then create its view/functions/triggers/policies.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_expenses (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE RESTRICT,
  vendor TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  tax NUMERIC DEFAULT 0 CHECK (tax >= 0),
  category TEXT DEFAULT 'materials',
  type TEXT DEFAULT 'expense',
  receipt_date DATE,
  receipt_image_url TEXT DEFAULT '',
  receipt_items JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_refunds (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE RESTRICT,
  expense_id INTEGER REFERENCES project_expenses(id) ON DELETE RESTRICT,
  vendor TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  receipt_date DATE,
  receipt_image_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_disbursements (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE RESTRICT,
  payment_type TEXT DEFAULT 'check',
  beneficiary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  payment_date DATE,
  reference_number TEXT DEFAULT '',
  receipt_image_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Intentionally omitted from this draft:
--   - RLS enablement and policies
--   - triggers/functions
--   - storage buckets
--   - seed/demo data
--   - wo_communications
--   - change_orders
--   - wo_photos
--
-- Those may be considered later only if local UI testing needs them.
-- ============================================================
