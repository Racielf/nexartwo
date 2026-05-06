# Auth/RLS Hardening — Diseño Técnico y Decisiones

> ⚠️ **DRAFT ONLY — DO NOT APPLY**  
> Gate obligatorio: Workflow `Supabase Financial QA` debe retornar PASS completo antes de mover cualquier archivo de este directorio a `supabase/migrations/`.

---

## Roles Propuestos

| Rol | Descripción | Quién es |
|---|---|---|
| `owner` | Acceso total. Ve P&L completo. Puede marcar Disbursements como `paid`. Puede editar campos financieros de proyectos. | Rodolfo / Raciel |
| `admin` | Gestión operativa. Aprueba Expenses/Refunds/Disbursements. Ve Financials via RPC. NO puede marcar `paid` ni editar campos financieros del proyecto. | Gerente de operaciones |
| `field_user` | Campo. Crea Expenses propios. Ve solo sus propios Expenses. No accede a datos financieros, refunds, disbursements ni a `projects` directamente. Usa `project_status_summary`. | Contratistas, inspectores |
| `viewer` | Solo lectura limitada. No ve KPIs internos, ni Disbursements, ni Refunds. Solo `project_status_summary` y sus propios contextos. | Contadores externos, auditores |

---

## Arquitectura de Acceso a Datos

### Acceso directo vs vistas seguras

| Objeto | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| `projects` (SELECT directo) | ✅ | ✅ | ❌ | ❌ |
| `project_status_summary` (vista segura) | ✅ | ✅ | ✅ | ✅ |
| `project_financial_summaries` (SELECT directo) | ❌ (REVOKE) | ❌ (REVOKE) | ❌ (REVOKE) | ❌ (REVOKE) |
| `get_project_financial_summary()` (RPC) | ✅ | ✅ | ❌ (0 filas) | ❌ (0 filas) |
| `project_expenses` | ✅ | ✅ | Solo los suyos | ❌ |
| `project_refunds` | ✅ | ✅ | ❌ | ❌ |
| `project_disbursements` | ✅ | ✅ | ❌ | ❌ |

> [!CAUTION]
> `field_user` y `viewer` **nunca** deben ver: `profit`, `cost_basis`, `cash_invested`, `net_expense_cost`, `project_cash_position`, `net_proceeds`, `purchase_price`, `down_payment`, `total_disbursements`.

---

## Matriz de Permisos Detallada

### `projects` (tabla)
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ❌ (usa `project_status_summary`) | ❌ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE campos financieros | ✅ | ❌ (trigger) | ❌ | ❌ |
| UPDATE `status` / campos operativos | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ | ❌ | ❌ | ❌ |

### `project_expenses`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT (todos) | ✅ | ✅ | Solo los suyos (`created_by = auth.uid()`) | ❌ |
| INSERT (propio) | ✅ | ✅ | ✅ (solo si `created_by = auth.uid()`) | ❌ |
| UPDATE `status` | ✅ | ✅ | ❌ | ❌ |
| UPDATE `amount`, `tax`, `vendor`, etc. | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_refunds`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ❌ | ❌ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_disbursements`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ❌ | ❌ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE → `approved` | ✅ | ✅ | ❌ | ❌ |
| UPDATE → `paid` | ✅ | ❌ (trigger) | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

---

## Objetos Nuevos — Triggers Activation-Ready (en drafts 005 y 007)

| Trigger | Tabla | Propósito |
|---|---|---|
| `prevent_non_owner_project_financial_update()` | `projects` | Bloquea a no-owner de editar campos financieros |
| `prevent_non_owner_paid_disbursement()` | `project_disbursements` | Bloquea a no-owner de marcar `paid` |

Ambos triggers están escritos como SQL ejecutable en sus respectivos drafts (no como pseudocódigo). No se ejecutan hasta que el archivo se mueva a `supabase/migrations/`.

---

## Diseño Anti-Recursión RLS en `user_roles`

**Problema:** policies que consultan `user_roles` dentro de `user_roles` → infinite recursion.  
**Solución:** función `is_owner()` con `SECURITY DEFINER` y `search_path = public, pg_temp` que bypassa RLS al consultar la tabla. Las policies la invocan directamente sin self-reference.

---

## Protección de `project_financial_summaries`

**Estrategia:** `REVOKE SELECT` total + acceso exclusivo via RPC `SECURITY DEFINER`.

1. `REVOKE SELECT ON project_financial_summaries FROM anon, authenticated`
2. `get_project_financial_summary(p_project_id)` → solo devuelve datos si `auth_role() IN ('owner','admin')`
3. `get_all_financial_summaries()` → ídem para listado completo
4. `GRANT EXECUTE` solo a `authenticated` — el auth_role check interno filtra

> El frontend deberá llamar `supabase.rpc('get_project_financial_summary', ...)` en lugar de SELECT directo. **Cambio a hacer en la Fase de Activación**, no en este draft.

---

## Orden de Migraciones (No ejecutar aún)

| # | Archivo | Dependencia | Contenido |
|---|---|---|---|
| 1a | `004a_user_roles_bootstrap.sql` | Bootstrap manual primero | `user_roles` + `is_owner()` + `auth_role()` |
| 1b | `004b_user_roles_policies.sql` | 004a + owner verificado | Policies de `user_roles` (idempotentes) |
| 2 | `005_rls_projects.sql` | 004a+b | Policies granulares + trigger de columnas financieras |
| 3 | `006_rls_expenses_refunds.sql` | 004a+b | `created_by`, policies con enforcement, refunds restringidos |
| 4 | `007_rls_disbursements.sql` | 004a+b | Policies + trigger `paid` solo owner |
| 5 | `008_rls_financial_summaries.sql` | 004-007 | REVOKE total + RPCs `SECURITY DEFINER` |
| 6 | `009_project_status_summary_view.sql` | 008 | Vista segura con REVOKE anon + GRANT authenticated |

> **Todos los archivos 005-009 son idempotentes:** incluyen `DROP POLICY IF EXISTS` y `DROP TRIGGER IF EXISTS` antes de cada `CREATE`. Seguros para reintentos.

---

## Riesgos Identificados y Estado

| Riesgo | Severidad | Estado |
|---|---|---|
| `FOR ALL USING (true)` expone P&L | Alta | Mitigado: REVOKE + RPC gated |
| Self-recursion en policies de `user_roles` | Alta | Resuelto: `is_owner()` SECURITY DEFINER |
| `SECURITY DEFINER` sin `search_path` | Alta | Resuelto: todas las funciones tienen `SET search_path = public, pg_temp` |
| `field_user` ve campos financieros via SELECT en `projects` | Alta | Resuelto: SELECT en `projects` solo para owner/admin |
| `field_user` spoofea `created_by` | Media | Resuelto: enforcement en INSERT policy |
| `field_user` ve `amount` en refunds | Media | Resuelto: refunds solo para owner/admin |
| Romper smoke test financiero al cambiar RLS | Media | Mitigado: correr `qa/financial_system_smoke_test.sql` tras cada migración |

---

## Decisiones Cerradas

| Decisión | Resolución |
|---|---|
| ¿Admin puede marcar `paid` en disbursements? | **NO** — Solo owner. Trigger enforced. |
| ¿Se incluyen montos en `project_status_summary`? | **NO** — Solo conteos y metadata operativa. |
| ¿`field_user` crea refunds? | **NO** — Correcciones contables internas (owner/admin). |
| ¿`field_user` tiene SELECT directo en `projects`? | **NO** — Usa `project_status_summary`. |
| ¿`field_user` puede ver `project_refunds`? | **NO** — Contienen `amount` (dato financiero). |
| Fórmula `profit` vs `project_cash_position` | **Opción A permanente** — no reabrir. |
| ¿Cómo acceden owner/admin a `project_financial_summaries`? | Via RPC `get_project_financial_summary()` / `get_all_financial_summaries()` |

## Decisiones Aún Abiertas

| # | Decisión | Impacto |
|---|---|---|
| 1 | ¿El `viewer` (contador interno) necesita ver KPIs de P&L? | Si sí, se añade a la RPC con `auth_role() IN ('owner','admin','viewer')`. Scope diferido. |
| 2 | ¿Se necesita `approved_by_user_id` en disbursements para auditoría? | Si sí, migración 010+ agrega esa columna. Fuera de scope de este paquete. |

---

## Criterios de Aceptación

- [ ] `field_user` NO puede `SELECT` directo en `projects` (purchase_price, down_payment ocultos)
- [ ] `field_user` SÍ puede `SELECT` de `project_status_summary` (sin montos)
- [ ] `field_user` NO puede invocar `get_all_financial_summaries()` y obtener datos
- [ ] `field_user` SÍ puede insertar Expense con `created_by = auth.uid()`
- [ ] `field_user` NO puede insertar Expense con `created_by` de otro usuario
- [ ] `field_user` NO puede aprobar su propio Expense
- [ ] `field_user` NO puede ver ni insertar Disbursements ni Refunds
- [ ] `admin` SÍ puede ver `project_financial_summaries` via RPC
- [ ] `admin` NO puede `SELECT` directo en `project_financial_summaries` (REVOKE)
- [ ] `admin` NO puede marcar Disbursement como `paid`
- [ ] `admin` NO puede editar campos financieros de `projects`
- [ ] `owner` puede realizar todas las operaciones permitidas
- [ ] Triggers de inmutabilidad (`amount`, `tax`, DELETE) siguen activos para **todos** los roles
- [ ] Smoke test financiero original pasa tras cada migración de RLS
