-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 006: Políticas RLS para `project_expenses` y `project_refunds`
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere 004a + 004b aplicados y owner verificado.
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columna created_by a project_expenses
-- ADD COLUMN IF NOT EXISTS = no destructivo en datos existentes.
-- ============================================================
ALTER TABLE project_expenses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE project_expenses
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- NOTA DE ALCANCE:
-- project_refunds: correcciones contables internas. Solo owner/admin.
--   No requiere created_by.
-- project_disbursements: campo approved_by_user_id para auditoría
--   se considera en migración 010+. Fuera de scope aquí.

-- ============================================================
-- PASO 2: Eliminar policies MVP activas (nombres exactos del SQL 003)
-- ============================================================
DROP POLICY IF EXISTS "Allow select project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow insert project_expenses"  ON project_expenses;
DROP POLICY IF EXISTS "Allow update project_expenses"  ON project_expenses;

DROP POLICY IF EXISTS "Allow select project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow insert project_refunds"  ON project_refunds;
DROP POLICY IF EXISTS "Allow update project_refunds"  ON project_refunds;

-- Idempotencia: eliminar policies nuevas si existen
DROP POLICY IF EXISTS "expenses_select" ON project_expenses;
DROP POLICY IF EXISTS "expenses_insert" ON project_expenses;
DROP POLICY IF EXISTS "expenses_update" ON project_expenses;

DROP POLICY IF EXISTS "refunds_select" ON project_refunds;
DROP POLICY IF EXISTS "refunds_insert" ON project_refunds;
DROP POLICY IF EXISTS "refunds_update" ON project_refunds;

-- ============================================================
-- PASO 3: Nuevas policies — project_expenses
-- ============================================================

-- SELECT: owner y admin ven todos.
-- field_user ve SOLO sus propios expenses (created_by = auth.uid()).
-- viewer NO tiene acceso — los expenses contienen amount (dato financiero).
CREATE POLICY "expenses_select" ON project_expenses
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- INSERT: owner y admin insertan libremente.
-- field_user solo puede insertar si created_by = auth.uid().
-- La policy enforza esto explícitamente (no solo el DEFAULT).
CREATE POLICY "expenses_insert" ON project_expenses
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- UPDATE: solo owner y admin pueden cambiar status.
-- trg_no_update_expenses bloquea amount, tax, vendor, etc.
CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado por trigger prevent_financial_delete + ausencia de policy DELETE.

-- ============================================================
-- PASO 4: Nuevas policies — project_refunds
-- ============================================================

-- SELECT: solo owner y admin.
-- Los refunds contienen amount (dato financiero interno).
-- field_user y viewer no tienen acceso directo.
CREATE POLICY "refunds_select" ON project_refunds
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
  );

-- INSERT: solo owner y admin crean refunds (correcciones contables)
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
