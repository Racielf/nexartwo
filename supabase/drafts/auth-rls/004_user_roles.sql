-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 004: Tabla de Roles y Función Helper
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Mover a supabase/migrations/ SOLO después de:
--     1. Workflow Supabase Financial QA: PASS
--     2. Aprobación del Owner sobre DESIGN.md
-- ============================================================

-- Tabla de roles por usuario
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'field_user', 'viewer')),
  PRIMARY KEY (user_id)
);

-- Habilitar RLS sobre user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Solo el owner puede leer/escribir user_roles
-- (por ahora, la asignación de roles es manual desde el SQL Editor o admin panel)
CREATE POLICY "user_roles_owner_only" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

-- Función helper: retorna el rol del usuario autenticado actual
-- Usada en todas las demás políticas RLS como: auth_role() IN ('owner','admin')
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- SEED INICIAL: Registrar al owner actual manualmente después de aplicar esta migración:
-- INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'owner');
-- ⚠️  Hacerlo desde el SQL Editor autenticado con el usuario owner ANTES de activar
--     las políticas de las migraciones siguientes, o el sistema quedará sin acceso.
