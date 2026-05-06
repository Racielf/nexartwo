# Production Gate Execution Prep

Este documento es la guía única y definitiva para ejecutar el *Supabase Financial QA Workflow* en el repositorio NexArtWO. Su propósito es definir los pasos, requisitos y acciones post-ejecución del gate de producción, garantizando que el entorno financiero se mantenga seguro, auditado y congelado hasta su validación.

## 1. Estado Actual Congelado

Antes de ejecutar este workflow, el estado del sistema es el siguiente:
- **Financial SQL:** Congelado. Los esquemas base (`001`, `002`, `003`) están listos y no deben ser modificados.
- **Vanilla JS Integration:** Congelado. Las consultas frontend a Supabase no sufrirán cambios sin pase previo del QA.
- **QA Automation:** Implementado. Los tests `financial_system_smoke_test.sql` cubren las 15 reglas de P&L de Opción A.
- **Client-Facing Safety:** Auditado (PASS). Ningún documento expone información de márgenes o costos.
- **PDFs/Docs:** Auditados y con bugs visuales de impresión solucionados (PASS WITH LOW-RISK FIXES).
- **Work Orders UX Cleanup:** Implementado de forma no destructiva (Empty states y affordances completados, PASS WITH LOW-RISK FIXES).
- **OCR Planning:** Completado exclusivamente como documento arquitectónico. Sin código implementado.
- **Auth/RLS Draft Final:** Aislado en `supabase/drafts/auth-rls/`. (READY FOR FUTURE ACTIVATION AFTER GATE). **NO ACTIVADO.**

## 2. Secrets Requeridos en GitHub

Para que el workflow pueda conectar con Supabase e inyectar el esquema/ejecutar el smoke test, deben estar configurados en **GitHub > Settings > Secrets and variables > Actions**:

- `SUPABASE_ACCESS_TOKEN`: Token de autenticación del CLI.
- `SUPABASE_PROJECT_REF`: ID del proyecto de Supabase objetivo.
- `SUPABASE_DB_PASSWORD`: Contraseña de base de datos del proyecto objetivo.

> **Importante:** No comparta, no imprima en logs y no exponga los valores de estos secrets.

## 3. Cómo Correr el Workflow

1. Navegar a la pestaña **Actions** en el repositorio de GitHub.
2. Seleccionar el workflow llamado **Supabase Financial QA** en el menú lateral izquierdo.
3. Hacer clic en el botón desplegable **Run workflow**.
4. Asegurarse de que la rama objetivo seleccionada sea `feat/auth-rls-hardening-prep` (o la rama actual unificada que contiene los últimos cambios).
5. Iniciar la ejecución. En los logs se podrá observar la inicialización de Supabase CLI, inyección del esquema financiero base, y la ejecución de los assertions del smoke test (15 reglas).

## 4. Interpretación del Resultado

### Si el resultado es **PASS** (Éxito verde):
- Se confirma que la Fase 1 y Fase 2 (SQL Financiero y Reglas Opción A) funcionan perfectamente bajo un entorno limpio de Supabase real.
- **NO** activar Auth/RLS de inmediato de manera automática.
- Se debe abrir una fase completamente separada para diseñar e iniciar el **Auth/RLS Activation Plan**.

### Si el resultado es **FAIL** (Falla roja):
- **NO** intentar implementar features nuevas, ni aplicar bypasses.
- Capturar el log exacto en la sección que falló.
- Diagnosticar dónde radicó el fallo: si fue falla de conexión (Secrets), un error de sintaxis SQL al pushear la migración, permisos en el host, o una falla matemática en los assertions de `financial_system_smoke_test.sql`.
- Corregir de forma quirúrgica *únicamente* el bug específico que causó el fallo.
- Volver a correr el workflow.

## 5. Evidencia Requerida Post-Ejecución

Para dar por cerrado este Gate, es estrictamente obligatorio registrar:
- **Workflow Run URL:** El link permanente al log en GitHub Actions.
- **Commit SHA:** El hash del commit exacto que fue evaluado.
- **Fecha y Hora** de la ejecución.
- **Resultado:** PASS o FAIL.
- **Logs relevantes:** (Si aplicó un FAIL, el segmento del error SQL/Conexión).

## 6. Bloqueantes Actuales (Estado Cero)

Actualmente no es posible activar y migrar nada debido a los siguientes bloqueantes pendientes de resolución:
- Los **Secrets** no han sido validados o confirmados en el entorno de GitHub.
- El **Workflow** en sí mismo aún no ha tenido su primera ejecución.
- El **Owner UUID** (requerido para la posterior activación de RLS) no ha sido identificado.
- Un **Backup/Snapshot manual** de la DB actual no ha sido reportado o confirmado.
- Las políticas de **Auth/RLS** no son activables hasta remover el bloqueo (PASS del workflow).

## 7. Qué **NO** Hacer

Bajo ninguna circunstancia durante o después del Gate:
- **NO** realizar un `supabase db push` manual sin revisión cruzada.
- **NO** ejecutar los scripts de la carpeta `drafts/auth-rls/` saltándose este documento.
- **NO** mover prematuramente los archivos drafts hacia `supabase/migrations/`.
- **NO** editar archivos de SQL Financiero guiado por simples intuiciones si el test falla.
- **NO** usar `localStorage` para desviar transacciones financieras a modo de rollback.
- **NO** iniciar el desarrollo/código de la funcionalidad OCR.
- **NO** alterar documentos para exponer información de rentabilidad al cliente.

## 8. Próxima Decisión Después del PASS

Una vez asegurado el PASS y recolectada la evidencia, se presentarán dos rutas claras para continuar el desarrollo. **Ninguna se ejecutará de forma automática;** requerirán aprobación gerencial expresa:

*   **Ruta A) Auth/RLS Activation Plan:** Proceder metódicamente con el despliegue a producción de las políticas restrictivas de Auth/RLS para endurecer la base de datos (Ejecutando en orden estricto de `004a` a `009`).
*   **Ruta B) Receipt Upload 4A:** Iniciar el desarrollo del almacenamiento manual de recibos usando Supabase Storage sin IA/OCR todavía.
