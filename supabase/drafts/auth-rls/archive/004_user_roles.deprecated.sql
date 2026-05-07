-- ============================================================
-- ❌ DEPRECATED — DO NOT MOVE TO MIGRATIONS
-- ============================================================
-- Este archivo fue reemplazado por:
--   004a_user_roles_bootstrap.sql  (tabla + funciones helper)
--   004b_user_roles_policies.sql   (policies idempotentes)
--
-- Motivo: el archivo original mezclaba bootstrap, funciones y
-- policies en un solo bloque, lo cual no es migration-safe.
-- Se mantiene aquí solo como referencia histórica.
-- ============================================================

-- Tabla de roles por usuario
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'field_user', 'viewer')),
  PRIMARY KEY (user_id)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIONES HELPER (crear ANTES de las policies para evitar
-- recursión RLS al consultar user_roles dentro de user_roles)
-- ============================================================

-- is_owner(): SECURITY DEFINER permite leer user_roles
-- sin pasar por el RLS de user_roles, evitando recursión infinita.
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  );
$$;

-- auth_role(): retorna el rol del usuario autenticado actual.
-- Usada en todas las demás tablas. SECURITY DEFINER + search_path seguro.
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- ============================================================
-- SECCIÓN BOOTSTRAP — Ejecutar UNA SOLA VEZ con service_role
-- ANTES de activar las policies de user_roles.
-- ============================================================
-- El problema del primer owner: con RLS activo y sin datos,
-- ninguna policy podría permitir el INSERT inicial.
-- Solución: insertar el primer owner desde el SQL Editor
-- usando el service_role key de Supabase (bypassa RLS).
--
-- PASO 1: En el SQL Editor de Supabase con service_role:
--   INSERT INTO user_roles (user_id, role)
--   VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'owner');
--   -- Reemplazar con el UUID real del usuario owner (auth.users.id)
--
-- PASO 2: Verificar el registro antes de activar policies:
--   SELECT * FROM user_roles;
--
-- PASO 3: Activar las policies (ejecutar el resto de este archivo).
-- ============================================================

-- ============================================================
-- POLICIES para user_roles
-- Usan is_owner() para evitar self-recursion en RLS.
-- ============================================================

-- Solo owner puede leer la tabla de roles
CREATE POLICY "user_roles_select" ON user_roles
  FOR SELECT USING ( is_owner() );

-- Solo owner puede asignar nuevos roles
CREATE POLICY "user_roles_insert" ON user_roles
  FOR INSERT WITH CHECK ( is_owner() );

-- Solo owner puede cambiar roles existentes
CREATE POLICY "user_roles_update" ON user_roles
  FOR UPDATE USING ( is_owner() );

-- Solo owner puede eliminar asignaciones de rol
-- (ej. al dar de baja a un colaborador)
CREATE POLICY "user_roles_delete" ON user_roles
  FOR DELETE USING ( is_owner() );
