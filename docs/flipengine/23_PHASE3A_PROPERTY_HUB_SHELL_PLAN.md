# Phase 3A: Property Hub Shell Plan

Status: Planning only.

No code was written. No UI was changed. No SQL was run. No migrations were applied. No new FlipEngine table writes were added. Investor Hub was not activated or changed.

## Purpose

Plan the safest first UI/code step for adding a Property Hub shell inside NexArWO using the existing Projects/project detail foundation.

The goal of Phase 3 is not to implement CRUD for FlipEngine tables yet. The first safe step is a read-safe shell that can be shown only for selected FlipEngine/property projects while preserving the existing NexArWO project, work order, financial, document, and Supabase behavior.

## Guardrails

- NexArWO remains the main app.
- FlipEngine is a module/layer inside NexArWO.
- Existing projects must not be forced to become investments.
- Existing Projects, Work Orders, Financials, Documents, and Supabase behavior must keep working.
- No writes to `project_acquisitions`, `project_budget_categories`, `project_receipts`, or `project_document_links` until the migration is applied in a real approved environment.
- Investor Hub must not be activated, expanded, redesigned, or depended on in Phase 3A.
- Existing financial formulas, ROI, P&L, `project_financial_summaries`, expenses, refunds, and disbursements must not be changed.

## Existing Files Likely Involved

Primary future implementation target:

- `js/projects.js`

Likely supporting files after first code approval:

- `css/styles.css`
- `index.html`, reference only unless route/page shell behavior needs inspection
- `projects.html`, reference only; it redirects to `index.html?page=projects`
- `js/supabase.js`, avoid in the first shell step unless owner approves read-safe DB helpers later

Files not to touch in the first shell step:

- `supabase/migrations/`
- existing SQL files
- Investor Hub modules
- financial formula logic
- `js/app.js` unless a later task proves a shared app-shell change is required

## Current `projects.html` Behavior

`projects.html` is not the real project workspace anymore.

It immediately redirects to:

- `index.html?page=projects`

If `tab=investorhub` or `page=investorhub` is present, it redirects to:

- `index.html?page=investorhub`

Implication:

- Do not build Property Hub in `projects.html`.
- Treat `projects.html` as a redirect/reference file only.
- Phase 3 should attach to the Projects module rendered inside the main app shell.

## Current `index.html` Behavior

`index.html` contains empty page containers for the project routes:

- `#page-projects`
- `#page-investorhub`

It loads:

- `js/projects.js`

Implication:

- Property Hub should use the existing `#page-projects` flow.
- No new standalone page is needed for the first shell.
- No new route should be required for Phase 3A.

## Current `js/projects.js` Behavior

`js/projects.js` currently owns:

- project list rendering
- project detail workspace
- project financial summary display
- project expenses/refunds/disbursements
- project-linked Work Orders
- Investor Hub route/tab behavior

Important functions:

| Function | Current role | Phase 3 relevance |
| --- | --- | --- |
| `initProjectsModule(options)` | Initializes Projects or Investor Hub route | Keep unchanged in first shell step |
| `projectsModuleShellHtml()` | Builds Projects list/detail shell and tab containers | Safest place to add a new top-level Property Hub tab/container |
| `renderProjectList()` | Renders project cards and summaries | Do not change in first shell step except maybe future badge/gate |
| `openProjectDetail(projId, options)` | Opens selected project detail and resets to Overview | Keep current reset behavior; ensure Property Hub content does not persist across projects |
| `switchProjTab(tab)` | Activates project detail tabs and calls tab renderers | Add only a guarded `propertyhub` branch after approval |
| `renderProjectDetail(options)` | Renders Overview and Financials; refreshes current tab content | Can call a shell renderer only when the active tab is Property Hub |
| `renderWorkOrdersTab()` | Loads linked Work Orders by strict `project_id` | Reuse conceptually; do not change Work Order behavior |
| Investor Hub `ih*` functions | Active Owner/Admin investor/capital console | Do not call or expand for Property Hub shell |

Current top-level project detail tabs:

- Overview
- Financials
- Expenses
- Disbursements
- Work Orders
- Investor Hub

Current data behavior:

- Projects load from `DB.projects` when Supabase is ready, with localStorage fallback.
- Financial summaries load from `DB.projectFinancialSummaries`.
- Expenses/refunds/disbursements load from existing financial tables.
- Work Orders load from `DB.workOrders` and match strictly on `work_orders.project_id === _currentProject.id`.
- Investor Hub has its own active route/tab and writes only when its own live schema checks pass.

## Where The Property Hub Shell Should Be Added

Safest first approach:

Add one new top-level project detail tab:

- `Property Hub`

Add one new matching content container:

- `#proj-tab-propertyhub`

Then render the recommended Property Hub sections as internal shell tabs/cards inside that single top-level Property Hub area.

Reason:

- It avoids replacing the existing Projects tab model.
- It leaves Overview, Financials, Expenses, Disbursements, Work Orders, and Investor Hub behavior intact.
- It lets Phase 3 introduce the FlipEngine concept without forcing all project detail navigation to change.
- It allows the shell to be hidden or disabled for non-FlipEngine projects.

Recommended first code shape after approval:

- Add a `propertyhub` tab to `projectsModuleShellHtml()`.
- Add `propertyhub: 'Property Hub'` to `updateProjectWorkspaceChrome()`.
- Add a guarded branch in `switchProjTab('propertyhub')`.
- Add a new renderer such as `renderPropertyHubShell()`.
- Keep the renderer read-only and based only on `_currentProject`, `_currentProject._financials`, and existing safe data already loaded.

## Recommended Property Hub Shell Tabs

Inside the Property Hub shell, plan for these internal tabs:

- Overview
- Acquisition
- Budget
- Work Orders
- Expenses
- Receipts
- Documents
- Loans / Draws
- Investors
- Contractors
- Labor / Time
- Payments
- Sale / Exit
- Reports

For the first code step, these should be shell-only.

Recommended first behavior:

- Render all labels as internal navigation or segmented controls.
- Make only Overview active initially.
- Keep unavailable modules visually disabled or read-only.
- Do not add forms.
- Do not add save buttons.
- Do not call new FlipEngine DB tables.
- Do not call Investor Hub data loaders from the Investors placeholder.

## Shell-Only First Tabs

These tabs should be placeholders only in the first Phase 3 code task:

- Acquisition
- Budget
- Receipts
- Documents
- Loans / Draws
- Investors
- Contractors
- Labor / Time
- Payments
- Sale / Exit
- Reports

Placeholder behavior:

- Show stable empty/readiness states.
- Explain internally through UI state, not as a marketing page.
- Avoid save/create/edit actions.
- Avoid network writes.
- Avoid assumptions that the migration exists.

Special Investor note:

- The Property Hub `Investors` shell tab must not call the existing `renderInvestorHub()` flow.
- It must not route to `page=investorhub`.
- It must not create or mutate `investors`, `project_investors`, `capital_contributions`, or `capital_calls`.
- It should remain locked/read-only until the owner separately approves Investor Hub behavior for FlipEngine.

## Existing Data Safe To Display

Phase 3 shell can safely display read-only data already available from the current Projects foundation:

From `_currentProject`:

- project ID
- project name
- address
- project type
- status
- responsible person
- purchase date
- existing purchase price
- existing down payment
- existing loan amount
- existing closing costs
- existing sale price when present
- notes

From `_currentProject._financials` when available:

- cost basis
- cash invested
- net expenses
- total disbursements
- net proceeds
- profit
- project cash position

From existing Work Orders:

- read-only count of linked Work Orders
- read-only link/status summary if already loaded through the existing Work Orders tab pattern

From existing expenses/refunds/disbursements:

- read-only status/count summaries only if already loaded through `fetchProjectFinancials()`
- do not reinterpret totals as FlipEngine budget actuals

From existing Documents:

- do not add document linking yet
- future read-only document summary needs a separate review of existing document relationships

## Tabs That Must Stay Disabled Or Read-Only Until DB Migration Is Applied

These depend on new Phase 2 tables and must not write or rely on successful reads until the migration is applied in a real approved environment:

| Tab | Depends on | Phase 3A behavior |
| --- | --- | --- |
| Acquisition | `project_acquisitions` | Shell/read-only placeholder |
| Budget | `project_budget_categories` | Shell/read-only placeholder |
| Receipts | `project_receipts` | Shell/read-only placeholder |
| Documents | `project_document_links` plus existing `documents` | Shell/read-only placeholder |

These depend on future tables not included in the MVP migration:

| Tab | Future dependency | Phase 3A behavior |
| --- | --- | --- |
| Loans / Draws | `project_loans`, `project_loan_draws` | Disabled placeholder |
| Contractors | `project_contractors` | Disabled placeholder |
| Labor / Time | `project_employees`, `project_time_entries` | Disabled placeholder |
| Payments | `project_payments` | Disabled placeholder |
| Sale / Exit | `project_sale_exit` | Disabled placeholder |
| Reports | approved metrics/data sources | Disabled or read-only summary |

Future Sale / Exit financial requirement:

- The shell must not implement Sale / Exit writes until the required schema and formulas are approved.
- When the Sale / Exit module is implemented later, realtor commissions should be entered as editable percentages per deal.
- Planned fields include `listing_agent_commission_percent`, `buyer_agent_commission_percent`, `total_realtor_commission_percent`, `sale_price`, and `calculated_realtor_commission_amount`.
- The calculated amount should display automatically using:

```text
calculated_realtor_commission_amount = sale_price * total_realtor_commission_percent / 100
```

- Actual closing statement amounts can be reconciled later, but the main planning input should be percentage-based rather than only a fixed manual dollar amount.

Investors remains separately gated:

- Do not use existing Investor Hub in Phase 3 shell without explicit approval.
- Keep investor capital/funding separate from expenses, ROI, P&L, and project financial summaries.

## Feature Gate Strategy

Recommended gates:

1. Shell availability gate:
   - Show the Property Hub tab only when a project is intentionally eligible.
   - Initial eligibility can use existing `project_type === 'fix_and_flip'`.
   - Normal `residential_project`, `commercial_project`, `new_construction`, and `maintenance` projects should keep the current project detail experience.

2. Database readiness gate:
   - Add no writes in Phase 3A.
   - Do not assume the new tables exist.
   - If later read attempts are approved, use a defensive table-readiness check and fail closed to empty/read-only state.

3. Module readiness gate:
   - MVP-backed modules can show locked/read-only states until the migration is applied.
   - Future modules remain disabled until their own schema exists.

4. Investor gate:
   - Property Hub `Investors` must not call current Investor Hub functions.
   - Investor Hub activation stays separate.

Suggested first gate helper after approval:

- `isFlipEngineProject(project)`

Suggested first implementation rule:

- Return true only for `project.project_type === 'fix_and_flip'` unless the owner later approves a more explicit flag.

Longer-term safer gate:

- Add a dedicated non-destructive field or table flag only after owner approval, instead of overloading `project_type`.

## Risks

1. Existing `js/projects.js` mixes Projects, financials, Work Orders, and Investor Hub in one large file.
2. Adding many top-level tabs could disrupt existing navigation and mobile layout.
3. Investor Hub is already present in the file; a careless Investors tab could accidentally activate or call it.
4. Existing project financial fields overlap with future acquisition/sale data, so shell copy must avoid implying a new source of truth.
5. Existing `Expenses` tab has create/approve/void behavior; Property Hub summaries must not create a second expense workflow.
6. New FlipEngine tables are not applied in production, so direct reads/writes could cause runtime errors.
7. Feature gating by `project_type` is practical for Phase 3 shell but may not be precise enough long term.
8. Styling changes in `css/styles.css` can affect the whole app if selectors are too broad.

## Manual Test Plan

Before code changes:

1. Open `index.html?page=projects`.
2. Confirm the Projects list renders.
3. Open a normal non-fix-and-flip project.
4. Confirm existing Overview, Financials, Expenses, Disbursements, Work Orders, and Investor Hub tabs still behave as they do now.
5. Open a fix-and-flip project if one exists.
6. Confirm current detail view behavior before adding the Property Hub shell.

After the first approved code task:

1. Open Projects list.
2. Open a normal project.
3. Confirm no Property Hub tab appears, or it appears disabled according to the approved gate.
4. Open a `fix_and_flip` project.
5. Confirm Property Hub shell appears.
6. Open Property Hub.
7. Confirm the shell renders Overview and internal module tabs.
8. Click every internal shell tab.
9. Confirm disabled/read-only tabs do not write data or call missing tables.
10. Confirm Work Orders tab still loads linked Work Orders through existing behavior.
11. Confirm Expenses and Disbursements tabs still load and behave as before.
12. Confirm Investor Hub route/tab is unchanged and not invoked by the Property Hub Investors placeholder.
13. Confirm there are no console errors.
14. Confirm no network requests are made to new FlipEngine tables in Phase 3A.

## Acceptance Criteria

For this planning phase:

- The Property Hub shell insertion point is documented.
- Existing files and current behavior are mapped.
- The first code step is limited and reversible.
- Disabled/read-only tabs are identified.
- Feature gate strategy is documented.
- Manual test plan is documented.
- No code, UI, SQL, migration, or production changes are made.

For the next approved code phase:

- Existing Projects list still works.
- Existing normal project detail still works.
- Existing Work Orders tab still works.
- Existing Financials, Expenses, and Disbursements behavior remains unchanged.
- Property Hub shell appears only for approved/eligible FlipEngine context.
- No writes occur to new FlipEngine tables.
- Investor Hub is not activated or changed.
- No existing financial formulas change.

## Next Coding Step After Approval

Recommended first code file to modify:

- `js/projects.js`

Recommended first code task:

1. Add a gated `Property Hub` top-level tab in `projectsModuleShellHtml()`.
2. Add a matching `#proj-tab-propertyhub` container.
3. Add `propertyhub` handling to `updateProjectWorkspaceChrome()` and `switchProjTab()`.
4. Add `isFlipEngineProject(project)` as a small pure helper.
5. Add `renderPropertyHubShell()` that uses only `_currentProject` and existing read-safe data.
6. Render internal shell tabs with placeholders only.
7. Do not add `js/supabase.js` methods yet.
8. Do not add forms or save actions.

Secondary file only if needed:

- `css/styles.css`

Use it only for narrowly scoped `.property-hub-*` selectors if the shell cannot be made cleanly with existing project styles.
