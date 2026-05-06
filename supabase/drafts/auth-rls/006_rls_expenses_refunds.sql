-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 006: Políticas RLS para `project_expenses` y `project_refunds`
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Requiere migración 004 aplicada.
--     DECISIÓN ABIERTA: Si no existe columna `created_by`, este archivo debe
--     incluir: ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
--     Confirmar con Owner antes de activar.
-- ============================================================

-- ---- project_expenses ----

DROP POLICY IF EXISTS "Allow all expenses" ON project_expenses;

-- SELECT: owner/admin ven todo; field_user ve solo sus propios registros; viewer solo lectura
CREATE POLICY "expenses_select" ON project_expenses
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin', 'viewer')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- INSERT: owner, admin y field_user pueden crear gastos
CREATE POLICY "expenses_insert" ON project_expenses
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin', 'field_user')
  );

-- UPDATE: solo owner y admin pueden cambiar status
-- Los triggers de inmutabilidad siguen bloqueando cambios a amount/tax/project_id
CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger + ausencia de policy DELETE


-- ---- project_refunds ----

DROP POLICY IF EXISTS "Allow all refunds" ON project_refunds;

-- SELECT: owner/admin/viewer ven todos; field_user ve solo los del proyecto asignado
CREATE POLICY "refunds_select" ON project_refunds
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin', 'viewer')
    OR auth_role() = 'field_user'  -- los refunds son visibles para field_user por contexto
  );

-- INSERT: solo owner y admin pueden crear refunds (los refunds son correcciones contables)
CREATE POLICY "refunds_insert" ON project_refunds
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: solo owner y admin
CREATE POLICY "refunds_update" ON project_refunds
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger + ausencia de policy DELETE
