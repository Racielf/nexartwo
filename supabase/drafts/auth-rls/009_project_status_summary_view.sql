-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 009: Vista pública reducida `project_status_summary`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--
-- Esta vista expone datos operativos seguros para field_user y viewer.
-- NO contiene KPIs financieros internos ni montos monetarios.
-- ============================================================

CREATE OR REPLACE VIEW project_status_summary AS
SELECT
  p.id             AS project_id,
  p.name,
  p.address,
  p.status,
  p.property_type,
  -- Solo conteos, sin montos — no expone datos financieros sensibles
  COUNT(DISTINCT e.id) AS expense_count,
  COUNT(DISTINCT r.id) AS refund_count,
  -- Fecha de actividad más reciente del proyecto
  MAX(GREATEST(
    COALESCE(e.created_at, '1970-01-01'::timestamptz),
    COALESCE(r.created_at, '1970-01-01'::timestamptz)
  )) AS last_activity
FROM projects p
LEFT JOIN project_expenses e ON e.project_id = p.id
LEFT JOIN project_refunds  r ON r.project_id = p.id
GROUP BY p.id, p.name, p.address, p.status, p.property_type;

-- Esta vista NO incluye:
-- profit, cost_basis, cash_invested, net_expense_cost,
-- total_disbursements, project_cash_position, net_proceeds,
-- total_approved_expenses, total_approved_refunds (montos internos),
-- purchase_price, down_payment ni ningún KPI de P&L.

-- Acceso: todos los roles autenticados pueden consultar esta vista.
-- GRANT SELECT ON project_status_summary TO authenticated;
