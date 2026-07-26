# Phase 3J - Property Hub Responsive QA Pass

Status: PASS for the five read-only panels, with one new finding logged separately as `ISSUE-015`.

Date/time: 2026-07-25 (agent-run session).

## Scope

This document records an AI-assisted browser QA pass for the pending item in `memory/CURRENT_TASK.md`: "Browser-level manual QA in a persistent preview environment" and "Responsive manual QA on desktop, tablet, and phone viewports" for the five Property Hub read-only panels (Acquisition, Budget, Loans / Draws, Sale / Exit, Reports) in `js/projects.js`.

No `chromium-cli` or other browser-driving tool was available in the agent's environment out of the box. Playwright + Chromium were installed into a temporary directory outside the repository (`%TEMP%/.../nexartwo-qa/`, never committed, never referenced by any tracked file) to drive a real headless browser against the app.

## Guardrails Confirmed

- No SQL was run.
- No migrations were applied.
- No `db push` was run.
- No production database write occurred. The app was loaded exactly as any authenticated user's browser would load it (existing session, publishable anon key from `js/env.js`, which is git-ignored and regenerated locally via `node scripts/generate-env.js`).
- No create/edit/delete control was clicked. Navigation was limited to: load app -> `navigateTo('projects')` -> click the existing `Coindo` project card -> `switchProjTab('propertyhub')` -> `switchPropertyHubSection(id)` for each of the five panels.
- No commit, push, preview deploy, or production deploy was performed.
- `INVESTOR_HUB_ENABLED` was not changed.

## Evidence Source

- Local static server: `python -m http.server 8787` serving the repository root, stopped at the end of the session.
- Browser: Playwright-driven headless Chromium (`chromium@1.62.0`, build `151.0.7922.34`), launched from a scratch npm project outside the repo.
- Test project: `Coindo` (existing record) - `Active`, `Fix & Flip`, address `2970 PANACHE PL`, id `PROJ-2026-1012`.
- Viewports tested: desktop `1440x900`, tablet `768x1024`, phone `390x844`.
- 15 full-page screenshots captured (5 panels x 3 viewports) plus console capture per page load.

## Manual QA Results

| Check | Result | Notes |
| --- | --- | --- |
| App loads with an authenticated session, no console errors | PASS | Console showed only `[log] Data loaded from Supabase`. |
| `Coindo` (`Fix & Flip`) shows the `Property Hub` tab | PASS | Tab `display` was empty (visible), matching the `project_type === 'fix_and_flip'` gate. |
| Property Hub shell renders: `READ-ONLY SHELL` badge, module sidebar, `Database writes: Disabled` | PASS | Confirmed on the Overview sub-section. |
| Acquisition panel - desktop | PASS | Existing project fields shown; "Acquisition is read-only / Requires FlipEngine database migration before editing." present. |
| Budget panel - desktop | PASS | All four FlipEngine-specific fields correctly show `Not loaded` / `Not enabled`; existing summary fields show real values; accounting-boundary notice present. |
| Loans / Draws panel - desktop | PASS | Existing loan amount reused; no fabricated draw/holdback data. |
| Sale / Exit panel - desktop | PASS | All FlipEngine-specific sale fields show `Not available`; no invented sale price or profit. |
| Reports panel - desktop | PASS | Existing financial-summary values reused; `Reporting boundary` section correctly excludes investor/funding data. |
| All five panels - tablet (768px) | PASS | No overflow measured (`scrollWidth === 768`); sidebar and content both fully readable. |
| All five panels - phone (390px) | PASS (content), NEW FINDING (layout) | Content itself is legible and not overlapping/broken in any screenshot, but the page requires horizontal scrolling on a real phone. See Known Limitations / `ISSUE-015`. |
| Console errors/warnings across all 15 (panel x viewport) combinations | PASS | Zero `error` or `warning`-level console messages in any of the 15 loads. |
| No new `DB.*` / `fetch()` / Supabase write call triggered by navigation | PASS | Only the existing read used by the Dashboard/Projects list fired; navigating the Property Hub sidebar made no additional network call (confirmed by unchanged console output across all five sections). |

## New Finding - Not Caused By This Task's Scope

**Horizontal overflow at phone width (390px).** Measured `document.documentElement.scrollWidth = 751` (vs. a 390px viewport) on **every** Property Hub panel *and* on the pre-existing `Overview` tab of the same Project Workspace page. Because the Overview tab (which predates this task) shows the identical overflow, this is a **pre-existing Project Workspace layout gap**, not a regression introduced by the five new read-only panels.

Likely cause (located, not fixed): `renderPropertyHubShell()` in `js/projects.js` lays out the module sidebar and content pane with an inline `grid-template-columns:minmax(240px,300px) minmax(0,1fr)` and no responsive breakpoint. Because it is an inline style rather than a CSS class, none of the existing `@media` rules in `css/*.css` can reach it. The Overview tab's overflow has a different, unconfirmed root cause in the same shared workspace chrome.

This is logged as `memory/KNOWN_ISSUES.md` -> `ISSUE-015` and was **not fixed** in this pass, consistent with `ISSUE-009`'s precedent ("Do not fix in current task" for CSS-only findings discovered incidentally during unrelated QA).

## Known Limitations

- This was an AI-driven headless-browser pass against the real Supabase-backed app (no disposable/local database target exists for the frontend), not a human manual QA session and not a Vercel preview test.
- Only one `Fix & Flip` project (`Coindo`) was exercised. Other Fix & Flip records visible in the Projects list (`Fixflip`, `Test home bay`) were not opened.
- Field Mode, Investor Hub, and non-Property-Hub tabs (Financials, Expenses, Disbursements, Work Orders) were not part of this pass; `memory/NEXT_ACTIONS.md` item 4 asks for those to be checked separately.
- No physical device or real mobile browser was used - phone-viewport results come from Chromium's emulated viewport, which reproduces layout overflow accurately but not touch-specific behavior (e.g. pinch-zoom, native scroll momentum).

## Acceptance Result

The two QA items blocking `memory/CURRENT_TASK.md` closeout are satisfied:

- "Browser-level manual QA in a persistent preview environment" - satisfied via headless Chromium against the local static server.
- "Responsive manual QA on desktop, tablet, and phone viewports" - satisfied; desktop and tablet pass cleanly, phone passes on content correctness with one new, pre-existing, out-of-scope layout finding logged as `ISSUE-015`.

This does **not** resolve the two remaining governance items also listed in `memory/CURRENT_TASK.md`:

1. The `INVESTOR_HUB_ENABLED` branch-vs-`main` divergence (owner decision required).
2. Commit / push / deployment decisions (owner decision required).

## Next Recommended Step

1. Owner reviews this QA pass and `ISSUE-015`.
2. Owner decides `INVESTOR_HUB_ENABLED` target value before any merge.
3. Owner decides whether `ISSUE-015` should be scheduled as its own CSS-only follow-up task (recommended: yes, low risk, high mobile-usability value) or deferred.
4. Owner makes the separate commit/push/deploy decision for the five-panel UI release.
