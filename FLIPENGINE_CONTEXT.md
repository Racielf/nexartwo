# FlipEngine Context

Estamos trabajando en el repositorio Nexartwo.

## Objetivo

Adaptar el sistema existente NexArWO agregando FlipEngine como una capa/modulo interno para inversiones inmobiliarias tipo fix & flip.

## Context Guardrails

- NexArWO es la aplicacion principal existente. No se reemplaza, no se reconstruye y no se rompe.
- FlipEngine no es una app nueva separada. Es una capa/modulo nuevo dentro de NexArWO.
- NexArtEngine pertenece a otro proyecto diferente y no debe usarse como nombre de esta app, branding, tablas o modulos dentro de este repositorio.
- NexArWO debe seguir funcionando como sistema de Work Orders, Projects, construccion y operaciones.
- Los proyectos existentes no deben ser forzados a ser inversiones.
- En el contexto de FlipEngine, solo algunos `projects` pueden representar propiedades/inversiones.
- Cualquier tabla o modulo nuevo debe extender lo existente de forma no destructiva.
- No hacer cambios destructivos.
- No tocar migraciones existentes sin aprobacion explicita.
- No activar Investor Hub sin aprobacion explicita.
- No cambiar el branding general de NexArWO sin aprobacion explicita.

## Importante

NO reconstruyas la app desde cero.
NO borres módulos existentes.
NO cambies todo el diseño de una vez.
NO rompas Work Orders, Projects, Financials ni Supabase.
Debes extender el sistema actual creando nuevos módulos conectados al flujo existente.

## Contexto

Ya teníamos un plan maestro para un CRM de inversión inmobiliaria. Ahora ese plan debe adaptarse a este repositorio.

El sistema final debe manejar:

- Propiedades / inversiones
- Compra de propiedades
- Remodelación
- Work Orders
- Presupuesto
- Gastos
- Recibos
- Documentos
- Prestamistas
- Draws
- Closing Costs
- Inversionistas
- Contratistas
- Empleados
- Horas de trabajo
- Pagos
- Reportes
- Venta de la propiedad

## Arquitectura Deseada

Usar el sistema actual de Projects como base principal cuando un proyecto se marque o se trate como propiedad/inversion.
No todos los Projects deben evolucionar para funcionar como Property / Investment Hub.

Nuevo concepto:

```text
Selected projects can represent properties/investments in FlipEngine context
```

Cada propiedad/inversión debe tener un centro principal llamado Property Hub.

Property Hub debe incluir tabs:

1. Overview
2. Acquisition
3. Budget
4. Work Orders
5. Expenses
6. Receipts
7. Documents
8. Loans / Draws
9. Investors
10. Contractors
11. Labor / Time
12. Payments
13. Sale / Exit
14. Reports

## Primera Tarea

Antes de escribir código grande, crea documentación técnica dentro del repo.

Crear carpeta si no existe:

```text
docs/flipengine/
```

Crear estos archivos:

1. `docs/flipengine/01_ADAPTATION_STRATEGY.md`
   Explicar cómo se adapta el plan anterior al repo actual.

2. `docs/flipengine/02_EXISTING_REPO_MAP.md`
   Mapear los archivos existentes relevantes:
   - `index.html`
   - `projects.html`
   - `js/app.js`
   - `js/projects.js`
   - `js/supabase.js`
   - css files
   - `supabase/migrations`

3. `docs/flipengine/03_MODULES_TO_ADD.md`
   Listar módulos nuevos y cómo se conectan con lo existente.

4. `docs/flipengine/04_DATABASE_EXTENSION_PLAN.md`
   Definir tablas nuevas necesarias, sin todavía ejecutar migraciones destructivas.

5. `docs/flipengine/05_IMPLEMENTATION_PHASES.md`
   Dividir la implementación por fases seguras.

## Módulos Nuevos Requeridos

### A. Acquisition Module

Debe manejar:

- Purchase price
- Earnest money
- Closing date
- Buyer entity
- Seller
- Escrow company
- Escrow number
- Lender
- Loan number
- Loan amount
- Buyer funds to close
- Construction holdback
- Assignment fee
- Insurance
- Title fees
- Recording fees
- Closing documents

### B. Budget Categories Module

Debe manejar:

- Categorías de remodelación
- Estimated budget
- Actual spent
- Remaining
- Variance
- Status
- Relación con property/project
- Relación con work orders
- Relación con expenses

### C. Closing Costs Module

Debe manejar:

- Closing cost name
- Category
- Amount
- Paid by
- Related lender
- Related document
- Property/project
- Notes

### D. Loans / Draws Module

Debe manejar:

- Lender
- Loan amount
- Origination fee
- Processing fee
- Construction holdback
- Draw requests
- Draw status
- Draw amount
- Draw documents
- Property/project

### E. Receipts Module

Debe manejar:

- Receipt date
- Vendor
- Amount
- Payment method
- Receipt image/file
- Property/project
- Work order
- Budget category
- Expense
- Review status
- Reimbursement status

### F. Documents Module Extension

Debe permitir asociar documentos a:

- Property/project
- Acquisition
- Loan
- Draw
- Closing cost
- Work order
- Expense
- Receipt
- Investor
- Contractor
- Employee

Tipos de documentos:

- Proof of Funds
- Buyer Statement
- Final Buyer Statement
- Deed
- Deed of Trust
- Insurance
- Receipt
- Invoice
- Work Order
- Contractor Document
- Employee Document
- Investor Document
- Other

### G. Investors Module

Debe manejar:

- Investor type: person / company
- Name
- Contact info
- Address
- Amount committed
- Amount funded
- Related properties/projects
- Documents
- Notes

### H. Contractors Module

Debe manejar:

- Contractor name
- Company
- Phone
- Email
- Specialty
- License info
- Insurance info
- Documents
- Related work orders
- Related payments

### I. Employees / Labor Module

Debe manejar:

- Employee info
- Hourly rate
- Time entries
- Check in / check out future-ready
- Related work order
- Related project/property
- Total hours
- Labor cost

### J. Payments Module

Debe manejar:

- Payment date
- Amount
- Payment method
- Paid to
- Related expense
- Related invoice
- Related contractor
- Related employee
- Related project/property
- Status

### K. Sale / Exit Module

Debe manejar:

- Listing price
- Sale price
- Sale date
- Realtor
- Selling costs
- Net proceeds
- Final profit
- Final ROI
- Sale documents

## Dashboards

Mantener dos dashboards:

### 1. Executive Dashboard

Debe mostrar:

- Active properties
- Total invested
- Total loan amount
- Total renovation budget
- Total spent
- Remaining budget
- Estimated profit
- ROI
- Open work orders
- Pending receipts review
- Pending payments
- Documents needing review

### 2. Data / Admin Dashboard

Debe mostrar tablas completas y filtros para:

- Properties / Projects
- Acquisition records
- Budgets
- Budget categories
- Work orders
- Expenses
- Receipts
- Loans
- Draws
- Closing costs
- Documents
- Investors
- Contractors
- Employees
- Time entries
- Payments

## Caso Real De Prueba

Usar estos datos demo iniciales:

Property:

```text
4134 NE 131st Place, Portland, OR 97230
```

Buyer:

```text
Blue Sky Properties LLC
```

Purchase Price:

```text
440000
```

Loan:

```text
Rain City Capital
```

Loan Amount:

```text
446040
```

Construction Holdback:

```text
45600
```

Buyer Funds to Close:

```text
64533.30
```

Earnest Money:

```text
5000
```

Owner Title Insurance:

```text
1230
```

Escrow Fee:

```text
2240
```

Homeowner Insurance:

```text
3999
```

Assignment Fee:

```text
10000
```

Example Receipt:

```text
Home Depot / PO Job 4134 RC / Total 10.85
```

## Fases

### Fase 1

Solo documentación + plan técnico.
No implementar todavía cambios grandes.

### Fase 2

Crear migración SQL no destructiva con tablas nuevas.

### Fase 3

Crear Property Hub usando `projects.html` como base.

### Fase 4

Integrar Acquisition, Budget, Receipts y Documents.

### Fase 5

Integrar Loans, Draws, Closing Costs y Payments.

### Fase 6

Integrar Investors, Contractors, Employees y Time Tracking.

### Fase 7

Crear reportes financieros y dashboard ejecutivo real.

## Validación

Después de cada fase, explicar:

- Archivos modificados
- Tablas agregadas
- Riesgos
- Qué falta
- Cómo probar manualmente
