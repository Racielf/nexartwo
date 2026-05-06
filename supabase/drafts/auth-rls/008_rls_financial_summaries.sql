-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 008: Protección fuerte de `project_financial_summaries`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migraciones 004-007 aplicadas primero.
--
-- CAMPOS PROHIBIDOS para field_user / viewer (nunca deben verlos):
--   profit, cost_basis, cash_invested, net_expense_cost,
--   total_disbursements, project_cash_position, net_proceeds,
--   purchase_price, down_payment
-- ============================================================

-- ============================================================
-- ESTRATEGIA: REVOKE total + acceso via RPC gated con auth_role()
-- No se confía únicamente en security_invoker porque la vista
-- puede ser consultada directamente desde cualquier cliente SQL.
-- ============================================================

-- PASO 1: Revocar acceso directo a la vista para todos los roles de DB
REVOKE SELECT ON project_financial_summaries FROM anon;
REVOKE SELECT ON project_financial_summaries FROM authenticated;

-- PASO 2: Crear RPC segura que actúa como gateway de acceso.
-- Solo owner y admin pueden invocarla.
-- SECURITY DEFINER + search_path aseguran que la función corra
-- con privilegios del creador y no sea inyectable.
CREATE OR REPLACE FUNCTION get_project_financial_summary(p_project_id TEXT)
RETURNS SETOF project_financial_summaries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_financial_summaries
  WHERE project_id = p_project_id
    AND auth_role() IN ('owner', 'admin');
$$;

-- Otorgar EXECUTE solo a authenticated (el auth_role check interno
-- bloquea a field_user y viewer aunque invoquen la función)
GRANT EXECUTE ON FUNCTION get_project_financial_summary(TEXT) TO authenticated;

-- PASO 3: Para listado de todos los proyectos financieros (solo owner/admin)
CREATE OR REPLACE FUNCTION get_all_financial_summaries()
RETURNS SETOF project_financial_summaries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_financial_summaries
  WHERE auth_role() IN ('owner', 'admin');
$$;

GRANT EXECUTE ON FUNCTION get_all_financial_summaries() TO authenticated;

-- ============================================================
-- RESULTADO ESPERADO:
-- owner/admin   → invocan get_project_financial_summary() o get_all_financial_summaries() → ven datos
-- field_user    → invocan función → retorna 0 filas (auth_role() no es owner/admin)
-- viewer        → invocan función → retorna 0 filas
-- Cualquier rol → SELECT directo en project_financial_summaries → error de permisos (REVOKE)
-- ============================================================

-- NOTA: El frontend Vanilla JS deberá llamar a estas RPCs mediante:
-- supabase.rpc('get_project_financial_summary', { p_project_id: id })
-- en lugar de un SELECT directo a la vista.
-- Este cambio en js/supabase.js se realizará en la Fase de Activación,
-- DESPUÉS del PASS del workflow, NO en esta fase de draft.
