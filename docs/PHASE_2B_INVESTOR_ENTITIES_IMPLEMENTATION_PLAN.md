# PHASE 2B — Investor Entities + Capital Contributions
## Implementation Plan

**Estado:** Listo para revisión antes de implementación.
**Fase:** 2B — Investor Entities + Capital Contributions.
**Referencia base:**
- `docs/PHASE_2_INVESTOR_HUB_PLAN.md`
- `docs/PHASE_2A_INVESTOR_HUB_SPEC.md`
- `sql/003_projects_financial_system.sql`
- `js/supabase.js` (patrón de namespaces existente)
- `projects.html` (UI de referencia)

---

## 1. Goal

Phase 2B registra **quién financia un proyecto** y **cuánto capital aportó cada socio**.

Resuelve: la información de inversionistas, sus aportes y su participación en el proyecto está hoy fragmentada en Excel, correos y documentos físicos. No existe un lugar en el sistema donde se vea quién puso dinero, cuándo y cuánto.

Al finalizar 2B, el sistema podrá responder:

- ¿Quiénes son los inversionistas de este proyecto?
- ¿Cuánto capital aportó cada uno?
- ¿Cuánto capital total entró al proyecto?
- ¿Están los aportes confirmados o pendientes de verificar?

Phase 2B **no** calcula ROI, no distribuye utilidades, no registra préstamos ni generará el reporte final. Eso es 2C, 2D, 2E y 2F.

---

## 2. Scope

### Incluye en 2B

| Componente | Incluye |
|---|---|
| Tabla `investors` | Sí |
| Tabla `investor_companies` | Sí |
| Tabla `project_investors` | Sí |
| Tabla `capital_contributions` | Sí |
| Tabla `capital_calls` (básico) | Sí — solo registro manual |
| Tab "Investor Hub" en UI de Project | Sí — vista mínima |
| Totales de contributions confirmed | Sí — cálculo simple en JS |
| Métodos en `js/supabase.js` | Sí — namespace `investors` |

### Explícitamente fuera de 2B

| Módulo | Fase que lo cubre |
|---|---|
| `lender_loans`, `loan_charges`, `loan_draws` | 2C |
| `acquisition_costs` adicionales | 2C |
| `realtor_parties` | 2C |
| `title_company_records` | 2C |
| `closing_statement_items` | 2C |
| P&L Dashboard avanzado | 2D |
| `investor_distribution_rules` | 2E |
| `investor_settlements` | 2E |
| Cálculo de ROI | 2E |
| `investor_report_snapshots` | 2F |
| PDF generator | 2F |
| Investor portal público | 2G |
| Auth/RLS activation | Separado — plan en `docs/AUTH_RLS_ACTIVATION_PLAN.md` |
| OCR | Separado — no implementado |

---

## 3. Files Expected to Change

### SQL / Migrations
| Archivo | Acción |
|---|---|
| `supabase/migrations/202605070001_investor_entities.sql` | **[NEW]** Una sola migración con las 5 tablas nuevas |

### JS Data Layer
| Archivo | Acción |
|---|---|
| `js/supabase.js` | **[MODIFY]** Agregar namespace `investors` al final, antes del cierre del objeto `DB` |

### UI Files
| Archivo | Acción |
|---|---|
| `projects.html` | **[MODIFY]** Agregar tab "Investor Hub" en el detalle del proyecto |

### Docs
| Archivo | Acción |
|---|---|
| `docs/PHASE_2B_INVESTOR_ENTITIES_IMPLEMENTATION_PLAN.md` | **[NEW]** Este documento |

### Tests / QA
| Archivo | Acción |
|---|---|
| `qa/investor_hub_smoke_test.sql` | **[NEW]** Script de verificación post-migración |

### Archivos que NO se tocan en 2B

| Archivo | Razón |
|---|---|
| `sql/003_projects_financial_system.sql` | Congelado — Fase 1 validada |
| `supabase/migrations/001_*`, `002_*`, `003_*` | Congelados — nunca tocar historial de migraciones |
| `js/projects.js` | Puede necesitar cambios menores de coordinación UI — revisar durante implementación |
| `index.html` | No tocar |
| `css/` | No tocar |
| Cualquier workflow `.github/` | No tocar |

---

## 4. Proposed Database Changes

### Diseño conceptual de la migración `202605070001_investor_entities.sql`

> No se escribe la migración todavía. Este diseño es la especificación a seguir durante la implementación.

---

#### Tabla: `investors`

```
investors
├── id              UUID, PK, default gen_random_uuid()
├── name            TEXT, NOT NULL
├── type            TEXT, NOT NULL  -- CHECK: 'person' | 'company'
├── company_id      UUID, nullable, FK → investor_companies(id)
├── email           TEXT, nullable
├── phone           TEXT, nullable
├── status          TEXT, NOT NULL, default 'active'  -- CHECK: 'active' | 'inactive'
├── notes           TEXT, default ''
├── created_at      TIMESTAMPTZ, default now()
└── updated_at      TIMESTAMPTZ, default now()
```

**Constraints:**
- `name` no puede ser vacío.
- `type` solo acepta `'person'` o `'company'`.
- No hard delete: usar `status = 'inactive'`.

---

#### Tabla: `investor_companies`

```
investor_companies
├── id              UUID, PK, default gen_random_uuid()
├── company_name    TEXT, NOT NULL
├── contact_person  TEXT, default ''
├── email           TEXT, nullable
├── phone           TEXT, nullable
├── license_number  TEXT, default ''
├── state           TEXT, default ''
├── notes           TEXT, default ''
├── created_at      TIMESTAMPTZ, default now()
└── updated_at      TIMESTAMPTZ, default now()
```

**Constraints:**
- `company_name` no puede ser vacío.
- No hard delete: manejar con `notes` o inactivar desde `investors.company_id`.

---

#### Tabla: `project_investors`

```
project_investors
├── id                      UUID, PK, default gen_random_uuid()
├── project_id              TEXT, NOT NULL, FK → projects(id) ON DELETE RESTRICT
├── investor_id             UUID, NOT NULL, FK → investors(id) ON DELETE RESTRICT
├── role                    TEXT, NOT NULL  -- 'lead_contractor' | 'equity_partner' | 'silent_partner' | 'other'
├── ownership_percentage    NUMERIC, nullable, CHECK (0 <= x <= 100)
├── profit_split_percentage NUMERIC, nullable, CHECK (0 <= x <= 100)
├── status                  TEXT, NOT NULL, default 'pending'  -- 'pending' | 'confirmed' | 'cancelled'
├── agreement_notes         TEXT, default ''
├── created_at              TIMESTAMPTZ, default now()
└── updated_at              TIMESTAMPTZ, default now()
```

**Constraints:**
- Un par `(project_id, investor_id, role)` debe ser único para evitar duplicados accidentales.
- No hard delete: usar `status = 'cancelled'`.
- `ON DELETE RESTRICT` en ambas FKs para proteger integridad.

---

#### Tabla: `capital_contributions`

```
capital_contributions
├── id                  UUID, PK, default gen_random_uuid()
├── project_id          TEXT, NOT NULL, FK → projects(id) ON DELETE RESTRICT
├── investor_id         UUID, NOT NULL, FK → investors(id) ON DELETE RESTRICT
├── amount              NUMERIC, NOT NULL, CHECK (amount > 0)   -- REGLA: Siempre positivo
├── date                DATE, NOT NULL
├── method              TEXT, NOT NULL  -- 'cash' | 'wire' | 'check' | 'company_payment'
├── type                TEXT, NOT NULL  -- 'initial' | 'additional' | 'closing' | 'reimbursement'
├── status              TEXT, NOT NULL, default 'pending'  -- 'pending' | 'confirmed' | 'cancelled'
├── evidence_reference  TEXT, default ''
├── notes               TEXT, default ''
├── created_at          TIMESTAMPTZ, default now()
└── updated_at          TIMESTAMPTZ, default now()
```

**Constraints:**
- `amount > 0`: constraint a nivel DB. Sin excepciones.
- No hard delete: trigger `prevent_contribution_delete` equivalente al de Fase 1.
- Correcciones via reversal: cancelar el registro incorrecto + crear uno nuevo correcto.
- Solo registros con `status = 'confirmed'` deben sumarse en totales del Investor Hub.

**Regla crítica:**
Esta tabla **no afecta** `project_financial_summaries`. No se modifica la vista de Fase 1.

---

#### Tabla: `capital_calls`

```
capital_calls
├── id               UUID, PK, default gen_random_uuid()
├── project_id       TEXT, NOT NULL, FK → projects(id) ON DELETE RESTRICT
├── requested_amount NUMERIC, NOT NULL, CHECK (requested_amount > 0)
├── reason           TEXT, NOT NULL
├── due_date         DATE, nullable
├── status           TEXT, NOT NULL, default 'pending'  -- 'pending' | 'confirmed' | 'cancelled'
├── notes            TEXT, default ''
├── created_at       TIMESTAMPTZ, default now()
└── updated_at       TIMESTAMPTZ, default now()
```

**Constraints:**
- Solo registro manual en 2B. Sin automation ni notificaciones.
- No hard delete.

---

#### Triggers requeridos en 004

```sql
-- Bloquear DELETE en capital_contributions (igual que Fase 1)
prevent_contribution_delete()  →  BEFORE DELETE ON capital_contributions

-- Bloquear UPDATE en campos históricos de capital_contributions
prevent_contribution_update()  →  campos: amount, date, investor_id, project_id
```

---

## 5. Business Rules

| Regla | Descripción |
|---|---|
| **Capital ≠ Expense** | Una `capital_contribution` nunca es un `project_expense`. Tablas separadas, sin relación directa. |
| **No afecta summaries** | Ningún INSERT en `capital_contributions` modifica `project_financial_summaries`. La vista de Fase 1 no lee esta tabla. |
| **No afecta net_expense_cost** | El `net_expense_cost` solo viene de `project_expenses - project_refunds`. Los aportes de capital no participan. |
| **Solo confirmed suma** | Los totales del Investor Hub solo suman contributions con `status = 'confirmed'`. Las `pending` y `cancelled` se muestran pero no cuentan. |
| **amount > 0** | Constraint a nivel DB. El JS debe validar antes de enviar. |
| **No DELETE físico** | Igual que Fase 1: trigger que bloquea DELETE. Siempre usar `status = 'cancelled'`. |
| **Corrections = reversal** | Si un monto está mal: cancelar el registro incorrecto, crear registro correcto nuevo. El histórico se preserva. |
| **No ROI en 2B** | El cálculo de ROI requiere datos de closing (2C) y settlement (2E). Bloqueado hasta entonces. |
| **No distributions en 2B** | Ningún `investor_settlement` ni reparto de profit en esta subfase. |
| **No mezclar con disbursements** | Un `investor_settlement` futuro (2E) será una entidad separada. Nunca usar `project_disbursements` de Fase 1 para registrar distribuciones a inversionistas. |

---

## 6. UI Plan

### Tab "Investor Hub" dentro del detalle de Project

Ubicación: tab adicional en la página de detalle de proyecto en `projects.html`, junto a los tabs existentes (Expenses, Refunds, Disbursements).

#### Sección 1: Investors del Proyecto

| Elemento | Descripción |
|---|---|
| Lista de investors | Nombre, rol, porcentaje (si aplica), status |
| Botón "Add Investor" | Abre modal para crear o seleccionar investor existente y adjuntarlo al proyecto |
| Acción "Remove" | Cambia `project_investors.status = 'cancelled'`. No borra. |

#### Sección 2: Capital Contributions

| Elemento | Descripción |
|---|---|
| Lista de contributions | Investor, monto, fecha, método, tipo, status |
| Filtro por status | `pending`, `confirmed`, `cancelled` |
| Botón "Add Contribution" | Abre modal con campos: investor, amount, date, method, type, notes, evidence_reference |
| Acción "Confirm" | Cambia status a `confirmed` |
| Acción "Cancel" | Cambia status a `cancelled`. Muestra nota de cancelación. No borra. |
| Total confirmed | Suma de `amount` WHERE `status = 'confirmed'` por investor y total del proyecto |

#### Sección 3: Capital Calls (básico)

| Elemento | Descripción |
|---|---|
| Lista de capital calls | Monto solicitado, razón, vencimiento, status |
| Botón "Add Capital Call" | Formulario simple: amount, reason, due_date |

#### Lo que NO aparece en esta UI (2B)

- Gráficas de capital stack.
- ROI estimado.
- Profit distribution.
- Lender / Acquisition data.
- Investor Final Report.

---

## 7. JS Data Layer Plan

Nuevo namespace a agregar en `js/supabase.js`, siguiendo exactamente el patrón existente (`projects`, `projectExpenses`, `projectRefunds`, `projectDisbursements`).

### Namespace: `investors`

```javascript
// Métodos propuestos (no escribir código todavía — solo plan)

investors: {
  getAll()                        // SELECT * FROM investors ORDER BY created_at DESC
  getById(id)                     // SELECT * WHERE id = :id
  create(investor)                // INSERT — mínimo: name, type, status
  updateStatus(id, status)        // UPDATE status — para inactivar. No DELETE.
  updateNotes(id, notes)          // UPDATE notes únicamente
}

investorCompanies: {
  getAll()
  getById(id)
  create(company)
  updateNotes(id, notes)
}

projectInvestors: {
  getByProject(projectId)         // SELECT * WHERE project_id = :projectId
  attach(projectId, investorId, role, options)  // INSERT project_investors
  cancel(id)                      // UPDATE status = 'cancelled'. No DELETE.
  confirm(id)                     // UPDATE status = 'confirmed'
}

capitalContributions: {
  getByProject(projectId)         // SELECT * WHERE project_id = :projectId
  getByInvestor(projectId, investorId)
  getTotalByProject(projectId)    // SUM(amount) WHERE status='confirmed'
  create(contribution)            // INSERT — validar amount > 0 en JS antes de enviar
  confirm(id)                     // UPDATE status = 'confirmed'
  cancel(id)                      // UPDATE status = 'cancelled'. No DELETE.
  // Sin método delete.
}

capitalCalls: {
  getByProject(projectId)
  create(call)
  confirm(id)
  cancel(id)
  // Sin método delete.
}
```

**Regla de implementación:**
- Ningún namespace nuevo debe llamar a `project_financial_summaries` para escribir.
- Ningún namespace nuevo debe INSERT en `project_expenses`, `project_refunds` o `project_disbursements`.
- Cálculo de totales de contributions: JS hace la suma desde los datos cargados o query directa. No modifica la vista SQL.

---

## 8. Safety Plan

### Qué se protege y cómo

| Componente de Fase 1 | Riesgo en 2B | Protección |
|---|---|---|
| `project_expenses` | INSERT accidental desde Investor Hub | Namespace separado. Contributions no tocan esta tabla. |
| `project_refunds` | Confundir con reversal de contribution | Reversal = cancelar contribution + nueva. No usa `project_refunds`. |
| `project_disbursements` | Confundir con distribution de investor | `investor_settlements` (2E) es tabla separada. No usa esta tabla. |
| `project_financial_summaries` | Que contributions modifiquen la vista | La vista SQL no lee `capital_contributions`. Segregación total. |
| Fórmulas financieras | Cambio accidental en la vista | No tocar `003_projects_financial_system.sql`. Solo agregar tablas nuevas en `004_`. |
| Triggers de Fase 1 | Que 2B los interfiera | Triggers de Fase 1 solo aplican a sus tablas. Las tablas nuevas tienen sus propios triggers. |

---

## 9. QA Plan

### Smoke test post-migración (`qa/investor_hub_smoke_test.sql`)

Pruebas SQL a ejecutar después de aplicar la migración `004_`:

| # | Prueba | Verificación |
|---|---|---|
| 1 | CREATE investor | Registro insertado correctamente |
| 2 | Attach investor to project | `project_investors` con status `pending` |
| 3 | Confirm project_investor | Status cambia a `confirmed` |
| 4 | Cancel project_investor | Status cambia a `cancelled`. Registro persiste. |
| 5 | CREATE capital_contribution (amount > 0) | INSERT exitoso |
| 6 | CREATE capital_contribution (amount = 0) | Debe fallar por constraint |
| 7 | CREATE capital_contribution (amount < 0) | Debe fallar por constraint |
| 8 | Confirm contribution | Status → `confirmed` |
| 9 | Cancel contribution | Status → `cancelled`. Registro persiste. |
| 10 | DELETE contribution | Debe fallar por trigger `prevent_contribution_delete` |
| 11 | UPDATE amount de contribution | Debe fallar por trigger `prevent_contribution_update` |
| 12 | Total confirmed = SUM(amount WHERE status='confirmed') | Coincide con query manual |
| 13 | Verificar `project_financial_summaries` antes y después | Los valores son idénticos. No cambia nada. |
| 14 | Un investor en múltiples proyectos | Ambos project_investors creados correctamente |
| 15 | Múltiples investors en un proyecto | Todos los project_investors visibles por proyecto |

---

## 10. Rollback Plan

Phase 2B es una subfase nueva con tablas completamente nuevas. Rollback es simple:

### Estrategia

```sql
-- Rollback completo de 2B (ejecutar en Supabase SQL editor si se requiere)
DROP TABLE IF EXISTS capital_calls;
DROP TABLE IF EXISTS capital_contributions;
DROP TABLE IF EXISTS project_investors;
DROP TABLE IF EXISTS investor_companies;
DROP TABLE IF EXISTS investors;
```

**Reglas del rollback:**
- Solo afecta las tablas nuevas de 2B. Nada de Fase 1 cambia.
- `project_financial_summaries` no cambia.
- `project_expenses`, `project_refunds`, `project_disbursements` no cambian.
- No hay datos financieros históricos en riesgo porque 2B es datos nuevos.

### Git rollback

```bash
git revert <commit-hash-de-2B>
```

O simplemente no mergear el PR de 2B si el QA falla.

---

## 11. Implementation Order

El orden exacto de ejecución durante la implementación:

```
Paso 1 — Migration draft
  └── Crear supabase/migrations/202605070001_investor_entities.sql
      (5 tablas + triggers no-delete + no-update en contributions)

Paso 2 — Validate migration locally (no push todavía)
  └── Revisar SQL contra patrón de 003_projects_financial_system.sql
  └── Confirmar que no modifica tablas existentes

Paso 3 — Data layer
  └── Agregar a js/supabase.js:
      - investors namespace
      - investorCompanies namespace
      - projectInvestors namespace
      - capitalContributions namespace
      - capitalCalls namespace

Paso 4 — UI tab
  └── Agregar en projects.html:
      - Tab "Investor Hub"
      - Investor list section
      - Contributions list section
      - Add Investor modal
      - Add Contribution modal
      - Capital Calls section (básico)

Paso 5 — QA smoke test
  └── Crear qa/investor_hub_smoke_test.sql
  └── Ejecutar manualmente contra DB de desarrollo
  └── Verificar que project_financial_summaries no cambia

Paso 6 — Commit
  └── git add supabase/migrations/004_*
  └── git add js/supabase.js
  └── git add projects.html
  └── git add qa/investor_hub_smoke_test.sql
  └── git commit -m "feat: Phase 2B — Investor Entities + Capital Contributions"

Paso 7 — PR
  └── PR desde feat/investor-hub → main
  └── Descripción: qué se implementó, qué se dejó afuera, resultado del QA

Paso 8 — Workflow
  └── Verificar que Supabase Financial QA sigue en PASS después de 2B
  └── gh workflow run "Supabase Financial QA" -R Racielf/nexartwo --ref feat/investor-hub
```

---

## 12. Open Questions

Preguntas que deben resolverse antes o durante la implementación de 2B:

| # | Pregunta | Impacto |
|---|---|---|
| 1 | ¿El trabajo físico (sweat equity) de Rodolfo/Investor 1 se registra como `capital_contribution` o como costo operativo? | Define si se crea un type especial `labor_equity` |
| 2 | ¿La UI del Investor Hub es dentro del tab de Projects o es una sección separada en el navbar? | Afecta `projects.html` vs nueva página |
| 3 | ¿Los capital_calls generan alguna alerta o son solo registro informativo en 2B? | Define si se necesita notificación o solo lista |
| 4 | ¿Ownership percentage y profit_split_percentage son obligatorios desde el inicio o se ingresan después en 2E? | Define si son nullable en DB |
| 5 | ¿Qué campos del investor debe ver el Owner vs un accountant vs un future investor portal? | Afecta diseño de permisos en 2G |
| 6 | ¿Se necesita adjuntar archivos (PDFs de acuerdos) como `evidence_reference` desde el inicio de 2B? | Define si se necesita storage en 2B o es solo text reference |
| 7 | ¿El `project_id` en `investors` usa TEXT igual que en `projects`? | Confirmar tipo de FK: projects.id es TEXT no UUID |
| 8 | ¿Se debe agregar `investor_hub_smoke_test` al workflow de GitHub Actions de QA existente? | Define si se actualiza `.github/workflows/supabase-financial-qa.yml` |
