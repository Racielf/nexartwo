@AGENTS.md

# Claude Code Instructions — NexArtWO

## Claude workflow

1. Read root `AGENTS.md`.
2. Read `memory/PROJECT_STATE.md`.
3. Read `memory/CURRENT_TASK.md`.
4. Read module spec.
5. Provide plan.
6. Wait for confirmation.
7. Make minimal change.
8. Validate.
9. Update memory.

## Claude memory usage

Use `memory/` as project memory:

- `PROJECT_STATE.md`: current project status
- `CURRENT_TASK.md`: active task and boundaries
- `DECISION_LOG.md`: architectural/product decisions
- `CHANGELOG.md`: completed changes
- `KNOWN_ISSUES.md`: unresolved bugs
- `BUG_FIX_LOG.md`: bug fixes
- `AGENT_HANDOFF.md`: handoff between sessions

## Claude-specific rules

- Do not load the entire repo unless needed.
- Prefer architecture maps before source code.
- Avoid editing huge JS files unless the target function is identified.
- No autonomous SQL.
- No autonomous merges.
- No "while I am here" fixes.
