# CURRENT_TASK — NexArtWO

## Task

ISSUE-002 + ISSUE-003: Remove duplicate utility function declarations.

## Phase

Phase A — Utility cleanup (dead code removal, doc/config scope).

## Objective

Remove dead global function declarations that are overridden at runtime.
No behavioral change. No call sites change. No new code added.

## Scope

### ISSUE-002 — showToast()
Remove 2 dead declarations. Keep app.js:5311 as the single canonical version.

| Action | File | Lines | What |
|--------|------|-------|------|
| DELETE | js/app.js | 3862–3870 | Dead showToast(message) — overridden by line 5311 |
| DELETE | js/projects.js | 98–104 | Dead showToast(msg) — overridden + uses #toast (not in HTML) |
| KEEP | js/app.js | 5311–5329 | Canonical showToast(message, duration) — do not touch |

### ISSUE-003 — showConfirmModal() / closeConfirmModal()
Remove 2 dead declarations. Keep app.js:1000 and app.js:1014 as canonical.

| Action | File | Lines | What |
|--------|------|-------|------|
| DELETE | js/projects.js | 128–141 | Dead showConfirmModal (3-param) + closeConfirmModal |
| KEEP | js/app.js | 1000–1017 | Canonical showConfirmModal (5-param) + closeConfirmModal |

### escHtml / escapeHtml
OUT OF SCOPE for this task. Different names → call sites use each name specifically.
Do not touch.

## Allowed files to modify

- `js/app.js` (remove lines 3862–3870 only)
- `js/projects.js` (remove lines 98–104 AND 128–141)
- `memory/CURRENT_TASK.md`
- `memory/KNOWN_ISSUES.md`
- `memory/SESSION_LOG.md`
- `memory/AGENT_HANDOFF.md`
- `docs/02-architecture/JAVASCRIPT_GLOBALS_AND_STATE_CONTRACT.md`
- `docs/02-architecture/FUNCTION_INDEX.md`

## Forbidden files

- Any other `js/**` file (supabase.js, modules/)
- `css/**`
- `sql/**`
- `supabase/**`
- `index.html`
- `projects.html`
- Auth/RLS
- Financial formulas
- Investor Hub activation

## Done when

- 3 dead function declarations removed (not replaced)
- App loads and renders normally
- 6 regression tests pass (listed in KNOWN_ISSUES)
- No new JS errors in browser console
- Commit is doc/dead-code only

## Regression tests required (manual)

1. Delete a Work Order → toast appears and disappears correctly
2. Save a project → toast appears (projects.js caller)
3. Trigger multiple toasts quickly → only one toast shows at a time
4. Delete a Work Order → confirm dialog shows "Delete" button, works correctly
5. Create a new Project → modal opens with form (form-injection pattern)
6. Close any modal → modal hides; then open standard confirm → confirm works correctly

## Previous task completed

Phase A investigation — ISSUE-001 resolved, active IH confirmed (2026-05-29)
