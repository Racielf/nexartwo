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

### ISSUE-010 — Projects have no safe delete/archive/cancel action visible

Severity: P2
Area: projects.js — renderProjectList() / project cards UI
Observed: Project cards/list do not show a visible way to delete, archive, or cancel projects.
Business rule confirmed by owner: Projects with financials, work orders, investors, documents, or history must use Archive/Cancel/Void workflow — NOT hard delete. Hard delete is prohibited.
Action needed: Design and implement a safe Archive/Cancel UI. Requires owner spec before implementation — must define what "archived" means in terms of visibility, reporting, and data retention.
Do not implement hard delete under any circumstances.
Do not fix in current task.
Status: OPEN — requires owner spec and separate task.
