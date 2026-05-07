# Phase 2 — Investor Hub

**Documento guía para orientar al agente y mantener contexto del proyecto NexArtWO.**  
**Estado:** Plan de discusión y dirección de producto.  
**No implementar todavía sin autorización explícita.**

---

## 1. Estado actual

La **Fase 1 — Sistema de Proyectos y Control Financiero** ya quedó cerrada.

Estado final de Fase 1:

- Mergeada a `main`.
- Validada con workflow `Supabase Financial QA`.
- Smoke test financiero en PASS.
- Módulo financiero congelado.
- Auth/RLS preparado como draft, no activado.
- OCR planificado, no implementado.

La Fase 1 dejó lista la base financiera interna:

- Projects.
- Project expenses.
- Project refunds.
- Project disbursements.
- Financial summaries.
- Reglas de aprobación.
- Regla de no borrar historia financiera.
- Triggers de inmutabilidad.
- Separación entre gastos, reembolsos y pagos.
- Vista financiera calculada en base de datos.

**Investor Hub debe construirse encima de esta base, no reemplazarla ni romperla.**

---

## 2. Nombre oficial de la nueva fase

# Phase 2 — Investor Hub

Nombre visible dentro del sistema:

## Investor Hub

Nombre sugerido para documentos:

```text
PHASE_2_INVESTOR_HUB_PLAN.md
```

Nombre sugerido de rama futura:

```text
feat/investor-hub
```

---

## 3. Idea central

Investor Hub será el centro de control para proyectos Fix & Flip donde participan inversionistas.

La idea no es solo guardar inversionistas como contactos.  
La idea es controlar todo el ciclo del negocio:

```text
Inversionistas
→ Capital
→ Préstamo / lender
→ Compra
→ Remodelación
→ Gastos reales
→ Venta
→ Cierre
→ Utilidad
→ Reparto
→ Reporte final profesional
```

El sistema debe responder una pregunta principal:

> ¿Qué pasó con el dinero desde que los inversionistas entraron al proyecto hasta que la propiedad se vendió y se repartió la utilidad?

---

## 4. Problema que resuelve

En un proyecto Fix & Flip real intervienen muchas partes:

- Inversionistas.
- Compañías de inversionistas.
- Contratista principal.
- Prestamista o hard money lender.
- Realtor o wholesaler.
- Title company.
- Comprador.
- Agentes de venta.
- Vendors.
- Subcontratistas.
- Workers/helpers.

Sin Investor Hub, la información queda separada en:

- Excel.
- Correos.
- PDFs.
- Reportes diarios.
- Presupuestos.
- Documentos de title company.
- Conversaciones con realtor.
- Gastos del proyecto.
- Work Orders.
- Cálculos manuales.

Investor Hub debe unir esa historia en un solo lugar por proyecto.

---

## 5. Caso real usado como referencia

El caso real usado para orientar esta fase fue un proyecto Fix & Flip en:

```text
6555 SE 71st Ave, Portland, OR 97206
```

Actores detectados en la auditoría inicial:

- **R.C Art Construction LLC** — Contratista principal / Investor 1.
- **Blue Sky Properties LLC** — Investor 2.
- **Rain City Capital** — Lender / hard money.
- **NetWorth Realty** — Wholesaler / fee de exclusividad.
- **Tony Gonzalez / KW** — Realtor de venta.
- **Lawyers Title** — Title / escrow.
- **Ryan** — Presupuesto / service library.
- **Reporte diario.xlsx** — Registro operativo de la obra.
- **RCC Budget Single Unit** — Presupuesto base / librería de servicios.

Datos importantes encontrados en el discovery inicial:

- Aporte inicial aproximado de Investor 1: `20,000`.
- Aporte inicial aproximado de Investor 2: `10,000`.
- Fee de NetWorth Realty mencionado: `10,000`.
- Obra aproximada: `2025-10-11` a `2026-01-26`.
- Gasto real consolidado reportado: `51,724.57`.
- Existen documentos de lender, title, realtor, correos y presupuesto que deben seguirse usando como evidencia.

Estos datos son referencia de negocio.  
Antes de calcular reparto real, deben verificarse con documentos finales de cierre.

---

## 6. Relación con Fase 1

Investor Hub debe consumir y respetar lo ya construido.

### Ya existe y no debe romperse

- Projects.
- Expenses.
- Refunds.
- Disbursements.
- Financial summaries.
- Estados: pending, approved, paid, cancelled, rejected.
- No hard delete financiero.
- Montos positivos.
- Triggers de inmutabilidad.
- Profit / cash position según fórmula aprobada.
- UI Vanilla JS.
- Supabase como fuente de verdad.

### Lo que Investor Hub debe usar de Fase 1

Investor Hub debe apoyarse en:

- `project_financial_summaries`.
- Expenses aprobados.
- Refunds aprobados.
- Disbursements aprobados/pagados.
- Work Orders.
- Costos de adquisición ya registrados en Projects.
- Net expense cost.
- Total disbursements.
- Profit.
- Project cash position.

### Lo que Investor Hub NO debe hacer

- No recalcular en JS lo que ya calcula SQL.
- No duplicar expenses.
- No convertir aportes de inversionistas en gastos.
- No convertir préstamos en utilidad.
- No borrar registros financieros.
- No modificar campos históricos.
- No mezclar cash out con profit.
- No cambiar la fórmula financiera aprobada sin una nueva decisión formal.

---

## 7. Relación con la Fase 2 anterior

La Fase 2 anterior se enfocaba en:

- Reportes P&L.
- Workflow de aprobación.
- Project-level reporting.
- Work Order-level reporting.
- Vendor/entity-level reporting.
- Cash Out.
- Pending Payables.
- Budget Variance.
- Approved vs Pending.
- Audit Log futuro.

Esa fase sigue siendo válida, pero ahora debe funcionar como parte interna de Investor Hub.

La nueva Fase 2 no reemplaza el P&L.  
Lo integra dentro de un ciclo más completo:

```text
P&L interno
+ capital de inversionistas
+ lender
+ compra
+ venta
+ closing
+ reparto
+ reporte final
= Investor Hub
```

---

## 8. Alcance de Investor Hub

Investor Hub debe cubrir:

### 8.1 Inversionistas

- Registrar inversionistas.
- Registrar compañías relacionadas.
- Definir rol de cada inversionista.
- Registrar aporte de capital.
- Registrar porcentaje o regla de participación.
- Registrar acuerdos de reparto.
- Ver balance de capital por inversionista.
- Ver utilidad o pérdida al final.

### 8.2 Capital

- Capital inicial.
- Capital adicional.
- Capital calls.
- Aportes de cierre.
- Reembolsos de capital.
- Distribuciones.
- Diferenciar capital de gastos.

### 8.3 Lender / préstamo

- Nombre del lender.
- Tipo de préstamo.
- Loan amount.
- Interest rate.
- Points.
- Fees.
- Draws.
- Payoff.
- Holding costs.
- Relación con el proyecto.

### 8.4 Compra / adquisición

- Purchase price.
- Reservation fee / wholesaler fee.
- Title deposit.
- Closing costs.
- Title company.
- Acquisition documents.
- Due diligence checklist.

### 8.5 Rehab / construcción

- Presupuesto inicial.
- Presupuesto actual.
- Gasto real.
- Work Orders.
- Labor.
- Materials.
- Servicios.
- Change Orders.
- Budget vs Actual.

### 8.6 Venta / negociación / closing

- Realtor.
- Listing price.
- Offer price.
- Accepted offer.
- Repair requests.
- Accepted repairs.
- Rejected repairs.
- Seller concessions.
- Title fees.
- Loan payoff.
- Net proceeds.

### 8.7 Reparto y reporte final

- Total capital invested.
- All-in cost.
- Net sale proceeds.
- Net profit.
- Profit split.
- ROI.
- Investor distributions.
- Final investor report.

---

## 9. Usuarios principales

### Owner / Manager

Necesita ver todo:

- Costos internos.
- Aportes.
- Lender.
- Expenses.
- Refunds.
- Disbursements.
- Profit.
- Cash position.
- Investor split.
- Closing.
- Reporte final.

### Investor

Debe ver solo lo necesario:

- Proyecto.
- Progreso.
- Capital aportado.
- Estado general.
- Proyección.
- Resultado final.
- Reporte final.
- Documentos permitidos.

No debe ver:

- Vendor costs sensibles no aprobados para inversionista.
- Notas internas privadas.
- Información de otros inversionistas si no aplica.
- Datos operativos que no sean parte del reporte autorizado.

### Field user / worker

No debe entrar a Investor Hub salvo permiso especial.

### Accountant / admin

Puede necesitar acceso a:

- Contributions.
- Closing statement.
- Distribution.
- Evidence.
- Export/report.

---

## 10. Entidades nuevas propuestas

Esto es conceptual. No escribir SQL todavía.

---

### 10.1 investors

Propósito: guardar personas o entidades que invierten.

Campos principales:

- id.
- name.
- type: person / company.
- email.
- phone.
- tax_notes opcional.
- status.
- notes.

Relaciones:

- Puede participar en muchos proyectos.
- Puede estar asociado a una compañía.

---

### 10.2 investor_companies

Propósito: registrar compañías como R.C Art Construction LLC o Blue Sky Properties LLC.

Campos:

- id.
- company_name.
- contact_person.
- email.
- phone.
- license_number si aplica.
- state.
- notes.

Relaciones:

- Una compañía puede tener uno o más inversionistas.
- Una compañía puede participar en proyectos.

---

### 10.3 project_investors

Propósito: unir inversionistas con proyectos.

Campos:

- project_id.
- investor_id.
- role.
- ownership_percentage.
- profit_split_percentage.
- capital_committed.
- status.
- agreement_notes.

Relaciones:

- Project → muchos project_investors.
- Investor → muchos project_investors.

---

### 10.4 capital_contributions

Propósito: registrar aportes de capital.

Campos:

- project_id.
- investor_id.
- amount.
- date.
- type: initial / additional / closing / reimbursement.
- method: cash / wire / check / company payment.
- evidence_document_id.
- notes.
- status.

Regla:

Un aporte de capital no es un gasto del proyecto.  
No debe afectar `net_expense_cost`.

---

### 10.5 capital_calls

Propósito: registrar solicitudes de capital adicional.

Campos:

- project_id.
- requested_amount.
- reason.
- due_date.
- status.
- notes.

---

### 10.6 lender_loans

Propósito: registrar préstamo o hard money.

Campos:

- project_id.
- lender_name.
- loan_amount.
- interest_rate.
- points.
- term_months.
- start_date.
- maturity_date.
- status.
- notes.

---

### 10.7 loan_charges

Propósito: registrar costos del préstamo.

Campos:

- loan_id.
- charge_type: interest / points / draw_fee / extension_fee / payoff_fee / other.
- amount.
- date.
- notes.
- evidence_document_id.

---

### 10.8 loan_draws

Propósito: registrar draws o avances del préstamo si existen.

Campos:

- loan_id.
- draw_amount.
- draw_date.
- purpose.
- status.
- evidence_document_id.

---

### 10.9 acquisition_costs

Propósito: registrar costos de compra que no sean expenses regulares.

Campos:

- project_id.
- cost_type: purchase_price / wholesaler_fee / title_deposit / inspection / appraisal / closing_cost / other.
- amount.
- date.
- party.
- evidence_document_id.
- notes.

---

### 10.10 realtor_parties

Propósito: registrar realtors, wholesalers y agentes.

Campos:

- project_id.
- name.
- company.
- role: wholesaler / listing_agent / buyer_agent / transaction_coordinator / other.
- commission_type.
- commission_amount.
- notes.
- evidence_document_id.

---

### 10.11 title_company_records

Propósito: registrar title company y estado de cierre.

Campos:

- project_id.
- company_name.
- escrow_number.
- officer_name.
- status.
- closing_date.
- notes.

---

### 10.12 closing_statement_items

Propósito: registrar el desglose de cierre.

Campos:

- project_id.
- title_record_id.
- item_name.
- category.
- amount.
- side: debit / credit.
- source_document_id.
- notes.

---

### 10.13 investor_distribution_rules

Propósito: guardar la regla de reparto.

Campos:

- project_id.
- rule_type: percentage / fixed_return / preferred_return / custom.
- investor_id.
- percentage.
- priority_order.
- notes.

---

### 10.14 investor_settlements

Propósito: guardar el resultado final por inversionista.

Campos:

- project_id.
- investor_id.
- capital_returned.
- profit_share.
- total_distribution.
- roi.
- settlement_date.
- status.
- evidence_document_id.
- notes.

---

### 10.15 investor_report_snapshots

Propósito: guardar una versión congelada del reporte final.

Campos:

- project_id.
- report_version.
- generated_at.
- generated_by.
- report_data_json.
- pdf_url futuro.
- status.

Regla:

Una vez aprobado el reporte final, no debe editarse silenciosamente.  
Si cambia, debe generarse nueva versión.

---

### 10.16 project_documents / evidence_links

Propósito: conectar documentos fuente con datos.

Campos:

- project_id.
- document_type.
- file_path_or_storage_path.
- source_name.
- related_entity.
- notes.
- uploaded_at.

---

## 11. Pantallas sugeridas

### 11.1 Investor Hub tab

Vista principal dentro de un Project.

Debe mostrar:

- Lista de inversionistas del proyecto.
- Capital aportado.
- Porcentaje o regla de participación.
- Balance de capital.
- Estado del reporte final.

Acciones:

- Add investor.
- Add contribution.
- View settlement.
- Generate draft report futuro.

---

### 11.2 Capital Stack tab

Debe mostrar:

- Equity contributions.
- Loan amount.
- Cash invested.
- Total capital available.
- Capital used.
- Remaining capital.
- Lender payoff estimate.

---

### 11.3 Acquisition tab

Debe mostrar:

- Purchase price.
- Wholesaler fee.
- Title deposit.
- Closing costs.
- Title company.
- Acquisition checklist.
- Source documents.

---

### 11.4 Lender tab

Debe mostrar:

- Lender.
- Loan amount.
- Interest.
- Points.
- Fees.
- Draws.
- Payoff.
- Maturity.
- Holding cost estimate.

---

### 11.5 Rehab Budget vs Actual tab

Debe mostrar:

- Original budget.
- Current budget.
- Actual cost.
- Work Order breakdown.
- Budget variance.
- Approved expenses.
- Pending expenses.
- Refunds.
- Disbursements.

Debe usar datos de Fase 1 cuando aplique.

---

### 11.6 Sale / Closing tab

Debe mostrar:

- Listing price.
- Offer price.
- Accepted sale price.
- Seller concessions.
- Buyer repair requests.
- Accepted repairs.
- Rejected repairs.
- Title fees.
- Loan payoff.
- Net proceeds.

---

### 11.7 Investor Settlement tab

Debe mostrar:

- Total capital contributed.
- Capital returned.
- Net profit.
- Profit split.
- Distribution by investor.
- ROI.
- Status.

---

### 11.8 Investor Final Report tab

Debe mostrar:

- Draft report.
- Data completeness checklist.
- Missing fields.
- Preview.
- Generate PDF futuro.
- Approve final report futuro.

---

## 12. Dashboards

### 12.1 Manager Dashboard

Debe mostrar:

- All-in cost.
- Rehab budget vs actual.
- Cash invested.
- Lender payoff estimate.
- Net proceeds estimate.
- Pending payables.
- Budget variance.
- Investor capital balance.
- Profit estimate.
- Final profit after closing.

### 12.2 Investor Dashboard

Debe mostrar:

- Project overview.
- Capital contributed.
- Progress.
- Timeline.
- Projected return.
- Final return.
- Report documents allowed.
- High-level work summary.

No debe mostrar información interna no autorizada.

---

## 13. Cálculos conceptuales

No implementar todavía.  
No calcular con datos incompletos.

### 13.1 All-in cost

```text
all_in_cost =
purchase_price
+ acquisition_costs
+ rehab_net_cost
+ lender_costs
+ holding_costs
+ selling_costs
```

### 13.2 Rehab net cost

```text
rehab_net_cost =
approved_expenses
- approved_refunds
```

### 13.3 Net profit

```text
net_profit =
sale_price
- all_in_cost
```

### 13.4 Cash-on-cash return

```text
cash_on_cash =
net_profit / cash_invested
```

### 13.5 Investor distribution

```text
investor_distribution =
capital_return
+ profit_share
```

### 13.6 Investor ROI

```text
investor_roi =
profit_share / investor_capital_contributed
```

---

## 14. Investor Final Report

Estructura sugerida:

1. Cover.
2. Executive Summary.
3. Project Overview.
4. Property Details.
5. Investment Structure.
6. Investor Contributions.
7. Loan / Lender Summary.
8. Acquisition Summary.
9. Renovation Summary.
10. Budget vs Actual.
11. Work Completed.
12. Work Rejected / Denied.
13. Sale and Negotiation Summary.
14. Closing Statement Summary.
15. Final P&L.
16. Investor Distribution.
17. ROI.
18. Timeline.
19. Source Documents / Appendix.
20. Signature / Approval futuro.

---

## 15. Qué NO implementar todavía

No implementar todavía:

- Auth/RLS activation.
- OCR real.
- Receipt upload.
- Final PDF generator.
- Investor portal público.
- Payment processing.
- Bank reconciliation.
- Tax/legal advice automation.
- E-signature.
- Automatic lender integrations.
- Automatic bank sync.
- Final settlement automation sin revisión humana.

---

## 16. Riesgos

Riesgos principales:

1. Mezclar capital contribution con expense.
2. Contar loan proceeds como profit.
3. Confundir disbursement con investor distribution.
4. Exponer datos internos a usuarios no autorizados.
5. Calcular ROI sin closing final.
6. Usar porcentajes de reparto sin acuerdo escrito.
7. No capturar holding costs.
8. Duplicar costos ya incluidos en closing statement.
9. Duplicar realtor commissions.
10. Hacer reporte final sin evidencia documental.

---

## 17. Preguntas abiertas

Antes de implementar se debe aclarar:

- ¿Cuál fue el purchase price final?
- ¿Cuál fue el loan amount real?
- ¿Cuáles fueron interest, points y fees?
- ¿Cuál fue el sale price final?
- ¿Cuál fue el closing date?
- ¿Cuál fue el net proceeds real?
- ¿Cuál es la regla oficial de profit split?
- ¿El trabajo/labor de un socio cuenta como capital o como costo?
- ¿El fee de NetWorth se clasifica como acquisition cost?
- ¿Las comisiones de Tony se clasifican como selling cost?
- ¿Los inversionistas verán datos en vivo o solo reporte final?
- ¿Habrá investor portal o solo reporte interno?
- ¿Quién aprueba el settlement final?

---

## 18. Fases de implementación sugeridas

### Phase 2A — Product Spec + Data Model

Objetivo:

Cerrar especificación antes de código.

Entregables:

- Especificación final.
- Data model conceptual.
- UI map.
- Calculation rules.
- Open questions list.

No código todavía.

---

### Phase 2B — Investor Entities + Capital Contributions

Objetivo:

Registrar inversionistas, compañías, participación y aportes.

Incluye:

- Investors.
- Investor companies.
- Project investors.
- Capital contributions.
- Capital calls básico.

---

### Phase 2C — Lender + Acquisition + Closing Records

Objetivo:

Registrar compra, lender y closing.

Incluye:

- Lender loans.
- Loan charges.
- Acquisition costs.
- Realtor parties.
- Title company records.
- Closing statement items.

---

### Phase 2D — P&L Advanced Dashboard

Objetivo:

Usar Fase 1 + datos nuevos para dashboard completo.

Incluye:

- All-in cost.
- Budget vs actual.
- Capital stack.
- Rehab net cost.
- Sale estimate.
- Profit estimate.
- Investor capital balance.

---

### Phase 2E — Investor Settlement Calculation

Objetivo:

Calcular reparto final.

Incluye:

- Capital returned.
- Profit share.
- ROI.
- Distribution.
- Settlement approval.

---

### Phase 2F — Investor Final Report

Objetivo:

Generar reporte profesional final.

Incluye:

- Snapshot.
- Preview.
- Approval.
- PDF futuro.
- Versioning.

---

### Phase 2G — Future Investor Portal

Objetivo:

Vista limitada para inversionistas.

No iniciar hasta Auth/RLS real.

---

## 19. Recomendación final

La mejor ruta es una fase híbrida:

```text
Phase 2 — Investor Hub
```

No conviene implementar solo la Fase 2 vieja de P&L.  
Tampoco conviene implementar solo una lista de inversionistas.

La ruta correcta es:

```text
Investor lifecycle + P&L alignment
```

Primero se define quién invierte y cómo entra el capital.  
Luego se conectan compra, préstamo, rehab, venta y cierre.  
Después se calcula el reparto y se genera el reporte final.

El orden recomendado es:

```text
2A — Product Spec + Data Model
2B — Investor Entities + Capital Contributions
2C — Lender + Acquisition + Closing Records
2D — P&L Advanced Dashboard
2E — Investor Settlement Calculation
2F — Investor Final Report
2G — Future Investor Portal
```

---

## 20. Regla final para el agente

Antes de implementar cualquier parte de Investor Hub, el agente debe confirmar:

- Qué subfase se autoriza.
- Qué archivos puede tocar.
- Qué archivos no puede tocar.
- Si puede crear SQL o no.
- Si puede hacer commit o no.
- Si debe esperar revisión antes de continuar.

Por defecto:

```text
No implementar sin autorización explícita.
```
