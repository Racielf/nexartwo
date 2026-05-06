-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 009: Vista operativa segura `project_status_summary`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migración 008 aplicada primero.
--
-- PROPÓSITO:
-- Esta vista es la ÚNICA superficie de datos permitida para field_user y viewer.
-- Expone solo metadata operativa del proyecto, sin ningún dato financiero.
--
-- CAMPOS EXPLÍCITAMENTE EXCLUIDOS (nunca deben aparecer aquí):
--   profit, cost_basis, cash_invested, net_expense_cost,
--   total_disbursements, project_cash_position, net_proceeds,
--   purchase_price, down_payment, amount (de expenses/refunds)
-- ============================================================

CREATE OR REPLACE VIEW project_status_summary AS
SELECT
  p.id             AS project_id,
  p.name,
  p.address,
  p.status,
  p.property_type,
  -- Solo conteos operativos, sin montos monetarios
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

-- ============================================================
-- PERMISOS EXPLÍCITOS
-- ============================================================

-- Bloquear acceso anónimo (usuarios no autenticados)
REVOKE SELECT ON project_status_summary FROM anon;

-- Otorgar acceso a todos los usuarios autenticados.
-- Las policies de RLS de las tablas base filtran qué filas
-- puede ver cada rol (field_user no ve proyectos de otros, etc.)
GRANT SELECT ON project_status_summary TO authenticated;

-- ============================================================
-- VERIFICACIÓN POST-ACTIVACIÓN:
-- Como field_user autenticado:
--   SELECT project_id, name, status FROM project_status_summary;
--   → debe retornar filas SIN montos financieros
--
-- Intentar acceder a columnas financieras:
--   SELECT profit FROM project_status_summary;
--   → debe fallar (columna no existe en la vista)
-- ============================================================
