# Auth/RLS Hardening — Diseño Técnico y Decisiones

> ⚠️ DRAFT — No ejecutar. Solo para revisión y aprobación del Owner.

---

## Roles Propuestos

| Rol | Descripción | Quién es |
|---|---|---|
| `owner` | Acceso total. Único que ve P&L y puede marcar Disbursements como `paid`. | Rodolfo / Raciel |
| `admin` | Gestión operativa. Puede crear y aprobar Expenses/Refunds/Disbursements. Ve Financials. | Gerente de operaciones |
| `field_user` | Campo. Solo puede crear Expenses propios. No ve KPIs financieros internos. | Contratistas, inspectores |
| `viewer` | Solo lectura. No puede crear ni modificar. No ve KPIs internos. | Contadores externos, auditores |

---

## Matriz de Permisos Completa

### `projects`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ✅ (solo asignados) | ✅ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE campos financieros | ✅ | ❌ | ❌ | ❌ |
| UPDATE `status` → `cancelled` | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ | ❌ | ❌ | ❌ |

### `project_expenses` / `project_refunds`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ✅ (solo los suyos) | ✅ |
| INSERT | ✅ | ✅ | ✅ | ❌ |
| UPDATE `status` → `approved` | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` → `cancelled` | ✅ | ✅ | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_disbursements`
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT | ✅ | ✅ | ❌ | ❌ |
| INSERT | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` → `approved` | ✅ | ✅ | ❌ | ❌ |
| UPDATE `status` → `paid` | ✅ | ❌ | ❌ | ❌ |
| DELETE | ❌ (trigger) | ❌ (trigger) | ❌ | ❌ |

### `project_financial_summaries` (Vista P&L)
| Operación | `owner` | `admin` | `field_user` | `viewer` |
|---|---|---|---|---|
| SELECT (todos los campos) | ✅ | ✅ | ❌ | ❌ |
| SELECT vía `project_status_summary` | ✅ | ✅ | ✅ | ✅ |

---

## Tablas Afectadas por las Nuevas Políticas RLS
1. `projects`
2. `project_expenses`
3. `project_refunds`
4. `project_disbursements`
5. `project_financial_summaries` (vista)

## Tablas NO Afectadas en esta Fase
- `work_orders`
- `work_order_items`
- Cualquier otra tabla existente fuera del módulo financiero

---

## Orden de Migraciones (No ejecutar aún)
| # | Archivo Draft | Descripción |
|---|---|---|
| 1 | `004_user_roles.sql` | Tabla `user_roles` + función helper `auth_role()` |
| 2 | `005_rls_projects.sql` | Políticas granulares para `projects` |
| 3 | `006_rls_expenses_refunds.sql` | Políticas para `project_expenses` + `project_refunds` |
| 4 | `007_rls_disbursements.sql` | Políticas para `project_disbursements` |
| 5 | `008_rls_financial_summaries.sql` | Restringir vista a `owner`/`admin` |
| 6 | `009_project_status_summary_view.sql` | Nueva vista pública sin KPIs internos |

---

## Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `FOR ALL USING (true)` expone P&L a cualquier usuario autenticado | Alta | Implementar este plan una vez que pase el QA gate |
| Sin columna `created_by` en `project_expenses`, `field_user` no puede filtrar sus registros | Media | La migración `006` debe agregarla con `DEFAULT auth.uid()` si no existe |
| Romper el smoke test financiero al cambiar RLS | Media | Correr `qa/financial_system_smoke_test.sql` después de cada migración |
| Un `admin` podría necesitar marcar `paid` en campo | Baja | Decisión abierta — confirmar con Owner |

---

## Decisiones Abiertas (Requieren respuesta del Owner antes de activar)

1. **¿Existe ya la columna `created_by` en `project_expenses`?**
   Si no existe, la migración `006` debe incluirla. Impacto: no destructivo si se agrega como nullable con default.

2. **¿Puede un `admin` marcar un Disbursement como `paid`?**
   Plan actual: solo `owner`. Si la operación lo requiere, ajustar migración `007`.

3. **¿Necesita el `viewer` (contador) ver KPIs de rentabilidad?**
   Plan actual: el `viewer` accede solo a `project_status_summary` (sin `profit`, `cost_basis`, etc.). Si necesita acceso completo, debe crearse un rol `viewer_internal`.

---

## Criterios de Aceptación
- [ ] `field_user` NO puede `SELECT profit FROM project_financial_summaries`
- [ ] `field_user` SÍ puede insertar un Expense propio
- [ ] `field_user` NO puede aprobar su propio Expense
- [ ] `admin` SÍ puede aprobar Expenses y Refunds
- [ ] `admin` NO puede marcar Disbursement como `paid` (solo `owner`)
- [ ] `viewer` SÍ puede leer Expenses, NO puede insertar ni actualizar
- [ ] Triggers de inmutabilidad siguen activos para todos los roles
- [ ] El smoke test financiero original sigue pasando tras cada migración de RLS
