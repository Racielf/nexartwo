# CURRENT_TASK — NexArtWO

## Task

ISSUE-011: INP performance audit — read-only investigation of nav-item click path.

## Phase

Phase A — Read-only audit (no code changes in this phase).

## Objective

Identify the root cause of ISSUE-011: ~3719ms INP on div.nav-item.
Read code only. Document findings. Propose minimum fix for a future task.

## Scope

Read-only audit of:
- js/app.js: navigateTo() (L336), setupNavigation() (L262), initProjectsRoute() (L365),
  renderDashboard() (L571), renderDashboardRevenueChart() (L461), renderDashboardStatusDonut() (L521),
  renderDashboardPriorityBars() (L553)
- js/projects.js: initProjectsModule() (L268), ensureProjectsModuleShell() (L245),
  loadProjectsLocal() (L170), renderProjectList() (L391)

## Allowed files to modify

- `memory/CURRENT_TASK.md`
- `memory/KNOWN_ISSUES.md`
- `memory/SESSION_LOG.md`
- `memory/AGENT_HANDOFF.md`

## Forbidden files

- `js/**` (read only — no edits)
- `css/**`
- `sql/**`, `supabase/**`
- Auth/RLS, Financial formulas, Investor Hub

## Done when

Findings documented in KNOWN_ISSUES.md with:
- Confirmed call chain
- Number of lucide.createIcons() calls per nav
- Primary cause identified
- Minimum fix plan proposed (not implemented)

## Previous task completed

ISSUE-002 + ISSUE-003 cleanup — QA PASSED, committed f124e11 (2026-05-29)
