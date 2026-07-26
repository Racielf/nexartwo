# Phase 4B: Acquisition Read-Only Panel Implementation

Status: Implemented locally. Not committed, pushed, deployed, or connected to a new database table.

## Purpose

Add the first useful Acquisition view inside the existing gated FlipEngine Property Hub without introducing database reads, database writes, new financial calculations, or Investor Hub behavior.

This phase follows `32_PHASE4A_ACQUISITION_MODULE_PLAN.md` and is intentionally limited to existing NexArWO project data.

## Owner Authorization

The owner approved Phase 4B with this scope:

- Modify `js/projects.js` only for the UI implementation.
- Keep Acquisition read-only.
- Do not add SQL, Supabase methods, CRUD, financial formulas, or Investor Hub behavior.
- Preserve all unrelated local and untracked work.

## Files Modified

Implementation:

- `js/projects.js`

Documentation:

- `docs/flipengine/33_PHASE4B_ACQUISITION_READ_ONLY_IMPLEMENTATION.md`

## Files Intentionally Not Modified

- `js/supabase.js`
- `js/app.js`
- `css/`
- `index.html`
- `projects.html`
- `supabase/`
- `sql/`
- Auth/RLS files
- Investor Hub logic
- Existing financial formulas
- `memory/CURRENT_TASK.md`
- Existing untracked local files

## Implementation Details

The existing `Acquisition` section in the Property Hub shell now renders a read-only panel for eligible `fix_and_flip` projects.

Existing project fields displayed:

- Project ID
- Address
- Project status
- Project type
- Purchase date
- Purchase price
- Down payment
- Loan amount
- Closing costs
- Notes

The panel labels its source as:

```text
Existing NexArWO project
```

It also states that an Acquisition extension record is not loaded and preserves the required lock notice:

```text
Requires FlipEngine database migration before editing.
```

## Helper Functions Added

`propertyHubProjectField(project, field, legacyField)`

- Reads the current snake_case project field.
- Falls back to the existing camelCase compatibility field.
- Preserves valid zero values.
- Returns `null` only when the value is absent.

`propertyHubDisplayValue(value, formatter)`

- Displays a consistent unavailable state for missing values.
- Applies existing formatters such as `fmtMoney` and `fmtDate`.
- Escapes unformatted text through the existing `escHtml()` helper.

## Safety Boundaries Preserved

- Property Hub remains gated through the existing `isFlipEngineProject(project)` behavior.
- Normal NexArWO projects are not converted into investment projects.
- No request is made to `project_acquisitions`.
- No `DB.*` method was added or called by the Acquisition panel.
- No Add, Edit, Save, Delete, or form control was added.
- No project value is changed by opening the panel.
- No acquisition value is copied or synchronized into another table.
- No existing project financial formula was changed.
- Investor Hub was not invoked, exposed, or modified.

## Validation Performed

### JavaScript syntax

```text
node --check js/projects.js
PASS
```

### Diff formatting

```text
git diff --check -- js/projects.js
PASS
```

Git reported only the repository's existing LF-to-CRLF warning for the working copy.

### Isolated render test

The Property Hub Acquisition renderer was executed with representative project data.

Verified:

- A `fix_and_flip` project passes the FlipEngine gate.
- A `residential_project` does not pass the FlipEngine gate.
- Purchase and loan values render with the existing money formatter.
- The source label identifies existing NexArWO project data.
- The migration-required notice is present.
- Project notes are HTML-escaped.
- The rendered Acquisition HTML contains no button, input, select, or textarea.
- The rendered Acquisition HTML contains no `project_acquisitions` table reference.

Result: PASS.

### Browser preview limitation

An in-app browser preview could not be completed because the temporary local HTTP server did not remain active after the command session, and direct local-file navigation was blocked by the browser security policy.

No workaround was used. The phase was instead validated through syntax, diff, and isolated render checks.

## Current Git Scope

Phase 4B added 50 lines to `js/projects.js`.

Pre-existing unrelated changes remain in the working tree, including a modified `memory/CURRENT_TASK.md` and untracked local files. They were not altered or included in this phase.

No commit or push was performed.

## Manual QA Checklist

When a normal browser preview is available:

1. Open NexArWO Projects.
2. Open a normal non-fix-and-flip project.
3. Confirm Property Hub does not become available for that project.
4. Open the Coindo or another `fix_and_flip` project.
5. Open Property Hub.
6. Open Acquisition.
7. Confirm purchase, loan, closing, property, and note values are read-only.
8. Confirm no Add, Edit, or Save action appears.
9. Confirm the migration-required notice appears.
10. Confirm Overview, Financials, Expenses, Disbursements, and Work Orders still open.
11. Confirm the Project Workspace Investor Hub tab remains hidden unless separately enabled.
12. Confirm the browser console has no new errors.

## Recovery

Phase 4B is isolated to the Acquisition branch inside `renderPropertyHubSection()` plus its two display helpers.

To revise the panel safely:

- Keep data reads limited to `_currentProject` until a DB-backed phase is approved.
- Keep text values escaped.
- Keep money/date formatting through existing helpers.
- Do not introduce save controls without an approved Acquisition CRUD phase.

To remove only Phase 4B before commit, remove:

- `propertyHubProjectField()`
- `propertyHubDisplayValue()`
- The `section.id === 'acquisition'` branch in `renderPropertyHubSection()`

Do not revert the entire `js/projects.js` file because it contains other existing product logic and may later contain unrelated user work.

## Remaining Risks

1. Existing `projects` acquisition fields overlap conceptually with the future `project_acquisitions` extension table.
2. The source-of-truth and synchronization policy remains intentionally undecided.
3. Browser-level manual QA is still required before release.
4. `js/projects.js` remains a large shared file, so future changes should stay function-scoped.

## Recommended Next Phase

The next safe step is a separate planning and implementation phase for the Property Hub Budget section using only already approved, existing project/financial-summary data.

That phase must remain read-only unless the FlipEngine migration, data-access methods, Auth/RLS behavior, and exact CRUD scope are separately approved.
