-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Migración 008: Restringir vista `project_financial_summaries`
-- ============================================================
-- ⚠️  NO EJECUTAR — Draft para revisión.
--     Requiere migración 004 aplicada.
--     Las vistas en Postgres heredan RLS de las tablas base, pero
--     agregar una policy explícita sobre la vista la hace más robusta.
-- ============================================================

-- Las vistas no soportan RLS directamente como las tablas,
-- pero podemos protegerlas mediante la función SECURITY INVOKER/DEFINER
-- y a través de las policies de las tablas subyacentes.

-- Opción recomendada: Recrear la vista con SECURITY INVOKER
-- para que herede los permisos del usuario que la consulta.
-- Esto asegura que si un field_user consulta la vista,
-- las policies de project_expenses le bloqueen sus filas.

-- Recrear la vista actual con SECURITY INVOKER (no cambia la lógica financiera):
-- CREATE OR REPLACE VIEW project_financial_summaries
-- WITH (security_invoker = true)  -- <-- este atributo aplica RLS del usuario
-- AS
-- [... mismo SELECT que en 003_projects_financial_system.sql ...]

-- NOTA IMPORTANTE:
-- No incluimos aquí el SELECT completo de la vista para no desincronizarla del SQL base aprobado.
-- Cuando se active esta migración, se debe copiar el SELECT vigente de la vista
-- desde supabase/migrations/20260506_projects_financial_system.sql
-- y agregar WITH (security_invoker = true) antes del AS.

-- Política adicional de Grant: Restringir EXECUTE/SELECT en la vista
-- REVOKE SELECT ON project_financial_summaries FROM anon;
-- REVOKE SELECT ON project_financial_summaries FROM authenticated;
-- GRANT SELECT ON project_financial_summaries TO authenticated;  -- controlado por RLS base
