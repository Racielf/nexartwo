-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 004b: Policies de user_roles (PASO 2 DE 2)
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--
--     PREREQUISITO OBLIGATORIO:
--     Ejecutar 004a y verificar que existe al menos un owner:
--       SELECT * FROM user_roles WHERE role = 'owner';
--     Si la query retorna 0 filas, NO ejecutar este archivo.
--     Activar policies sin un owner bloquea el acceso a todos.
-- ============================================================

-- Idempotencia: eliminar policies previas si existen (seguro para reintentos)
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;

-- SELECT: solo owner puede leer la tabla de roles
-- is_owner() usa SECURITY DEFINER para evitar recursión RLS
CREATE POLICY "user_roles_select" ON user_roles
  FOR SELECT USING ( is_owner() );

-- INSERT: solo owner puede asignar nuevos roles
CREATE POLICY "user_roles_insert" ON user_roles
  FOR INSERT WITH CHECK ( is_owner() );

-- UPDATE: solo owner puede modificar roles existentes
CREATE POLICY "user_roles_update" ON user_roles
  FOR UPDATE USING ( is_owner() );

-- DELETE: solo owner puede eliminar asignaciones de rol
CREATE POLICY "user_roles_delete" ON user_roles
  FOR DELETE USING ( is_owner() );

-- Verificación post-activación:
-- SELECT * FROM user_roles;  -- debe retornar filas (autenticado como owner)
-- SELECT auth_role();        -- debe retornar 'owner'
