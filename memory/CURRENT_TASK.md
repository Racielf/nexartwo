# CURRENT_TASK — NexArtWO

## Task

ISSUE-012: Document Work Order recipient model — Client or Investor support required.

## Phase

Phase A — Documentation only (no code changes).

## Objective

Record the business requirement, current state, future data model, and implementation
scope for adding Investor as a valid WO recipient. No code until owner approves.

## Allowed files to modify

- `memory/CURRENT_TASK.md`
- `memory/KNOWN_ISSUES.md`
- `memory/SESSION_LOG.md`
- `memory/AGENT_HANDOFF.md`

## Forbidden files

- `js/**`
- `css/**`
- `index.html`
- `sql/**`, `supabase/**`
- Auth/RLS, Financial formulas, Investor Hub activation

## Done when

ISSUE-012 documented in KNOWN_ISSUES.md with:
- Current state description
- Required future behavior
- Future data model (recipient_type, recipient_id, recipient_name)
- Backward-compat fields listed
- Implementation scope itemized
- Constraints and dependencies noted

## Previous task completed

ISSUE-011 read-only audit — root cause documented, committed d0199b7 (2026-06-05)
