# AGENT_CONFIGURATION_GUIDE — NexArtWO

## Universal rule

Every tool must start from the same source of truth:

- `AGENTS.md`
- `memory/PROJECT_STATE.md`
- `memory/CURRENT_TASK.md`

## Claude Code setup

1. Open repo root.
2. Confirm root has `CLAUDE.md`.
3. Confirm `.claude/CLAUDE.md` exists.
4. Confirm `.claude/rules/` exists.
5. Start every session by asking Claude:

```md
Read AGENTS.md, CLAUDE.md, memory/PROJECT_STATE.md and memory/CURRENT_TASK.md.
Do not edit files.
Summarize the active task, forbidden files and stop conditions.
```

Only after that, give a small task.

## VS Code / Copilot setup

1. Confirm `.github/copilot-instructions.md` exists.
2. Confirm `.github/instructions/*.instructions.md` exists.
3. Open Copilot Chat and say:

```md
Use repository instructions. Read AGENTS.md and memory/CURRENT_TASK.md.
Do not edit protected files. First propose a plan.
```

## Cursor / Antigravity setup

1. Confirm `.cursorrules` exists.
2. Confirm `.cursor/rules/nexartwo.mdc` exists.
3. In chat, start with:

```md
Follow .cursorrules and AGENTS.md.
Read memory/CURRENT_TASK.md.
Plan first. No code until I say GO.
```

## Codex setup

1. Confirm `AGENTS.md` exists.
2. Confirm `.codex/instructions.md` exists.
3. Create one task with:
   - goal
   - allowed files
   - forbidden files
   - QA steps
   - rollback plan

Use Codex for isolated tasks, not vague project repair.

## First safe agent prompt

```md
You are working in NexArtWO.

Read:
- AGENTS.md
- memory/PROJECT_STATE.md
- memory/CURRENT_TASK.md
- docs/00-governance/STOP_CONDITIONS.md

Do not edit files.

Return:
1. current phase
2. active task
3. allowed files
4. forbidden files
5. stop conditions
6. what you need from me before coding
```
