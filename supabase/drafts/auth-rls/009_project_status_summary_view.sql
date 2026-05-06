-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 009: Vista operativa `project_status_summary`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migración 008 aplicada primero.
--
-- ESTRATEGIA ACTUAL: Opción B — Acceso restringido (owner/admin only)
--
-- MOTIVO:
-- GRANT SELECT a todos los usuarios autenticados expondría metadata
-- de proyectos a cualquier field_user o viewer, incluyendo proyectos
-- a los que no están asignados. Sin una tabla `project_assignments`
-- (o mecanismo equivalente de scope por proyecto), no es posible
-- filtrar correctamente qué proyectos puede ver cada field_user.
--
-- DECISIÓN: field_user y viewer quedan sin superficie de proyectos
-- hasta que exista `project_assignments` o una lógica de scope segura.
-- Esta restricción se levantará en una migración futura (010+).
--
-- CAMPOS EXPLÍCITAMENTE EXCLUIDOS DE ESTA VISTA (ninguno debe agregarse):
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
-- PERMISOS: Opción B — Acceso inicial solo para owner/admin
-- ============================================================

-- Bloquear acceso anónimo
REVOKE SELECT ON project_status_summary FROM anon;

-- Bloquear acceso genérico a todos los autenticados
-- (evita exposición de proyectos a roles sin scope definido)
REVOKE SELECT ON project_status_summary FROM authenticated;

-- Acceso via RPC segura: solo owner/admin por ahora
CREATE OR REPLACE FUNCTION get_project_status_summary()
RETURNS SETOF project_status_summary
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_status_summary
  WHERE auth_role() IN ('owner', 'admin');
$$;

GRANT EXECUTE ON FUNCTION get_project_status_summary() TO authenticated;

-- ============================================================
-- MIGRACIÓN FUTURA (010+): Cuando exista project_assignments
-- ============================================================
-- Una vez que se implemente la tabla project_assignments
-- (que mapea qué proyectos puede ver cada user_id), esta función
-- se puede actualizar para que field_user y viewer vean
-- únicamente sus proyectos asignados:
--
-- CREATE OR REPLACE FUNCTION get_project_status_summary()
-- RETURNS SETOF project_status_summary
-- LANGUAGE sql STABLE SECURITY DEFINER
-- SET search_path = public, pg_temp
-- AS $$
--   SELECT pss.*
--   FROM project_status_summary pss
--   WHERE auth_role() IN ('owner', 'admin')
--     OR EXISTS (
--       SELECT 1 FROM project_assignments pa
--       WHERE pa.project_id = pss.project_id
--         AND pa.user_id = auth.uid()
--     );
-- $$;
-- ============================================================
