-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 006: Políticas RLS para `project_expenses` y `project_refunds`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migración 004 aplicada primero.
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columna created_by (si no existe)
-- Necesaria para que field_user filtre solo sus propios registros.
-- ADD COLUMN IF NOT EXISTS = no destructivo.
-- ============================================================
ALTER TABLE project_expenses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE project_expenses
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- NOTA: project_refunds son correcciones contables internas (admin/owner).
-- No se agrega created_by a refunds — no hay caso de uso para field_user creando refunds.
--
-- project_disbursements: considerar approved_by_user_id en una migración futura (010+)
-- para auditoría de quién aprobó cada desembolso. NO incluir en esta fase.

-- ============================================================
-- PASO 2: Eliminar policies MVP activas (nombres exactos del SQL 003)
-- ============================================================
DROP POLICY IF EXISTS "Allow select project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow insert project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow update project_expenses" ON project_expenses;

DROP POLICY IF EXISTS "Allow select project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow insert project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow update project_refunds" ON project_refunds;

-- ============================================================
-- PASO 3: Nuevas policies granulares — project_expenses
-- ============================================================

-- SELECT: owner/admin/viewer ven todos; field_user solo los suyos
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
-- Los triggers del SQL base (trg_no_update_expenses) siguen bloqueando cambios a amount/tax/vendor/etc.
CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger prevent_financial_delete + ausencia de policy DELETE.

-- ============================================================
-- PASO 4: Nuevas policies granulares — project_refunds
-- ============================================================

-- SELECT: owner/admin/viewer ven todos; field_user ve todos los del sistema (contexto de proyecto)
CREATE POLICY "refunds_select" ON project_refunds
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin', 'field_user', 'viewer')
  );

-- INSERT: solo owner y admin crean refunds (son correcciones contables)
CREATE POLICY "refunds_insert" ON project_refunds
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: solo owner y admin
CREATE POLICY "refunds_update" ON project_refunds
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger prevent_financial_delete + ausencia de policy DELETE.
