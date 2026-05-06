-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 004: Tabla de Roles y Función Helper
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT APPLY
--     Gate obligatorio: Workflow Supabase Financial QA debe retornar PASS.
--     Requiere aprobación del Owner sobre DESIGN.md antes de mover a supabase/migrations/
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
-- SECCIÓN BOOTSTRAP (Ejecutar UNA SOLA VEZ antes de activar RLS)
-- ============================================================
-- El problema del primer owner: si RLS requiere un owner para insertar owners,
-- nadie puede insertar el primer registro.
--
-- Estrategia segura de bootstrap:
-- Paso 1) Insertar el primer owner desde el SQL Editor como superuser (service role),
--         ANTES de activar las policies de user_roles.
--         Usar el UUID real del usuario autenticado (owner del proyecto).
--
--         Ejemplo (reemplazar con UUID real del owner):
--         INSERT INTO user_roles (user_id, role)
--         VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'owner');
--
-- Paso 2) Verificar que el registro existe:
--         SELECT * FROM user_roles;
--
-- Paso 3) Solo DESPUÉS de confirmar el owner, activar las policies.
-- ============================================================

-- Policy: solo owner puede leer/escribir user_roles
-- (Solo activa DESPUÉS del paso de bootstrap)
CREATE POLICY "user_roles_select_owner" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

CREATE POLICY "user_roles_insert_owner" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

CREATE POLICY "user_roles_update_owner" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

CREATE POLICY "user_roles_delete_owner" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

-- ============================================================
-- Función helper: retorna el rol del usuario autenticado actual
-- search_path explícito requerido por SECURITY DEFINER
-- ============================================================
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;
