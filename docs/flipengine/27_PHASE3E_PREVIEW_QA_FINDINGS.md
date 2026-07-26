# Phase 3E: Preview QA Findings

Status: Preview QA documented.

Date: 2026-07-05

## Scope

Document the Vercel preview QA observations for the Phase 3B gated Property Hub shell.

This is documentation only. No code, UI, SQL, migration, or database changes are included in this phase.

## Guardrails Followed

- No SQL was run.
- No migrations were applied.
- No Supabase `db push` was run.
- No production database was touched.
- No new writes to FlipEngine tables were added.
- Investor Hub was not activated or changed.
- Phase 2 migration and local bootstrap files remain separate from this UI QA note.

## Preview Context

Preview deployment reviewed:

- Commit: `0fd5d34`
- Branch: `feat/activate-investor-hub-local`
- Deployment type: Vercel Preview

The preview confirmed the Phase 3B shell behavior against a `Fix & Flip` project.

## Confirmed Working

### Property Hub Visibility

Property Hub is visible for the `Fix & Flip` project:

- Project name: `Coindo`
- Project type: `Fix & Flip`
- Expected gate: `project_type === 'fix_and_flip'`

Result:

- PASS

### Existing Financials

The existing `Financials` tab still works in the project workspace.

Result:

- PASS

Notes:

- No financial formulas were changed in Phase 3B.
- Property Hub does not write to or reinterpret existing financial summary data.
- Existing financial views remain separate from future FlipEngine budget/acquisition modules.

### FlipEngine Module Locking

FlipEngine-specific modules remain read-only/locked.

Confirmed locked/read-only areas include:

- Acquisition
- Budget
- Receipts
- Documents
- Loans / Draws
- Investors
- Contractors
- Labor / Time
- Payments
- Sale / Exit
- Reports

Expected message remains visible:

```text
Requires FlipEngine database migration before editing.
```

Result:

- PASS

## Findings

### Issue 1: Investor Hub Still Appears Visible In Navigation

The existing top-level `Investor Hub` entry is still visible in the project navigation.

Risk:

- It may look like Investor Hub has been activated as part of FlipEngine.
- It may confuse users reviewing the Property Hub shell because the Property Hub `Investors` section is intentionally locked, while the existing top-level `Investor Hub` tab remains visible.

Important distinction:

- The Property Hub `Investors` section remains read-only.
- The existing top-level `Investor Hub` navigation is pre-existing NexArWO behavior.
- Phase 3B did not activate or connect Investor Hub from Property Hub.

Recommended handling:

- Hide, disable, or visually separate Investor Hub from the Property Hub experience unless the owner explicitly approves Investor Hub behavior for FlipEngine.

### Issue 2: Property Hub Title/Header Feels Duplicated

The preview shows repeated `Property Hub` labeling in the project workspace and inside the shell body.

Risk:

- The page hierarchy feels heavier than necessary.
- Users may perceive the shell as a separate app/page instead of a module inside the existing project workspace.

Recommended handling:

- Keep one clear Property Hub title.
- Reduce or remove duplicate shell header text.
- Preserve the `FlipEngine` context label without making the page feel repetitive.

### Issue 3: Property Hub Shell Needs Visual Cleanup

The initial shell is functional and safe, but the visual layout needs polish before broader release.

Observed needs:

- Cleaner spacing between the section list and active content area.
- Clearer locked/read-only state styling.
- Better visual hierarchy for Overview, Work Orders, and Expenses.
- Less visual noise around placeholder modules.

Risk:

- The current shell is acceptable for gated preview QA but may feel unfinished to end users.

Recommended handling:

- Improve layout and visual hierarchy in a scoped UI-only phase.
- Avoid global styling changes unless necessary.
- Do not add database reads or writes during cleanup.

## Overall QA Result

Preview QA result:

- PASS with visual cleanup findings.

The Phase 3B shell is safe as a read-only preview:

- It appears for `Fix & Flip` projects.
- It does not require FlipEngine database tables.
- It keeps FlipEngine modules locked/read-only.
- It preserves existing Financials behavior.

It is not yet visually final.

## Recommended Phase 3F Scope

Phase 3F should be UI-only and limited to cleanup:

1. Hide or disable Investor Hub entry from the Property Hub experience unless explicitly approved.
2. Clean the duplicate Property Hub title/header.
3. Improve the Property Hub shell layout without adding database writes.

Phase 3F must not:

- Add CRUD for FlipEngine tables.
- Read or write `project_acquisitions`.
- Read or write `project_budget_categories`.
- Read or write `project_receipts`.
- Read or write `project_document_links`.
- Apply SQL.
- Modify migrations.
- Run `db push`.
- Touch the production database.
- Activate Investor Hub.
- Change financial formulas.

## Next Step

Proceed to Phase 3F only after owner approval.

Recommended first file to inspect before Phase 3F code:

- `js/projects.js`

Recommended optional file if scoped styling is needed:

- `css/styles.css`

