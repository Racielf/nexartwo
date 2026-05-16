# PHASE 2B — Investor Entities + Capital Contributions
**Especificación Detallada**  
**Proyecto:** NexArtWO  
**Fase:** 2B (Septiembre 2026)  
**Estado:** SPECIFICATION

---

## 🎯 OBJETIVO

Registrar inversionistas, empresas, participación en proyectos, y aportes de capital. Establecer la base para cálculos de ROI y distribución de ganancias.

---

## 📊 TABLAS A CREAR

### 1️⃣ TABLA: `investors`

**Propósito:** Registrar personas o entidades que invierten.

```sql
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identidad
  name TEXT NOT NULL,                    -- "Rodolfo Fernandez" o "John Doe"
  type TEXT NOT NULL,                    -- 'person' | 'company'
  
  -- Contacto
  email TEXT,
  phone TEXT,
  
  -- Información tax/legal
  tax_id TEXT,                          -- EIN (empresa) o SSN (persona)
  tax_notes TEXT,                       -- Notas para accountant
  
  -- Estado
  status TEXT DEFAULT 'active',         -- 'active' | 'inactive'
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Índices:**
```sql
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_investors_status ON investors(status);
```

---

### 2️⃣ TABLA: `investor_companies`

**Propósito:** Registrar empresas de inversión (R.C Art Construction LLC, Blue Sky Properties, etc).

```sql
CREATE TABLE investor_companies (
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
```

---

### 3️⃣ TABLA: `project_investors`

**Propósito:** Unir inversionistas con proyectos (quién invierte en cuál proyecto).

```sql
CREATE TABLE project_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  
  -- Rol y participación
  role TEXT NOT NULL,                   -- 'investor' | 'owner' | 'manager'
  ownership_percentage DECIMAL(5,2),    -- 25.00, 50.00, 100.00
  profit_split_percentage DECIMAL(5,2), -- % de ganancias que recibe
  
  -- Estatus
  status TEXT DEFAULT 'active',         -- 'active' | 'inactive' | 'exited'
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(project_id, investor_id)
);
```

**Índices:**
```sql
CREATE INDEX idx_project_investors_project ON project_investors(project_id);
CREATE INDEX idx_project_investors_investor ON project_investors(investor_id);
```

---

### 4️⃣ TABLA: `capital_contributions`

**Propósito:** Registrar dinero aportado por inversionistas.

```sql
CREATE TABLE capital_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_investor_id UUID NOT NULL REFERENCES project_investors(id) ON DELETE CASCADE,
  
  -- Fondos
  amount DECIMAL(12,2) NOT NULL,        -- $6,600, $10,000, etc
  contribution_date DATE NOT NULL,      -- Cuándo se depositó
  
  -- Tipo
  contribution_type TEXT NOT NULL,      -- 'initial' | 'mid-project' | 'closing'
  
  -- Evidencia
  reference TEXT,                       -- "Cheque #12345", "Wire XXX"
  notes TEXT,
  
  -- Estado
  status TEXT DEFAULT 'received',       -- 'pending' | 'received' | 'refunded'
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Índices:**
```sql
CREATE INDEX idx_capital_project ON capital_contributions(project_id);
CREATE INDEX idx_capital_investor ON capital_contributions(project_investor_id);
```

---

### 5️⃣ TABLA: `flip_analyses`

**Propósito:** Guardar versiones del análisis de flip (propuesta inicial, actualizaciones, final).

```sql
CREATE TABLE flip_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Versioning
  version INT NOT NULL DEFAULT 1,       -- v1, v2, v3...
  analysis_date DATE NOT NULL,
  
  -- ACQUISITION
  purchase_price DECIMAL(12,2),
  earnest_deposit DECIMAL(12,2),
  closing_costs_entry DECIMAL(12,2),
  
  -- HARD MONEY LOAN
  loan_amount DECIMAL(12,2),
  loan_rate_annual DECIMAL(4,2),        -- 10.00 (10%)
  loan_months INT,                      -- 6, 12, etc
  calculated_interest DECIMAL(12,2),
  
  -- HOLDING
  property_taxes_6m DECIMAL(12,2),
  insurance_6m DECIMAL(12,2),
  
  -- REHAB
  estimated_repairs DECIMAL(12,2),
  contingency_percent DECIMAL(4,2),     -- 10.00 (10%)
  
  -- SALE
  arv DECIMAL(12,2),                    -- After Repair Value
  realtor_commission_percent DECIMAL(4,2),  -- 5.50 (5.5%)
  title_escrow_exit DECIMAL(12,2),
  
  -- CALCULATED FIELDS
  total_all_in_cost DECIMAL(12,2),
  realtor_commission DECIMAL(12,2),
  net_proceeds DECIMAL(12,2),
  gross_profit DECIMAL(12,2),
  net_profit DECIMAL(12,2),
  roi_percent DECIMAL(6,2),             -- 320.00 (320%)
  profit_margin DECIMAL(5,2),
  
  -- Status
  status TEXT DEFAULT 'draft',          -- 'draft' | 'submitted' | 'approved' | 'final'
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Índices:**
```sql
CREATE INDEX idx_flip_analyses_project ON flip_analyses(project_id);
CREATE INDEX idx_flip_analyses_version ON flip_analyses(project_id, version);
```

---

## 🧮 CÁLCULOS (RPCs en Supabase)

### RPC 1: `calculate_flip_analysis()`

**Propósito:** Recalcular todo el análisis de flip basado en inputs.

```sql
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
  -- Calculo de interés
  v_calculated_interest := p_loan_amount * (p_loan_rate_annual / 100) * (p_loan_months / 12.0);
  
  -- Contingency (10% de repairs)
  v_contingency := p_estimated_repairs * (p_contingency_percent / 100);
  
  -- Comisión realtor
  v_realtor_commission := p_arv * (p_realtor_commission_percent / 100);
  
  -- TOTAL ALL-IN COST
  v_total_cost := p_purchase_price 
                + p_earnest_deposit
                + p_closing_costs_entry
                + v_calculated_interest
                + p_property_taxes_6m
                + p_insurance_6m
                + p_estimated_repairs
                + v_contingency
                + p_title_escrow_exit;
  
  -- NET PROCEEDS (sale price - comisión)
  v_net_proceeds := p_arv - v_realtor_commission;
  
  -- GROSS PROFIT
  v_gross_profit := v_net_proceeds - v_total_cost;
  
  -- NET PROFIT (gross - earnest deposit investor)
  v_net_profit := v_gross_profit - p_earnest_deposit;
  
  -- ROI (net profit / earnest deposit)
  IF p_earnest_deposit != 0 THEN
    v_roi := (v_net_profit / p_earnest_deposit) * 100;
  ELSE
    v_roi := 0;
  END IF;
  
  -- PROFIT MARGIN (gross / sale price)
  IF p_arv != 0 THEN
    v_margin := (v_gross_profit / p_arv) * 100;
  ELSE
    v_margin := 0;
  END IF;
  
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
```

---

### RPC 2: `get_flip_analysis_history(project_id)`

**Propósito:** Obtener historial de análisis de un proyecto (v1, v2, v3...).

```sql
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
```

---

### RPC 3: `get_investor_capital_summary(project_id, investor_id)`

**Propósito:** Resumen de capital aportado por un inversionista en un proyecto.

```sql
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
    COALESCE(SUM(cc.amount), 0),
    COUNT(cc.id),
    pi.ownership_percentage,
    pi.profit_split_percentage,
    pi.status
  FROM investors i
  LEFT JOIN project_investors pi ON i.id = pi.investor_id
  LEFT JOIN capital_contributions cc ON pi.id = cc.project_investor_id
  WHERE pi.project_id = p_project_id
    AND i.id = p_investor_id
  GROUP BY i.id, i.name, pi.id, pi.ownership_percentage, pi.profit_split_percentage, pi.status;
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 EJEMPLOS DE DATOS

### Ejemplo 1: Proyecto Gresham (2906 SE 182nd Ave)

**Investors:**
```
ID: inv-001
Name: Rodolfo Fernandez
Type: person
Email: rcartconstruction@gmail.com
```

**Project Investors:**
```
Project: gresham-2906
Investor: inv-001
Role: owner
Ownership: 100%
Profit Split: 100%
```

**Capital Contributions:**
```
Amount: $6,600
Type: initial
Date: 2026-05-15
Status: received
```

**Flip Analysis v1:**
```
Version: 1
Analysis Date: 2026-05-11
Status: submitted

Purchase Price: $330,000
Earnest Deposit: $6,600
Closing Costs Entry: $6,500
Loan Amount: $323,400
Loan Rate: 10.00%
Loan Months: 6
Calculated Interest: $16,170
Property Taxes (6m): $1,250
Insurance (6m): $1,200
Estimated Repairs: $30,350
Contingency (10%): $3,035
ARV: $450,000
Realtor Commission %: 5.50%
Realtor Commission: $24,750
Title Escrow Exit: $9,000

CALCULATED:
Total All-In Cost: $397,505
Net Proceeds: $425,250
Gross Profit: $27,745
Net Profit: $21,145
ROI: 320.00%
Profit Margin: 4.70%
```

---

## 🔄 FLUJO DE USO

### PASO 1: Registrar Inversionista
```
User: Owner
Action: Crear investor
Data: Nombre, email, tipo (person/company)
Result: investor_id creado
```

### PASO 2: Asignar a Proyecto
```
User: Owner
Action: Agregar investor a project
Data: project_id, investor_id, rol, ownership%, profit_split%
Result: project_investor_id creado
```

### PASO 3: Registrar Aporte de Capital
```
User: Owner
Action: Registrar capital contribution
Data: Monto, fecha, tipo (initial/mid-project/closing)
Result: capital_contributions entry creado
```

### PASO 4: Crear Análisis de Flip
```
User: Owner
Action: Proponer flip analysis
Data: Purchase price, loan terms, repairs, ARV, etc
Trigger: RPC calculate_flip_analysis()
Result: flip_analyses v1 guardado
```

### PASO 5: Actualizar Análisis
```
User: Owner
Action: Crear nueva versión (mes 3)
Data: Actualizar repairs, ARV, etc
Trigger: RPC calculate_flip_analysis()
Result: flip_analyses v2 guardado
```

---

## 🔐 VALIDACIONES

### Capital Contribution
- ✅ amount > 0
- ✅ contribution_date <= TODAY
- ✅ project_investor_id válido
- ✅ Status in ('pending', 'received', 'refunded')

### Flip Analysis
- ✅ purchase_price > 0
- ✅ loan_amount > 0
- ✅ arv > purchase_price
- ✅ loan_months > 0
- ✅ Cálculos consisten

### Project Investors
- ✅ ownership_percentage > 0
- ✅ profit_split_percentage > 0
- ✅ UNIQUE(project_id, investor_id)

---

## 📊 QUERIES COMUNES

### Query 1: Capital Total del Proyecto
```sql
SELECT 
  p.name,
  SUM(cc.amount) as total_capital,
  COUNT(DISTINCT pi.investor_id) as investor_count
FROM projects p
LEFT JOIN project_investors pi ON p.id = pi.project_id
LEFT JOIN capital_contributions cc ON pi.id = cc.project_investor_id
WHERE p.id = ?
GROUP BY p.id, p.name;
```

### Query 2: Últimas Versiones de Análisis
```sql
SELECT DISTINCT ON (project_id)
  id, project_id, version, analysis_date, net_profit, roi_percent
FROM flip_analyses
ORDER BY project_id, version DESC;
```

### Query 3: Resumen de Inversiones por Investor
```sql
SELECT 
  i.name,
  p.name as project,
  pi.ownership_percentage,
  SUM(cc.amount) as total_contributed
FROM investors i
JOIN project_investors pi ON i.id = pi.investor_id
JOIN projects p ON pi.project_id = p.id
LEFT JOIN capital_contributions cc ON pi.id = cc.project_investor_id
GROUP BY i.id, i.name, p.id, p.name, pi.ownership_percentage;
```

---

## ✅ CRITERIA DE ÉXITO PARA PHASE 2B

Fase 2B es exitosa cuando:

✅ **Schema Implementado**
- [ ] Todas 5 tablas creadas en Supabase
- [ ] Índices creados
- [ ] Foreign keys funcionando
- [ ] Constraints validando

✅ **RPCs Funcionando**
- [ ] calculate_flip_analysis() retorna cálculos correctos
- [ ] get_flip_analyses_history() retorna versiones en orden
- [ ] get_investor_capital_summary() retorna datos correctos

✅ **Data Integridad**
- [ ] No hay huérfanos (investor sin project_investor)
- [ ] Cálculos son consistentes
- [ ] Auditoría (created_at, updated_at) funciona

✅ **Testing**
- [ ] Test project con datos reales (Gresham)
- [ ] Test con múltiples inversores
- [ ] Test cambios de versión
- [ ] Test validaciones

---

## 🚀 SIGUIENTE FASE

Cuando Phase 2B esté completado:

→ **Phase 2C: Lender + Acquisition + Closing Records**

Qué se agrega:
- Tablas de lender (hard money)
- Closing statement
- Title company
- Realtor parties

---

## 📌 NOTAS

1. **Confidencialidad:** Investor Hub es sensible financieramente. Activar Auth/RLS en Phase I.
2. **Auditoría:** Todas las transacciones se registran (created_at, updated_at).
3. **Historial:** flip_analyses guarda versiones (v1, v2, v3) para tracking de cambios.
4. **Cálculos:** RPCs en PostgreSQL aseguran precisión matemática.

---

**PHASE 2B READY FOR IMPLEMENTATION**  
**Próximo paso:** Crear SQL y deployar en Supabase
