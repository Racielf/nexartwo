# FlipEngine Existing Repo Map

Source context: `FLIPENGINE_CONTEXT.md`

This file maps the current NexArWO repo to the future FlipEngine module architecture.

## Current App Shape

NexArWO is a static, vanilla JavaScript app deployed through Vercel.

## Context Guardrails

- NexArWO remains the existing app and general product identity.
- FlipEngine is a new investment module/layer inside NexArWO, not a replacement application.
- NexArtEngine is out of scope for this repository and must not be used for branding, table names, or module names here.
- Existing Projects, Work Orders, construction workflows, financials, and documents must remain valid.
- Only selected projects should behave as properties/investments in the FlipEngine context.
- Existing migrations are protected and must not be edited without explicit approval.

Primary files:

| File / Folder | Current Purpose | FlipEngine Relevance |
|---|---|---|
| `index.html` | Main SPA markup: dashboard, Work Orders, clients, docs, field mode, settings | Keep as app shell and dashboard surface |
| `projects.html` | Separate projects entry/reference page | Use as reference/base for Property Hub planning |
| `js/app.js` | Main app logic: dashboard, Work Orders, clients, documents, email, PDF, field mode | Critical for dashboard, documents, Work Orders, future data/admin dashboard |
| `js/projects.js` | Projects, project financials, work order links, Investor Hub | Primary Property Hub implementation target |
| `js/supabase.js` | Supabase client and data access layer | Add new DB namespaces here in controlled phases |
| `css/styles.css` | Global styling | Extend carefully for Property Hub tabs and dashboards |
| `supabase/migrations/` | Production migration history | Protected. Add only owner-approved non-destructive migrations |
| `sql/` | SQL references and older scripts | Reference only unless reviewed |
| `docs/` | Documentation | Home for FlipEngine planning |
| `memory/` | Agent state and task memory | Keep updated when task state changes |
| `dist/` | Build output | Do not edit directly |

## Existing Data Modules In `js/supabase.js`

The `DB` object currently includes major namespaces that FlipEngine can extend:

| Namespace | Current Role | FlipEngine Use |
|---|---|---|
| `DB.clients` | Client records | Keep for customer/recipient workflows |
| `DB.services` | Price Book / service items | Connect to Work Orders and budget categories later |
| `DB.workOrders` | Work Order CRUD | Use for renovation execution |
| `DB.lineItems` | Work Order line items | Link to budget categories later |
| `DB.documents` | Documents table | Extend with document linking model |
| `DB.projects` | Project CRUD | Optional Property / Investment base for selected FlipEngine projects |
| `DB.projectExpenses` | Project operating expenses | Budget actual spend source |
| `DB.projectRefunds` | Refunds | Keep isolated and linked to property |
| `DB.projectDisbursements` | Disbursements | Future payments connection must be planned carefully |
| `DB.projectFinancialSummaries` | Financial summary reads | Do not casually alter formulas |
| `DB.investors` | Investor records | Connect to FlipEngine investors module |
| `DB.investorCompanies` | Investor company records | Continue for company investors |
| `DB.projectInvestors` | Project-investor relationship | Use for property investor relationships |
| `DB.capitalContributions` | Investor capital contributions | Funding view only |
| `DB.capitalCalls` | Capital requests | Funding view only |

## Existing Project UI In `js/projects.js`

Important functions:

| Function | Current Role | FlipEngine Impact |
|---|---|---|
| `initProjectsModule()` | Initializes project route/page | Entry point for Property Hub |
| `projectsModuleShellHtml()` | Renders project workspace shell | Future tab shell can evolve here |
| `renderProjectList()` | Renders project cards/list | Can become property/investment list |
| `openProjectDetail()` | Opens a single project workspace | Future Property Hub entry |
| `switchProjTab()` | Switches project detail tabs | Add tabs gradually here |
| `renderWorkOrdersTab()` | Project-linked Work Orders | Keep and expand for renovation workflow |
| `ih*` functions | Investor Hub/capital functions | Treat as active Investor Hub implementation |

## Existing Work Orders

Work Orders are handled mainly in:

- `index.html`
- `js/app.js`
- `js/supabase.js`
- `js/projects.js` for project-linked Work Order tab

The database already has a `project_id` relationship for Work Orders through migration history.

FlipEngine should preserve Work Orders and connect budget categories, contractors, receipts, labor, and payments around them.

## Existing Financial System

Existing financial tables in migration history:

- `projects`
- `project_expenses`
- `project_refunds`
- `project_disbursements`
- `project_financial_summaries` or related summary logic

Important rule:

Capital funding data from investors must remain separate from operating financial formulas unless explicitly approved.

## Existing Investor Hub Warning

The active Investor Hub implementation is in `js/projects.js`.

There are also files under `js/modules/`:

- `js/modules/investor-hub-logic.js`
- `js/modules/investor-hub-modals.js`
- `js/modules/investor-manager.js`

Those module files are not currently loaded by `index.html`. Treat them as draft/reference unless a future approved task activates or removes them.

## Existing Supabase Migration Areas

Protected migration files include:

- `20260506_projects_financial_system.sql`
- `202605070001_investor_entities.sql`
- `202605070002_project_expenses_created_by.sql`
- `202605070003_work_orders_project_id.sql`
- `202605070004_investor_realtime_publication.sql`
- `202605070005_project_investor_private_lender_role.sql`
- `202605170001_repair_capital_calls.sql`
- `20260606_phase2a2_schema_alignment.sql`

No SQL should be executed from documentation work. Future migrations must be non-destructive and reviewed.

## Risk Map

| Area | Risk | Reason |
|---|---|---|
| `docs/**` | Low | Documentation only |
| `css/styles.css` | Medium | Can affect entire app visually |
| `index.html` | Medium | Shared app shell |
| `projects.html` | Medium | Project entry/reference page |
| `js/app.js` | High | Main app behavior |
| `js/projects.js` | High | Projects, financials, Investor Hub |
| `js/supabase.js` | Critical | Data access layer |
| `supabase/**` | Critical | Database schema, RLS, migrations |
| Financial formulas | Critical | Profit, ROI, P&L integrity |

## FlipEngine Mapping Decision

The safest path is:

1. Keep `projects` as the canonical project record and use it as the property/investment base only for selected FlipEngine projects.
2. Extend through new linked tables.
3. Add UI tabs inside the existing project workspace.
4. Keep Work Orders and financial summaries working throughout the migration.
5. Avoid touching existing formulas until data model and QA are approved.
