# AGENT_HANDOFF — NexArtWO

## Last completed action

ISSUE-013 Phase B design plan complete (2026-06-05).
Full technical implementation plan in docs/03-modules/INVESTOR_HUB.md:
- Current state map with full call chain and active functions table
- Target architecture (Global Directory + Project Capital Workspace)
- Routing design: renderInvestorDirectory() replaces openInvestorHubEntry() for sidebar path
- Data model gaps identified: DB.investors.update(), DB.investorCompanies.update(), DB.projectInvestors.getByInvestor()
- 5 phases with file impact matrix and risk table
- Manual QA checklist (8 areas)
No code modified. Design documentation only. No commit yet.

## Code changes staged (not committed)

None. Last code commit: f124e11 (ISSUE-009 modal width fix, pushed).

## Open issues

### P1 — ISSUE-013: Investor Hub separation — DESIGN PLAN COMPLETE
Full plan in docs/03-modules/INVESTOR_HUB.md. 5 phases:
  Phase 1: Global Investor Directory shell (renderInvestorDirectory in projects.js)
  Phase 2: Create/Edit investor + DB.investors.update() + DB.investorCompanies.update()
  Phase 3: Attach flow refactor (separate from create)
  Phase 4: Edit Project label fix (1 word, zero logic)
  Phase 5: WO recipient integration (depends on Phase 1-2)
Key routing change: intercept initProjectsModule(route='investorhub') to call directory, not openInvestorHubEntry().
Data model gaps: investors.update(), investorCompanies.update(), projectInvestors.getByInvestor() needed.
Awaiting owner GO for Phase 1.

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
