-- ============================================================
-- Auth/RLS 009: project_status_summary Restricted View
-- Source: supabase/drafts/auth-rls/009_project_status_summary_view.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004–008 must be PASS
-- ⚠️  Execute in Supabase SQL Editor (service_role context)
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- ============================================================

-- A. Verify prerequisites in user_roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
        RAISE EXCEPTION 'CRITICAL: No owner found in user_roles. Aborting 009.';
    END IF;
END $$;

-- B. Confirm dependency tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') OR
       NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_expenses') OR
       NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_refunds') THEN
        RAISE EXCEPTION 'CRITICAL: Dependency tables (projects, expenses, refunds) missing. Aborting 009.';
    END IF;
END $$;

-- C. Confirm auth_role() function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'auth_role'
  ) THEN
    RAISE EXCEPTION 'CRITICAL: auth_role() function missing. Aborting 009.';
  END IF;
END $$;

-- ============================================================
-- 2. VIEW CREATION (Operational Only)
-- ============================================================

CREATE OR REPLACE VIEW project_status_summary AS
SELECT
  p.id             AS project_id,
  p.name,
  p.address,
  p.status,
  p.property_type,
  -- Solo conteos operativos, sin montos monetarios
  COUNT(DISTINCT e.id) AS expense_count,
  COUNT(DISTINCT r.id) AS refund_count,
  -- Fecha de actividad más reciente del proyecto
  MAX(GREATEST(
    COALESCE(e.created_at, '1970-01-01'::timestamptz),
    COALESCE(r.created_at, '1970-01-01'::timestamptz)
  )) AS last_activity
FROM projects p
LEFT JOIN project_expenses e ON e.project_id = p.id
LEFT JOIN project_refunds  r ON r.project_id = p.id
GROUP BY p.id, p.name, p.address, p.status, p.property_type;

-- ============================================================
-- 3. PERMISSION HARDENING (Lockdown)
-- ============================================================

-- Explicitly revoke from PUBLIC and standard roles
REVOKE SELECT ON public.project_status_summary FROM PUBLIC;
REVOKE SELECT ON public.project_status_summary FROM anon;
REVOKE SELECT ON public.project_status_summary FROM authenticated;

-- ============================================================
-- 4. CREATE SECURE RPC (Gateway)
-- ============================================================

CREATE OR REPLACE FUNCTION get_project_status_summary()
RETURNS SETOF project_status_summary
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_status_summary
  WHERE auth_role() IN ('owner', 'admin');
$$;

-- Explicitly lockdown RPC permissions
REVOKE ALL ON FUNCTION get_project_status_summary() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_project_status_summary() FROM anon;
GRANT EXECUTE ON FUNCTION get_project_status_summary() TO authenticated;

-- ============================================================
-- 5. POST-VERIFICATION
-- ============================================================

-- List view metadata
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'project_status_summary';

-- Check RPC and security type
SELECT routine_name, security_type
FROM information_schema.routines 
WHERE routine_name = 'get_project_status_summary';
-- Expected: 1 row, security_type = DEFINER

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'project_status_summary'
AND grantee IN ('anon', 'authenticated');
-- Expected: 0 rows
