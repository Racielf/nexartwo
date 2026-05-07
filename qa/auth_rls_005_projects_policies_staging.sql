-- ============================================================
-- Auth/RLS 005: projects Policies + Financial Trigger
-- Source: supabase/drafts/auth-rls/005_rls_projects.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004a + 004b must be PASS
-- ⚠️  Execute in Supabase SQL Editor (service_role context)
-- ⚠️  DO NOT APPLY 006-009 YET
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- Verify that prerequisites are in place before proceeding.
-- ============================================================

-- A. Verify owner exists in user_roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
    RAISE EXCEPTION 'CRITICAL: No owner found in user_roles. Aborting 005 policies.';
  END IF;
END $$;

-- B. Confirm auth_role() and is_owner() functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_owner', 'auth_role')
ORDER BY routine_name;
-- Expected: 2 rows — auth_role, is_owner

-- C. Confirm user_roles has owner-only policies active
SELECT policyname
FROM pg_policies
WHERE tablename = 'user_roles'
ORDER BY policyname;
-- Expected: user_roles_delete, user_roles_insert, user_roles_select, user_roles_update

-- D. Confirm projects table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'projects';
-- Expected: 1 row

-- ============================================================
-- 2. DROP LEGACY POLICIES (from Migration 003 MVP)
-- ============================================================

DROP POLICY IF EXISTS "Allow select projects" ON projects;
DROP POLICY IF EXISTS "Allow insert projects" ON projects;
DROP POLICY IF EXISTS "Allow update projects" ON projects;

-- ============================================================
-- 3. DROP ANY EXISTING 005 POLICIES (Idempotent)
-- ============================================================

DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;

-- ============================================================
-- 4. APPLY 005 POLICIES
-- ============================================================

-- SELECT: owner and admin only (field_user/viewer use project_status_summary via migration 009)
-- REASON: RLS cannot hide columns. Direct SELECT would expose purchase_price,
--         down_payment, and other financial fields to non-authorized roles.
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (
    auth_role() IN ('owner', 'admin')
  );

-- INSERT: owner and admin only
CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (
    auth_role() IN ('owner', 'admin')
  );

-- UPDATE: owner and admin only (financial columns further protected by trigger below)
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
  );

-- NOTE: No DELETE policy is created intentionally.
-- Absence of a DELETE policy blocks all deletes when RLS is active.

-- ============================================================
-- 5. APPLY FINANCIAL FIELD PROTECTION TRIGGER
-- Protects financial columns from non-owner updates.
-- RLS cannot restrict columns — this trigger is mandatory.
-- ============================================================

DROP TRIGGER IF EXISTS trg_protect_project_financials ON projects;

CREATE OR REPLACE FUNCTION prevent_non_owner_project_financial_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth_role() != 'owner' THEN
    IF (OLD.purchase_price           IS DISTINCT FROM NEW.purchase_price)           OR
       (OLD.down_payment             IS DISTINCT FROM NEW.down_payment)             OR
       (OLD.loan_amount              IS DISTINCT FROM NEW.loan_amount)              OR
       (OLD.realtor_fee              IS DISTINCT FROM NEW.realtor_fee)              OR
       (OLD.title_company_fee        IS DISTINCT FROM NEW.title_company_fee)        OR
       (OLD.closing_costs            IS DISTINCT FROM NEW.closing_costs)            OR
       (OLD.inspection_fee           IS DISTINCT FROM NEW.inspection_fee)           OR
       (OLD.insurance                IS DISTINCT FROM NEW.insurance)                OR
       (OLD.sale_price               IS DISTINCT FROM NEW.sale_price)               OR
       (OLD.selling_agent_commission IS DISTINCT FROM NEW.selling_agent_commission) OR
       (OLD.seller_closing_costs     IS DISTINCT FROM NEW.seller_closing_costs)
    THEN
      RAISE EXCEPTION 'Solo el owner puede modificar campos financieros de un proyecto.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_project_financials
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION prevent_non_owner_project_financial_update();

-- ============================================================
-- 6. POST-VERIFICATION (Primary — service_role context)
-- ============================================================

-- A. Confirm 005 policies are active on projects
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
-- Expected: 3 rows — projects_insert, projects_select, projects_update

-- B. Confirm financial protection trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'projects';
-- Expected: trg_protect_project_financials / UPDATE

-- ============================================================
-- OPTIONAL AUTHENTICATED OWNER-SESSION VERIFICATION ONLY
-- These require an authenticated session (auth.uid() set).
-- They will NOT work with service_role in SQL Editor.
-- ------------------------------------------------------------
-- SELECT * FROM projects;     -- Expected: returns rows
-- SELECT auth_role();         -- Expected: 'owner'
-- ============================================================
