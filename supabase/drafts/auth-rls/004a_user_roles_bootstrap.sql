-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 004a: Bootstrap de user_roles (PASO 1 DE 2)
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate: Workflow Supabase Financial QA debe retornar PASS.
--     Este archivo es el PASO 1. Solo contiene:
--       - CREATE TABLE user_roles
--       - CREATE FUNCTION is_owner()
--       - CREATE FUNCTION auth_role()
--       - Instrucciones de bootstrap manual del primer owner
--     NO contiene policies todavía.
--     Las policies van en 004b (ejecutar DESPUÉS de verificar el owner).
-- ============================================================

-- Tabla de roles por usuario
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'field_user', 'viewer')),
  PRIMARY KEY (user_id)
);

-- Habilitar RLS (sin policies activas todavía — tabla abierta para bootstrap)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIONES HELPER
-- Creadas ANTES de las policies para que las policies puedan
-- invocarlas sin causar recursión RLS en user_roles.
-- SECURITY DEFINER + search_path seguro en todas las funciones.
-- ============================================================

-- is_owner(): consulta user_roles bypassando RLS (SECURITY DEFINER).
-- Usada en las policies de user_roles para evitar self-recursión.
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

-- auth_role(): retorna el rol del usuario autenticado.
-- Usada en todas las tablas financieras (005-008).
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
-- BOOTSTRAP — Insertar el primer owner (OBLIGATORIO antes de 004b)
-- ============================================================
-- Con RLS activo pero sin policies, la tabla está efectivamente
-- bloqueada para todos los roles de auth. Usar service_role key
-- (bypassa RLS) para insertar el primer owner.
--
-- PASO 1: En Supabase SQL Editor usando la service_role key:
--
--   INSERT INTO user_roles (user_id, role)
--   VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'owner');
--
--   Reemplazar con el UUID real del owner (buscar en auth.users):
--   SELECT id, email FROM auth.users;
--
-- PASO 2: Verificar que el registro existe:
--   SELECT * FROM user_roles;
--
-- PASO 3: Confirmar que is_owner() retorna true para ese usuario:
--   (Autenticar como el owner y ejecutar):
--   SELECT is_owner();  -- debe retornar TRUE
--
-- SOLO DESPUÉS de verificar los tres pasos, ejecutar 004b.
-- ============================================================
