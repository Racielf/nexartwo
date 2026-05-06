-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 009: Vista pública reducida `project_status_summary`
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Esta vista expone datos seguros para roles field_user y viewer.
--     No contiene KPIs financieros internos (profit, cost_basis, etc.)
-- ============================================================

CREATE OR REPLACE VIEW project_status_summary AS
SELECT
  p.id                                           AS project_id,
  p.name,
  p.address,
  p.status,
  p.property_type,
  -- Conteo de gastos (sin montos sensibles)
  COUNT(DISTINCT e.id)                           AS expense_count,
  COUNT(DISTINCT r.id)                           AS refund_count,
  -- Solo montos agregados aprobados, no desglosados por KPI
  COALESCE(SUM(e.amount) FILTER (WHERE e.status = 'approved'), 0) AS total_approved_expenses,
  COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'approved'), 0) AS total_approved_refunds,
  -- Fecha de actividad reciente
  MAX(GREATEST(
    COALESCE(e.created_at, '1970-01-01'),
    COALESCE(r.created_at, '1970-01-01')
  ))                                             AS last_activity
FROM projects p
LEFT JOIN project_expenses e ON e.project_id = p.id
LEFT JOIN project_refunds r  ON r.project_id = p.id
GROUP BY p.id, p.name, p.address, p.status, p.property_type;

-- Esta vista NO incluye:
-- profit, cost_basis, cash_invested, net_expense_cost,
-- total_disbursements, project_cash_position, net_proceeds,
-- purchase_price, down_payment ni ningún KPI de P&L.
