-- ============================================================================
-- NEXARTWO PHASE 2B — INVESTOR ENTITIES + CAPITAL CONTRIBUTIONS
-- Schema SQL para Supabase PostgreSQL
-- Date: Mayo 2026
-- Status: READY FOR DEPLOYMENT
-- ============================================================================

-- ============================================================================
-- TABLE 1: investors
-- Purpose: Registro de personas o entidades que invierten
-- ============================================================================

CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identidad
  name TEXT NOT NULL,                    -- "Rodolfo Fernandez" o "John Doe"
  type TEXT NOT NULL CHECK (type IN ('person', 'company')),  -- 'person' | 'company'
  
  -- Contacto
  email TEXT,
  phone TEXT,
  
  -- Información tax/legal
  tax_id TEXT,                          -- EIN (empresa) o SSN (persona)
  tax_notes TEXT,                       -- Notas para accountant
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),  -- 'active' | 'inactive'
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para investors
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);

-- ============================================================================
-- TABLE 2: investor_companies
-- Purpose: Registro de empresas de inversión
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identidad
  company_name TEXT NOT NULL,           -- "R.C Art Construction LLC"
  state TEXT NOT NULL,                  -- "Oregon"
  
  -- Contacto
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  
  -- Acreditación legal
  license_number TEXT,                  -- CCB #247277
  tax_id TEXT,                          -- EIN
  
  -- Registro
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para investor_companies
CREATE INDEX IF NOT EXISTS idx_investor_companies_state ON investor_companies(state);
CREATE INDEX IF NOT EXISTS idx_investor_companies_tax_id ON investor_companies(tax_id);

-- ============================================================================
-- TABLE 3: project_investors
-- Purpose: Unión de inversionistas con proyectos
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  
  -- Rol y participación
  role TEXT NOT NULL CHECK (role IN ('investor', 'owner', 'manager')),  -- 'investor' | 'owner' | 'manager'
  ownership_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  profit_split_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (profit_split_percentage >= 0 AND profit_split_percentage <= 100),
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'exited')),  -- 'active' | 'inactive' | 'exited'
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(project_id, investor_id)
);

-- Índices para project_investors
CREATE INDEX IF NOT EXISTS idx_project_investors_project ON project_investors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_investors_investor ON project_investors(investor_id);
CREATE INDEX IF NOT EXISTS idx_project_investors_status ON project_investors(status);

-- ============================================================================
-- TABLE 4: capital_contributions
-- Purpose: Registro de dinero aportado por inversionistas
-- ============================================================================

CREATE TABLE IF NOT EXISTS capital_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_investor_id UUID NOT NULL REFERENCES project_investors(id) ON DELETE CASCADE,
  
  -- Fondos
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),        -- $6,600, $10,000, etc
  contribution_date DATE NOT NULL,      -- Cuándo se depositó
  
  -- Tipo
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('initial', 'mid-project', 'closing')),
  
  -- Evidencia
  reference TEXT,                       -- "Cheque #12345", "Wire XXX"
  notes TEXT,
  
  -- Estado
  status TEXT DEFAULT 'received' CHECK (status IN ('pending', 'received', 'refunded')),  -- 'pending' | 'received' | 'refunded'
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para capital_contributions
CREATE INDEX IF NOT EXISTS idx_capital_project ON capital_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_capital_investor ON capital_contributions(project_investor_id);
CREATE INDEX IF NOT EXISTS idx_capital_status ON capital_contributions(status);
CREATE INDEX IF NOT EXISTS idx_capital_date ON capital_contributions(contribution_date);

-- ============================================================================
-- TABLE 5: flip_analyses
-- Purpose: Guardar versiones del análisis de flip (propuesta, actualizaciones, final)
-- ============================================================================

CREATE TABLE IF NOT EXISTS flip_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Versioning
  version INT NOT NULL DEFAULT 1,       -- v1, v2, v3...
  analysis_date DATE NOT NULL,
  
  -- ===== ACQUISITION PHASE =====
  purchase_price DECIMAL(12,2),
  earnest_deposit DECIMAL(12,2),
  closing_costs_entry DECIMAL(12,2),
  
  -- ===== HARD MONEY LOAN =====
  loan_amount DECIMAL(12,2),
  loan_rate_annual DECIMAL(4,2),        -- 10.00 (10%)
  loan_months INT,                      -- 6, 12, etc
  calculated_interest DECIMAL(12,2),
  
  -- ===== HOLDING COSTS =====
  property_taxes_6m DECIMAL(12,2),
  insurance_6m DECIMAL(12,2),
  
  -- ===== REHAB / REPAIRS =====
  estimated_repairs DECIMAL(12,2),
  contingency_percent DECIMAL(4,2),     -- 10.00 (10%)
  contingency_amount DECIMAL(12,2),
  
  -- ===== SALE PHASE =====
  arv DECIMAL(12,2),                    -- After Repair Value
  realtor_commission_percent DECIMAL(4,2),  -- 5.50 (5.5%)
  title_escrow_exit DECIMAL(12,2),
  
  -- ===== CALCULATED RESULTS =====
  total_all_in_cost DECIMAL(12,2),
  realtor_commission DECIMAL(12,2),
  net_proceeds DECIMAL(12,2),
  gross_profit DECIMAL(12,2),
  net_profit DECIMAL(12,2),
  roi_percent DECIMAL(8,2),             -- 320.00 (320%)
  profit_margin DECIMAL(5,2),           -- 4.70 (4.70%)
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'final')),
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para flip_analyses
CREATE INDEX IF NOT EXISTS idx_flip_analyses_project ON flip_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_flip_analyses_version ON flip_analyses(project_id, version);
CREATE INDEX IF NOT EXISTS idx_flip_analyses_date ON flip_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_flip_analyses_status ON flip_analyses(status);

-- ============================================================================
-- RPC 1: calculate_flip_analysis()
-- Purpose: Recalcular todo el análisis de flip basado en inputs
-- Returns: Tabla con todos los cálculos finales
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_flip_analysis(
  p_purchase_price DECIMAL,
  p_earnest_deposit DECIMAL,
  p_closing_costs_entry DECIMAL,
  p_loan_amount DECIMAL,
  p_loan_rate_annual DECIMAL,
  p_loan_months INT,
  p_property_taxes_6m DECIMAL,
  p_insurance_6m DECIMAL,
  p_estimated_repairs DECIMAL,
  p_contingency_percent DECIMAL,
  p_arv DECIMAL,
  p_realtor_commission_percent DECIMAL,
  p_title_escrow_exit DECIMAL
)
RETURNS TABLE (
  total_all_in_cost DECIMAL,
  calculated_interest DECIMAL,
  contingency_amount DECIMAL,
  realtor_commission DECIMAL,
  net_proceeds DECIMAL,
  gross_profit DECIMAL,
  net_profit DECIMAL,
  roi_percent DECIMAL,
  profit_margin DECIMAL
)
AS $$
DECLARE
  v_calculated_interest DECIMAL;
  v_contingency DECIMAL;
  v_realtor_commission DECIMAL;
  v_total_cost DECIMAL;
  v_net_proceeds DECIMAL;
  v_gross_profit DECIMAL;
  v_net_profit DECIMAL;
  v_roi DECIMAL;
  v_margin DECIMAL;
BEGIN
  -- ===== CÁLCULO 1: Interés del Préstamo =====
  -- Interest = Loan Amount × (Annual Rate / 100) × (Months / 12)
  v_calculated_interest := COALESCE(p_loan_amount, 0) * 
                           COALESCE(p_loan_rate_annual, 0) / 100 * 
                           COALESCE(p_loan_months, 0) / 12.0;
  
  -- ===== CÁLCULO 2: Contingency (10% de repairs) =====
  v_contingency := COALESCE(p_estimated_repairs, 0) * 
                   COALESCE(p_contingency_percent, 0) / 100;
  
  -- ===== CÁLCULO 3: Comisión Realtor =====
  v_realtor_commission := COALESCE(p_arv, 0) * 
                          COALESCE(p_realtor_commission_percent, 0) / 100;
  
  -- ===== CÁLCULO 4: TOTAL ALL-IN COST =====
  -- Suma TODOS los costos del proyecto
  v_total_cost := COALESCE(p_purchase_price, 0)
                + COALESCE(p_earnest_deposit, 0)
                + COALESCE(p_closing_costs_entry, 0)
                + v_calculated_interest
                + COALESCE(p_property_taxes_6m, 0)
                + COALESCE(p_insurance_6m, 0)
                + COALESCE(p_estimated_repairs, 0)
                + v_contingency
                + COALESCE(p_title_escrow_exit, 0);
  
  -- ===== CÁLCULO 5: NET PROCEEDS (sale price - comisión) =====
  v_net_proceeds := COALESCE(p_arv, 0) - v_realtor_commission;
  
  -- ===== CÁLCULO 6: GROSS PROFIT (net proceeds - all-in cost) =====
  v_gross_profit := v_net_proceeds - v_total_cost;
  
  -- ===== CÁLCULO 7: NET PROFIT (gross - earnest deposit) =====
  -- Este es el profit que recibe el inversor después de restar su capital inicial
  v_net_profit := v_gross_profit - COALESCE(p_earnest_deposit, 0);
  
  -- ===== CÁLCULO 8: ROI (%) =====
  -- ROI = (Net Profit / Earnest Deposit) × 100
  IF COALESCE(p_earnest_deposit, 0) != 0 THEN
    v_roi := (v_net_profit / COALESCE(p_earnest_deposit, 1)) * 100;
  ELSE
    v_roi := 0;
  END IF;
  
  -- ===== CÁLCULO 9: PROFIT MARGIN (%) =====
  -- Margin = (Gross Profit / Sale Price) × 100
  IF COALESCE(p_arv, 0) != 0 THEN
    v_margin := (v_gross_profit / COALESCE(p_arv, 1)) * 100;
  ELSE
    v_margin := 0;
  END IF;
  
  -- ===== RETURN RESULTS =====
  RETURN QUERY SELECT
    v_total_cost,
    v_calculated_interest,
    v_contingency,
    v_realtor_commission,
    v_net_proceeds,
    v_gross_profit,
    v_net_profit,
    v_roi,
    v_margin;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RPC 2: get_flip_analyses_history(project_id)
-- Purpose: Obtener historial de análisis de un proyecto (v1, v2, v3...)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_flip_analyses_history(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  version INT,
  analysis_date DATE,
  purchase_price DECIMAL,
  arv DECIMAL,
  total_all_in_cost DECIMAL,
  net_profit DECIMAL,
  roi_percent DECIMAL,
  status TEXT,
  created_at TIMESTAMP
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fa.id,
    fa.version,
    fa.analysis_date,
    fa.purchase_price,
    fa.arv,
    fa.total_all_in_cost,
    fa.net_profit,
    fa.roi_percent,
    fa.status,
    fa.created_at
  FROM flip_analyses fa
  WHERE fa.project_id = p_project_id
  ORDER BY fa.version DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RPC 3: get_investor_capital_summary(project_id, investor_id)
-- Purpose: Resumen de capital aportado por un inversionista en un proyecto
-- ============================================================================

CREATE OR REPLACE FUNCTION get_investor_capital_summary(
  p_project_id UUID,
  p_investor_id UUID
)
RETURNS TABLE (
  investor_name TEXT,
  total_contributed DECIMAL,
  contribution_count INT,
  ownership_percent DECIMAL,
  profit_split_percent DECIMAL,
  status TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.name,
    COALESCE(SUM(cc.amount), 0::DECIMAL),
    COUNT(cc.id)::INT,
    pi.ownership_percentage,
    pi.profit_split_percentage,
    pi.status
  FROM investors i
  LEFT JOIN project_investors pi ON i.id = pi.investor_id AND pi.project_id = p_project_id
  LEFT JOIN capital_contributions cc ON pi.id = cc.project_investor_id
  WHERE i.id = p_investor_id
  GROUP BY i.id, i.name, pi.id, pi.ownership_percentage, pi.profit_split_percentage, pi.status;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RPC 4: get_project_investor_summary(project_id)
-- Purpose: Resumen de TODOS los inversores en un proyecto con su capital total
-- ============================================================================

CREATE OR REPLACE FUNCTION get_project_investor_summary(p_project_id UUID)
RETURNS TABLE (
  investor_name TEXT,
  investor_id UUID,
  role TEXT,
  ownership_percent DECIMAL,
  profit_split_percent DECIMAL,
  total_capital DECIMAL,
  contribution_count INT,
  status TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.name,
    i.id,
    pi.role,
    pi.ownership_percentage,
    pi.profit_split_percentage,
    COALESCE(SUM(cc.amount), 0::DECIMAL),
    COUNT(cc.id)::INT,
    pi.status
  FROM project_investors pi
  JOIN investors i ON pi.investor_id = i.id
  LEFT JOIN capital_contributions cc ON pi.id = cc.project_investor_id
  WHERE pi.project_id = p_project_id
  GROUP BY i.id, i.name, pi.id, pi.role, pi.ownership_percentage, pi.profit_split_percentage, pi.status
  ORDER BY pi.ownership_percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFY: Asegúrate de que projects existe (necesaria para FKs)
-- ============================================================================

-- Si projects table no existe, este será el punto de falla
-- Asume que projects ya existe en Phase 1

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

-- Phase 2B schema deployed successfully!
-- Tables: investors, investor_companies, project_investors, capital_contributions, flip_analyses
-- RPCs: calculate_flip_analysis, get_flip_analyses_history, get_investor_capital_summary, get_project_investor_summary
