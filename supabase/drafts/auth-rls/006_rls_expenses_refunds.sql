-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 006: Políticas RLS para `project_expenses` y `project_refunds`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere migración 004 aplicada primero (is_owner, auth_role).
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columna created_by a project_expenses
-- Necesaria para que field_user filtre solo sus propios registros.
-- ADD COLUMN IF NOT EXISTS = no destructivo en datos existentes.
-- ============================================================
ALTER TABLE project_expenses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE project_expenses
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- NOTA DE ALCANCE:
-- project_refunds: correcciones contables internas. Solo owner/admin crean y ven refunds.
--   No se agrega created_by — el concepto de "mi refund" no aplica para field_user.
-- project_disbursements: campo approved_by_user_id se considera para auditoría futura
--   (migración 010+). No incluir en esta fase.

-- ============================================================
-- PASO 2: Eliminar policies MVP activas (nombres exactos del SQL 003)
-- ============================================================
DROP POLICY IF EXISTS "Allow select project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow insert project_expenses"  ON project_expenses;
DROP POLICY IF EXISTS "Allow update project_expenses"  ON project_expenses;

DROP POLICY IF EXISTS "Allow select project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow insert project_refunds"  ON project_refunds;
DROP POLICY IF EXISTS "Allow update project_refunds"  ON project_refunds;

-- ============================================================
-- PASO 3: Nuevas policies — project_expenses
-- ============================================================

-- SELECT: owner y admin ven todos.
-- field_user ve SOLO los expenses que él mismo creó (via created_by).
-- viewer NO tiene acceso directo — los expenses contienen amount (dato financiero).
-- NOTA: Si se decide en el futuro dar acceso a viewer, agregar aquí.
CREATE POLICY "expenses_select" ON project_expenses
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- INSERT: owner y admin pueden insertar libremente.
-- field_user solo puede insertar si created_by = auth.uid() (enforced en policy).
-- DEFAULT auth.uid() ayuda, pero la policy lo garantiza explícitamente.
CREATE POLICY "expenses_insert" ON project_expenses
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- UPDATE: solo owner y admin pueden cambiar status.
-- Los triggers del SQL base (trg_no_update_expenses) bloquean cambios a
-- amount, tax, vendor, project_id, receipt_date.
CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger prevent_financial_delete + ausencia de policy DELETE.

-- ============================================================
-- PASO 4: Nuevas policies — project_refunds
-- ============================================================

-- SELECT: solo owner y admin.
-- Los refunds contienen `amount` (dato financiero interno).
-- field_user no tiene acceso directo. Usa project_status_summary para conteos.
-- viewer: si el viewer es un contador interno, el Owner puede decidir añadirlo aquí.
-- Por defecto: solo owner/admin para máxima protección.
CREATE POLICY "refunds_select" ON project_refunds
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
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
