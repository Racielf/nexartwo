# Product Boundaries - NexArtWO

Status: Active product boundary. Updated 2026-07-12.

## Product Identity

NexArtWO is the main application. FlipEngine is an internal module/layer for selected projects where `project_type === 'fix_and_flip'` or a future approved eligibility rule applies.

Deal Analyzer remains a possible future quick property-evaluation calculator. It is not the name of the current Property Hub and does not replace FlipEngine's project lifecycle controls.

## In Scope

- Dashboard, Work Orders, Projects, clients, documents, and mobile field use.
- Existing project expenses, refunds, disbursements, and financial summaries.
- FlipEngine Property Hub for eligible projects.
- Acquisition, budget, receipts, document links, loans/draws, people, labor, payments, sale/exit, and reports through approved phases.
- Investor and capital workflows only through their own approval and security gates.

## Gated

- SQL execution and migration application.
- New Supabase methods or FlipEngine CRUD.
- Auth/RLS and production access.
- Investor Hub activation or modification.
- New or changed financial formulas.
- Receipt-to-expense, draw, payment, profit, ROI, and distribution automation.

## Out Of Scope For Now

- Full QuickBooks replacement, bank sync, payroll, or tax filing.
- Public investor portal.
- Native mobile app.
- AI comps engine without a dedicated phase.
- A separate FlipEngine application or broad NexArtWO rebrand.
