# Auth/RLS Activation Plan

Plan de activación ejecutable para el paquete de endurecimiento Auth/RLS del sistema financiero NexArtWO.

> **Estado:** Plan aprobado para documentación. NO ejecutar hasta recibir orden explícita.
>
> **Evidencia de Production Gate:**
> - Workflow: https://github.com/Racielf/nexartwo/actions/runs/25471506803
> - Commit: `67cd7a3`
> - Branch: `feat/auth-rls-hardening-prep`
> - Status: **PASS** — 2026-05-07T01:52:56Z

---

## 1. Activation Prerequisites

Antes de ejecutar cualquier migración RLS, todos estos prerequisitos deben estar cumplidos:

| # | Requisito | Estado |
|---|-----------|--------|
| 1 | Production Gate QA — PASS | ✅ Completado (run 25471506803) |
| 2 | GitHub Secrets configurados | ✅ Completado (SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD) |
| 3 | Owner UUID identificado | ⏳ Pendiente — buscar en `auth.users` con `SELECT id, email FROM auth.users;` |
| 4 | Backup/Snapshot de DB | ⏳ Pendiente — crear snapshot manual en Supabase Dashboard > Database > Backups |
| 5 | Ventana de activación acordada | ⏳ Pendiente — recomendar horario de baja actividad |
| 6 | Lista de usuarios y roles definida | ⏳ Pendiente — al menos el owner; admin/field_user/viewer son opcionales en esta fase |
| 7 | Frontend RPC compatibility (antes de 008) | ⏳ Pendiente — ver sección 4 |

---

## 2. Migration Promotion Plan

Los drafts activos serán promovidos de `supabase/drafts/auth-rls/` a `supabase/migrations/` en el futuro. **No mover todavía.**

| Draft actual | Destino futuro | Tamaño |
|---|---|---|
| `004a_user_roles_bootstrap.sql` | `supabase/migrations/004a_user_roles_bootstrap.sql` | 3.1 KB |
| `004b_user_roles_policies.sql` | `supabase/migrations/004b_user_roles_policies.sql` | 1.8 KB |
| `005_rls_projects.sql` | `supabase/migrations/005_rls_projects.sql` | 3.7 KB |
| `006_rls_expenses_refunds.sql` | `supabase/migrations/006_rls_expenses_refunds.sql` | 4.3 KB |
| `007_rls_disbursements.sql` | `supabase/migrations/007_rls_disbursements.sql` | 2.7 KB |
| `008_rls_financial_summaries.sql` | `supabase/migrations/008_rls_financial_summaries.sql` | 3.2 KB |
| `009_project_status_summary_view.sql` | `supabase/migrations/009_project_status_summary_view.sql` | 3.8 KB |

**Proceso de promoción (futuro):**
1. Copiar archivo de `drafts/auth-rls/` a `supabase/migrations/`.
2. Verificar que la numeración no colisione con migraciones existentes (001–003 ya ocupadas).
3. Remover el header `DRAFT ONLY — DO NOT APPLY` de cada archivo promovido.
4. Commit y push individual por cada archivo promovido, verificando entre cada paso.

---

## 3. Activation Order

Orden estricto de ejecución. Cada paso requiere verificación antes de continuar al siguiente.

```
PASO 1  ──►  Ejecutar 004a_user_roles_bootstrap.sql
                 │
                 ├── Crea tabla user_roles
                 ├── Crea función is_owner()
                 └── Crea función auth_role()
                 │
PASO 2  ──►  Insertar owner (ver sección 5)
                 │
                 └── INSERT INTO user_roles (user_id, role)
                     VALUES ('<OWNER_UUID>', 'owner');
                 │
PASO 3  ──►  Verificar owner
                 │
                 ├── SELECT * FROM user_roles;         → debe mostrar 1 fila
                 ├── SELECT is_owner();                → debe retornar TRUE
                 └── SELECT auth_role();               → debe retornar 'owner'
                 │
PASO 4  ──►  Ejecutar 004b_user_roles_policies.sql
                 │
                 └── Activar policies de user_roles
                 │
PASO 5  ──►  Ejecutar 005_rls_projects.sql
                 │
                 └── Verificar: field_user NO puede SELECT en projects
                 │
PASO 6  ──►  Ejecutar 006_rls_expenses_refunds.sql
                 │
                 └── Verificar: expenses con created_by, refunds restringidos
                 │
PASO 7  ──►  Ejecutar 007_rls_disbursements.sql
                 │
                 └── Verificar: trigger paid solo para owner
                 │
   ┌─────────────────────────────────────────────────────────┐
   │  ⚠️  BLOCKER: Frontend RPC Compatibility (sección 4)   │
   │  Ejecutar cambio en js/supabase.js ANTES de paso 8     │
   └─────────────────────────────────────────────────────────┘
                 │
PASO 8  ──►  Ejecutar 008_rls_financial_summaries.sql
                 │
                 ├── REVOKE SELECT en project_financial_summaries
                 ├── Crea RPCs get_project_financial_summary()
                 │         y get_all_financial_summaries()
                 └── Verificar: SELECT directo falla, RPC funciona
                 │
PASO 9  ──►  Ejecutar 009_project_status_summary_view.sql
                 │
                 └── Verificar: RPC get_project_status_summary() funciona para owner/admin
                 │
PASO 10 ──►  Ejecutar permission_smoke_test.sql (5 bloques)
                 │
                 └── Verificar: todos los bloques PASS
                 │
PASO 11 ──►  Ejecutar qa/financial_system_smoke_test.sql
                 │
                 └── Verificar: las matemáticas financieras no se rompieron
                 │
PASO 12 ──►  Rerun del workflow Supabase Financial QA
                 │
                 └── Verificar: PASS post-activación
                 │
PASO 13 ──►  Verificación final
                 │
                 ├── Prueba frontend (ver sección 6)
                 ├── Recolectar evidencia
                 └── Documentar resultado
```

---

## 4. Frontend Compatibility Blocker

> [!WARNING]
> El paso 8 (REVOKE SELECT en `project_financial_summaries`) romperá el frontend si no se actualiza primero `js/supabase.js`.

### Código actual que debe cambiar

**Archivo:** `js/supabase.js`, líneas 638–653

```javascript
// CÓDIGO ACTUAL (SELECT directo — se rompe con 008)
projectFinancialSummaries: {
  async getAll() {
    var sb = getSupabase();
    if (!sb) return null;
    var { data, error } = await sb.from('project_financial_summaries').select('*');
    if (error) { console.error('DB projectFinancialSummaries.getAll:', error); return null; }
    return data;
  },
  async getByProject(projectId) {
    var sb = getSupabase();
    if (!sb) return null;
    var { data, error } = await sb.from('project_financial_summaries').select('*').eq('project_id', projectId).single();
    if (error) { console.error('DB projectFinancialSummaries.getByProject:', error); return null; }
    return data;
  }
},
```

### Código futuro requerido (NO implementar todavía)

```javascript
// CÓDIGO FUTURO (RPC — compatible con 008)
projectFinancialSummaries: {
  async getAll() {
    var sb = getSupabase();
    if (!sb) return null;
    var { data, error } = await sb.rpc('get_all_financial_summaries');
    if (error) { console.error('DB projectFinancialSummaries.getAll:', error); return null; }
    return data;
  },
  async getByProject(projectId) {
    var sb = getSupabase();
    if (!sb) return null;
    var { data, error } = await sb.rpc('get_project_financial_summary', { p_project_id: projectId });
    if (error) { console.error('DB projectFinancialSummaries.getByProject:', error); return null; }
    return data && data.length > 0 ? data[0] : null;
  }
},
```

**Notas sobre el cambio:**
- `getAll()` pasa de `.from().select()` a `.rpc('get_all_financial_summaries')`.
- `getByProject()` pasa de `.from().select().eq().single()` a `.rpc('get_project_financial_summary', ...)`.
- El RPC retorna un array (`SETOF`), por lo que `getByProject` debe extraer `data[0]` en lugar de confiar en `.single()`.
- El cambio es backward-compatible si se ejecuta ANTES de 008 (las RPCs no existen aún, pero si se crean primero con 008 y se cambia el frontend a la vez, funciona).

**Estrategia de ejecución recomendada:**
1. Ejecutar 004a–007 primero (no afectan `project_financial_summaries`).
2. Aplicar el cambio de `js/supabase.js` (commit separado).
3. Verificar que el frontend sigue funcionando (las RPCs aún no existen, pero el SELECT directo sigue activo porque 008 no se ha ejecutado).
4. Ejecutar 008 (crea las RPCs y hace REVOKE del SELECT directo).
5. Verificar que el frontend funciona vía RPC.

---

## 5. Manual Owner Bootstrap Plan

### Qué dato se necesita
El UUID del usuario autenticado que será designado como `owner`. Este UUID proviene de la tabla `auth.users` de Supabase.

### Cómo obtenerlo
Ejecutar en **Supabase SQL Editor** (con la service_role key):
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at;
```
Identificar el registro del propietario del sistema (probablemente el primer usuario registrado o el email del administrador principal).

### Cómo insertar el primer owner
Ejecutar en **Supabase SQL Editor** (service_role):
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<UUID_DEL_OWNER>', 'owner');
```

### Cómo verificar sin bloquearse
```sql
-- 1. Verificar que el registro existe (service_role, bypassa RLS)
SELECT * FROM user_roles;

-- 2. Verificar que is_owner() retorna TRUE
-- (Debe ejecutarse como el usuario autenticado, no como service_role)
SELECT is_owner();

-- 3. Verificar que auth_role() retorna 'owner'
SELECT auth_role();
```

> [!IMPORTANT]
> Si `is_owner()` retorna FALSE después de insertar, verificar que el UUID insertado coincide exactamente con el `auth.uid()` del usuario logueado. Un UUID incorrecto causa **owner lockout** (nadie puede administrar `user_roles`).

---

## 6. Verification Plan

### 6.1 Permission Smoke Test
Ejecutar `supabase/drafts/auth-rls/permission_smoke_test.sql` completo:
- **Bloque 1:** Tests como owner (8 tests)
- **Bloque 2:** Tests como admin (4 tests)
- **Bloque 3:** Tests como field_user (4 tests)
- **Bloque 4:** Tests como owner sobre expenses (4 tests)
- **Bloque 5:** Tests como viewer (7 tests)

### 6.2 Financial Smoke Test
Ejecutar `qa/financial_system_smoke_test.sql`:
- Confirmar que las 15 reglas de Opción A siguen funcionando.
- Confirmar que los triggers de inmutabilidad siguen activos.
- Confirmar que las fórmulas P&L no se han alterado.

### 6.3 GitHub Actions Rerun
Ejecutar el workflow `Supabase Financial QA` después de la activación:
```bash
gh workflow run "Supabase Financial QA" -R Racielf/nexartwo --ref feat/auth-rls-hardening-prep
```

### 6.4 Pruebas Frontend Mínimas
- Abrir la aplicación NexArtWO en el navegador.
- Navegar a la vista de Projects.
- Verificar que los datos financieros se cargan correctamente para el owner.
- Verificar que la consola del navegador no muestra errores de permisos.
- Si hay usuarios con rol `field_user`, verificar que no ven datos financieros.

### 6.5 Evidencia a Guardar
- URL del workflow run post-activación.
- Commit SHA probado.
- Fecha y hora de activación.
- Resultado PASS/FAIL de cada smoke test.
- Screenshot del frontend funcionando post-activación.
- Logs de cualquier error encontrado.

---

## 7. Rollback Plan

### Reglas inquebrantables de rollback
- ❌ **NO** borrar tablas financieras (`project_expenses`, `project_disbursements`, `project_refunds`).
- ❌ **NO** modificar campos `amount`, `tax` ni campos históricos.
- ❌ **NO** intentar "limpiar" registros `cancelled` — deben quedar como historia.
- ❌ **NO** desactivar triggers de inmutabilidad.
- ❌ **NO** usar `localStorage` como fallback financiero.
- ❌ **NO** forzar `isSupabaseReady() = false` para desviar datos a local.

### Cómo desactivar RLS si bloquea acceso
```sql
-- Desactivar RLS tabla por tabla (orden inverso)
ALTER TABLE project_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_disbursements DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Restaurar acceso directo a vista financiera
GRANT SELECT ON project_financial_summaries TO authenticated;
```

### Cómo revertir frontend RPC si es necesario
Si el cambio de `js/supabase.js` (RPC) causa problemas y se necesita revertir:
```bash
git revert <COMMIT_SHA_DEL_CAMBIO_RPC>
git push origin HEAD
```
Esto restauraría los SELECT directos, que funcionarán porque el GRANT se restauró en el paso anterior.

### Referencia completa
Ver `supabase/drafts/auth-rls/ROLLBACK.md` para el protocolo detallado.

---

## 8. Risk Matrix

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| 1 | **Owner lockout** — UUID incorrecto, nadie puede administrar `user_roles` | Media | Crítico | Verificar UUID con `SELECT id, email FROM auth.users` antes de insertar. Service_role bypassa RLS para corrección. |
| 2 | **Frontend roto por cambio RPC** — `js/supabase.js` falla al llamar RPCs | Media | Alto | Ejecutar cambio frontend ANTES de 008. Probar con SELECT directo todavía activo. Revert disponible con `git revert`. |
| 3 | **field_user/viewer sin superficie de proyectos** — no ven nada hasta 010+ | Esperado | Bajo | Documentado en DESIGN.md. No es un bug, es comportamiento esperado. Se resuelve cuando exista `project_assignments` (migración futura). |
| 4 | **Exposición de `project_financial_summaries`** — SELECT directo sin REVOKE | Baja (post-008) | Crítico | 008 hace REVOKE explícito. Smoke test 5.2 verifica. |
| 5 | **Smoke test false positive** — test pasa pero permisos están mal | Baja | Alto | 5 bloques con 27 tests cubren owner, admin, field_user, expenses owner y viewer. Verificación manual adicional recomendada. |
| 6 | **Error de orden en migraciones** — ejecutar 004b antes de owner insert | Media | Alto | Plan de activación documenta orden explícito. 004a/004b están separados por diseño. Verificación obligatoria entre pasos. |
| 7 | **DB Push sobreescribe RLS** — un `supabase db push` futuro deshace policies | Baja | Crítico | Una vez activadas, las migraciones deben moverse a `supabase/migrations/` para que `db push` las incluya. |

---

## 9. Go / No-Go Checklist

Antes de ejecutar la activación, cada item debe estar en ✅:

| # | Item | Estado |
|---|------|--------|
| 1 | Production Gate QA: PASS | ✅ |
| 2 | GitHub Secrets: configurados y funcionales | ✅ |
| 3 | Workflow IPv4 pooler: fix confirmado | ✅ |
| 4 | Owner UUID: identificado y verificado | ⬜ |
| 5 | DB Backup/Snapshot: creado justo antes de activación | ⬜ |
| 6 | Ventana de mantenimiento: acordada | ⬜ |
| 7 | Frontend RPC compatibility: implementada y testeada (antes de 008) | ⬜ |
| 8 | ROLLBACK.md: leído y comprendido | ⬜ |
| 9 | Todos los drafts revisados una última vez | ⬜ |
| 10 | Comunicación a usuarios (si aplica): enviada | ⬜ |

**Decisión Go/No-Go:** Todos los items deben estar en ✅ antes de proceder.

---

## 10. Deliverables for Next Implementation Phase

Cuando se apruebe la ejecución, los commits necesarios serán:

| # | Commit | Descripción | Archivos |
|---|--------|-------------|----------|
| 1 | Frontend RPC compatibility | Cambiar SELECT directo por `.rpc()` | `js/supabase.js` |
| 2 | Promote 004a | Mover draft a migrations | `supabase/migrations/004a_user_roles_bootstrap.sql` |
| 3 | Promote 004b | Mover draft a migrations | `supabase/migrations/004b_user_roles_policies.sql` |
| 4 | Promote 005 | Mover draft a migrations | `supabase/migrations/005_rls_projects.sql` |
| 5 | Promote 006 | Mover draft a migrations | `supabase/migrations/006_rls_expenses_refunds.sql` |
| 6 | Promote 007 | Mover draft a migrations | `supabase/migrations/007_rls_disbursements.sql` |
| 7 | Promote 008 | Mover draft a migrations | `supabase/migrations/008_rls_financial_summaries.sql` |
| 8 | Promote 009 | Mover draft a migrations | `supabase/migrations/009_project_status_summary_view.sql` |
| 9 | Activation docs update | Actualizar CHECKLIST, DESIGN con estado "ACTIVATED" | `supabase/drafts/auth-rls/*.md` |
| 10 | CI permission smoke test (futuro) | Agregar `permission_smoke_test.sql` al workflow de QA | `.github/workflows/supabase-financial-qa.yml` |

> Cada commit será individual, pusheado a GitHub, y reportado con hash. Ninguno se ejecutará sin orden explícita.
