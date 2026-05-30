# NexArtWO — Master Documentation Index

## Purpose

This is the main entry point for NexArtWO documentation and agent control.

NexArtWO must be treated as a real SaaS/product repository, not as an open prototype where an AI agent can freely modify large areas of code.

The goal of this documentation pack is to prevent AI-induced regressions: fixing one issue while breaking two unrelated areas.

## Product direction

NexArtWO is the main platform.

Core areas:

- Dashboard
- Work Orders
- Projects
- Project Financials
- Expenses / Refunds / Disbursements
- Clients / CRM
- Documents / Reports
- Mobile field usage
- Future Cash-In
- Future Investor Hub
- Future Auth/RLS
- Future Deal Analyzer

## Mandatory reading before code

Every human, AI agent, Claude Code session, Codex task, Cursor session, Copilot session, or other coding assistant must read:

1. `AGENTS.md`
2. `memory/PROJECT_STATE.md`
3. `memory/CURRENT_TASK.md`
4. `docs/00-governance/STOP_CONDITIONS.md`
5. `docs/00-governance/ERROR_RECOVERY.md`
6. The module spec in `docs/03-modules/`

## Core rule

The agent must not begin coding until it produces a short plan and receives explicit approval.

## Recommended first workflow

1. Install this pack in the root of the NexArtWO repo.
2. Commit documentation only.
3. Do not change code in the same commit.
4. Update `memory/CURRENT_TASK.md` with the first real task.
5. Start with Phase A: manual QA and code map, not feature development.

## Project file map

See:

- `docs/02-architecture/CURRENT_REPO_MAP.md`
- `docs/02-architecture/FILE_OWNERSHIP_MAP.md`
- `docs/02-architecture/FUNCTION_INDEX.md`

## Agent configuration files included

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `.claude/rules/*.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.cursorrules`
- `.cursor/rules/nexartwo.mdc`
- `.codex/instructions.md`

## Memory files included

- `memory/PROJECT_STATE.md`
- `memory/CURRENT_TASK.md`
- `memory/DECISION_LOG.md`
- `memory/CHANGELOG.md`
- `memory/KNOWN_ISSUES.md`
- `memory/BUG_FIX_LOG.md`
- `memory/AGENT_HANDOFF.md`
- `memory/SESSION_LOG.md`
- `memory/PROTECTED_AREAS.md`
- `memory/NEXT_ACTIONS.md`
