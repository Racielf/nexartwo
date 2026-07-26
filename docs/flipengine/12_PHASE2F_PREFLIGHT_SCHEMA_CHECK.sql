-- FlipEngine Phase 2F Preflight Schema Check
-- READ-ONLY. Run only in an approved local or staging Supabase database.
-- This file intentionally contains SELECT queries only.

SELECT
  'existing_dependency_column' AS check_group,
  expected.table_schema || '.' || expected.table_name || '.' || expected.column_name AS check_name,
  expected.expected_data_type,
  COALESCE(c.data_type, 'missing') AS actual_data_type,
  COALESCE(c.udt_name, 'missing') AS actual_udt_name,
  CASE
    WHEN c.table_name IS NULL THEN 'STOP_MISSING_COLUMN_OR_TABLE'
    WHEN c.data_type = expected.expected_data_type THEN 'PASS'
    ELSE 'STOP_TYPE_MISMATCH'
  END AS result
FROM (
  SELECT 'public'::text AS table_schema, 'projects'::text AS table_name, 'id'::text AS column_name, 'text'::text AS expected_data_type
  UNION ALL
  SELECT 'public', 'work_orders', 'id', 'uuid'
  UNION ALL
  SELECT 'public', 'project_expenses', 'id', 'integer'
  UNION ALL
  SELECT 'public', 'documents', 'id', 'uuid'
  UNION ALL
  SELECT 'auth', 'users', 'id', 'uuid'
) expected
LEFT JOIN information_schema.columns c
  ON c.table_schema = expected.table_schema
  AND c.table_name = expected.table_name
  AND c.column_name = expected.column_name
ORDER BY expected.table_schema, expected.table_name, expected.column_name;

SELECT
  'flipengine_table_absence' AS check_group,
  'public.' || expected.table_name AS check_name,
  'table must not exist before Phase 2C migration' AS expected_state,
  CASE
    WHEN t.table_name IS NULL THEN 'not_found'
    ELSE 'exists'
  END AS actual_state,
  CASE
    WHEN t.table_name IS NULL THEN 'PASS'
    ELSE 'STOP_TABLE_ALREADY_EXISTS'
  END AS result
FROM (
  SELECT 'project_acquisitions'::text AS table_name
  UNION ALL
  SELECT 'project_budget_categories'
  UNION ALL
  SELECT 'project_receipts'
  UNION ALL
  SELECT 'project_document_links'
) expected
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
  AND t.table_name = expected.table_name
ORDER BY expected.table_name;
