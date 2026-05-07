-- ============================================================
-- Auth/RLS Schema Compatibility Check — READ-ONLY QUERIES
-- Targets: nexartwo-staging
-- Purpose: Verify schema readiness before applying Auth/RLS.
-- RULES:
--   1. SELECT only.
--   2. NO DDL (CREATE, ALTER, DROP).
--   3. NO DML (INSERT, UPDATE, DELETE).
--   4. NO DCL (GRANT, REVOKE).
--   5. NO RLS state changes.
-- ============================================================

-- 1. Verify Auth Users (Check for owner/admin sessions)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verify project_expenses.created_by column (Required for migration 006)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_expenses'
  AND column_name = 'created_by';

-- 3. Verify all required tables are present
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'company_settings',
    'clients',
    'services',
    'work_orders',
    'wo_line_items',
    'documents',
    'wo_communications',
    'change_orders',
    'wo_photos',
    'projects',
    'project_expenses',
    'project_refunds',
    'project_disbursements',
    'investors',
    'investor_companies',
    'project_investors',
    'capital_contributions',
    'capital_calls'
  )
ORDER BY table_name;

-- 4. Verify required views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'project_financial_summaries'
  )
ORDER BY table_name;

-- 5. Check if user_roles already exists (Should be missing before 004a)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_roles';

-- 6. Verify functions/RPCs status
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_owner',
    'auth_role',
    'get_all_financial_summaries',
    'get_project_financial_summary'
  )
ORDER BY routine_name;

-- 7. Check current RLS state for critical tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'projects',
    'project_expenses',
    'project_refunds',
    'project_disbursements',
    'investors',
    'investor_companies',
    'project_investors',
    'capital_contributions',
    'capital_calls',
    'user_roles'
  )
ORDER BY tablename;
