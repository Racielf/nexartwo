# PHASE 2A — Investor Hub Specification

**Estado:** Draft para revisión y aprobación.  
**Fase:** 2A — Product Spec + Data Model.  
**Referencia:** PHASE_2_INVESTOR_HUB_PLAN.md.

---

## 1. Objetivo del Investor Hub
El **Investor Hub** es el centro de control estratégico de NexArtWO diseñado para gestionar el ciclo de vida completo de una inversión inmobiliaria (Fix & Flip). Resuelve la fragmentación de datos entre inversionistas, prestamistas, contratistas y realtors, unificando la historia financiera desde la captación del capital hasta el reparto de utilidades en un solo lugar.

## 2. Base de Fase 1 (Validada)
El Investor Hub se apoya sobre los siguientes componentes ya construidos y verificados (Financial QA PASS):
- **Proyectos:** Entidad base con dirección y estado.
- **Gastos (Expenses):** Registro de tickets y recibos (RESTA).
- **Reembolsos (Refunds):** Devoluciones de dinero (SUMA).
- **Pagos (Disbursements):** Registro de dinero pagado (RESTA).
- **Summaries:** Vista `project_financial_summaries` que calcula el Net Cost y Profit operativo.
- **Inmutabilidad:** Reglas que impiden borrar o modificar la historia financiera (todo se corrige con nuevos registros).

## 3. Restricciones de Seguridad (No Romper)
- **Integridad Matemática:** No se debe alterar la fórmula financiera de la Fase 1.
- **Separación de Flujos:** Los aportes de capital de inversionistas **NUNCA** deben mezclarse con los `expenses` del proyecto (son pasivos/equity, no gastos operativos).
- **Préstamos vs Profit:** El capital proveniente de préstamos no es utilidad; debe rastrearse por separado como pasivo.
- **Privacidad:** La interfaz debe ser capaz de filtrar datos internos (notas privadas o costos de vendors específicos) para no exponerlos en reportes simplificados a inversionistas.

## 4. Idea Central del Flujo
El módulo gestiona el "Camino del Dinero":
1. **Inversionistas:** Identificación de quién pone el capital.
2. **Capital:** Registro de aportes (Equity).
3. **Loan / Lender:** Gestión de la deuda y sus costos (Intereses/Puntos).
4. **Acquisition:** Costos de compra y comisiones de entrada.
5. **Rehab:** Seguimiento de la obra (Fase 1).
6. **Sale / Closing:** Registro de venta y gastos de salida.
7. **Profit Split:** Aplicación de reglas de reparto.
8. **Final Report:** Documento profesional de cierre.

## 5. Entidades Futuras (Modelo de Datos Conceptual)

### Inversionistas y Estructura
- **investors:** Personas físicas o jurídicas que aportan capital.
- **investor_companies:** Entidades legales (ej: Blue Sky Properties LLC) asociadas a inversionistas.
- **project_investors:** Tabla de unión que define el rol y porcentaje de participación en un proyecto específico.
- **capital_contributions:** Registro de entradas de dinero de socios (Down payments, capital calls).
- **capital_calls:** Solicitudes formales de capital adicional durante el proyecto.

### Financiamiento y Adquisición
- **lender_loans:** Detalles del préstamo (Rain City Capital), tasa y términos.
- **loan_charges:** Intereses mensuales, puntos y fees de desembolso (draw fees).
- **loan_draws:** Registro de cuándo se libera dinero del préstamo para la obra.
- **acquisition_costs:** Precios de compra, fees de wholesalers (NetWorth) y depósitos iniciales.

### Venta y Cierre
- **realtor_parties:** Registro de agentes involucrados y sus comisiones pactadas.
- **title_company_records:** Datos de la compañía de título (Lawyers Title) y estado del escrow.
- **closing_statement_items:** Desglose del HUD/Settlement Statement (créditos y débitos finales).

### Reparto y Reportes
- **investor_distribution_rules:** Lógica de reparto (ej: 50/50, o retorno preferente).
- **investor_settlements:** Cálculo final de capital retornado + utilidad por socio.
- **investor_report_snapshots:** Versión congelada del reporte final para evitar cambios post-cierre.
- **project_documents:** Enlaces a evidencia (PDFs de cierre, cheques de aporte).

## 6. Pantallas Futuras (UI Map)
- **Investor Hub Dashboard:** Vista general de socios y balance de capital en el proyecto.
- **Capital Stack:** Visualización de cuánto es Equity vs cuánto es Deuda (LTV real).
- **Acquisition & Closing:** Panel para registrar los datos del HUD y documentos de título.
- **Lender Panel:** Seguimiento de pagos de intereses y fechas de vencimiento.
- **Rehab vs Actual:** Comparativa de presupuesto original (Ryan) vs gastos reales (Fase 1).
- **Investor Settlement:** Pantalla de "check-out" para liquidar el proyecto y repartir utilidades.

## 7. Cálculos Conceptuales
- **All-in Cost:** Compra + Adquisición + Rehab (Net) + Holding Costs + Selling Costs.
- **Net Profit:** Precio de Venta - All-in Cost.
- **ROI Inversionista:** Utilidad recibida / Capital aportado.

## 8. Estructura del Reporte Final
Un documento profesional que incluya:
- Resumen ejecutivo y fotos del proyecto.
- Cuadro de aportes y capital retornado.
- Resumen del préstamo y costos financieros.
- Desglose de remodelación (Presupuesto vs Real).
- P&L Final y cálculo de ROI.
- Apéndice con links a documentos de cierre.

## 9. Preguntas Abiertas (Por Confirmar)
- ¿El trabajo físico (sweat equity) de un socio se valoriza como capital?
- ¿Qué nivel de detalle de los gastos de Fase 1 debe ver el inversionista externo?
- ¿Las comisiones de venta se restan del Profit bruto o se consideran gasto del proyecto?

## 10. Plan de Implementación (Sugerido)
- **2B:** Entidades de Inversionistas y aportes iniciales.
- **2C:** Registro de Lender, Compra y Cierre.
- **2D:** Dashboard avanzado integrando Fase 1.
- **2E:** Cálculo de liquidación (Settlement).
- **2F:** Generación de Reporte Final.

## 11. Recomendación
Se recomienda iniciar con la **Fase 2B (Inversionistas y Capital)** inmediatamente después de aprobar esta especificación, ya que permite registrar el origen de los fondos que sustentan los gastos actuales de la Fase 1.
