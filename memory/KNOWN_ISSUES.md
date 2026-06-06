# KNOWN_ISSUES — NexArtWO

## Initial risk list

### AI regression risk

Severity: P1
Area: Project-wide
Description: Agents may fix one area while breaking another due to large vanilla JS files and weak task boundaries.
Status: Mitigated by Project Control Pack v2.

### Cash-In undefined

Severity: P1
Area: Project Financials
Description: Cash-In model must be specified before Investor Hub.
Status: Pending spec.

### Investor Hub locked

Severity: P2
Area: Investor Hub
Description: Do not enable until approved.
Status: Locked.

### Auth/RLS locked

Severity: P2
Area: Security
Description: Draft exists but should not be activated without owner approval.
Status: Locked.

---

## Phase A findings — 2026-05-29

### ISSUE-001 — Dual Investor Hub implementation

Severity: P1 → RESOLVED (investigation complete 2026-05-29)
Area: js/projects.js + js/modules/investor-hub-logic.js + js/modules/investor-hub-modals.js

VERDICT: **`js/projects.js` is the active implementation.**
The `js/modules/` files are dead code — never loaded in index.html.

Evidence:
- `index.html` loads only: env.js, supabase.js, projects.js, app.js
- `js/modules/investor-hub-logic.js`, `investor-hub-modals.js`, `investor-manager.js` have NO script tags
- `supabase.js:986` comment confirms InvestorManager requires a script tag that was never added
- Active call chain: navigateTo('investorhub') → initProjectsRoute → initProjectsModule → renderInvestorHub (projects.js:1829)

See `docs/03-modules/INVESTOR_HUB.md` for full evidence and call chain.

Action needed: Owner to decide what to do with `js/modules/` — delete, keep as draft, or activate in a future planned task.
Status: INVESTIGATION RESOLVED. Pending owner decision on dead code.

### ISSUE-002 — showToast() declared 5 times

Severity: P2 → ✅ QA PASSED
Area: app.js, projects.js

Implementation: Removed app.js:3862–3870 and projects.js:98–104 (2026-05-29).
QA result: Toast notifications confirmed working — appearing and auto-dismissing correctly.
Unrelated failures observed during QA session: see ISSUE-008, ISSUE-009, ISSUE-010.
Status: CLOSED.

### ISSUE-003 — showConfirmModal() / closeConfirmModal() duplicated

Severity: P2 → ✅ QA PASSED
Area: app.js, projects.js

Implementation: Removed projects.js:128–141 (showConfirmModal + closeConfirmModal) (2026-05-29).
QA result: Confirm dialog behavior confirmed working — Delete WO modal shows correctly with "Delete" button. New Project modal opens (form-injection pattern). Skeleton restoration between modal types confirmed working.
Unrelated failures observed during QA session: see ISSUE-008, ISSUE-009, ISSUE-010.
Status: CLOSED.

### ISSUE-004 — escHtml / escapeHtml naming inconsistency

Severity: P3
Area: app.js, projects.js, investor-hub-logic.js
Description: The HTML escape utility has two different names: `escHtml()` (app.js:2767, projects.js:93) and `escapeHtml()` (app.js:3999, investor-hub-logic.js:411). Both do the same thing.
Risk: Low — but agents may use the wrong name when adding code, leading to undefined function errors.
Action needed: Standardize to one name during cleanup phase.
Status: OPEN — low priority.

### ISSUE-005 — js/modules/ not in CURRENT_REPO_MAP

Severity: P2
Area: Documentation
Description: `js/modules/investor-hub-logic.js`, `investor-hub-modals.js`, and `investor-manager.js` were not documented in CURRENT_REPO_MAP.
Resolution: CURRENT_REPO_MAP updated 2026-05-29.
Status: RESOLVED.

### ISSUE-006 — js/env.js not documented

Severity: P3
Area: Documentation
Description: `js/env.js` (auto-generated Supabase config) was missing from CURRENT_REPO_MAP. It contains the Supabase URL and anon key hardcoded. The anon key is intentionally public per Supabase design, but the file must not be manually edited.
Resolution: CURRENT_REPO_MAP updated 2026-05-29. `js/env.js` marked as DO NOT EDIT.
Status: RESOLVED.

### ISSUE-007 — dist/ directory not documented

Severity: P3
Area: Documentation
Description: A `dist/` directory exists with copies of the app files (likely Vercel build output). Not documented. Edits should be made to source files, not dist.
Resolution: CURRENT_REPO_MAP updated 2026-05-29.
Status: RESOLVED.

---

## QA session findings — 2026-05-29

### ISSUE-008 — Work Order delete failure (Supabase/database error)

Severity: P2
Area: js/app.js — woDeleteSelected() / deleteWorkOrder()
Observed: When attempting to delete a Work Order, the app shows:
  "Delete failed — database error. Try again."
  or "0 deleted, 1 failed — check connection"
Likely cause: Supabase delete operation failing — could be RLS policy blocking delete, network issue, or missing DB permission. NOT a regression from ISSUE-002/003 cleanup.
Action needed: Separate investigation task. Must read STOP_CONDITIONS before touching Supabase/RLS.
Do not fix in current task.
Status: OPEN — separate task required.

### ISSUE-009 — New Project modal layout too narrow

Severity: P3
Area: projects.js — openProjectModal() — CSS/UI only
Observed: When opening "+ New Project", the modal appears too narrow/cramped, especially for financial fields.
Likely cause: CSS modal width constraint not accounting for financial input layout.
Action needed: Separate CSS-only task. Must not touch JS logic or financial formulas.
Do not fix in current task.
Status: OPEN — separate CSS task required.

### ISSUE-011 — INP performance issue on nav-item interaction

Severity: P2
Area: app.js — navigation / route switching
Observed: Vercel Toolbar reports INP issue on `div.nav-item`. Event handlers on this element blocked UI updates for ~3719.9ms.
Source: Vercel Toolbar — branch feat/activate-investor-hub-local, 2026-06-05.

#### AUDIT COMPLETE — 2026-06-05

##### Call chain: click → navigateTo('projects')

```
div.nav-item click (setupNavigation app.js:264)
  └─ navigateTo('projects')  [SYNCHRONOUS — no yield, no RAF]
       ├─ querySelectorAll('.page').forEach → classList  [DOM walk]
       ├─ querySelectorAll('.nav-item').forEach → classList  [DOM walk]
       ├─ getElementById × 3 + textContent writes  [topbar]
       ├─ initProjectsRoute('projects')  [→ initProjectsModule, runs sync until first await]
       │    ├─ ensureProjectsModuleShell() → target.innerHTML = '' + appendChild → lucide.createIcons()  ← CALL 1
       │    ├─ syncProjectRouteChrome() → classList + textContent
       │    ├─ loadProjectsLocal() → localStorage.getItem() + JSON.parse  [SYNC I/O]
       │    ├─ renderProjectList() → PROJECTS.map() → container.innerHTML = html + lucide.createIcons()  ← CALL 2
       │    └─ showProjectList() → DOM visibility
       └─ lucide.createIcons()  ← CALL 3  [app.js:362 — REDUNDANT]
```

**Total lucide.createIcons() calls (projects nav): 3**

##### Call chain: click → navigateTo('dashboard')

```
div.nav-item click
  └─ navigateTo('dashboard')  [SYNCHRONOUS]
       ├─ DOM class cleanup
       ├─ renderDashboard()
       │    ├─ WORK_ORDERS.filter() × 3 + .reduce() × 3
       │    ├─ 12× getElementById + textContent writes
       │    ├─ tbody.innerHTML = WORK_ORDERS.slice(0,5).map(...)  [forced layout]
       │    ├─ feed.innerHTML = ACTIVITIES.slice(0,7).map(...)
       │    ├─ renderDashboardRevenueChart() → el.innerHTML = full SVG string + polyline + circles
       │    ├─ renderDashboardStatusDonut() → conic-gradient + donut.innerHTML + legend.innerHTML
       │    ├─ renderDashboardPriorityBars() → el.innerHTML = bars
       │    ├─ renderDashboardFinancials()  [async — NOT awaited, returns Promise, doesn't block]
       │    └─ lucide.createIcons()  ← CALL 1  [app.js:639]
       └─ lucide.createIcons()  ← CALL 2  [app.js:362 — REDUNDANT]
```

**Total lucide.createIcons() calls (dashboard nav): 2**

##### Root causes identified

1. **`lucide.createIcons()` called 2–3× per navigation, all synchronously.**
   Each call: queries all `[data-lucide]` elements in the full SPA DOM → creates SVG → replaces `<i>` tags.
   The call at `navigateTo()` L362 is ALWAYS redundant — each downstream render function already calls it.

2. **Zero yield to browser in the click handler.**
   `navigateTo()` is entirely synchronous. No `requestAnimationFrame`, no `setTimeout(fn,0)`, no scheduling.
   The browser cannot paint ANY frame (including the nav active-state highlight) until the entire render chain completes.
   This is the fundamental architectural cause of the INP measurement.

3. **`renderProjectList()` does a massive synchronous `innerHTML` write.**
   All project cards built as one long string, then `container.innerHTML = html` in a single operation.
   Triggers full DOM parse + layout for all projects at once (O(n) with project count).

4. **`loadProjectsLocal()` is synchronous I/O on every nav to projects.**
   `localStorage.getItem('nexartwo_projects')` + `JSON.parse()` runs on the click handler thread.
   With many projects (each having financial data), this JSON parse adds blocking time.

5. **SVG chart renders in `renderDashboard()` are inline `innerHTML` injections.**
   `renderDashboardRevenueChart()` builds a full SVG string with per-point path data and sets `el.innerHTML`.
   Three charts rendered sequentially before first paint on every dashboard nav.

##### Most probable primary cause

The ~3719ms INP is caused by the **entire render pipeline running synchronously in the click handler with no paint opportunity**, compounded by `lucide.createIcons()` running 2–3× and at least one large `innerHTML` write (project list or SVG charts) triggering expensive layout.
The redundant `lucide.createIcons()` at `app.js:362` alone forces an extra full-DOM scan every single navigation.

##### Minimum fix plan (DO NOT IMPLEMENT — requires separate approved task)

**Fix 1 — Remove redundant `lucide.createIcons()` at app.js:362 (1 line delete, near-zero risk)**
Each downstream render already calls it. This eliminates 1 full DOM scan per every nav click.
Safe because: pre-rendered pages (workorders, services, clients, docs) have no new icons during nav.

**Fix 2 — Defer heavy render after first paint (medium change, medium risk)**
Wrap the render calls in `navigateTo()` in a `setTimeout(fn, 0)` block, keeping only DOM class/text
updates synchronous. Lets the browser paint the nav highlight before the heavy render starts.
Requires manual QA of all 8 pages after change.

**Recommended order:** Fix 1 first (safe, measurable), then Fix 2 if INP still fails threshold.

Status: OPEN — audit complete. Fix 1 plan ready for owner approval.

### ISSUE-012 — Work Order recipient must support Client or Investor

Severity: P2
Area: index.html (modal-new-wo), js/app.js — openNewWOModal(), openEditWOModal(), saveNewWO(), renderWorkOrders()
Business context: Fix-and-flip / investor workflows require Work Orders to be directed to an Investor, not only a Client.

#### Current state

- Modal `#modal-new-wo` has a single "Client *" field: `<select id="new-wo-client">` populated from CLIENTS.
- `saveNewWO()` stores the selected value as `wo.client` / `wo.clientId`.
- `renderWorkOrders()` displays the client name in the WO list.
- Work Order PDFs/documents may read `wo.client` directly.
- No concept of recipient type exists anywhere in the data model.

#### Required behavior

| Recipient Type | Dropdown source |
|---|---|
| Client | CLIENTS array (current behavior) |
| Investor | Investor Hub investor records (new) |

User selects Recipient Type first (Client / Investor), then the dropdown refreshes to show the correct list.

#### Future data model

New fields to add when implemented:
- `recipient_type` — `'client'` or `'investor'`
- `recipient_id` — ID of the selected client or investor
- `recipient_name` — display name (denormalized for rendering/PDFs)

Legacy fields to keep for backward compatibility:
- `wo.client` — keep populated (set to `recipient_name`) until formal migration
- `wo.clientId` — keep populated (set to `recipient_id`) until formal migration

Do NOT remove legacy fields without a separate approved migration task.

#### Implementation scope (future — DO NOT implement until owner approval)

1. `index.html` — `#modal-new-wo`: add Recipient Type radio/select above the existing client field.
2. `js/app.js` — `openNewWOModal()`: default Recipient Type to `'client'`, populate dropdown from CLIENTS.
3. `js/app.js` — `openEditWOModal()`: restore saved `recipient_type` and populate correct dropdown.
4. `js/app.js` — `saveNewWO()`: write `recipient_type`, `recipient_id`, `recipient_name` + keep legacy `client`/`clientId`.
5. `js/app.js` — `renderWorkOrders()`: display `recipient_name` (falls back to `wo.client` for old records).
6. Investor Hub investor list: read from existing `ihGetInvestors()` or equivalent in projects.js.

#### Constraints

- Do not touch Supabase schema until owner approves a formal migration plan.
- Do not touch Investor Hub logic or activation status.
- Do not touch financial formulas.
- Do not break existing Client workflow — backward compatibility is required.
- PDF/document generation must be audited before migration to ensure it doesn't hardcode `wo.client`.

#### Dependencies

- ISSUE-001 (resolved): active IH implementation confirmed as `js/projects.js` — investor list source known.
- ISSUE-010 (open): project archive/cancel — unrelated but shares the projects.js module scope.

Status: OPEN — documented. Awaiting owner approval before implementation plan.

---

### ISSUE-010 — Projects have no safe delete/archive/cancel action visible

Severity: P2
Area: projects.js — renderProjectList() / project cards UI
Observed: Project cards/list do not show a visible way to delete, archive, or cancel projects.
Business rule confirmed by owner: Projects with financials, work orders, investors, documents, or history must use Archive/Cancel/Void workflow — NOT hard delete. Hard delete is prohibited.
Action needed: Design and implement a safe Archive/Cancel UI. Requires owner spec before implementation — must define what "archived" means in terms of visibility, reporting, and data retention.
Do not implement hard delete under any circumstances.
Do not fix in current task.
Status: OPEN — requires owner spec and separate task.
