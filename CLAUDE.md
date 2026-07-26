@AGENTS.md

# Claude Code Instructions - NexArtWO

`AGENTS.md` is the universal authority. Use its context router instead of loading every document.

At a new task, context reset, branch change, or owner scope change:

1. Re-read the five core context files listed in `AGENTS.md`.
2. Load only the task-type row that applies.
3. Inspect exact source functions and contracts before proposing edits.
4. Keep the task small, validate it, and update current memory when state changes.

Do not preload `Otros/`, all of `docs/flipengine/`, or the full session log. Read archive/history only for a specific recovery or provenance need.

No autonomous SQL, remote database action, formula change, Investor Hub change, commit, merge, push, or deploy.
