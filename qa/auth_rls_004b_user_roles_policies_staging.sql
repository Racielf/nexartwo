-- ============================================================
-- Auth/RLS 004b: user_roles Policies (STAGING ONLY)
-- Source: docs/AUTH_RLS_004B_USER_ROLES_POLICIES_PLAN.md
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  PREREQUISITE: 004a bootstrap must be PASS
-- ⚠️  Execute in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PRE-FLIGHT GATE
-- Verify at least one owner exists to prevent lockout.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'owner') THEN
        RAISE EXCEPTION 'CRITICAL ERROR: No owner found in user_roles. Applying policies now would lock the table permanently for authenticated users.';
    END IF;
END $$;

-- ============================================================
-- 2. APPLY POLICIES (Idempotent)
-- ============================================================

DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles
  FOR SELECT USING ( is_owner() );

DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles
  FOR INSERT WITH CHECK ( is_owner() );

DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
CREATE POLICY "user_roles_update" ON user_roles
  FOR UPDATE USING ( is_owner() );

DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;
CREATE POLICY "user_roles_delete" ON user_roles
  FOR DELETE USING ( is_owner() );

-- ============================================================
-- 3. POST-VERIFICATION (Primary)
-- ============================================================

-- A. List applied policies (verifies policies exist)
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- B. Verify owner row exists (verifies data integrity)
-- Should work if executed as service_role
SELECT user_id, role FROM user_roles;

-- ============================================================
-- 4. OPTIONAL AUTHENTICATED OWNER-SESSION VERIFICATION ONLY
-- ============================================================
-- These require an active authenticated session as the owner.
-- They will NOT work as expected with service_role in SQL Editor.
-- ------------------------------------------------------------
-- SELECT * FROM user_roles;      -- Expected: returns rows
-- SELECT is_owner();             -- Expected: returns true
-- SELECT auth_role();            -- Expected: returns 'owner'
-- ------------------------------------------------------------

-- ============================================================
-- NOTE: Once verified, user_roles is hardened.
-- Next step: Proceed with 005_rls_projects.sql plan.
-- ============================================================
