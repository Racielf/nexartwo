# Auth/RLS Hardening — Checklist de Preparación

> ⚠️ DRAFT — No ejecutar. No aplicar a Supabase. Gate: Workflow Supabase Financial QA debe retornar PASS.

## Estado de los Drafts
- [x] Roles y Matriz de Permisos documentados
- [x] Borrador SQL — `004_user_roles.sql`
- [x] Borrador SQL — `005_rls_projects.sql`
- [x] Borrador SQL — `006_rls_expenses_refunds.sql`
- [x] Borrador SQL — `007_rls_disbursements.sql`
- [x] Borrador SQL — `008_rls_financial_summaries.sql`
- [x] Borrador SQL — `009_project_status_summary_view.sql`
- [x] Smoke test de permisos — `permission_smoke_test.sql`
- [x] Rollback RLS documentado
- [ ] **Revisión y aprobación del Owner antes de mover a `supabase/migrations/`**

## Pasos de Activación (Cuando el Gate esté abierto)
1. Confirmar respuestas a decisiones abiertas (ver `DESIGN.md`).
2. Revisar cada borrador SQL en este directorio.
3. Mover a `supabase/migrations/` en orden numérico estricto.
4. Ejecutar el smoke test de permisos después de cada migración.
5. Merge de esta rama a `main`.
