-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 007: Políticas RLS para `project_disbursements`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere 004a + 004b aplicados y owner verificado.
--     DECISIÓN CONFIRMADA: Solo owner puede marcar status = 'paid'.
-- ============================================================

-- Eliminar policies MVP activas (nombres exactos del SQL 003)
DROP POLICY IF EXISTS "Allow select project_disbursements" ON project_disbursements;
DROP POLICY IF EXISTS "Allow insert project_disbursements" ON project_disbursements;
DROP POLICY IF EXISTS "Allow update project_disbursements" ON project_disbursements;

-- Idempotencia: eliminar policies nuevas si existen
DROP POLICY IF EXISTS "disbursements_select" ON project_disbursements;
DROP POLICY IF EXISTS "disbursements_insert" ON project_disbursements;
DROP POLICY IF EXISTS "disbursements_update" ON project_disbursements;

-- SELECT: solo owner y admin ven desembolsos.
-- Son salidas de caja reales. field_user y viewer no tienen acceso.
CREATE POLICY "disbursements_select" ON project_disbursements
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
  );

-- INSERT: owner y admin pueden crear desembolsos
CREATE POLICY "disbursements_insert" ON project_disbursements
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: owner y admin pueden actualizar.
-- Restricción de 'paid' solo para owner se implementa en el trigger.
CREATE POLICY "disbursements_update" ON project_disbursements
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger prevent_financial_delete + ausencia de policy DELETE.

-- ============================================================
-- TRIGGER: Restringir transición a 'paid' solo al owner
-- ============================================================

-- Idempotencia: eliminar trigger previo si existe
DROP TRIGGER IF EXISTS trg_restrict_paid_to_owner ON project_disbursements;

CREATE OR REPLACE FUNCTION prevent_non_owner_paid_disbursement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    IF auth_role() != 'owner' THEN
      RAISE EXCEPTION 'Solo el owner puede marcar un desembolso como paid.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restrict_paid_to_owner
BEFORE UPDATE ON project_disbursements
FOR EACH ROW EXECUTE FUNCTION prevent_non_owner_paid_disbursement();
