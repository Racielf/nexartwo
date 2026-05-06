# Release Checklist: NexArtWO Financial System

Este documento define los criterios operativos y de seguridad para considerar la integración financiera como estable para producción.

## Pre-requisitos de Estabilidad
Antes de hacer el despliegue final (Fase 1 + Fase 2), el equipo debe confirmar que:

1. **Workflow de QA Exitoso:** El pipeline de GitHub Actions (`Supabase Financial QA`) se ha ejecutado satisfactoriamente sin fallos (ver tabla con salidas `PASS`). El Smoke Test previene regresiones en matemáticas contables y triggers.
2. **Revisión Interna del Equipo:** Operaciones confirma que la fórmula de separación estricta (Opción A) es la deseada, donde P&L y Flujo de Caja no se mezclan.
3. **Carga Inicial de Secrets:** Todos los GitHub Secrets han sido mapeados correctamente para el CI.

## Pasos para el Lanzamiento Oficial
1. Obtén confirmación escrita (o "Approved" en PR) de que el Smoke test pasó.
2. Guarda el screenshot o link del workflow exitoso como evidencia.
3. Efectúa el merge de la rama `main`.
4. El equipo debe usar Supabase CLI desde un entorno con credenciales de admin para aplicar las migraciones a producción:
   ```bash
   npx supabase db push
   ```

## Resolución de Incidentes de Lanzamiento
### Si el Workflow Falla
- Revisa el paso "Run Smoke Test via psql" en GitHub Actions.
- Busca el `FAIL` en la tabla.
- Si falla en cálculos financieros (`cost_basis`, `profit`, etc.), NO toques el Frontend. Se debe corregir el bug matemático en `project_financial_summaries` y actualizar la migración.
- Si falla un test de Inmutabilidad, revisa los triggers que protegen las tablas.

### Después del Lanzamiento Exitoso
1. Informar al equipo sobre el uso de los módulos `Financials`, `Expenses` y `Disbursements`.
2. Empezar a planear la refactorización de RLS (ver `AUTH_RLS_BACKLOG.md`).
