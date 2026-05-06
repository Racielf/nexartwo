-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 007: Políticas RLS para `project_disbursements`
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Requiere migración 004 aplicada.
--     DECISIÓN ABIERTA: ¿Puede un admin marcar status = 'paid'?
--     Plan actual: solo owner. Confirmar con Owner antes de activar.
-- ============================================================

DROP POLICY IF EXISTS "Allow all disbursements" ON project_disbursements;

-- SELECT: solo owner y admin ven los desembolsos
-- Los desembolsos son salidas de caja sensibles, no visibles para field_user ni viewer
CREATE POLICY "disbursements_select" ON project_disbursements
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
  );

-- INSERT: owner y admin pueden crear desembolsos
CREATE POLICY "disbursements_insert" ON project_disbursements
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: lógica de aprobación separada por role
-- owner puede cambiar a cualquier status permitido (approved, paid, cancelled)
-- admin puede cambiar a approved o cancelled, pero NO a paid
-- La separación owner vs admin en UPDATE se refuerza opcionalmente con un trigger
-- (ya que RLS no filtra por columna de destino, solo por fila)
CREATE POLICY "disbursements_update" ON project_disbursements
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- Trigger adicional recomendado para bloquear a admin en la transición a 'paid':
-- CREATE OR REPLACE FUNCTION restrict_paid_to_owner()
-- RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- BEGIN
--   IF NEW.status = 'paid' AND auth_role() != 'owner' THEN
--     RAISE EXCEPTION 'Only owner can mark disbursements as paid';
--   END IF;
--   RETURN NEW;
-- END $$;
--
-- CREATE TRIGGER enforce_paid_owner_only
-- BEFORE UPDATE ON project_disbursements
-- FOR EACH ROW EXECUTE FUNCTION restrict_paid_to_owner();

-- DELETE: bloqueado por trigger + ausencia de policy DELETE
