# INVESTOR_HUB — Module Spec

## Status

LOCKED — do not activate without owner approval.

---

## Active implementation — verified 2026-05-29

**CANONICAL: `js/projects.js`** (functions prefixed `ih*`, lines ~1559–2170)

**Dead code (not loaded): `js/modules/`**
- `investor-hub-logic.js` — NOT in any script tag
- `investor-hub-modals.js` — NOT in any script tag
- `investor-manager.js` — NOT in any script tag

### Evidence

1. `index.html` script load order (lines 1408–1412):
   ```html
   <script src="js/env.js"></script>
   <script src="js/supabase.js"></script>
   <script src="js/projects.js?v=..."></script>
   <script src="js/app.js?v=..."></script>
   ```
   `js/modules/` files are absent.

2. `supabase.js:986` comment says explicitly:
   > "InvestorManager será importado via script tag en HTML"
   — that script tag was never added. `getInvestorManager()` always returns `null`.

3. `projects.js:906-907` — when user switches to Investor Hub tab:
   ```js
   if (tab === 'investorhub' && _currentProject) {
     renderInvestorHub(_currentProject.id);  // projects.js:1829
   ```

4. `app.js:359` — routing to `investorhub` page calls `initProjectsRoute(page)`,
   which loads the `projects.js` module.

### Call chain (active)

```
User clicks Investor Hub
  → app.js: navigateTo('investorhub')
  → app.js: initProjectsRoute('investorhub')
  → projects.js: initProjectsModule({ route: 'investorhub' })
  → projects.js: openInvestorHubEntry()
  → projects.js: renderInvestorHub(projectId)   ← LINE 1829
```

### What js/modules/ was intended for

The `js/modules/` files appear to be a Phase 2B refactor attempt that was never activated.
`investor-manager.js` contains an `InvestorManager` class for Supabase CRUD.
It was designed to be loaded via `<script>` tag, but that was never done.
These files can be treated as drafts/reference only until a future decision.

---

## Owner decision required

Before any Investor Hub work:
1. Confirm `js/projects.js` is the canonical implementation (already verified active).
2. Decide what to do with `js/modules/` — delete, keep as draft, or activate.
3. Do not add `investor-manager.js` script tag without a proper task and approved plan.

---

## Business Model — Investor in NexArtWO

*Authored: 2026-06-06. Status: Approved business model — no code yet.*

---

### 1. Investor — global entity

An investor is a real-world person or company that provides capital to one or more projects.
An investor record exists globally — independent of any project.
The same investor can be linked to many projects with different roles each time.

**Person investor:**

| Field | Required | Notes |
|---|---|---|
| `name` | ✅ | Full legal name |
| `email` | ✅ | Primary contact email |
| `phone` | optional | Contact phone |
| `notes` | optional | Internal notes |
| `status` | auto | `'active'` or `'inactive'` — never deleted |
| `type` | auto | Always `'person'` — immutable after create |
| `company_id` | auto | Always `null` for person type |
| `address`, `city`, `state_addr`, `zip` | optional | `investors` — applied Phase 2A.2 |

**Company investor:**

| Field | Required | Table | Notes |
|---|---|---|---|
| `company_name` | ✅ | `investor_companies` | Legal company name |
| `contact_person` | ✅ | `investor_companies` | Primary contact name |
| `email` | ✅ | `investor_companies` | Company contact email |
| `phone` | optional | `investor_companies` | Company phone |
| `license_number` | optional | `investor_companies` | Contractor/company license if applicable |
| `state` | optional | `investor_companies` | State of registration |
| `notes` | optional | `investor_companies` | Internal notes |
| `address`, `address2`, `city`, `zip` | optional | `investor_companies` | Applied Phase 2A.2 |
| `website` | optional | `investor_companies` | Applied Phase 2A.2 |
| `contact_role` | optional | `investor_companies` | Applied Phase 2A.2 |
| `ein_tax_id` | optional | `investor_companies` | Applied Phase 2A.2 — company EIN, distinct from `investors.tax_id` (personal SSN) |
| `type` | auto | `investors` | Always `'company'` — immutable after create |
| `company_id` | auto | `investors` | FK → `investor_companies.id` — set at create |
| `status` | auto | `investors` | Lives on the linked `investors` row |

**Status model:**

- `active` — investor available for linking to projects (default at create)
- `inactive` — investor retired; no new attachments; existing project links unchanged
- No hard delete. Use `DB.investors.updateStatus('inactive')` instead.

---

### 2. Project investor relationship

When an investor is linked to a project the link is stored in `project_investors`.

**Role belongs to the relationship, not the investor.**
The same person can be an equity partner in Project A and a private lender in Project B.
The investor's global record stores their identity — the project link stores their role.

**`project_investors` join record fields:**

| Field | Description |
|---|---|
| `project_id` | FK → projects |
| `investor_id` | FK → investors |
| `role` | Role in THIS project (`equity_partner`, `private_lender`, `co_owner`, etc.) |
| `ownership_percentage` | % ownership in THIS project — defaults to 0 |
| `profit_split_percentage` | Profit distribution % in THIS project — defaults to 0 |
| `status` | `pending` → `confirmed` → `cancelled` (no delete) |
| `agreement_notes` | Optional notes about terms for this project link |

**Void instead of delete:**
Never hard-delete a `project_investors` row with capital history.
Use `DB.projectInvestors.cancel(id)` — sets `status = 'cancelled'`.

**Status lifecycle:**

```
attach()     → status: 'pending'
confirm(id)  → status: 'confirmed'
cancel(id)   → status: 'cancelled'  ← terminal, no recovery
```

---

### 3. Capital behavior

**Capital contributions** — money the investor puts into the project:

| Field | Description |
|---|---|
| `project_id` | Scoped to a project |
| `investor_id` | Which investor provided it |
| `amount` | Must be > 0 |
| `date` | Date of contribution |
| `method` | `wire`, `check`, etc. |
| `type` | `initial`, `follow_on`, etc. |
| `status` | `pending` → `confirmed` → `cancelled` |
| `evidence_reference` | Bank ref, doc link, etc. |

**Capital calls** — project-level funding requests to investors.
Tracked separately from contributions.
Outstanding calls = capital calls where `status != 'confirmed'`.

**Confirmed capital** — sum of `capital_contributions` where `status = 'confirmed'`.
**Pending capital** — sum where `status = 'pending'` (awaiting bank confirmation).

**Capital does NOT affect the following financial formulas:**

| Formula | Uses capital data? |
|---|---|
| Repair cost / cost basis | ❌ Never |
| Project expenses (labor, materials) | ❌ Never |
| ROI / net profit | ❌ Never |
| P&L summary | ❌ Never |
| Work Order totals / revenue pipeline | ❌ Never |
| Sale revenue / resale value | ❌ Never |

Capital is a **funding view** — it shows how the project is financed.
It is NOT an operating expense and must not feed into cost or profit calculations.
All capital reads are isolated in `ih*` functions in `js/projects.js`.
No capital table is referenced in expense, ROI, or WO formula functions.

---

### 4. UI surfaces

#### A — Global Investor Directory (sidebar "Investor Hub")

- Entry point: sidebar nav-item `data-page="investorhub"`
- Scope: ALL investors across all projects — no project required
- Actions: Create investor, Edit investor, View linked projects, Change status
- "Edit" in this view = **Edit Investor** — never edits a project
- No project header, no project tabs, no project financials visible
- Renders inside `#page-investorhub` without `_currentProject`

**Current state:** Not yet implemented. Sidebar click still opens project-scoped view via `openInvestorHubEntry()`. Routing change requires Phase 3 GO.

**Rule:** Global Directory must NOT replace the Project Capital Workspace until explicitly approved with a separate GO. Both surfaces must coexist independently.

#### B — Project Capital Workspace (project tab "Investor Hub")

- Entry point: project detail → "Investor Hub" tab → `switchProjTab('investorhub')`
- Scope: Capital stack for ONE selected project only
- Actions: Attach investor from directory, record contributions/calls, confirm/void links
- "Edit" in this view = **Edit Project** — label fix is Phase 1, pending commit
- Project header and project tabs remain visible
- Renders via `renderInvestorHub(_currentProject.id)`

**Current state:** Implemented and active. Phase 1 label fix uncommitted.

#### C — Investor profile / detail view (future)

- View a single investor's global record: name, contact info, linked projects, capital summary
- Entry point: click investor in Global Directory
- Not implemented. Requires Phase 2 (Edit) + Phase 3 (Directory) to exist first.

---

### 5. Permissions and actions

| Action | Who |
|---|---|
| Create investor (person or company) | Owner / Admin |
| Edit investor contact info | Owner / Admin |
| Deactivate investor (`status = 'inactive'`) | Owner / Admin |
| Attach investor to project | Owner / Admin |
| Set role in project | Owner / Admin |
| Record capital contribution | Owner / Admin |
| Issue capital call | Owner / Admin |
| Confirm contribution / link | Owner / Admin |
| Void / cancel project investor link | Owner / Admin |
| Hard delete any investor or capital record | **Prohibited** — use cancel/void |

No hard delete for records with financial or project history.
Applies to: `investors`, `investor_companies`, `project_investors`, `capital_contributions`, `capital_calls`.

---

### 6. Future Work Order connection

Work Orders can be directed to a **Client** or an **Investor** as recipient.

**Dependency chain (must complete in order):**

1. Global Investor Directory must exist (Phase 3) — WO modal needs the investor list source.
2. `recipient_type / recipient_id / recipient_name` fields added to WO data model (ISSUE-012).
3. Legacy `wo.client / wo.clientId` kept until formal migration approved.

**Future WO recipient model:**

| Field | Values |
|---|---|
| `recipient_type` | `'client'` or `'investor'` |
| `recipient_id` | ID of selected client or investor |
| `recipient_name` | Display name (denormalized for rendering/PDFs) |

Do NOT implement until ISSUE-012 is formally approved and Investor Hub Phases 1–3 are stable.

---

### 7. How current pending code changes relate to this model

**`js/projects.js` — Phase 1 Non-Destructive UI Alignment (3 label changes, uncommitted):**

Compatible with this model. No behavior changed.
- `"Edit" → "Edit Project"` — correctly distinguishes Project Capital Workspace action from Investor Directory action (model rule: Edit in project context = Edit Project).
- `openAddInvestorModal()` label/placeholder changes — align form copy with model. Person vs Company distinction is Phase 2.
- Modal note with project name — confirms to user they are operating in project scope, not global scope.

**`js/supabase.js` — Phase 2A.1 DB methods (3 new methods, uncommitted):**

Infrastructure only. No UI calls these methods yet.
- `DB.investors.update()` — will support Edit Investor modal (Phase 2).
- `DB.investorCompanies.update()` — will support Edit Company modal (Phase 2).
- `DB.projectInvestors.getByInvestor()` — will support Global Directory linked-projects view (Phase 3).

No model behavior changed. No routing changed. No schema changed.

**Schema migration Phase 2A.2 — APPLIED to staging and production (2026-06-06):**

`investors` canonical columns applied: `address`, `city`, `state_addr`, `zip`, `capital_source`, `tax_id` (personal SSN/ITIN), plus KYC fields `first_name`, `last_name`, `entity_type`, `investment_profile`, `accredited_investor`, `signed_agreement`, `first_contact_date`, `owner_notes`.
`investor_companies` canonical columns applied: `address`, `address2`, `city`, `zip`, `website`, `contact_role`, `ein_tax_id` (company EIN — distinct from `investors.tax_id`).
`project_investors` canonical column applied: `capital_commitment` NUMERIC(12,2) NOT NULL DEFAULT 0.
`DB.investors.update()` and `DB.investorCompanies.update()` allowlists expand in Phase 2B GO to include all new canonical fields.
Do NOT create: `address_line1`, `state` on investors, `source_of_capital`, or `ein_tax_id` on investors — use canonical names above.

---

## ISSUE-013 Phase B — Implementation Design Plan

*Authored: 2026-06-05. Status: DESIGN ONLY — no code yet.*

---

### 1. Current state map

#### How Investor Hub works today

When the user clicks the sidebar "Investor Hub" nav item:

```
index.html nav-item[data-page="investorhub"]
  → app.js: navigateTo('investorhub')
  → app.js: initProjectsRoute('investorhub')   [L365]
  → projects.js: initProjectsModule({ route: 'investorhub' })   [L268]
  → projects.js: openInvestorHubEntry({ skipFinancials: true, silentIfEmpty: true })   [L368]
  → IF PROJECTS.length > 0:
      openProjectDetail(targetProject.id)       ← auto-selects first active project
      switchProjTab('investorhub')              ← activates project IH tab
      renderInvestorHub(_currentProject.id)     ← renders project-scoped IH   [L1810]
  → IF PROJECTS.length === 0:
      showProjectList()                         ← shows empty projects list (confusing)
```

When the user clicks the "Investor Hub" tab inside a project:

```
projects.js: switchProjTab('investorhub')   [L896 area]
  → renderInvestorHub(_currentProject.id)   [L1810]
```

**Both paths call the same `renderInvestorHub(projectId)` — always project-scoped.**

#### Active functions involved

| Function | File | Line | Role |
|---|---|---|---|
| `openInvestorHubRoute()` | projects.js | 291 | Entry from sidebar nav routing |
| `openInvestorHubEntry()` | projects.js | 368 | Opens first active project + IH tab |
| `renderInvestorHub()` | projects.js | 1810 | Async: loads Supabase data, calls shell |
| `ihRenderInvestorHubShell()` | projects.js | 1835 | Renders full project-scoped IH HTML |
| `ihRenderInvestorCards()` | projects.js | 1737 | Capital stack cards |
| `ihRenderContributionRows()` | projects.js | 1766 | Contributions ledger |
| `ihRenderCallRows()` | projects.js | 1790 | Capital calls |
| `openAddInvestorModal()` | projects.js | 1998 | Create-or-attach investor (project-scoped) |
| `saveAddInvestor()` | projects.js | 2029 | Saves via `ihCreateInvestor()` + `ihAttachInvestor()` |
| `ihProjectData()` | projects.js | 1633 | Loads project_investors + contributions + calls |
| `ihAllInvestors()` | projects.js | 1650 | Loads all investors from Supabase |
| `ihCanUseLive()` | projects.js | 1565 | Checks Supabase + `_ihMode === 'supabase'` |
| `ihEnsureRealtime()` | projects.js | 1599 | Subscribes to 4 Supabase realtime channels |

#### Current "Edit" problem

`ihRenderInvestorHubShell()` renders inside `proj-tab-investorhub`.
The project workspace header (`proj-title-actions`) renders outside the tab and contains:

```html
<button onclick="editCurrentProject()">Edit</button>
<button onclick="cancelCurrentProject()">Cancel Project</button>
```

Both are visible when the user is in Investor Hub tab — "Edit" edits the project, not an investor. No label distinguishes this.

#### Existing Supabase tables (confirmed in supabase.js)

| Table | Purpose | Delete allowed |
|---|---|---|
| `investors` | Global investor directory | No — use `updateStatus('inactive')` |
| `investor_companies` | Company records linked from investors | No |
| `project_investors` | Join: investor ↔ project (with role, ownership %, status) | No — use `cancel()` |
| `capital_contributions` | Capital inputs per project | No — use `cancel()` |
| `capital_calls` | Capital requests per project | No — use `cancel()` |

---

### 2. Target architecture

#### A — Global Investor Directory

**Purpose:** Manage all investors as independent entities, regardless of project.

**Entry point:** sidebar `Investor Hub` nav-item → renders directory (NOT a project).

**Responsibilities:**
- List all investors (persons + companies) from `DB.investors.getAll()`
- Create Person investor
- Create Company investor (uses `DB.investorCompanies.create()` + links to `investors`)
- Edit investor name / contact info
- View investor status (active / inactive)
- Show linked projects per investor (requires new `DB.projectInvestors.getByInvestor(investorId)`)
- Show total capital summary per investor across projects (optional, Phase 1 can skip)
- "Edit" in this view = Edit Investor only

**What it does NOT do:**
- Does not open a project
- Does not show capital stack, contributions, or capital calls
- Does not show project tabs or project header
- Does not have "Edit Project" or "Cancel Project" actions

#### B — Project Capital Workspace

**Purpose:** Manage capital, investors, and contributions for one selected project.

**Entry point:** Project detail → "Investor Hub" tab.

**Responsibilities:**
- Show capital stack for the selected project
- Attach existing investor (from directory) to this project
- Define role in project (`project_investors.role`)
- Record capital contributions and capital calls
- Confirm / void investors, contributions, calls
- Realtime updates via Supabase channels
- Capital stays separate from expenses, disbursements, ROI, P&L

**What it does NOT do:**
- Does not create new investor records (attach only — creation belongs to Global Directory)
- Does not show investors outside this project

---

### 3. Routing / UI design

#### Sidebar "Investor Hub" click (target behavior)

```
nav-item[data-page="investorhub"] click
  → navigateTo('investorhub')
  → initProjectsRoute('investorhub')
  → initProjectsModule({ route: 'investorhub' })
  → [NEW] renderInvestorDirectory()    ← replaces openInvestorHubEntry() for sidebar context
```

`renderInvestorDirectory()` renders inside `page-investorhub` directly — no project required.
No `_currentProject` dependency.

#### Project "Investor Hub" tab click (unchanged)

```
switchProjTab('investorhub')
  → renderInvestorHub(_currentProject.id)   ← unchanged
```

#### Routing change required

**Current `openInvestorHubEntry()`** always opens a project. This must change:

Option A (preferred): Modify `initProjectsModule()` to detect `route === 'investorhub'` with no specific projectId → call `renderInvestorDirectory()` instead of `openInvestorHubEntry()`.

Option B: Add `route: 'investorhub-directory'` flag to avoid touching `openInvestorHubEntry()`.

**Recommended: Option A.** Minimal change, preserves project-level IH tab path.

#### Edit button disambiguation

In `projectsModuleShellHtml()` (projects.js L187), the proj-title-actions buttons must be relabeled:

```js
// Current (ambiguous when on Investor Hub tab):
'<button onclick="editCurrentProject()">Edit</button>'
'<button onclick="cancelCurrentProject()">Cancel Project</button>'

// Target (always explicit):
'<button onclick="editCurrentProject()">Edit Project</button>'
'<button onclick="cancelCurrentProject()">Cancel Project</button>'
```

This is a 1-word change with zero logic impact.

---

### 4. Data model design

#### investors table (global investor record)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Full name (person) or company display name |
| type | 'person' \| 'company' | Determines UI fields |
| company_id | uuid, nullable | FK → investor_companies (if type='company') |
| email | text | Contact email |
| phone | text | Contact phone |
| status | 'active' \| 'inactive' | Not a delete |
| notes | text | Free text |

**Gaps identified:** No `update()` method for name/email/phone in `DB.investors`. Only `updateStatus()` and `updateNotes()` exist. An `update()` method will be needed for Phase 2.

#### investor_companies table (company detail)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| company_name | text | Legal company name |
| contact_person | text | Primary contact name |
| email | text | |
| phone | text | |
| license_number | text | Optional |
| state | text | Optional |
| notes | text | Optional |

**Gaps vs ISSUE-013 requirements:** `address` and `website` columns do not appear in current `supabase.js` schema. These would require a migration. **Do not add yet.**

**Gaps:** No `update()` method for `DB.investorCompanies`. Only `updateNotes()` exists.

#### project_investors table (role in project — join)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| investor_id | uuid | FK → investors |
| role | text | equity_partner, private_lender, etc. |
| ownership_percentage | float | Optional, defaults to 0 |
| profit_split_percentage | float | Optional, defaults to 0 |
| status | 'pending' \| 'confirmed' \| 'cancelled' | No delete |
| agreement_notes | text | Optional |

**Gap:** No `DB.projectInvestors.getByInvestor(investorId)` method. Needed for Global Directory to show linked projects per investor.

#### Separation rule: investor data vs role in project

| Belongs to `investors` | Belongs to `project_investors` |
|---|---|
| name | role |
| type | ownership_percentage |
| email | profit_split_percentage |
| phone | agreement_notes |
| status | status (per project link) |
| notes | project_id |

**Never store role, ownership %, or profit split on the global investor record.**

#### Fields that must NOT mix with project financials

Capital fields (`capital_contributions`, `capital_calls`) are independent of:
- `project_expenses` (expenses table)
- `project_financial_summaries` (ROI, P&L, cost basis)
- Work Order `total` (revenue/pipeline)

No formula or summary should read from capital tables. Capital is owner-managed separately.

---

### 5. Implementation phases

#### Phase 1 — Global Investor Directory shell (read-only list)

**Goal:** When user clicks sidebar Investor Hub, show a list of all investors (no project required).
**Scope:** Read-only. No create/edit yet.

Files to modify:
- `js/projects.js`:
  - Add `renderInvestorDirectory()` function — renders inside `page-investorhub`
  - Modify `initProjectsModule()` (L268): when `route === 'investorhub'`, call `renderInvestorDirectory()` instead of `openInvestorHubEntry()`
  - `renderInvestorDirectory()` calls `ihAllInvestors()` (already exists), renders list

Files read-only: `index.html`, `js/supabase.js`, `js/app.js`
Files prohibited: `supabase/**`, `css/**` (unless minimal new class needed), financial formulas

**Regression risk:** Low. `openInvestorHubEntry()` is only bypassed for the sidebar path. Project tab path (`switchProjTab → renderInvestorHub`) is completely unchanged.

#### Phase 2 — Create / Edit investor (person + company)

**Goal:** From Global Directory, create a new investor (person or company), and edit existing.

Files to modify:
- `js/projects.js`:
  - Add `openCreateInvestorModal()` — separate from `openAddInvestorModal()`
  - Person form: name (required), email (required), phone (optional)
  - Company form: company_name, contact_person, email, phone + optional fields
  - Company create: `DB.investorCompanies.create()` → then `DB.investors.create({ type: 'company', company_id })`
  - Add `openEditInvestorModal(investorId)` function
- `js/supabase.js`:
  - Add `DB.investors.update(id, changes)` method (name, email, phone)
  - Add `DB.investorCompanies.update(id, changes)` method
  - Add `DB.projectInvestors.getByInvestor(investorId)` method

Files prohibited: `supabase/**` migrations (schema is not changing), Auth/RLS, financial formulas

**Regression risk:** Medium — touches supabase.js to add new methods. Must add only, never modify existing methods.

#### Phase 3 — Attach investor to project

**Goal:** From Global Directory or Project Capital Workspace, attach an existing investor to a project.

Files to modify:
- `js/projects.js`:
  - Refactor `openAddInvestorModal()`: remove create-new inline section, show only "Select from directory" + role selector
  - Add "Create New Investor" button that opens `openCreateInvestorModal()` (from Phase 2) before returning to attach flow
  - Keep `saveAddInvestor()` logic for the attachment itself (`ihAttachInvestor()`)

Files prohibited: supabase.js existing methods (do not change), financial formulas

**Regression risk:** Medium — `openAddInvestorModal()` is called from `ihRenderInvestorHubShell()`. Change must be backward-compatible with existing project IH flow.

#### Phase 4 — Project Capital Workspace cleanup

**Goal:** Fix Edit button label, remove confusion between global IH and project workspace.

Files to modify:
- `js/projects.js`:
  - `projectsModuleShellHtml()` (L187): change `'>Edit</button>'` → `'>Edit Project</button>'`
  - This is 1 word change, zero logic impact
- `index.html` (if toolbar buttons are in HTML rather than JS template):
  - Confirm edit/cancel buttons are rendered in `projectsModuleShellHtml()` not inline HTML
  - From reading the code: they ARE in `projectsModuleShellHtml()` — index.html is unchanged

Files prohibited: supabase.js, financial formulas

**Regression risk:** Very low — label-only change.

#### Phase 5 — Work Order recipient integration

**Goal:** WO modal supports Client or Investor as recipient (ISSUE-012).
**Dependency:** Phase 1 and 2 must be complete (global directory + investor records exist).

Files to modify:
- `index.html`: add Recipient Type selector to `#modal-new-wo`
- `js/app.js`: update `openNewWOModal()`, `openEditWOModal()`, `saveNewWO()`, `renderWorkOrders()`

Files prohibited: supabase.js schema changes, financial formulas, Investor Hub activation

**Regression risk:** High — touches app.js and the WO save path. Requires dedicated QA checklist.

---

### 6. File impact plan

| File | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| `js/projects.js` | MODIFY | MODIFY | MODIFY | MODIFY | read-only |
| `js/supabase.js` | read-only | MODIFY (add only) | read-only | read-only | read-only |
| `js/app.js` | read-only | read-only | read-only | read-only | MODIFY |
| `index.html` | read-only | read-only | read-only | read-only | MODIFY |
| `css/styles.css` | read-only | read-only | read-only | read-only | read-only |
| `supabase/**` | PROHIBITED | PROHIBITED | PROHIBITED | PROHIBITED | PROHIBITED |
| `js/modules/**` | REFERENCE ONLY | REFERENCE ONLY | REFERENCE ONLY | REFERENCE ONLY | REFERENCE ONLY |
| Financial formulas | PROHIBITED | PROHIBITED | PROHIBITED | PROHIBITED | PROHIBITED |

---

### 7. Risk analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `openInvestorHubEntry()` change breaks project tab IH | Medium | High | Phase 1 only bypasses for sidebar path; project tab path unchanged |
| `openAddInvestorModal()` refactor loses attach logic | Medium | High | Keep `saveAddInvestor()` / `ihAttachInvestor()` intact; only change modal form fields |
| `DB.investors.update()` added incorrectly to supabase.js | Low | High | Add only new methods; never edit existing ones; no schema change |
| `DB.projectInvestors.getByInvestor()` query error | Low | Medium | Guard with null check; if error, directory shows without linked projects |
| Capital tables accidentally mixed into P&L | Low | Critical | All capital reads stay in ih* functions; never read from financial formula functions |
| `investor_companies` missing address/website columns | Confirmed | Low | Skip address/website in Phase 2; document as future migration |
| `js/modules/` accidentally activated | Low | High | Never add script tags for modules/; treat as read-only reference |
| Realtime channels conflict between directory and project workspace | Low | Medium | `ihEnsureRealtime()` is project-scoped; directory does not subscribe to realtime |

---

### 8. Manual QA checklist

#### Sidebar Investor Hub
- [ ] Clicking sidebar Investor Hub does NOT auto-open a project (Phase 1+)
- [ ] Directory shows all investors across all projects
- [ ] Directory renders when PROJECTS array is empty
- [ ] Directory renders when Supabase is unavailable (graceful empty state)

#### Project detail Investor Hub tab
- [ ] Clicking "Investor Hub" tab inside a project opens project-scoped workspace
- [ ] Capital stack shows only investors linked to THAT project
- [ ] Contributions and capital calls show only for THAT project
- [ ] Realtime updates still work (Supabase channel)

#### Add investor — person
- [ ] Name (required) — validation blocks empty submit
- [ ] Email (required) — validation blocks empty submit
- [ ] Phone (optional) — can be blank
- [ ] Creates record in `investors` table with type='person'
- [ ] Appears in global directory immediately

#### Add investor — company
- [ ] Legal company name (required)
- [ ] Contact person (required)
- [ ] Email (required)
- [ ] Phone (optional)
- [ ] Creates record in `investor_companies` table
- [ ] Creates linked record in `investors` table with type='company', company_id set
- [ ] Appears in global directory with company label

#### Attach existing investor to project
- [ ] Dropdown shows all investors from global directory
- [ ] Role in project selector shows all IH_ROLES
- [ ] Attaches via `project_investors` record (does not duplicate global investor record)
- [ ] New attachment appears in Project Capital Workspace

#### Edit investor
- [ ] Edit modal pre-fills name, email, phone
- [ ] Save updates `investors` record
- [ ] If company: edit modal shows company-level fields, saves `investor_companies`
- [ ] Edit in Global Directory never edits a project

#### Edit Project / Cancel Project button disambiguation
- [ ] Inside Investor Hub tab: top-right button reads "Edit Project" (not "Edit")
- [ ] "Cancel Project" label unchanged
- [ ] Clicking "Edit Project" opens project edit modal (not investor modal)

#### Financial isolation confirmation
- [ ] Create a capital contribution → P&L / cost basis / ROI figures do NOT change
- [ ] Create a capital call → project financial summary does NOT change
- [ ] Work Order totals do NOT include capital contributions

---

## Required sections before coding

- Objective
- User actions
- Data model
- UI behavior
- Mobile behavior
- Business rules
- Validation rules
- Affected files
- Protected files
- QA checklist
- Acceptance criteria
- Stop conditions

## Default stop conditions

Stop if implementation requires:

- SQL
- Supabase config changes
- financial formula changes
- Auth/RLS
- Investor Hub activation without owner approval
- broad refactor
- files not listed in `CURRENT_TASK.md`
