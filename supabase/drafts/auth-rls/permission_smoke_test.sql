-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Smoke Test de Permisos por Rol
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT EXECUTE AGAINST PRODUCTION
--     Correr DESPUÉS de activar las 6 migraciones de RLS (004-009).
--     Usar con sesiones de usuario reales autenticadas en Supabase.
--     No usa ROLLBACK — valida permisos reales de sesión activa.
--
-- INSTRUCCIONES:
-- 1. Autenticar con usuario de rol `field_user` en Supabase.
-- 2. Ejecutar los bloques del Bloque 1 y verificar resultados.
-- 3. Repetir autenticando como `admin` (Bloque 2).
-- 4. Repetir autenticando como `owner` (Bloque 3).
-- Reemplazar los placeholders <PROJECT_ID>, <EXPENSE_ID>, <DISB_ID>
-- con IDs reales de la base de datos antes de correr.
-- ============================================================

-- ==========================================
-- BLOQUE 1: Pruebas como `field_user`
-- ==========================================

-- Test 1.1 — field_user NO puede ver project_financial_summaries (KPIs internos)
-- RESULTADO ESPERADO: 0 filas (security_invoker filtra por RLS de tablas base)
SELECT project_id, profit, cost_basis, cash_invested
FROM project_financial_summaries
LIMIT 5;

-- Test 1.2 — field_user SÍ puede consultar project_status_summary (vista segura)
-- RESULTADO ESPERADO: filas con project_id, name, status — SIN montos financieros
SELECT project_id, name, status, expense_count, refund_count, last_activity
FROM project_status_summary
LIMIT 5;

-- Test 1.3 — field_user SÍ puede insertar un expense en un proyecto activo
-- RESULTADO ESPERADO: INSERT exitoso (1 row)
INSERT INTO project_expenses (project_id, vendor, amount, status)
VALUES ('<PROJECT_ID>', 'Field Test Vendor', 100, 'pending');

-- Test 1.4 — field_user NO puede aprobar su propio expense
-- RESULTADO ESPERADO: 0 rows updated (RLS bloquea UPDATE a field_user)
UPDATE project_expenses
SET status = 'approved'
WHERE id = '<EXPENSE_ID>';

-- Test 1.5 — field_user NO puede ver project_disbursements
-- RESULTADO ESPERADO: 0 filas
SELECT * FROM project_disbursements LIMIT 5;

-- Test 1.6 — field_user NO puede insertar un disbursement
-- RESULTADO ESPERADO: error de RLS o 0 rows
INSERT INTO project_disbursements (project_id, beneficiary, amount, status)
VALUES ('<PROJECT_ID>', 'Field Unauthorized', 500, 'pending');

-- ==========================================
-- BLOQUE 2: Pruebas como `admin`
-- ==========================================

-- Test 2.1 — admin SÍ puede ver project_financial_summaries completa
-- RESULTADO ESPERADO: filas con profit, cost_basis, cash_invested, etc.
SELECT project_id, profit, cost_basis, cash_invested, project_cash_position
FROM project_financial_summaries
LIMIT 5;

-- Test 2.2 — admin SÍ puede aprobar un expense
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_expenses
SET status = 'approved'
WHERE id = '<EXPENSE_ID>';

-- Test 2.3 — admin NO puede marcar un disbursement como paid
-- RESULTADO ESPERADO: excepción del trigger prevent_non_owner_paid_disbursement
UPDATE project_disbursements
SET status = 'paid'
WHERE id = '<DISB_ID>';

-- Test 2.4 — admin NO puede modificar campos financieros de un proyecto
-- RESULTADO ESPERADO: excepción del trigger prevent_non_owner_project_financial_update
UPDATE projects
SET purchase_price = 999999
WHERE id = '<PROJECT_ID>';

-- ==========================================
-- BLOQUE 3: Pruebas como `owner`
-- ==========================================

-- Test 3.1 — owner puede marcar disbursement como paid
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_disbursements
SET status = 'paid'
WHERE id = '<DISB_ID>';

-- Test 3.2 — owner puede modificar campos financieros de un proyecto
-- RESULTADO ESPERADO: 1 row updated
UPDATE projects
SET purchase_price = 110000
WHERE id = '<PROJECT_ID>';

-- ==========================================
-- BLOQUE 4: Triggers de inmutabilidad (cualquier rol)
-- ==========================================

-- Test 4.1 — UPDATE amount DEBE fallar (trigger trg_no_update_expenses)
-- RESULTADO ESPERADO: excepción REGLA 9
UPDATE project_expenses
SET amount = 999
WHERE id = '<EXPENSE_ID>';

-- Test 4.2 — DELETE DEBE fallar (trigger prevent_financial_delete)
-- RESULTADO ESPERADO: excepción REGLA 14
DELETE FROM project_expenses WHERE id = '<EXPENSE_ID>';

-- Test 4.3 — UPDATE tax DEBE fallar
-- RESULTADO ESPERADO: excepción REGLA 9
UPDATE project_expenses
SET tax = 999
WHERE id = '<EXPENSE_ID>';

-- Test 4.4 — UPDATE status DEBE funcionar para owner/admin
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_expenses
SET status = 'cancelled'
WHERE id = '<EXPENSE_ID>';
