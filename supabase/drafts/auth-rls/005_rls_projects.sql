-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 005: Políticas RLS para tabla `projects`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migración 004 aplicada primero (is_owner, auth_role).
-- ============================================================

-- Eliminar policies MVP actuales (nombres exactos del SQL activo 003)
DROP POLICY IF EXISTS "Allow select projects" ON projects;
DROP POLICY IF EXISTS "Allow insert projects" ON projects;
DROP POLICY IF EXISTS "Allow update projects" ON projects;

-- ============================================================
-- SELECT: SOLO owner y admin tienen SELECT directo en `projects`.
-- MOTIVO: RLS no oculta columnas. Si field_user/viewer pudieran
-- hacer SELECT en projects, verían purchase_price, down_payment
-- y otros campos financieros sensibles.
-- field_user y viewer deben usar project_status_summary (migración 009).
-- ============================================================
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
  );

-- INSERT: solo owner y admin pueden crear proyectos
CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: owner y admin pueden actualizar filas.
-- La restricción de columnas financieras (solo owner) se implementa
-- mediante el trigger a continuación — RLS no puede limitar columnas.
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: no se crea policy — ausencia de policy bloquea por defecto con RLS activo.

-- ============================================================
-- TRIGGER: Protección de campos financieros en `projects`
-- Solo owner puede modificar campos financieros.
-- Admin solo puede cambiar `status` y campos operativos.
-- Activar junto con esta migración.
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_non_owner_project_financial_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth_role() != 'owner' THEN
    IF (OLD.purchase_price           IS DISTINCT FROM NEW.purchase_price)           OR
       (OLD.down_payment             IS DISTINCT FROM NEW.down_payment)             OR
       (OLD.loan_amount              IS DISTINCT FROM NEW.loan_amount)              OR
       (OLD.realtor_fee              IS DISTINCT FROM NEW.realtor_fee)              OR
       (OLD.title_company_fee        IS DISTINCT FROM NEW.title_company_fee)        OR
       (OLD.closing_costs            IS DISTINCT FROM NEW.closing_costs)            OR
       (OLD.inspection_fee           IS DISTINCT FROM NEW.inspection_fee)           OR
       (OLD.insurance                IS DISTINCT FROM NEW.insurance)                OR
       (OLD.sale_price               IS DISTINCT FROM NEW.sale_price)               OR
       (OLD.selling_agent_commission IS DISTINCT FROM NEW.selling_agent_commission) OR
       (OLD.seller_closing_costs     IS DISTINCT FROM NEW.seller_closing_costs)
    THEN
      RAISE EXCEPTION 'Solo el owner puede modificar campos financieros de un proyecto.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_project_financials
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION prevent_non_owner_project_financial_update();
