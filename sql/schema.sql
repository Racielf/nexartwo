-- ============================================================
-- WOIMS — Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Company Settings
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

-- 2. Clients
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

-- 3. Services
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

-- 3.5 Projects (Financial Core)
CREATE SEQUENCE IF NOT EXISTS project_seq START 1000;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT ('PRJ-' || nextval('project_seq')::TEXT),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  purchase_date DATE,
  status TEXT DEFAULT 'Active',
  responsible TEXT DEFAULT '',
  purchase_price NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  realtor_fee NUMERIC DEFAULT 0,
  loan_amount NUMERIC DEFAULT 0,
  title_company TEXT DEFAULT '',
  closing_costs NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT,
  budget NUMERIC DEFAULT 0,
  expenses_total NUMERIC DEFAULT 0,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Work Order Line Items (Phase 2)
CREATE TABLE IF NOT EXISTS wo_line_items (
  id SERIAL PRIMARY KEY,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
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

-- 6. Documents (Phase 2)
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  doc_number TEXT NOT NULL,
  type TEXT DEFAULT 'completion',
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft',
  style TEXT DEFAULT 'classic',
  hide_prices BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Work Order Communications (Phase 2)
CREATE TABLE IF NOT EXISTS wo_communications (
  id SERIAL PRIMARY KEY,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'note',
  subject TEXT DEFAULT '',
  body TEXT DEFAULT '',
  sender TEXT DEFAULT '',
  recipient TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Change Orders (Phase 2)
CREATE TABLE IF NOT EXISTS change_orders (
  id SERIAL PRIMARY KEY,
  co_number TEXT NOT NULL,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'proposed',
  requested_by TEXT DEFAULT '',
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Work Order Photos (Phase 2)
CREATE TABLE IF NOT EXISTS wo_photos (
  id SERIAL PRIMARY KEY,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'before',
  label TEXT DEFAULT '',
  area TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  taken_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Project Expenses
CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  vendor TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  date DATE DEFAULT CURRENT_DATE,
  category TEXT DEFAULT '',
  receipt_url TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Project Refunds
CREATE TABLE IF NOT EXISTS project_refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  expense_id UUID REFERENCES project_expenses(id) ON DELETE RESTRICT,
  vendor TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Project Disbursements
CREATE TABLE IF NOT EXISTS project_disbursements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  type TEXT DEFAULT 'Check',
  payee TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  date DATE DEFAULT CURRENT_DATE,
  document_url TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Financial Summaries View
CREATE OR REPLACE VIEW project_financial_summaries AS
SELECT 
    p.id AS project_id,
    p.name,
    COALESCE((SELECT SUM(amount) FROM project_expenses WHERE project_id = p.id AND status != 'Cancelled'), 0) AS total_expenses,
    COALESCE((SELECT SUM(amount) FROM project_refunds WHERE project_id = p.id AND status != 'Cancelled'), 0) AS total_refunds,
    COALESCE((SELECT SUM(amount) FROM project_disbursements WHERE project_id = p.id AND status != 'Cancelled'), 0) AS total_disbursements,
    (COALESCE((SELECT SUM(amount) FROM project_expenses WHERE project_id = p.id AND status != 'Cancelled'), 0) - 
     COALESCE((SELECT SUM(amount) FROM project_refunds WHERE project_id = p.id AND status != 'Cancelled'), 0)) AS net_cost
FROM projects p;

-- ============================================================
-- Row Level Security — Allow all for single-tenant
-- ============================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_disbursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for services" ON services FOR ALL USING (true) WITH CHECK (true);
-- NOTA IMPORTANT: Las policies FOR ALL USING (true) son temporales para MVP/single-tenant.
-- Antes de producción, estas tablas financieras deben ser admin/internal-only.
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for work_orders" ON work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for wo_line_items" ON wo_line_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for wo_communications" ON wo_communications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for change_orders" ON change_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for wo_photos" ON wo_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_expenses" ON project_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_refunds" ON project_refunds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_disbursements" ON project_disbursements FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Storage Buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Allow anon upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow anon update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');
CREATE POLICY "Allow anon delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');

CREATE POLICY "Allow public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Allow anon upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Allow anon update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Allow anon delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

