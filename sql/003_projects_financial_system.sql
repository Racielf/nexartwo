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
  status TEXT DEFAULT 'planning', -- planning | active | completed | on_hold | cancelled
  responsible TEXT DEFAULT '',
  
  -- Financial Summary (Acquisition)
  purchase_price NUMERIC DEFAULT 0 CHECK (purchase_price >= 0),
  down_payment NUMERIC DEFAULT 0 CHECK (down_payment >= 0),
  loan_amount NUMERIC DEFAULT 0 CHECK (loan_amount >= 0),
  realtor_fee NUMERIC DEFAULT 0 CHECK (realtor_fee >= 0),
  title_company TEXT DEFAULT '',
  title_company_fee NUMERIC DEFAULT 0 CHECK (title_company_fee >= 0),
  closing_costs NUMERIC DEFAULT 0 CHECK (closing_costs >= 0),
  inspection_fee NUMERIC DEFAULT 0 CHECK (inspection_fee >= 0),
  insurance NUMERIC DEFAULT 0 CHECK (insurance >= 0),
  
  -- Sale (filled when selling)
  sale_price NUMERIC DEFAULT 0 CHECK (sale_price >= 0),
  selling_agent_commission NUMERIC DEFAULT 0 CHECK (selling_agent_commission >= 0),
  seller_closing_costs NUMERIC DEFAULT 0 CHECK (seller_closing_costs >= 0),
  
  -- Parties
  buying_agent TEXT DEFAULT '',
  buying_agent_company TEXT DEFAULT '',
  selling_agent TEXT DEFAULT '',
  lender_name TEXT DEFAULT '',
  lender_contact TEXT DEFAULT '',
  
  -- Property
  property_type TEXT DEFAULT 'residential',
  beds INTEGER DEFAULT 0 CHECK (beds >= 0),
  baths NUMERIC DEFAULT 0 CHECK (baths >= 0),
  sqft INTEGER DEFAULT 0 CHECK (sqft >= 0),
  year_built INTEGER DEFAULT 0 CHECK (year_built >= 0),
  
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
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected | cancelled
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
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected | cancelled
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
  
  status TEXT DEFAULT 'pending',           -- pending | approved | rejected | paid | cancelled
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Vista Financiera Resumida (Reglas de Oro: Cálculo dinámico separado)
CREATE OR REPLACE VIEW project_financial_summaries AS
SELECT
  p.id AS project_id,
  p.name,
  p.status,
  
  -- Base metrics
  p.purchase_price,
  p.down_payment,
  p.loan_amount,
  
  -- 7.1 COST BASIS (Valor contable de adquisición)
  -- purchase_price + todos los fees iniciales
  (p.purchase_price + p.realtor_fee + p.title_company_fee + 
   p.closing_costs + p.inspection_fee + p.insurance) AS cost_basis,

  -- 7.2 CASH INVESTED (Dinero líquido que salió de la bolsa inicial)
  -- down_payment + fees iniciales
  (p.down_payment + p.realtor_fee + p.title_company_fee + 
   p.closing_costs + p.inspection_fee + p.insurance) AS cash_invested,
  
  -- Totales agregados (approved only)
  COALESCE(e.total_expenses, 0) AS total_expenses,
  COALESCE(r.total_refunds, 0) AS total_refunds,
  COALESCE(d.total_disbursements, 0) AS total_disbursements,
  
  -- 7.3 NET EXPENSE COST = Expenses - Refunds
  (COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0)) AS net_expense_cost,
  
  -- SALE
  p.sale_price,
  p.selling_agent_commission,
  p.seller_closing_costs,
  (p.sale_price - p.selling_agent_commission - p.seller_closing_costs) AS net_proceeds,
  
  -- 7.4 PROFIT (Net Proceeds - (Cost Basis + Net Expenses))
  CASE WHEN p.sale_price > 0 THEN
    (p.sale_price - p.selling_agent_commission - p.seller_closing_costs) -
    ((p.purchase_price + p.realtor_fee + p.title_company_fee + p.closing_costs + p.inspection_fee + p.insurance) +
     (COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0)))
  ELSE 0 END AS profit,
  
  -- 7.5 PROJECT CASH POSITION (Cash Outflow & Inflow Real-Time)
  -- Net Proceeds - Cash Invested - Net Expenses - Disbursements
  ((p.sale_price - p.selling_agent_commission - p.seller_closing_costs) - 
   (p.down_payment + p.realtor_fee + p.title_company_fee + p.closing_costs + p.inspection_fee + p.insurance) - 
   (COALESCE(e.total_expenses, 0) - COALESCE(r.total_refunds, 0)) - 
   COALESCE(d.total_disbursements, 0)) AS project_cash_position

FROM projects p

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS total_expenses
  FROM project_expenses GROUP BY project_id
) e ON e.project_id = p.id

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS total_refunds
  FROM project_refunds GROUP BY project_id
) r ON r.project_id = p.id

LEFT JOIN (
  SELECT project_id,
    SUM(CASE WHEN status IN ('approved', 'paid') THEN amount ELSE 0 END) AS total_disbursements
  FROM project_disbursements GROUP BY project_id
) d ON d.project_id = p.id;


-- 8. PROTECCIÓN REGLAS 9 Y 14 (Triggers Inmutables)

-- 8.1 Evitar DELETE
CREATE OR REPLACE FUNCTION prevent_financial_delete() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'REGLA 14: NUNCA borrar historia financiera. Cambia el status a cancelled.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_delete_expenses
BEFORE DELETE ON project_expenses
FOR EACH ROW EXECUTE FUNCTION prevent_financial_delete();

CREATE TRIGGER trg_no_delete_refunds
BEFORE DELETE ON project_refunds
FOR EACH ROW EXECUTE FUNCTION prevent_financial_delete();

CREATE TRIGGER trg_no_delete_disbursements
BEFORE DELETE ON project_disbursements
FOR EACH ROW EXECUTE FUNCTION prevent_financial_delete();

-- 8.2 Evitar UPDATE de campos históricos
CREATE OR REPLACE FUNCTION prevent_expense_update() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.amount IS DISTINCT FROM NEW.amount OR
       OLD.tax IS DISTINCT FROM NEW.tax OR
       OLD.project_id IS DISTINCT FROM NEW.project_id OR
       OLD.work_order_id IS DISTINCT FROM NEW.work_order_id OR
       OLD.receipt_date IS DISTINCT FROM NEW.receipt_date OR
       OLD.vendor IS DISTINCT FROM NEW.vendor
    THEN
        RAISE EXCEPTION 'REGLA 9: NUNCA modificar registros históricos financieros (monto, fechas, vendor o IDs). Crea un nuevo registro compensatorio o usa status cancelled.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_refund_update() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.amount IS DISTINCT FROM NEW.amount OR
       OLD.project_id IS DISTINCT FROM NEW.project_id OR
       OLD.work_order_id IS DISTINCT FROM NEW.work_order_id OR
       OLD.expense_id IS DISTINCT FROM NEW.expense_id OR
       OLD.receipt_date IS DISTINCT FROM NEW.receipt_date OR
       OLD.vendor IS DISTINCT FROM NEW.vendor
    THEN
        RAISE EXCEPTION 'REGLA 9: NUNCA modificar registros históricos financieros (monto, fechas, vendor o IDs). Crea un nuevo registro compensatorio o usa status cancelled.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_disbursement_update() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.amount IS DISTINCT FROM NEW.amount OR
       OLD.project_id IS DISTINCT FROM NEW.project_id OR
       OLD.work_order_id IS DISTINCT FROM NEW.work_order_id OR
       OLD.payment_date IS DISTINCT FROM NEW.payment_date OR
       OLD.beneficiary IS DISTINCT FROM NEW.beneficiary OR
       OLD.payment_type IS DISTINCT FROM NEW.payment_type
    THEN
        RAISE EXCEPTION 'REGLA 9: NUNCA modificar registros históricos financieros (monto, fechas, beneficiario o IDs). Crea un nuevo registro compensatorio o usa status cancelled.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_update_expenses
BEFORE UPDATE ON project_expenses
FOR EACH ROW EXECUTE FUNCTION prevent_expense_update();

CREATE TRIGGER trg_no_update_refunds
BEFORE UPDATE ON project_refunds
FOR EACH ROW EXECUTE FUNCTION prevent_refund_update();

CREATE TRIGGER trg_no_update_disbursements
BEFORE UPDATE ON project_disbursements
FOR EACH ROW EXECUTE FUNCTION prevent_disbursement_update();


-- 9. Row Level Security (Políticas Seguras)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_disbursements ENABLE ROW LEVEL SECURITY;

-- Projects (CRUD allowed for MVP)
CREATE POLICY "Allow select projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update projects" ON projects FOR UPDATE USING (true) WITH CHECK (true);

-- Expenses (Delete blocked by Trigger, Update limited by Trigger)
CREATE POLICY "Allow select project_expenses" ON project_expenses FOR SELECT USING (true);
CREATE POLICY "Allow insert project_expenses" ON project_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update project_expenses" ON project_expenses FOR UPDATE USING (true) WITH CHECK (true);

-- Refunds (Delete blocked by Trigger, Update limited by Trigger)
CREATE POLICY "Allow select project_refunds" ON project_refunds FOR SELECT USING (true);
CREATE POLICY "Allow insert project_refunds" ON project_refunds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update project_refunds" ON project_refunds FOR UPDATE USING (true) WITH CHECK (true);

-- Disbursements (Delete blocked by Trigger, Update limited by Trigger)
CREATE POLICY "Allow select project_disbursements" ON project_disbursements FOR SELECT USING (true);
CREATE POLICY "Allow insert project_disbursements" ON project_disbursements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update project_disbursements" ON project_disbursements FOR UPDATE USING (true) WITH CHECK (true);
