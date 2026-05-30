# TOOL_SELECTION_GUIDE — NexArtWO

## VS Code / Copilot

Best for:
- small edits
- autocomplete
- CSS/UI improvements
- local navigation

Use:
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`

## Claude Code

Best for:
- multi-file reasoning
- controlled debugging
- codebase explanation
- refactor planning

Use:
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `.claude/rules/*.md`
- `memory/`

## Cursor / Antigravity-style tools

Best for:
- visual agent flows
- structured code changes
- guided edits

Use:
- `.cursorrules`
- `.cursor/rules/nexartwo.mdc`
- `AGENTS.md`

## Codex

Best for:
- isolated bugfix
- test generation
- PR-style task
- code review style implementation

Use:
- `AGENTS.md`
- `.codex/instructions.md`
- exact issue scope

## Rule

No tool should receive vague instructions. Every task must have allowed files, forbidden files and validation.
