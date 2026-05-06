-- ============================================================
-- NexArtWO — Migration 003: Projects & Financial System
-- ============================================================

-- 1. Secuencia para IDs de Proyecto
CREATE SEQUENCE IF NOT EXISTS project_seq START 1000;

-- 2. Tabla de Proyectos (Entidad Principal)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT 'PROJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('project_seq')::text, 4, '0'),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  purchase_date DATE,
  status TEXT DEFAULT 'planning',
  responsible TEXT DEFAULT '',
  
  -- Financial Summary (Acquisition)
  purchase_price NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  loan_amount NUMERIC DEFAULT 0,
  realtor_fee NUMERIC DEFAULT 0,
  title_company TEXT DEFAULT '',
  title_company_fee NUMERIC DEFAULT 0,
  closing_costs NUMERIC DEFAULT 0,
  inspection_fee NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  
  -- Sale (filled when selling)
  sale_price NUMERIC DEFAULT 0,
  selling_agent_commission NUMERIC DEFAULT 0,
  seller_closing_costs NUMERIC DEFAULT 0,
  
  -- Parties
  buying_agent TEXT DEFAULT '',
  buying_agent_company TEXT DEFAULT '',
  selling_agent TEXT DEFAULT '',
  lender_name TEXT DEFAULT '',
  lender_contact TEXT DEFAULT '',
  
  -- Property
  property_type TEXT DEFAULT 'residential',
  beds INTEGER DEFAULT 0,
  baths NUMERIC DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  year_built INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Vincular Work Orders a Proyectos
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE RESTRICT;

-- 4. Gastos (Expenses - Siempre RESTAN)
CREATE TABLE IF NOT EXISTS project_expenses (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  
  vendor TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0), -- REGLA: Siempre positivo en tabla
  tax NUMERIC DEFAULT 0 CHECK (tax >= 0),
  category TEXT DEFAULT 'materials',       -- materials | tools | subcontractor | rental | permits | other
  type TEXT DEFAULT 'expense',             -- expense (siempre)
  
  receipt_date DATE,
  receipt_image_url TEXT DEFAULT '',
  receipt_items JSONB DEFAULT '[]',        -- Para OCR futuro
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT DEFAULT '',
  
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Devoluciones (Refunds - Siempre SUMAN)
CREATE TABLE IF NOT EXISTS project_refunds (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  expense_id INTEGER REFERENCES project_expenses(id) ON DELETE RESTRICT,
  
  vendor TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0), -- REGLA: Siempre positivo en tabla
  
  receipt_date DATE,
  receipt_image_url TEXT DEFAULT '',
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Pagos Emitidos (Disbursements - Siempre RESTAN)
CREATE TABLE IF NOT EXISTS project_disbursements (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE RESTRICT,
  
  payment_type TEXT DEFAULT 'check',       -- check | cash | transfer | card
  beneficiary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0), -- REGLA: Siempre positivo en tabla
  
  payment_date DATE,
  reference_number TEXT DEFAULT '',        -- Check number, transfer ID, etc.
  receipt_image_url TEXT DEFAULT '',
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected | paid
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Vista Financiera Resumida (Reglas de Oro: Cálculo dinámico)
CREATE OR REPLACE VIEW project_financial_summaries AS
SELECT
  p.id AS project_id,
  p.name,
  p.status,
  
  -- Acquisition costs
  p.purchase_price,
  p.down_payment,
  p.loan_amount,
  p.realtor_fee,
  p.title_company_fee,
  p.closing_costs,
  p.inspection_fee,
  p.insurance,
  (p.purchase_price + p.down_payment + p.realtor_fee + p.title_company_fee + 
   p.closing_costs + p.inspection_fee + p.insurance) AS total_acquisition,
  
  -- Expenses (approved only)
  COALESCE(e.total_expenses, 0) AS total_expenses,
  COALESCE(e.pending_expenses, 0) AS pending_expenses,
  COALESCE(e.expense_count, 0) AS expense_count,
  
  -- Refunds (approved only)
  COALESCE(r.total_refunds, 0) AS total_refunds,
  COALESCE(r.refund_count, 0) AS refund_count,
  
  -- Disbursements (approved or paid only)
  COALESCE(d.total_disbursements, 0) AS total_disbursements,
  COALESCE(d.disbursement_count, 0) AS disbursement_count,
  
  -- Work Orders
  COALESCE(w.wo_total, 0) AS total_work_orders,
  COALESCE(w.wo_count, 0) AS work_order_count,
  
  -- NET COST = Expenses - Refunds
  (COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0)) AS net_expense_cost,
  
  -- TOTAL INVESTMENT
  (p.purchase_price + p.down_payment + p.realtor_fee + p.title_company_fee + 
   p.closing_costs + p.inspection_fee + p.insurance +
   COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0) +
   COALESCE(d.total_disbursements, 0)) AS total_investment,
  
  -- SALE
  p.sale_price,
  p.selling_agent_commission,
  p.seller_closing_costs,
  (p.sale_price - p.selling_agent_commission - p.seller_closing_costs) AS net_proceeds,
  
  -- PROFIT
  CASE WHEN p.sale_price > 0 THEN
    (p.sale_price - p.selling_agent_commission - p.seller_closing_costs) -
    (p.purchase_price + p.down_payment + p.realtor_fee + p.title_company_fee + 
     p.closing_costs + p.inspection_fee + p.insurance +
     COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0) +
     COALESCE(d.total_disbursements, 0))
  ELSE 0 END AS profit

FROM projects p

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending_expenses,
    COUNT(*) AS expense_count
  FROM project_expenses GROUP BY project_id
) e ON e.project_id = p.id

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS total_refunds,
    COUNT(*) AS refund_count
  FROM project_refunds GROUP BY project_id
) r ON r.project_id = p.id

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status IN ('approved', 'paid') THEN amount ELSE 0 END) AS total_disbursements,
    COUNT(*) AS disbursement_count
  FROM project_disbursements GROUP BY project_id
) d ON d.project_id = p.id

LEFT JOIN (
  SELECT project_id,
    SUM(COALESCE(total, 0)) AS wo_total,
    COUNT(*) AS wo_count
  FROM work_orders WHERE project_id IS NOT NULL GROUP BY project_id
) w ON w.project_id = p.id;


-- 8. Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_disbursements ENABLE ROW LEVEL SECURITY;

-- NOTA IMPORTANTE: Estas políticas públicas FOR ALL USING (true) son estrictamente temporales 
-- para la fase de desarrollo MVP. En producción, estas tablas que contienen historia financiera 
-- deben configurarse como admin/internal-only.
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_expenses" ON project_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_refunds" ON project_refunds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for project_disbursements" ON project_disbursements FOR ALL USING (true) WITH CHECK (true);
