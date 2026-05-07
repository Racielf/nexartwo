-- ============================================================
-- Auth/RLS 006: project_expenses & project_refunds Policies
-- Source: supabase/drafts/auth-rls/006_rls_expenses_refunds.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004a, 004b, 005 must be PASS
-- ⚠️  Execute in Supabase SQL Editor (service_role context)
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- ============================================================

-- A. Verify prerequisites in user_roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
        RAISE EXCEPTION 'CRITICAL: No owner found in user_roles. Aborting 006.';
    END IF;
END $$;

-- B. Confirm created_by column exists in project_expenses
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'project_expenses'
  AND column_name = 'created_by';
-- Expected: 1 row, created_by, uuid

-- C. Confirm RLS is enabled on target tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('project_expenses', 'project_refunds');
-- Expected: 2 rows with rowsecurity = true. 
-- NOTE: If rowsecurity is false, execute: ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CLEANUP LEGACY POLICIES (Migration 003 MVP)
-- ============================================================

DROP POLICY IF EXISTS "Allow select project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow insert project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow update project_expenses" ON project_expenses;

DROP POLICY IF EXISTS "Allow select project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow insert project_refunds" ON project_refunds;
DROP POLICY IF EXISTS "Allow update project_refunds" ON project_refunds;

-- Idempotencia: eliminar policies 006 si existen
DROP POLICY IF EXISTS "expenses_select" ON project_expenses;
DROP POLICY IF EXISTS "expenses_insert" ON project_expenses;
DROP POLICY IF EXISTS "expenses_update" ON project_expenses;

DROP POLICY IF EXISTS "refunds_select" ON project_refunds;
DROP POLICY IF EXISTS "refunds_insert" ON project_refunds;
DROP POLICY IF EXISTS "refunds_update" ON project_refunds;

-- ============================================================
-- 3. APPLY 006 POLICIES — project_expenses
-- ============================================================

-- SELECT: owner/admin see all. field_user sees only their own.
CREATE POLICY "expenses_select" ON project_expenses
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- INSERT: owner/admin free. field_user must set created_by to themselves.
CREATE POLICY "expenses_insert" ON project_expenses
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
    OR (auth_role() = 'field_user' AND created_by = auth.uid())
  );

-- UPDATE: owner/admin only (field_user records are finalized once created).
CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- ============================================================
-- 4. APPLY 006 POLICIES — project_refunds
-- ============================================================

-- SELECT/INSERT/UPDATE: Restricted to owner/admin due to financial nature.
CREATE POLICY "refunds_select" ON project_refunds
  FOR SELECT USING ( auth_role() IN ('owner', 'admin') );

CREATE POLICY "refunds_insert" ON project_refunds
  FOR INSERT WITH CHECK ( auth_role() IN ('owner', 'admin') );

CREATE POLICY "refunds_update" ON project_refunds
  FOR UPDATE USING ( auth_role() IN ('owner', 'admin') );

-- ============================================================
-- 5. POST-VERIFICATION
-- ============================================================

-- List applied policies
SELECT policyname, tablename, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('project_expenses', 'project_refunds')
ORDER BY tablename, policyname;

-- Confirm RLS is still enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('project_expenses', 'project_refunds');

-- ============================================================
-- OPTIONAL AUTHENTICATED SESSION VERIFICATION
-- ------------------------------------------------------------
-- -- As field_user:
-- SELECT * FROM project_expenses; -- Should return only your own rows.
-- -- As owner:
-- SELECT * FROM project_refunds;   -- Should return all rows.
-- ============================================================
