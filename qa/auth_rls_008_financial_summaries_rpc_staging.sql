-- ============================================================
-- Auth/RLS 008: project_financial_summaries RPC Gateway
-- Source: supabase/drafts/auth-rls/008_rls_financial_summaries.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004–007 must be PASS
-- ⚠️  Execute in Supabase SQL Editor (service_role context)
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- ============================================================

-- A. Verify prerequisites in user_roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
        RAISE EXCEPTION 'CRITICAL: No owner found in user_roles. Aborting 008.';
    END IF;
END $$;

-- B. Confirm project_financial_summaries view exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'project_financial_summaries'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: View project_financial_summaries not found. Aborting 008.';
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
    RAISE EXCEPTION 'CRITICAL: auth_role() function missing. Aborting 008.';
  END IF;
END $$;

SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'auth_role';
-- Expected: 1 row

-- ============================================================
-- 2. REVOKE DIRECT ACCESS
-- ============================================================

REVOKE SELECT ON public.project_financial_summaries FROM PUBLIC;
REVOKE SELECT ON public.project_financial_summaries FROM anon;
REVOKE SELECT ON public.project_financial_summaries FROM authenticated;

-- ============================================================
-- 3. CREATE SECURE RPCs (Gateway)
-- ============================================================

-- A. Get single project summary
CREATE OR REPLACE FUNCTION get_project_financial_summary(p_project_id TEXT)
RETURNS SETOF project_financial_summaries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_financial_summaries
  WHERE project_id = p_project_id
    AND auth_role() IN ('owner', 'admin');
$$;

REVOKE ALL ON FUNCTION get_project_financial_summary(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_project_financial_summary(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION get_project_financial_summary(TEXT) TO authenticated;

-- B. Get all project summaries
CREATE OR REPLACE FUNCTION get_all_financial_summaries()
RETURNS SETOF project_financial_summaries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM project_financial_summaries
  WHERE auth_role() IN ('owner', 'admin');
$$;

REVOKE ALL ON FUNCTION get_all_financial_summaries() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_all_financial_summaries() FROM anon;
GRANT EXECUTE ON FUNCTION get_all_financial_summaries() TO authenticated;

-- ============================================================
-- 4. POST-VERIFICATION
-- ============================================================

-- Check permissions on the view
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'project_financial_summaries'
AND grantee IN ('anon', 'authenticated');
-- Expected: 0 rows (Revoked)

-- Check routines exist and are SECURITY DEFINER
SELECT routine_name, external_language, security_type
FROM information_schema.routines 
WHERE routine_name IN ('get_project_financial_summary', 'get_all_financial_summaries')
ORDER BY routine_name;
-- Expected: 2 rows, security_type = DEFINER

-- ============================================================
-- OPTIONAL AUTHENTICATED SESSION VERIFICATION
-- ------------------------------------------------------------
-- -- As owner:
-- SELECT * FROM get_all_financial_summaries(); -- Should return data.
-- SELECT * FROM project_financial_summaries;    -- Should FAIL (Permission denied).
-- ------------------------------------------------------------
-- -- As field_user:
-- SELECT * FROM get_all_financial_summaries(); -- Should return 0 rows.
-- ============================================================
