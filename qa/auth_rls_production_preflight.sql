-- ============================================================
-- NexArtWO Auth/RLS Production Preflight
-- Target Project: udaeifoibydcokefcmbg (NexArtWO Original)
-- Type: READ-ONLY AUDIT
-- ============================================================

-- 1. Check for owner existence (Prerequisite for 004b)
SELECT 'owner_check' as check_type, count(*) as count
FROM user_roles 
WHERE role = 'owner';

-- 2. Check user_roles RLS status
SELECT 'user_roles_rls' as check_type, relname, relrowsecurity 
FROM pg_class 
JOIN pg_namespace n ON n.oid = pg_class.relnamespace
WHERE n.nspname = 'public'
  AND relname = 'user_roles';

-- 3. Check existing policies (user_roles)
SELECT 'user_roles_policies' as check_type, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 4. Check Projects RLS status
SELECT 'projects_rls' as check_type, relname, relrowsecurity 
FROM pg_class 
JOIN pg_namespace n ON n.oid = pg_class.relnamespace
WHERE n.nspname = 'public'
  AND relname = 'projects';

-- 5. Check Project Expenses RLS status
SELECT 'project_expenses_rls' as check_type, relname, relrowsecurity 
FROM pg_class 
JOIN pg_namespace n ON n.oid = pg_class.relnamespace
WHERE n.nspname = 'public'
  AND relname = 'project_expenses';

-- 6. Check Project Refunds RLS status
SELECT 'project_refunds_rls' as check_type, relname, relrowsecurity 
FROM pg_class 
JOIN pg_namespace n ON n.oid = pg_class.relnamespace
WHERE n.nspname = 'public'
  AND relname = 'project_refunds';

-- 7. Check Project Disbursements RLS status
SELECT 'project_disbursements_rls' as check_type, relname, relrowsecurity 
FROM pg_class 
JOIN pg_namespace n ON n.oid = pg_class.relnamespace
WHERE n.nspname = 'public'
  AND relname = 'project_disbursements';

-- 8. Check Base Views
SELECT 'views_check' as check_type, table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('project_financial_summaries', 'project_status_summary');

-- 9. Check RPC Functions (Phase 008/009)
SELECT 'rpc_check' as check_type, routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_all_financial_summaries',
    'get_project_financial_summary',
    'get_project_status_summary'
  );

-- 10. Check Privileges on Views (Phase 008)
SELECT 'view_privileges' as check_type, table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'project_financial_summaries'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated');
