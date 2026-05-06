-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 005: Políticas RLS para tabla `projects`
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Requiere que la migración 004 esté aplicada primero.
-- ============================================================

-- Eliminar policy permisiva MVP
DROP POLICY IF EXISTS "Allow all projects" ON projects;
DROP POLICY IF EXISTS "Allow select projects" ON projects;
DROP POLICY IF EXISTS "Allow insert projects" ON projects;
DROP POLICY IF EXISTS "Allow update projects" ON projects;

-- SELECT: todos los roles autenticados pueden leer proyectos
-- field_user solo ve proyectos a los que está asignado (requiere tabla project_assignments futura)
-- Por ahora: todos los roles ven todos los proyectos activos
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin', 'field_user', 'viewer')
  );

-- INSERT: solo owner y admin pueden crear proyectos
CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: owner puede cambiar campos financieros, admin solo puede cambiar status
-- Nota: la granularidad por columna requiere usar triggers adicionales o separar en dos policies
-- Por ahora, UPDATE completo para owner; solo status para admin via aplicación
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- DELETE: bloqueado para todos (ya eliminada en SQL base, reforzado aquí)
-- No se crea policy de DELETE. La ausencia de policy bloquea por defecto cuando RLS está activo.
