# Auth/RLS Hardening — Diseño Técnico y Decisiones

> ⚠️ **DRAFT ONLY — DO NOT APPLY**
> Gate obligatorio: Workflow `Supabase Financial QA` debe retornar PASS completo antes de mover cualquier archivo de este directorio a `supabase/migrations/`.

---

## Roles Propuestos

| Rol | Descripción | Quién es |
|---|---|---|
| `owner` | Acceso total. Único que ve P&L y puede marcar Disbursements como `paid`. Único que puede editar campos financieros de proyectos. | Rodolfo / Raciel |
| `admin` | Gestión operativa. Puede crear y aprobar Expenses/Refunds/Disbursements. Ve Financials. NO puede marcar `paid` ni editar campos financieros del proyecto. | Gerente de operaciones |
| `field_user` | Campo. Solo puede crear Expenses propios. Ve solo sus propios Expenses. No ve KPIs financieros, ni Disbursements, ni campos de P&L. | Contratistas, inspectores |
| `viewer` | Solo lectura. No puede crear ni modificar nada. No ve KPIs internos ni Disbursements. | Contadores externos, auditores |

---

## Matriz de Permisos Completa

### `projects`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ✅ | ✅ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE campos financieros | ✅ | ❌ (trigger) | ❌ | ❌ |
| UPDATE `status` | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ | ❌ | ❌ | ❌ |

### `project_expenses`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT (todos) | ✅ | ✅ | Solo los suyos (`created_by`) | ✅ |
| INSERT | ✅ | ✅ | ✅ | ❌ |
| UPDATE `status` | ✅ | ✅ | ❌ | ❌ |
| UPDATE campos históricos (`amount`, `tax`, etc.) | ❌ (trigger) | ❌ (trigger) | ❌ (trigger) | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_refunds`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ✅ | ✅ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_disbursements`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ❌ | ❌ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` → `approved` | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` → `paid` | ✅ | ❌ (trigger) | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_financial_summaries` (Vista P&L interna)
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT (todos los KPIs) | ✅ | ✅ | ❌ | ❌ |

### `project_status_summary` (Vista operativa segura)
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT (`project_id`, `name`, `address`, `status`, `property_type`, `expense_count`, `refund_count`, `last_activity`) | ✅ | ✅ | ✅ | ✅ |

> [!CAUTION]
> Los campos `profit`, `cost_basis`, `cash_invested`, `net_expense_cost`, `project_cash_position`, `net_proceeds`, `purchase_price` y `down_payment` son **estrictamente internos**. Nunca deben aparecer en `project_status_summary` ni en interfaces client-facing.

---

## Tablas y Objetos Afectados

| Objeto | Tipo | Acción |
|---|---|---|
| `user_roles` | Tabla nueva | Crear |
| `auth_role()` | Función nueva | Crear con `SECURITY DEFINER SET search_path` |
| `projects` | Tabla existente | Reemplazar policies MVP |
| `project_expenses` | Tabla existente | Agregar `created_by`, reemplazar policies |
| `project_refunds` | Tabla existente | Reemplazar policies |
| `project_disbursements` | Tabla existente | Reemplazar policies |
| `project_financial_summaries` | Vista existente | Recrear con `security_invoker = true` + REVOKE anon |
| `project_status_summary` | Vista nueva | Crear |
| `prevent_non_owner_project_financial_update()` | Trigger nuevo | Crear (en migración 005) |
| `prevent_non_owner_paid_disbursement()` | Trigger nuevo | Crear (en migración 007) |

---

## Orden de Migraciones (No ejecutar aún)

| # | Archivo Draft | Dependencia | Descripción |
|---|---|---|---|
| 1 | `004_user_roles.sql` | Bootstrap manual primero | Tabla `user_roles` + función `auth_role()` con `search_path` |
| 2 | `005_rls_projects.sql` | 004 aplicado | Policies granulares para `projects` + trigger columnar |
| 3 | `006_rls_expenses_refunds.sql` | 004 aplicado | `created_by` en expenses, policies granulares |
| 4 | `007_rls_disbursements.sql` | 004 aplicado | Policies + trigger `paid` solo para owner |
| 5 | `008_rls_financial_summaries.sql` | 004-007 aplicados | `security_invoker`, REVOKE anon en vista P&L |
| 6 | `009_project_status_summary_view.sql` | 008 aplicado | Vista operativa sin KPIs internos |

---

## Riesgos Identificados

| Riesgo | Severidad | Estado |
|---|---|---|
| `FOR ALL USING (true)` expone P&L a cualquier autenticado | Alta | Mitigado en este plan |
| Sin `created_by`, `field_user` ve expenses de otros | Media | Resuelto: `ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS created_by` |
| Bootstrap deadlock (primer owner) | Alta | Resuelto: instrucciones de seed previas a activar policies |
| `SECURITY DEFINER` sin `search_path` puede ser explotado | Alta | Resuelto: `SET search_path = public, pg_temp` en `auth_role()` |
| Romper smoke test financiero al cambiar RLS | Media | Mitigado: correr `qa/financial_system_smoke_test.sql` tras cada migración |
| Admin edita campos financieros del proyecto | Media | Resuelto: trigger `prevent_non_owner_project_financial_update()` |

---

## Decisiones Cerradas

| Decisión | Resolución |
|---|---|
| ¿Admin puede marcar `paid` en disbursements? | **NO** — Solo owner. Enforce via trigger. |
| ¿Se incluyen montos en `project_status_summary`? | **NO** — Solo conteos y metadata operativa. |
| ¿`field_user` crea refunds? | **NO** — Los refunds son correcciones contables internas (owner/admin). |
| Fórmula de `profit` vs `project_cash_position` | **Opción A permanente** — no reabrir. |

## Decisiones Aún Abiertas

| # | Decisión | Impacto |
|---|---|---|
| 1 | ¿El `viewer` (contador) necesita ver KPIs internos de P&L? | Si sí, crear rol `viewer_internal` con acceso a `project_financial_summaries`. |
| 2 | ¿Se necesita `approved_by_user_id` en disbursements para auditoría? | Si sí, migración 010+ agrega esa columna. Fuera de scope de este paquete. |

---

## Criterios de Aceptación

- [ ] `field_user` NO puede `SELECT profit FROM project_financial_summaries`
- [ ] `field_user` SÍ puede `SELECT` de `project_status_summary` (sin montos)
- [ ] `field_user` SÍ puede insertar un Expense propio
- [ ] `field_user` NO puede aprobar su propio Expense
- [ ] `field_user` NO puede ver ni insertar Disbursements
- [ ] `admin` SÍ puede aprobar Expenses y Refunds
- [ ] `admin` NO puede marcar Disbursement como `paid`
- [ ] `admin` NO puede editar campos financieros de `projects`
- [ ] `owner` puede realizar todas las operaciones permitidas
- [ ] `viewer` SÍ puede leer Expenses y Refunds, NO puede insertar ni actualizar
- [ ] Triggers de inmutabilidad (`amount`, `tax`, DELETE) siguen activos para **todos** los roles
- [ ] El smoke test financiero original (`qa/financial_system_smoke_test.sql`) sigue pasando tras cada migración de RLS
