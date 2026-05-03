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

-- 4. Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  id TEXT PRIMARY KEY,
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

-- ============================================================
-- Row Level Security — Allow all for single-tenant
-- ============================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for services" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for work_orders" ON work_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Storage Bucket for Logos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Allow anon upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow anon update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');
CREATE POLICY "Allow anon delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');
