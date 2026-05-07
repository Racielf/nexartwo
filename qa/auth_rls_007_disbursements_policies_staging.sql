-- ============================================================
-- Auth/RLS 007: project_disbursements Policies
-- Source: supabase/drafts/auth-rls/007_rls_disbursements.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004a, 004b, 005, 006 must be PASS
-- ⚠️  Execute in Supabase SQL Editor (service_role context)
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- ============================================================

-- A. Verify prerequisites in user_roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
        RAISE EXCEPTION 'CRITICAL: No owner found in user_roles. Aborting 007.';
    END IF;
END $$;

-- B. Confirm 006 record exists in docs (Manual Verification Required)
-- SELECT COUNT(*) FROM docs/AUTH_RLS_006_EXECUTION_RECORD.md exists in main.

-- C. Confirm RLS is enabled on target table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'project_disbursements'
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'CRITICAL: RLS is not enabled on project_disbursements. Aborting 007.';
  END IF;
END $$;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'project_disbursements';
-- Expected: 1 row with rowsecurity = true. 
-- Do not proceed if rowsecurity = false.

-- ============================================================
-- 2. CLEANUP LEGACY POLICIES (Migration 003 MVP)
-- ============================================================

DROP POLICY IF EXISTS "Allow select project_disbursements" ON project_disbursements;
DROP POLICY IF EXISTS "Allow insert project_disbursements" ON project_disbursements;
DROP POLICY IF EXISTS "Allow update project_disbursements" ON project_disbursements;

-- Idempotencia: eliminar policies 007 si existen
DROP POLICY IF EXISTS "disbursements_select" ON project_disbursements;
DROP POLICY IF EXISTS "disbursements_insert" ON project_disbursements;
DROP POLICY IF EXISTS "disbursements_update" ON project_disbursements;

-- ============================================================
-- 3. APPLY 007 POLICIES
-- ============================================================

-- SELECT: owner/admin only.
CREATE POLICY "disbursements_select" ON project_disbursements
  FOR SELECT USING ( auth_role() IN ('owner', 'admin') );

-- INSERT: owner/admin only.
CREATE POLICY "disbursements_insert" ON project_disbursements
  FOR INSERT WITH CHECK ( auth_role() IN ('owner', 'admin') );

-- UPDATE: owner/admin only.
-- Status transition to 'paid' is further restricted by trigger below.
CREATE POLICY "disbursements_update" ON project_disbursements
  FOR UPDATE USING ( auth_role() IN ('owner', 'admin') );

-- ============================================================
-- 4. APPLY STATUS PROTECTION TRIGGER
-- Only owner can mark a disbursement as 'paid'.
-- ============================================================

DROP TRIGGER IF EXISTS trg_restrict_paid_to_owner ON project_disbursements;

CREATE OR REPLACE FUNCTION prevent_non_owner_paid_disbursement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    IF auth_role() != 'owner' THEN
      RAISE EXCEPTION 'Solo el owner puede marcar un desembolso como paid.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restrict_paid_to_owner
BEFORE UPDATE ON project_disbursements
FOR EACH ROW EXECUTE FUNCTION prevent_non_owner_paid_disbursement();

-- ============================================================
-- 5. POST-VERIFICATION
-- ============================================================

-- List applied policies
SELECT policyname, tablename, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'project_disbursements'
ORDER BY policyname;

-- Confirm trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'project_disbursements';

-- ============================================================
-- OPTIONAL AUTHENTICATED SESSION VERIFICATION
-- ------------------------------------------------------------
-- -- As owner:
-- SELECT * FROM project_disbursements; -- Should return rows.
-- UPDATE project_disbursements SET status = 'paid' WHERE id = '...'; -- Should work.
-- ------------------------------------------------------------
-- -- As admin:
-- UPDATE project_disbursements SET status = 'paid' WHERE id = '...'; -- Should FAIL.
-- ============================================================
