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

Severity: P2
Area: app.js, projects.js, investor-hub-logic.js, investor-hub-modals.js
Description: `showToast()` is defined in 5 locations including TWICE within app.js (lines 3862 and 5311). The last definition in scope wins at runtime, but this creates ambiguity and maintenance risk.
Locations:
- app.js:3862
- app.js:5311 (second definition in same file)
- projects.js:98
- investor-hub-logic.js:426
- investor-hub-modals.js:570
Action needed: Consolidate to one shared utility. Low priority until Investor Hub work begins.
Status: OPEN.

### ISSUE-003 — showConfirmModal() / closeConfirmModal() duplicated

Severity: P2
Area: app.js, projects.js
Description: Both `app.js:1000` and `projects.js:128` define `showConfirmModal()`. Both `app.js:1014` and `projects.js:138` define `closeConfirmModal()`. They have different signatures (`btnText, btnClass` in app.js vs. not in projects.js).
Risk: A call to `showConfirmModal()` may behave differently depending on which definition the JS engine uses last.
Action needed: Determine which is actually called and remove the dead one.
Status: OPEN.

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
