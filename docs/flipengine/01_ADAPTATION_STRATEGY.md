# FlipEngine Adaptation Strategy

Source context: `FLIPENGINE_CONTEXT.md`

## Objective

Adapt NexArWO by adding FlipEngine as an internal fix-and-flip real estate investment layer, without rebuilding the app from scratch.

The current NexArWO app already has the right foundation:

- Projects
- Work Orders
- Project financials
- Expenses, refunds, disbursements
- Documents
- Clients
- Investor Hub infrastructure
- Supabase data layer

FlipEngine should extend those systems into optional property investment workflows instead of replacing them.

## Context Guardrails

- NexArWO remains the primary existing application and product.
- FlipEngine is a module/layer inside NexArWO, not a separate app and not a replacement.
- NexArtEngine belongs to a different project and must not be used as this app name, branding, table prefix, module name, or repo identity.
- NexArWO must continue working as a Work Orders, Projects, construction, and operations system.
- Existing projects must not be forcibly converted into investments.
- In FlipEngine, selected projects can represent properties/investments.
- New tables and UI modules must extend the current system non-destructively.
- Do not modify existing migrations, activate Investor Hub, or change general NexArWO branding without explicit approval.

## Core Product Translation

The module-specific translation is:

```text
Selected projects can represent properties/investments in FlipEngine context
```

The existing `Projects` module can become the base for property investments when a project participates in FlipEngine. Those selected projects can expose a `Property Hub`, where acquisition, renovation, financing, investors, labor, documents, and exit data are managed in one place.

## Non-Negotiable Rules

- Do not rebuild the app from zero.
- Do not delete existing modules.
- Do not change the entire design in one pass.
- Do not break Work Orders, Projects, Financials, Documents, Investor Hub, or Supabase.
- Do not rebrand NexArWO as FlipEngine.
- Do not use NexArtEngine naming in this repository.
- Do not force every existing project to become an investment.
- Do not execute SQL directly during planning.
- Do not modify `supabase/migrations/` without owner approval.
- Do not mix capital funding data into operating expense, ROI, P&L, or Work Order formulas unless a later approved spec explicitly changes that rule.

## Adaptation Principles

### 1. Preserve Current Operational Workflows

Existing workflows must continue to work while FlipEngine features are added:

- Work Orders continue to manage scope, line items, status, client/project association, and documents.
- Projects continue to manage property-level records and project financial summaries.
- Existing project expenses, refunds, and disbursements remain valid.
- Existing Investor Hub data remains isolated from operating financial formulas.

### 2. Add Property-Specific Extensions Around Projects

New FlipEngine modules should relate to `projects.id` rather than replacing the `projects` table.

Recommended approach:

- Keep `projects` as the primary record only for selected property/investment workflows.
- Add extension tables for acquisition, budget categories, closing costs, loans, draw requests, receipts, contractors, employees, labor, payments, and sale/exit.
- Link each extension record to `project_id`.

### 3. Build A Property Hub, Not Separate Apps

The user should not have to jump between unrelated tools. Each property should have a central workspace:

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

The existing project detail screen and tabs in `js/projects.js` are the safest starting point.

### 4. Use Documentation Before Implementation

Fase 1 is documentation only. No large code changes should happen until:

- The current repo map is clear.
- The new modules are defined.
- The database extension plan is reviewed.
- The implementation phases are approved.

### 5. Make Each Phase Independently Testable

Each implementation phase must end with:

- Files modified
- Tables added
- Risks
- What remains
- Manual test steps

## Recommended Architecture Direction

### Existing Foundation

| Existing Area | FlipEngine Role |
|---|---|
| `projects` | Property / Investment base record |
| `work_orders` | Renovation scopes and field execution |
| `project_expenses` | Operating spend tied to a property |
| `project_refunds` | Refund tracking |
| `project_disbursements` | Outgoing disbursements |
| `documents` | Document/report records, to be extended with richer links |
| Investor Hub tables | Investor and capital tracking, to be connected carefully |
| `js/projects.js` | Property Hub UI/controller foundation |
| `js/supabase.js` | Data layer for safe CRUD extensions |

### New Extension Layer

New modules should be added as extension layers:

- Acquisition
- Budget Categories
- Closing Costs
- Loans
- Draw Requests
- Receipts
- Document Links
- Contractors
- Employees
- Labor / Time
- Payments
- Sale / Exit

These modules should connect to the existing app through `project_id`.

## Demo Property For Validation

Use this property as the first real-world test record during planning and QA:

| Field | Value |
|---|---|
| Property | 4134 NE 131st Place, Portland, OR 97230 |
| Buyer | Blue Sky Properties LLC |
| Purchase price | 440000 |
| Loan | Rain City Capital |
| Loan amount | 446040 |
| Construction holdback | 45600 |
| Buyer funds to close | 64533.30 |
| Earnest money | 5000 |
| Owner title insurance | 1230 |
| Escrow fee | 2240 |
| Homeowner insurance | 3999 |
| Assignment fee | 10000 |
| Example receipt | Home Depot / PO Job 4134 RC / Total 10.85 |

## First Safe Milestone

The first safe milestone is not UI code. It is:

1. Create the FlipEngine documentation set.
2. Confirm how existing repo files map to the future product.
3. Confirm non-destructive database additions.
4. Define implementation phases.
5. Only then request owner approval for Fase 2 SQL migration planning.
