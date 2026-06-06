# AGENT_HANDOFF — NexArtWO

## Last completed action

ISSUE-013 documented (2026-06-05).
P1: Investor Hub must split into Global Investor Directory (sidebar) and Project Capital Workspace (project tab).
QA observations, future model A/B, UX rules, and Add Investor requirements recorded.
No code modified. Memory update only. No commit yet.

## Code changes staged (not committed)

None. Last code commit: f124e11 (ISSUE-009 modal width fix, pushed).

## Open issues

### P1 — ISSUE-013: Investor Hub separation — Directory vs Project Capital Workspace
Two surfaces required: Global Investor Directory (sidebar, all investors, CRUD) and Project Capital Workspace (project tab, capital stack, roles).
Edit button context rule documented. Add Investor Person + Company requirements documented.
No code. No Supabase changes. No refactor. Awaiting design approval.
Dependencies: ISSUE-012 (WO investor recipient) needs global directory to exist first.

### P2 — ISSUE-012: WO recipient must support Client or Investor
Business requirement documented. Future model: recipient_type / recipient_id / recipient_name.
Legacy wo.client / wo.clientId fields kept for backward compat until formal migration.
Affected: index.html #modal-new-wo, app.js openNewWOModal/openEditWOModal/saveNewWO/renderWorkOrders.
Do not implement until owner approves. Do not touch Supabase schema yet.

### P2 — ISSUE-011: INP ~3719ms on nav-item — AUDIT COMPLETE
Root cause: synchronous render pipeline + lucide.createIcons() called 3× (projects) / 2× (dashboard) per nav.
Redundant call at app.js:362 confirmed. Full findings in KNOWN_ISSUES.md.
Fix 1 (safe): delete app.js:362 lucide.createIcons() — awaiting owner approval.
Fix 2 (medium risk): defer render in setTimeout — only if Fix 1 insufficient.

### P2 — ISSUE-008: Work Order delete failure
Supabase/database error when attempting WO delete.
"Delete failed — database error. Try again." / "0 deleted, 1 failed"
NOT a regression. Separate investigation required.
Must read STOP_CONDITIONS and skills/codex-fix/SKILL.md before touching Supabase.

### P2 — ISSUE-010: No safe project archive/cancel action
Project cards have no visible delete/archive/cancel.
Business rule: hard delete PROHIBITED for projects with history.
Requires owner spec on Archive/Cancel/Void workflow before implementation.

### P3 — ISSUE-009: New Project modal too narrow
CSS-only issue. Separate task. Do not touch JS or financial formulas.

## Do not do next

Do not implement ISSUE-011 Fix 1 or Fix 2 without explicit owner GO.
Do not investigate ISSUE-008 (Supabase) without reading STOP_CONDITIONS first.
Do not implement archive/delete for projects without owner spec.
