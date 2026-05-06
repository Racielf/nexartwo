-- ============================================================
-- DRAFT — Auth/RLS Hardening
-- Smoke Test de Permisos por Rol
-- ============================================================
-- ⚠️  DRAFT ONLY — DO NOT EXECUTE AGAINST PRODUCTION
--     Correr DESPUÉS de activar las 6 migraciones de RLS (004-009).
--     Usar sesiones de usuario reales autenticadas en Supabase.
--     No usa ROLLBACK — valida permisos reales de sesión activa.
--
-- INSTRUCCIONES:
-- Reemplazar <PROJECT_ID>, <EXPENSE_ID>, <DISB_ID> con IDs reales.
-- Autenticar en Supabase con el rol correspondiente antes de cada bloque.
-- ============================================================

-- ==========================================
-- BLOQUE 1: Pruebas como `field_user`
-- ==========================================

-- Test 1.1 — field_user NO puede SELECT directo en projects
-- (contendría purchase_price, down_payment, etc.)
-- RESULTADO ESPERADO: 0 filas (RLS bloquea)
SELECT id, name, purchase_price, down_payment
FROM projects
LIMIT 5;

-- Test 1.2 — field_user SÍ puede consultar project_status_summary (vista segura)
-- RESULTADO ESPERADO: filas con project_id, name, status — SIN montos financieros
SELECT project_id, name, status, expense_count, refund_count, last_activity
FROM project_status_summary
LIMIT 5;

-- Test 1.3 — field_user NO puede consultar project_financial_summaries directamente
-- RESULTADO ESPERADO: error de permisos (REVOKE) — 0 filas o excepción
SELECT project_id, profit, cost_basis, cash_invested
FROM project_financial_summaries
LIMIT 5;

-- Test 1.4 — field_user NO puede invocar RPC financiera y obtener datos
-- RESULTADO ESPERADO: 0 filas (auth_role check interno bloquea)
SELECT * FROM get_all_financial_summaries();

-- Test 1.5 — field_user SÍ puede insertar un expense con created_by = auth.uid()
-- RESULTADO ESPERADO: INSERT exitoso (1 row)
INSERT INTO project_expenses (project_id, vendor, amount, status, created_by)
VALUES ('<PROJECT_ID>', 'Field Test Vendor', 100, 'pending', auth.uid());

-- Test 1.6 — field_user NO puede insertar expense con created_by de otro usuario
-- RESULTADO ESPERADO: error de policy (created_by != auth.uid())
INSERT INTO project_expenses (project_id, vendor, amount, status, created_by)
VALUES ('<PROJECT_ID>', 'Spoof Vendor', 100, 'pending', '00000000-0000-0000-0000-000000000000');

-- Test 1.7 — field_user NO puede aprobar su propio expense
-- RESULTADO ESPERADO: 0 rows updated (RLS bloquea UPDATE para field_user)
UPDATE project_expenses
SET status = 'approved'
WHERE id = '<EXPENSE_ID>';

-- Test 1.8 — field_user NO puede ver project_disbursements
-- RESULTADO ESPERADO: 0 filas
SELECT * FROM project_disbursements LIMIT 5;

-- Test 1.9 — field_user NO puede ver project_refunds (contienen amount)
-- RESULTADO ESPERADO: 0 filas
SELECT id, amount FROM project_refunds LIMIT 5;

-- ==========================================
-- BLOQUE 2: Pruebas como `admin`
-- ==========================================

-- Test 2.1 — admin SÍ puede SELECT directo en projects
-- RESULTADO ESPERADO: filas completas
SELECT id, name, purchase_price, down_payment FROM projects LIMIT 5;

-- Test 2.2 — admin SÍ puede invocar RPC financiera
-- RESULTADO ESPERADO: filas con profit, cost_basis, etc.
SELECT * FROM get_all_financial_summaries();

-- Test 2.3 — admin SÍ puede consultar project_financial_summaries via RPC
SELECT * FROM get_project_financial_summary('<PROJECT_ID>');

-- Test 2.4 — admin NO puede consultar project_financial_summaries directamente
-- RESULTADO ESPERADO: error de permisos (REVOKE)
SELECT profit FROM project_financial_summaries LIMIT 1;

-- Test 2.5 — admin SÍ puede aprobar un expense
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_expenses SET status = 'approved' WHERE id = '<EXPENSE_ID>';

-- Test 2.6 — admin NO puede marcar un disbursement como paid
-- RESULTADO ESPERADO: excepción del trigger prevent_non_owner_paid_disbursement
UPDATE project_disbursements SET status = 'paid' WHERE id = '<DISB_ID>';

-- Test 2.7 — admin NO puede modificar campos financieros de un proyecto
-- RESULTADO ESPERADO: excepción del trigger prevent_non_owner_project_financial_update
UPDATE projects SET purchase_price = 999999 WHERE id = '<PROJECT_ID>';

-- ==========================================
-- BLOQUE 3: Pruebas como `owner`
-- ==========================================

-- Test 3.1 — owner SÍ puede marcar disbursement como paid
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_disbursements SET status = 'paid' WHERE id = '<DISB_ID>';

-- Test 3.2 — owner SÍ puede modificar campos financieros del proyecto
-- RESULTADO ESPERADO: 1 row updated
UPDATE projects SET purchase_price = 110000 WHERE id = '<PROJECT_ID>';

-- Test 3.3 — owner SÍ puede invocar RPC financiera
SELECT * FROM get_project_financial_summary('<PROJECT_ID>');

-- ==========================================
-- BLOQUE 4: Triggers de inmutabilidad (cualquier rol, incluyendo owner)
-- ==========================================

-- Test 4.1 — UPDATE amount DEBE fallar (trigger trg_no_update_expenses / REGLA 9)
-- RESULTADO ESPERADO: excepción REGLA 9
UPDATE project_expenses SET amount = 999 WHERE id = '<EXPENSE_ID>';

-- Test 4.2 — UPDATE tax DEBE fallar (REGLA 9)
-- RESULTADO ESPERADO: excepción REGLA 9
UPDATE project_expenses SET tax = 999 WHERE id = '<EXPENSE_ID>';

-- Test 4.3 — DELETE DEBE fallar (trigger prevent_financial_delete / REGLA 14)
-- RESULTADO ESPERADO: excepción REGLA 14
DELETE FROM project_expenses WHERE id = '<EXPENSE_ID>';

-- Test 4.4 — UPDATE status DEBE funcionar para owner/admin
-- RESULTADO ESPERADO: 1 row updated
UPDATE project_expenses SET status = 'cancelled' WHERE id = '<EXPENSE_ID>';

-- ==========================================
-- BLOQUE 5: Pruebas como `viewer`
-- ==========================================

-- Test 5.1 — viewer NO puede SELECT directo en projects
-- RESULTADO ESPERADO: 0 filas (RLS bloquea)
SELECT id, name, purchase_price, down_payment FROM projects LIMIT 5;

-- Test 5.2 — viewer NO puede SELECT directo en project_financial_summaries
-- RESULTADO ESPERADO: error de permisos (REVOKE)
SELECT profit FROM project_financial_summaries LIMIT 1;

-- Test 5.3 — viewer NO puede ejecutar get_project_financial_summary() con resultados
-- RESULTADO ESPERADO: 0 filas
SELECT * FROM get_project_financial_summary('<PROJECT_ID>');

-- Test 5.4 — viewer NO puede SELECT project_disbursements
-- RESULTADO ESPERADO: 0 filas
SELECT * FROM project_disbursements LIMIT 5;

-- Test 5.5 — viewer NO puede SELECT project_refunds
-- RESULTADO ESPERADO: 0 filas
SELECT * FROM project_refunds LIMIT 5;

-- Test 5.6 — viewer NO puede INSERT/UPDATE project_expenses
-- RESULTADO ESPERADO: error de permisos (RLS bloquea)
INSERT INTO project_expenses (project_id, vendor, amount, status, created_by)
VALUES ('<PROJECT_ID>', 'Test', 100, 'pending', auth.uid());
UPDATE project_expenses SET status = 'cancelled' WHERE id = '<EXPENSE_ID>';

-- Test 5.7 — viewer NO tiene project_status_summary (hasta migración futura 010+)
-- RESULTADO ESPERADO: error de permisos o 0 filas
SELECT * FROM get_project_status_summary();
