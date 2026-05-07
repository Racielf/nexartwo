-- ============================================================
-- Auth/RLS Owner Bootstrap — STAGING ONLY
-- Source: supabase/drafts/auth-rls/004a_user_roles_bootstrap.sql
-- ============================================================
-- ⚠️  STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- ⚠️  004a ONLY — DO NOT APPLY 004b YET
-- ⚠️  Execute in Supabase SQL Editor using service_role key
-- ⚠️  Run blocks A–G IN ORDER. Verify each before proceeding.
-- ============================================================
-- Confirmed owner:
--   email:          racinllerf@gmail.com
--   owner_auth_uid: 1953318e-ff95-4073-abb5-e418f241b7e5
--   environment:    nexartwo-staging
-- ============================================================

-- ============================================================
-- STEP A: Create user_roles table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'field_user', 'viewer')),
  PRIMARY KEY (user_id)
);

-- ============================================================
-- STEP B: Enable RLS on user_roles
-- NOTE: Without policies, table is locked for all auth users.
--       Only service_role can bypass. Required for 004b safety.
-- ============================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP C: Create is_owner() — SECURITY DEFINER
-- Bypasses RLS to prevent self-recursion in user_roles policies.
-- Used by all table policies in 004b–009.
-- ============================================================
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

-- ============================================================
-- STEP D: Create auth_role() — SECURITY DEFINER
-- Returns role for current authenticated user.
-- Used by financial table policies (005-009).
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

-- ============================================================
-- STEP E: Insert confirmed staging owner
-- STAGING ONLY — DO NOT USE THIS UUID IN PRODUCTION
-- owner_auth_uid: 1953318e-ff95-4073-abb5-e418f241b7e5
-- email:          racinllerf@gmail.com
-- ============================================================
INSERT INTO user_roles (user_id, role)
VALUES ('1953318e-ff95-4073-abb5-e418f241b7e5', 'owner')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- STEP F: Verify owner row was inserted
-- Expected: 1 row, user_id = 1953318e-ff95-4073-abb5-e418f241b7e5, role = owner
-- ============================================================
SELECT user_id, role FROM user_roles;

-- ============================================================
-- STEP G: Verify functions were created
-- Expected: 2 rows — auth_role, is_owner
-- ============================================================
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_owner', 'auth_role')
ORDER BY routine_name;

-- ============================================================
-- ADDITIONAL VERIFICATION QUERIES
-- ============================================================

-- Confirm user_roles table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_roles';

-- Confirm RLS is enabled on user_roles
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_roles';

-- ============================================================
-- AFTER ALL CHECKS PASS:
-- DO NOT APPLY 004b YET.
-- Report results back to the team before proceeding.
-- Next step: prepare and review 004b user_roles policies plan.
-- ============================================================
