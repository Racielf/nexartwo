-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Smoke Test de Permisos por Rol
-- ============================================================
-- ⚠️  NO EJECUTAR EN PRODUCCIÓN — Draft para revisión.
--     Correr DESPUÉS de activar las 6 migraciones de RLS.
--     Usar con sesiones de usuario reales (owner, admin, field_user).
--     No usa ROLLBACK porque valida permisos reales de sesión.
-- ============================================================
-- INSTRUCCIONES:
-- 1. Autenticar como `field_user` en Supabase.
-- 2. Ejecutar los bloques de "field_user" y verificar los resultados.
-- 3. Repetir autenticando como `admin` y como `owner`.
-- ============================================================

-- ==========================================
-- BLOQUE 1: Pruebas como `field_user`
-- ==========================================

-- Test 1.1 — field_user NO puede ver profit (DEBE devolver 0 filas o error)
SELECT project_id, profit, cost_basis, cash_invested
FROM project_financial_summaries
LIMIT 5;
-- RESULTADO ESPERADO: 0 filas (RLS bloquea) o error de permisos

-- Test 1.2 — field_user SÍ puede insertar un expense en un proyecto activo
-- (Reemplazar '<PROJECT_ID>' con un ID real)
INSERT INTO project_expenses (project_id, vendor, amount, status)
VALUES ('<PROJECT_ID>', 'Field Test Vendor', 100, 'pending');
-- RESULTADO ESPERADO: INSERT exitoso (1 row)

-- Test 1.3 — field_user NO puede aprobar su propio expense
-- (Reemplazar '<EXPENSE_ID>' con el ID del expense recién creado)
UPDATE project_expenses SET status = 'approved' WHERE id = '<EXPENSE_ID>';
-- RESULTADO ESPERADO: 0 rows updated (RLS bloquea UPDATE a field_user)

-- Test 1.4 — field_user NO puede ver disbursements
SELECT * FROM project_disbursements LIMIT 5;
-- RESULTADO ESPERADO: 0 filas

-- ==========================================
-- BLOQUE 2: Pruebas como `admin`
-- ==========================================

-- Test 2.1 — admin SÍ puede ver project_financial_summaries
SELECT project_id, profit, cost_basis FROM project_financial_summaries LIMIT 5;
-- RESULTADO ESPERADO: filas con datos financieros

-- Test 2.2 — admin SÍ puede aprobar un expense
UPDATE project_expenses SET status = 'approved' WHERE id = '<EXPENSE_ID>';
-- RESULTADO ESPERADO: 1 row updated

-- Test 2.3 — admin NO puede marcar un disbursement como paid
-- (Reemplazar '<DISB_ID>' con un disbursement aprobado real)
UPDATE project_disbursements SET status = 'paid' WHERE id = '<DISB_ID>';
-- RESULTADO ESPERADO: 0 rows updated (trigger bloquea) o excepción

-- ==========================================
-- BLOQUE 3: Pruebas como `owner`
-- ==========================================

-- Test 3.1 — owner puede marcar disbursement como paid
UPDATE project_disbursements SET status = 'paid' WHERE id = '<DISB_ID>';
-- RESULTADO ESPERADO: 1 row updated

-- Test 3.2 — Triggers de inmutabilidad siguen activos para todos los roles
-- Ejecutar como owner (debe fallar igual):
UPDATE project_expenses SET amount = 999 WHERE id = '<EXPENSE_ID>';
-- RESULTADO ESPERADO: FALLA por trigger prevent_expense_update

DELETE FROM project_expenses WHERE id = '<EXPENSE_ID>';
-- RESULTADO ESPERADO: FALLA por trigger prevent_financial_delete
