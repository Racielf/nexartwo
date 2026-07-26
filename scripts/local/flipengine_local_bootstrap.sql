-- ============================================================
-- FlipEngine Local Bootstrap Script Draft
-- ============================================================
--
-- LOCAL ONLY / DO NOT USE PRODUCTION
--
-- STATUS:
--   Draft for owner review.
--   Do not run until explicitly approved.
--   Do not place in supabase/migrations.
--   Do not apply to production, staging, or any linked Supabase project.
--
-- PURPOSE:
--   Prepare a disposable Supabase local database with the missing NexArWO
--   base tables needed before testing the FlipEngine MVP migration.
--
-- SOURCE:
--   docs/flipengine/17_PHASE2J_LOCAL_BOOTSTRAP_DRAFT.sql
--   docs/flipengine/18_PHASE2K_LOCAL_BOOTSTRAP_REVIEW.md
--
-- SAFETY GATE:
--   This file intentionally refuses to run unless a future approved local
--   runner sets this session variable in the same local database session:
--
--     SET app.flipengine_local_bootstrap_confirm = 'LOCAL_ONLY_APPROVED';
--
--   Do not add that SET command to this file unless the owner explicitly
--   approves execution in a disposable local environment.
--
-- IMPORTANT VERIFIED TYPES:
--   - projects.id = text
--   - work_orders.id = uuid
--   - project_expenses.id = integer
--   - documents.id = uuid
--   - auth.users.id = uuid
--
-- THIS SCRIPT DRAFT DOES NOT:
--   - Insert seed/demo data.
--   - Create RLS policies.
--   - Create triggers.
--   - Create storage buckets.
--   - Touch Investor Hub behavior.
--   - Change app code or UI.
--   - Modify existing migrations.
--
-- ============================================================

DO $$
BEGIN
  IF current_setting('app.flipengine_local_bootstrap_confirm', true)
     IS DISTINCT FROM 'LOCAL_ONLY_APPROVED'
  THEN
    RAISE EXCEPTION
      'STOP: FlipEngine local bootstrap is LOCAL ONLY and requires owner-approved local execution. Set app.flipengine_local_bootstrap_confirm only in a disposable local database.';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS project_seq START 1000;

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
-- End of local-only bootstrap draft.
-- Next required step after any future approved local run:
--   Run docs/flipengine/12_PHASE2F_PREFLIGHT_SCHEMA_CHECK.sql
--   against the same local database and stop on any STOP_* result.
-- ============================================================
