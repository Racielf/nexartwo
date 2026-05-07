# Phase 2B — PR #2 Review Checklist

**Documento de revisión pre-merge para Draft PR #2**
**No hacer merge hasta que todos los items estén marcados.**

---

## 1. Estado del PR

| Campo | Valor |
|---|---|
| **PR URL** | https://github.com/Racielf/nexartwo/pull/2 |
| **Base** | `main` |
| **Head** | `feat/investor-hub-spec` |
| **Draft** | ✅ Yes — Draft PR, no puede mergearse |
| **Head Commit** | `ba6b293` |
| **Título** | Phase 2B — Investor Hub: Investor Entities + Capital Contributions |

---

## 2. Archivos Esperados en el PR

Los siguientes 10 archivos deben estar presentes y solo estos:

| Archivo | Tipo | Estado esperado |
|---|---|---|
| `.github/workflows/investor-hub-pr-qa.yml` | Workflow | Nuevo |
| `docs/PHASE_2_INVESTOR_HUB_PLAN.md` | Documentación | Nuevo |
| `docs/PHASE_2A_INVESTOR_HUB_SPEC.md` | Documentación | Nuevo |
| `docs/PHASE_2B_INVESTOR_ENTITIES_IMPLEMENTATION_PLAN.md` | Documentación | Nuevo |
| `docs/PHASE_2B_PR_REVIEW_CHECKLIST.md` | Documentación | Nuevo |
| `supabase/migrations/202605070001_investor_entities.sql` | SQL Migration | Nuevo |
| `qa/investor_hub_smoke_test.sql` | QA Script | Nuevo |
| `js/supabase.js` | JS Data Layer | Modificado |
| `js/projects.js` | JS UI Logic | Modificado |
| `projects.html` | HTML UI | Modificado |

**Archivos que NO deben aparecer en el diff:**
- `sql/003_projects_financial_system.sql`
- `supabase/migrations/20260506_projects_financial_system.sql`
- `supabase/drafts/auth-rls/`
- `.github/workflows/`
- `index.html`
- `css/`
- `read_*.ps1`
- `diff_output.txt`
- `sql/schema.sql` (debe estar idéntico a main)

---

## 3. Revisión SQL — `supabase/migrations/202605070001_investor_entities.sql`

| # | Check | Cómo verificar | Estado |
|---|---|---|---|
| 3.1 | La migración es solo nueva — no modifica tablas existentes | Buscar `ALTER TABLE project_` → debe dar 0 resultados | ⬜ |
| 3.2 | No toca `project_financial_summaries` | Buscar `project_financial_summaries` en la migración → solo en comentarios | ⬜ |
| 3.3 | No toca `project_expenses` | Buscar `project_expenses` → 0 resultados | ⬜ |
| 3.4 | No toca `project_refunds` | Buscar `project_refunds` → 0 resultados | ⬜ |
| 3.5 | No toca `project_disbursements` | Buscar `project_disbursements` → 0 resultados | ⬜ |
| 3.6 | No modifica migraciones anteriores | Solo existe el archivo `202605070001_*` como nuevo | ⬜ |
| 3.7 | `amount > 0` enforced en `capital_contributions` | `CHECK (amount > 0)` presente | ⬜ |
| 3.8 | `requested_amount > 0` enforced en `capital_calls` | `CHECK (requested_amount > 0)` presente | ⬜ |
| 3.9 | No hay `ON DELETE CASCADE` | Buscar `ON DELETE CASCADE` → 0 resultados | ⬜ |
| 3.10 | Todas las FKs usan `ON DELETE RESTRICT` | Verificar cada FK hacia `projects` e `investors` | ⬜ |
| 3.11 | Trigger `prevent_contribution_delete` presente | Función y trigger definidos | ⬜ |
| 3.12 | Trigger `prevent_contribution_update` presente | Bloquea cambios en `amount`, `date`, `investor_id`, `project_id` | ⬜ |
| 3.13 | Status `cancelled` en lugar de DELETE | Campos `status` con CHECK válido en todas las tablas | ⬜ |
| 3.14 | RLS habilitado en todas las tablas nuevas | `ENABLE ROW LEVEL SECURITY` para las 5 tablas | ⬜ |
| 3.15 | FK de `project_id` usa tipo TEXT (no UUID) | `project_id TEXT ... REFERENCES projects(id)` | ⬜ |
| 3.16 | Timestamps `created_at` / `updated_at` en todas las tablas | Verificar definición de cada tabla | ⬜ |

---

## 4. Revisión JS — `js/supabase.js` y `js/projects.js`

### 4A — Data Layer (`js/supabase.js`)

| # | Check | Cómo verificar | Estado |
|---|---|---|---|
| 4.1 | Namespaces nuevos agregados al objeto `DB` | Buscar: `investors:`, `investorCompanies:`, `projectInvestors:`, `capitalContributions:`, `capitalCalls:` | ⬜ |
| 4.2 | Ningún namespace de 2B tiene método `delete` | Buscar `.delete()` en las líneas del bloque Investor Hub (línea 656+) → 0 resultados | ⬜ |
| 4.3 | No hay escritura a `project_expenses` desde 2B | Buscar `project_expenses` en bloque Investor Hub → 0 inserts | ⬜ |
| 4.4 | No hay escritura a `project_refunds` desde 2B | Buscar `project_refunds` en bloque Investor Hub → 0 inserts | ⬜ |
| 4.5 | No hay escritura a `project_disbursements` desde 2B | Buscar `project_disbursements` en bloque Investor Hub → 0 inserts | ⬜ |
| 4.6 | Validación `amount > 0` en JS antes de INSERT | `capitalContributions.create()` rechaza `amt <= 0` | ⬜ |
| 4.7 | Validación `requested_amount > 0` en JS antes de INSERT | `capitalCalls.create()` rechaza `amt <= 0` | ⬜ |
| 4.8 | Método `cancel()` en todos los namespaces de 2B | `projectInvestors.cancel()`, `capitalContributions.cancel()`, `capitalCalls.cancel()` | ⬜ |
| 4.9 | Fórmulas de Fase 1 (`projectFinancialSummaries`) no modificadas | Namespace `projectFinancialSummaries` idéntico a main | ⬜ |
| 4.10 | Errores manejados con `console.error` en todos los métodos | Verificar estructura `if (error) { console.error(...); return null/false; }` | ⬜ |

### 4B — UI Logic (`js/projects.js`)

| # | Check | Cómo verificar | Estado |
|---|---|---|---|
| 4.11 | Función `renderInvestorHub()` presente | Buscar `function renderInvestorHub` | ⬜ |
| 4.12 | `switchProjTab()` llama `renderInvestorHub` al cambiar a `investorhub` | Buscar el bloque `if (tab === 'investorhub')` | ⬜ |
| 4.13 | No hay llamadas a `DB.projectExpenses`, `DB.projectRefunds`, `DB.projectDisbursements` dentro de Investor Hub | Verificar que `renderInvestorHub` y funciones `ih*` no usen estos namespaces | ⬜ |
| 4.14 | Funciones de acción presentes: `ihConfirmPI`, `ihCancelPI`, `ihConfirmContrib`, `ihCancelContrib`, `ihConfirmCall`, `ihCancelCall` | Buscar cada nombre de función | ⬜ |
| 4.15 | Modales de agregar: `openAddInvestorModal`, `saveAddInvestor`, `openAddContribModal`, `saveAddContrib`, `openAddCallModal`, `saveAddCall` | Buscar cada función | ⬜ |

---

## 5. Revisión UI — `projects.html` + `js/projects.js`

| # | Check | Cómo verificar | Estado |
|---|---|---|---|
| 5.1 | Tab "🏦 Investor Hub" visible en el detalle de proyecto | Buscar `data-tab="investorhub"` en `projects.html` | ⬜ |
| 5.2 | Panel `proj-tab-investorhub` existe en el DOM | Buscar `id="proj-tab-investorhub"` en `projects.html` | ⬜ |
| 5.3 | Banner "INTERNAL & ADMIN USE ONLY" visible al abrir el tab | Buscar `INTERNAL.*ADMIN USE ONLY` en `renderInvestorHub` | ⬜ |
| 5.4 | Sección de investors visible con botón "Add Investor" | Buscar `openAddInvestorModal` en el HTML generado por JS | ⬜ |
| 5.5 | Sección de contributions visible con botón "Add Contribution" | Buscar `openAddContribModal` | ⬜ |
| 5.6 | Botón "Confirm" para contributions pendientes | Buscar `ihConfirmContrib` | ⬜ |
| 5.7 | Botón "Void" para contributions — NO "Delete" | Buscar el texto `Void` en botones. Verificar que no dice "Delete" | ⬜ |
| 5.8 | Sección de Capital Calls con botón "Add Capital Call" | Buscar `openAddCallModal` | ⬜ |
| 5.9 | Total Confirmed Capital visible | Buscar cálculo de `totalConfirmed` en `renderInvestorHub` | ⬜ |
| 5.10 | No hay mención de ROI en Investor Hub | Buscar `ROI` en bloque Investor Hub → 0 resultados | ⬜ |
| 5.11 | No hay mención de distributions | Buscar `distribution` en bloque Investor Hub → 0 resultados | ⬜ |
| 5.12 | No hay mención de lender | Buscar `lender` en bloque Investor Hub → 0 resultados | ⬜ |
| 5.13 | No hay mención de closing statement | Buscar `closing statement` en bloque Investor Hub → 0 resultados | ⬜ |
| 5.14 | No hay mención de final report | Buscar `final report` en bloque Investor Hub → 0 resultados | ⬜ |
| 5.15 | Modal de contribution muestra aviso "Capital ≠ Expense" | Buscar `Capital.*Expense` o `does NOT affect` en el modal | ⬜ |

---

## 6. QA Pendiente (Ejecución Real)

Estas pruebas deben ejecutarse en un entorno **dev/staging**, nunca en producción.

| # | Prueba | Entorno | Estado |
|---|---|---|---|
| 6.1 | Aplicar migración `202605070001_investor_entities.sql` en dev/staging | GitHub Actions (temporal) | ✅ PASS |
| 6.2 | Ejecutar `qa/investor_hub_smoke_test.sql` completo | GitHub Actions (temporal) | ✅ PASS |
| 6.3 | Verificar que `BEGIN/ROLLBACK` no deja datos en tablas nuevas | SELECT * FROM investors → 0 rows después de correr test | ✅ PASS |
| 6.4 | Verificar que `project_financial_summaries` no cambia antes/después | Test 18 del smoke test debe PASS | ✅ PASS |
| 6.5 | Verificar que trigger bloquea DELETE en `capital_contributions` | Test 15 del smoke test debe PASS | ✅ PASS |
| 6.6 | Verificar que trigger bloquea UPDATE de `amount` | Test 16 del smoke test debe PASS | ✅ PASS |
| 6.7 | Verificar que `amount = 0` es rechazado | Test 10 del smoke test debe PASS | ✅ PASS |
| 6.8 | Ejecutar workflow existente `Supabase Financial QA` → debe seguir en PASS | GitHub Actions (dev branch) | ⬜ BLOCKED |
| 6.9 | Verificar UI manualmente: abrir proyecto, click en Investor Hub | Browser con app en dev | ⬜ BLOCKED |
| 6.10 | Crear investor desde UI, adjuntar a proyecto, confirmar | Browser con app en dev | ⬜ BLOCKED |
| 6.11 | Agregar contribution, confirmar, verificar total confirmed | Browser con app en dev | ⬜ BLOCKED |
| 6.12 | Void contribution, verificar que record persiste (no deleted) | Browser con app en dev | ⬜ BLOCKED |

---

## 7. Merge Blockers

El PR #2 **no puede mergearse** hasta que se resuelvan todos estos puntos:

| # | Blocker | Estado |
|---|---|---|
| 7.1 | Smoke test real ejecutado contra DB temporal en GitHub Actions | ✅ PASS |
| 7.2 | PR sigue en estado Draft | 🔴 BLOCKER — no marcar Ready hasta que 6.8 y UI checks estén listos |
| 7.3 | Migración no aplicada en ningún entorno real persistente | 🔴 BLOCKER |
| 7.4 | UI no verificada manualmente en browser real | 🔴 BLOCKER |
| 7.5 | `Supabase Financial QA` workflow no ejecutado post-2B | 🔴 BLOCKER |

---

## 8. Resultado Esperado por Prueba

| Estado | Definición | Acción |
|---|---|---|
| **PASS** | La prueba se ejecutó sin errores. El comportamiento es exactamente el esperado. | Marcar ✅ en el checklist |
| **FAIL** | La prueba detectó un error, comportamiento incorrecto, o constraint violado inesperadamente. | Reportar detalle. No mergear. Abrir issue con resultado. |
| **BLOCKED** | La prueba no pudo ejecutarse por falta de entorno, conexión, o dependencia externa. | Reportar razón. No interpretar como PASS. Desbloquear antes de mergear. |

### Criterio de aprobación para merge

Para pasar de **Draft** a **Ready for Review** y luego mergear a `main`:

1. ✅ Todos los checks de §3 (SQL) verificados contra el diff
2. ✅ Todos los checks de §4 (JS) verificados contra el diff
3. ✅ Todos los checks de §5 (UI) verificados estáticamente
4. ✅ §6.1 a §6.8 en estado PASS (no BLOCKED, no FAIL)
5. ✅ `Supabase Financial QA` workflow PASS después de aplicar migración
6. ✅ Validación manual de UI básica (§6.9 a §6.12)

---

*Documento generado en Phase 2B — Draft PR #2*
*https://github.com/Racielf/nexartwo/pull/2*
