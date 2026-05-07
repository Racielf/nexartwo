# Auth/RLS Hardening — Checklist de Preparación

> ⚠️ **DRAFT ONLY — DO NOT APPLY**  
> Gate obligatorio: Workflow `Supabase Financial QA` debe retornar PASS completo antes de mover cualquier archivo a `supabase/migrations/`.

---

## Estado del Paquete

| Archivo Draft | Estado | Descripción |
|---|---|---|
| ~~`004_user_roles.sql`~~ | ❌ Archivado | Movido a `archive/004_user_roles.deprecated.sql`. No usar. |
| `004a_user_roles_bootstrap.sql` | ✅ Listo | Tabla + funciones helper (`is_owner`, `auth_role`) + instrucciones de bootstrap |
| `004b_user_roles_policies.sql` | ✅ Listo | Policies de `user_roles` — ejecutar solo tras verificar owner |
| `005_rls_projects.sql` | ✅ Listo | Policies granulares + trigger de columnas financieras |
| `006_rls_expenses_refunds.sql` | ✅ Listo | `created_by`, policies con enforcement en INSERT |
| `007_rls_disbursements.sql` | ✅ Listo | Policies + trigger `paid` solo para owner |
| `008_rls_financial_summaries.sql` | ✅ Listo | REVOKE total + RPCs SECURITY DEFINER |
| `009_project_status_summary_view.sql` | ✅ Listo | Opción B: REVOKE total + RPC `get_project_status_summary()` para owner/admin únicamente |
| `permission_smoke_test.sql` | ✅ Listo | 18 tests en 4 bloques por rol |
| `ROLLBACK.md` | ✅ Listo | Protocolo de rollback sin pérdida de datos |
| `DESIGN.md` | ✅ Listo | Diseño técnico completo, decisiones cerradas |

> **Estado de field_user/viewer:** No tienen superficie de proyectos en esta fase.  
> Accederán a `project_status_summary` en migración 010+ cuando exista `project_assignments`.

## Tarea Bloqueante de Activación (Activation Readiness)
> [!WARNING]
> Antes de activar `008_rls_financial_summaries.sql`, se debe planificar y ejecutar un cambio futuro en `js/supabase.js`:
> - Reemplazar el `SELECT` directo a `project_financial_summaries`.
> - Usar la RPC `get_all_financial_summaries()`.
> - Usar la RPC `get_project_financial_summary({ p_project_id })`.
> No implementar ese cambio ahora. Documentado como bloqueante para la activación.

---

## Orden de Activación (Cuando el Gate esté abierto)

> Estos pasos aplican **solo** después del PASS del workflow QA.  
> Ejecutar en orden estricto. Verificar entre cada paso.

1. **Confirmar respuestas a decisiones abiertas** en `DESIGN.md` (2 pendientes).
2. **Revisar cada draft** en este directorio y aprobar su contenido.
3. **Ejecutar `004a`** en Supabase SQL Editor (service_role):
   - Crea la tabla y las funciones helper.
   - Insertar el primer owner según las instrucciones del archivo.
   - Verificar: `SELECT * FROM user_roles; SELECT is_owner();`
4. **Ejecutar `004b`** solo si el paso 3 fue verificado exitosamente.
5. **Ejecutar `005`** → Verificar que field_user no puede SELECT en `projects`.
6. **Ejecutar `006`** → Verificar expenses y refunds.
7. **Ejecutar `007`** → Verificar disbursements y trigger de paid.
8. **Ejecutar `008`** → Verificar REVOKE y acceso via RPC.
9. **Ejecutar `009`** → Verificar que field_user ve `project_status_summary`.
10. **Correr `permission_smoke_test.sql`** completo (4 bloques).
11. **Correr `qa/financial_system_smoke_test.sql`** para confirmar que las matemáticas no se rompieron.
12. **Mover archivos** de `supabase/drafts/auth-rls/` a `supabase/migrations/` con numeración correcta.
13. **Merge** de la rama `feat/auth-rls-hardening-prep` hacia `main`.

---

## Propiedades del Paquete

- **Idempotente:** todos los archivos incluyen `DROP POLICY IF EXISTS` y `DROP TRIGGER IF EXISTS` antes de los `CREATE`. Seguro para reintentos.
- **Bootstrap seguro:** `004a` y `004b` están separados. Las policies solo se activan después de verificar el primer owner.
- **Anti-recursión:** `is_owner()` usa `SECURITY DEFINER` para consultar `user_roles` sin pasar por RLS.
- **Protección de vista financiera:** `REVOKE` total + acceso via RPC gated con `auth_role()`.
- **Vista segura:** `project_status_summary` con `REVOKE anon` + `GRANT authenticated` explícito.

---

## Restricciones Permanentes (No Negociables)

- No modificar fórmula financiera (Opción A congelada).
- No hacer hard-delete en tablas financieras.
- No exponer `profit`, `cost_basis`, `cash_invested`, `project_cash_position` a roles externos.
- No mover estos archivos a `supabase/migrations/` sin PASS del workflow.
