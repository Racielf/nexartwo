-- ============================================================
-- NexArtWO Phase 2 — Migration Script
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Only adds NEW tables (safe to run if tables already exist)
-- ============================================================

-- 5. Work Order Line Items
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

-- 6. Documents
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

-- 7. Work Order Communications
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

-- 8. Change Orders
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

-- 9. Work Order Photos
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

-- RLS
ALTER TABLE wo_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all for wo_line_items" ON wo_line_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all for documents" ON documents FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all for wo_communications" ON wo_communications FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all for change_orders" ON change_orders FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all for wo_photos" ON wo_photos FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Allow public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow anon upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow anon update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow anon delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
