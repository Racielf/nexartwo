# PHASE 2A — Investor Hub Specification (Hardened)

**Estado:** Aprobado como borrador. Pendiente de aprobación final para iniciar 2B.
**Fase:** 2A — Product Spec + Data Model (Hardened).
**Referencia:** `docs/PHASE_2_INVESTOR_HUB_PLAN.md`.
**Última revisión:** 2026-05-07.

---

## 1. Objetivo del Investor Hub

El **Investor Hub** resuelve el siguiente problema real:

En un proyecto Fix & Flip, la información de quién puso dinero, cuánto puso, cuándo lo puso y qué le corresponde al final queda dispersa en Excel, correos, PDFs y conversaciones. No existe un sistema que una esa historia.

El Investor Hub registra, en un solo lugar por proyecto:

- Quiénes son los inversionistas.
- Cuánto capital aportó cada uno.
- Qué porcentaje o regla de reparto tiene.
- Cómo se conecta ese capital con los costos reales del proyecto.
- Cuál fue el resultado financiero final para cada socio.

El módulo **no procesa pagos reales**. Solo registra, organiza y calcula para producir información de gestión y un reporte final profesional.

---

## 2. Base de Fase 1 (Validada — No Romper)

La Fase 1 está mergeada a `main`, validada con `Supabase Financial QA` en PASS y congelada.

Lo que ya existe y **no debe modificarse**:

| Componente | Estado |
|---|---|
| Projects | Activo y validado |
| Expenses | Activo y validado |
| Refunds | Activo y validado |
| Disbursements | Activo y validado |
| `project_financial_summaries` | Vista SQL activa, no tocar |
| Reglas de aprobación | Activas |
| Inmutabilidad financiera | Activa (no hard delete) |
| Fórmulas: Net Cost, Cash Position, Profit | Congeladas |
| Workflow `Supabase Financial QA` | PASS confirmado |
| Auth/RLS drafts | Preparados, no activados |
| OCR | Planificado, no implementado |

---

## 3. Qué NO se debe romper

Reglas absolutas para toda la Fase 2:

- **No alterar la fórmula financiera de Fase 1** bajo ninguna circunstancia.
- **No duplicar gastos.** Una contribution no es un expense. Nunca deben contarse dos veces.
- **No mezclar aportes de capital con expenses.** Son categorías distintas: los aportes son equity o pasivos, los expenses son costos operativos.
- **No mezclar préstamos con profit.** El dinero de un lender no es utilidad.
- **No borrar registros históricos.** Todo se corrige con nuevos registros o reversals.
- **No exponer datos internos a usuarios no autorizados.** Notas privadas y costos internos no deben filtrarse hacia vistas de inversionistas.
- **No calcular distribuciones antes del closing** confirmado.
- **No mezclar `investor_settlements` con `disbursements` de Fase 1** sin una decisión formal documentada en una subfase futura.

---

## 4. Flujo Central del Módulo

```
Investors (quiénes son)
→ Capital Contributions (cuánto aportaron)
→ Project Investors (qué rol y % tienen)
→ [Fase 1] Rehab Net Cost (gastos reales validados)
→ [2C] Lender + Acquisition + Closing
→ [2D] P&L Avanzado (All-in Cost, Net Profit)
→ [2E] Investor Settlement (reparto final)
→ [2F] Investor Final Report (reporte profesional)
```

---

## 5. Alcance Exacto de Phase 2B

### Incluye en 2B

| Entidad | Incluye |
|---|---|
| `investors` | Sí |
| `investor_companies` | Sí |
| `project_investors` | Sí |
| `capital_contributions` | Sí |
| `capital_calls` | Solo básico (registro manual, sin automation) |

### Explícitamente FUERA de 2B

Los siguientes módulos **no se implementan en 2B**. Quedan para fases futuras:

| Módulo | Fase |
|---|---|
| `lender_loans` / `loan_charges` / `loan_draws` | 2C |
| `acquisition_costs` | 2C |
| `realtor_parties` | 2C |
| `title_company_records` | 2C |
| `closing_statement_items` | 2C |
| `investor_distribution_rules` | 2E |
| `investor_settlements` | 2E |
| `investor_report_snapshots` | 2F |
| P&L Dashboard avanzado | 2D |
| PDF generator | 2F |
| Investor portal público | 2G |
| Cálculo de ROI | 2E |
| Cálculo de distribuciones | 2E |

---

## 6. Entidades de Phase 2B

### 6.1 `investors`

**Propósito:** Registrar personas físicas o jurídicas que aportan capital en proyectos.

**Campos mínimos:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | UUID | Sí | PK auto-generado |
| `name` | Text | Sí | Nombre completo o razón social |
| `type` | Enum | Sí | `person` / `company` |
| `email` | Text | No | Opcional |
| `phone` | Text | No | Opcional |
| `notes` | Text | No | Notas internas |
| `status` | Enum | Sí | `active` / `inactive` |
| `created_at` | Timestamp | Auto | |

**Relaciones:**
- Un `investor` puede participar en muchos proyectos vía `project_investors`.
- Un `investor` puede estar asociado a una `investor_company`.

---

### 6.2 `investor_companies`

**Propósito:** Registrar entidades legales (LLC, Corp) de los inversionistas. Ej: Blue Sky Properties LLC, R.C Art Construction LLC.

**Campos mínimos:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | UUID | Sí | PK |
| `company_name` | Text | Sí | |
| `contact_person` | Text | No | |
| `email` | Text | No | |
| `phone` | Text | No | |
| `license_number` | Text | No | Ej: Licencia 247277 |
| `state` | Text | No | Estado de registro |
| `notes` | Text | No | |
| `created_at` | Timestamp | Auto | |

---

### 6.3 `project_investors`

**Propósito:** Tabla de unión que define la participación de un inversionista en un proyecto específico.

**Campos mínimos:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | UUID | Sí | PK |
| `project_id` | UUID | Sí | FK → projects |
| `investor_id` | UUID | Sí | FK → investors |
| `role` | Text | Sí | Ej: `lead_contractor`, `equity_partner`, `silent_partner` |
| `ownership_percentage` | Numeric | No | 0–100, opcional en 2B |
| `profit_split_percentage` | Numeric | No | 0–100, opcional en 2B |
| `status` | Enum | Sí | `pending` / `confirmed` / `cancelled` |
| `agreement_notes` | Text | No | Referencia a acuerdo escrito |
| `created_at` | Timestamp | Auto | |

---

### 6.4 `capital_contributions`

**Propósito:** Registro de cada aporte de capital al proyecto por parte de un inversionista.

**Campos mínimos:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | UUID | Sí | PK |
| `project_id` | UUID | Sí | FK → projects |
| `investor_id` | UUID | Sí | FK → investors |
| `amount` | Numeric | Sí | Siempre > 0 |
| `date` | Date | Sí | Fecha del aporte |
| `method` | Enum | Sí | `cash` / `wire` / `check` / `company_payment` |
| `type` | Enum | Sí | `initial` / `additional` / `closing` / `reimbursement` |
| `status` | Enum | Sí | `pending` / `confirmed` / `cancelled` |
| `notes` | Text | No | |
| `evidence_reference` | Text | No | Path o referencia a documento fuente |
| `created_at` | Timestamp | Auto | |

---

### 6.5 `capital_calls` (básico)

**Propósito:** Registrar solicitudes formales de capital adicional. Solo registro manual en 2B, sin automation.

**Campos mínimos:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | UUID | Sí | PK |
| `project_id` | UUID | Sí | FK → projects |
| `requested_amount` | Numeric | Sí | > 0 |
| `reason` | Text | Sí | |
| `due_date` | Date | No | |
| `status` | Enum | Sí | `pending` / `confirmed` / `cancelled` |
| `notes` | Text | No | |
| `created_at` | Timestamp | Auto | |

---

## 7. Reglas de Negocio Obligatorias para 2B

### 7.1 Separación capital vs gasto

- Una `capital_contribution` **no es** un `expense`.
- Una `capital_contribution` **no afecta** `net_expense_cost`.
- Una `capital_contribution` **no afecta** `project_cash_position` en la Fase 1 sin una decisión formal documentada en una subfase posterior.
- El `project_financial_summaries` de Fase 1 **no debe modificarse** por aportes de capital.

### 7.2 Montos

- `amount` siempre **> 0**. Sin excepciones.
- Si un aporte fue incorrecto, se cancela con `status = cancelled`. No se edita el monto histórico.

### 7.3 Correcciones

- **No hay DELETE físico** de `capital_contributions`.
- Si un aporte fue un error, se marca como `cancelled` con nota explicativa.
- Si el monto fue incorrecto, se registra un nuevo aporte correcto y se cancela el anterior. Esto es un **reversal**.

### 7.4 Distribuciones y ROI

- **No aprobar distributions automáticamente** en 2B.
- **No calcular ROI en 2B.** El ROI requiere datos de closing que pertenecen a 2C/2E.
- **No mezclar** `investor_settlements` con `disbursements` de Fase 1 hasta que exista una decisión formal en 2E.

---

## 8. Estados de 2B

| Estado | Aplica a | Significado |
|---|---|---|
| `pending` | Contributions, project_investors, capital_calls | Registrado pero pendiente de verificación o confirmación documental |
| `confirmed` | Contributions, project_investors, capital_calls | Verificado con evidencia. Cuenta en totales calculados |
| `cancelled` | Contributions, project_investors, capital_calls | Anulado. No cuenta en totales. Se mantiene en historial |

**Regla:** Solo los registros en estado `confirmed` deben sumarse en los totales del Investor Hub.

---

## 9. Validaciones

| Campo | Regla |
|---|---|
| `amount` | Debe ser > 0 |
| `ownership_percentage` | Entre 0 y 100 si se ingresa |
| `profit_split_percentage` | Entre 0 y 100 si se ingresa |
| Duplicados | No duplicar el mismo `investor_id` + `project_id` + `role` sin justificación |
| Relaciones | Un investor puede estar en muchos proyectos. Un proyecto puede tener muchos investors |

---

## 10. UI Mínima para 2B

### Investor Hub Tab (dentro de un Project)

Vista mínima requerida:

| Sección | Contenido | Acciones |
|---|---|---|
| Investors List | Lista de inversionistas del proyecto con su rol y status | Add Investor, Remove (cancel) |
| Add Investor | Formulario para crear investor y adjuntarlo al proyecto | Save |
| Contributions List | Lista de aportes por inversionista con monto, fecha y status | Add Contribution, Cancel |
| Totals | Total aportado por cada inversionista, Total aportado al proyecto | Solo lectura |

**No incluir en 2B:**
- Dashboard de P&L avanzado.
- Gráficas de capital stack.
- Cálculo de ROI o distribuciones.
- Integración con lender, acquisition o closing.
- Vistas de inversionista final.

---

## 11. Integración con Fase 1

Phase 2B interactúa con la Fase 1 **solo en lectura**:

| Acción | Permitido en 2B |
|---|---|
| Leer `project.id` para asociar investors | Sí |
| Leer `project.name`, `project.address` | Sí |
| Leer `project_financial_summaries` para mostrar contexto | Sí (solo lectura) |
| Escribir en `expenses` | No |
| Escribir en `refunds` | No |
| Escribir en `disbursements` | No |
| Modificar `project_financial_summaries` | No |
| Cambiar fórmulas financieras | No |

---

## 12. Riesgos Específicos de 2B

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Confundir aporte con gasto | Doble conteo del costo del proyecto | Separar tablas. Contribution nunca toca expenses. |
| Doble registro de un aporte | Totales inflados | Validación de duplicados antes de guardar |
| Usar contribution como "capital disponible" sin conciliación real | Decisiones basadas en datos incorrectos | Contributions son solo registro. No son fuente de verdad de liquidez |
| Calcular y repartir profit antes de closing | Distribuciones incorrectas | ROI y settlement bloqueados hasta 2E |
| Exponer datos de inversionistas entre sí | Privacidad comprometida | Roles de vista separados desde el diseño |

---

## 13. Criterios de Aceptación para Aprobar Phase 2B

La implementación de 2B se considera completa cuando:

### Entidades implementadas
- [ ] `investors` — CRUD básico funcional.
- [ ] `investor_companies` — CRUD básico funcional.
- [ ] `project_investors` — Asociación funcional con estados.
- [ ] `capital_contributions` — Registro con validaciones de monto y estado.
- [ ] `capital_calls` — Registro básico manual.

### Pantallas mínimas
- [ ] Tab "Investor Hub" visible dentro del detalle de un Project.
- [ ] Lista de investors del proyecto.
- [ ] Formulario para agregar investor al proyecto.
- [ ] Lista de contributions con totales.
- [ ] Formulario para registrar contribution.

### Datos que NO deben calcularse en 2B
- [ ] ROI — Bloqueado hasta 2E.
- [ ] Profit distribution — Bloqueado hasta 2E.
- [ ] All-in cost — Bloqueado hasta 2D.
- [ ] Holding costs — Bloqueado hasta 2C.
- [ ] Net proceeds — Bloqueado hasta 2C.

### Lo que queda para fases futuras
- [ ] 2C: Lender, Acquisition, Title, Closing.
- [ ] 2D: Dashboard P&L avanzado.
- [ ] 2E: Settlement y distribución.
- [ ] 2F: Reporte final profesional.
- [ ] 2G: Portal público para inversionistas.

### Pruebas requeridas antes de aprobar 2B
- [ ] Un investor puede crearse sin proyecto.
- [ ] Un investor puede adjuntarse a un proyecto con rol.
- [ ] Un mismo investor puede estar en múltiples proyectos.
- [ ] Un proyecto puede tener múltiples investors.
- [ ] Una contribution con `amount <= 0` es rechazada.
- [ ] Cancelar una contribution no la elimina, solo cambia su status.
- [ ] El `project_financial_summaries` no cambia al agregar una contribution.
- [ ] Los totales de Investor Hub solo suman contributions con status `confirmed`.

---

## 14. Plan de Subfases

| Subfase | Contenido | Bloqueado hasta |
|---|---|---|
| **2B** | Investors, Companies, Project Investors, Contributions, Capital Calls | Aprobación de esta spec |
| **2C** | Lender, Acquisition, Realtor, Title, Closing | Entrega y QA de 2B |
| **2D** | P&L Dashboard avanzado (All-in cost, Net Profit estimado) | Entrega de 2C |
| **2E** | Investor Settlement, Distribution, ROI | Closing confirmado + 2D |
| **2F** | Investor Final Report (snapshot, preview, PDF futuro) | 2E aprobado |
| **2G** | Investor Portal público | Auth/RLS activado + 2F |

---

## 15. Recomendación

La implementación de **Phase 2B** es el siguiente paso lógico después de aprobar esta especificación.

Razón: los datos de inversionistas y sus aportes son la base de toda la cadena financiera del Investor Hub. Sin esta información registrada, las fases 2C a 2G no tienen contexto de quién financia el proyecto.

**Orden de trabajo sugerido en 2B:**

1. Crear migraciones para `investors`, `investor_companies`.
2. Crear migración para `project_investors`.
3. Crear migración para `capital_contributions` con validación `amount > 0`.
4. Crear migración para `capital_calls` básico.
5. Agregar tab "Investor Hub" en el detalle de proyecto.
6. UI: lista de investors + formulario de contribución.
7. QA: verificar que `project_financial_summaries` no se altera.
8. Commit y PR hacia `feat/investor-hub`.
