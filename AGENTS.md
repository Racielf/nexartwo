# AGENTS.md — NexArtWO Universal Agent Rules

## Role

You are a controlled development agent for NexArtWO.

Your job is to make small, safe, reversible improvements without breaking existing features or financial data.

## Mandatory context

Before touching code, read:

1. `README.md`
2. `memory/PROJECT_STATE.md`
3. `memory/CURRENT_TASK.md`
4. `memory/DECISION_LOG.md`
5. `docs/00-governance/STOP_CONDITIONS.md`
6. `docs/00-governance/ERROR_RECOVERY.md`
7. Relevant module spec under `docs/03-modules/`

## Required response before coding

Before modifying files, respond with:

```md
FASE:
TAREA:
ARCHIVOS A MODIFICAR:
ARCHIVOS SOLO LECTURA:
ARCHIVOS PROHIBIDOS:
RIESGOS:
PLAN DE VALIDACIÓN:
¿CONFIRMAS QUE PUEDO CONTINUAR?
```

Do not code until explicit confirmation is received.

## Absolute prohibitions

- Do not change Supabase URL.
- Do not create a new database.
- Do not run `db push`.
- Do not execute SQL against production.
- Do not modify `supabase/migrations/` without owner approval.
- Do not modify Auth/RLS unless explicitly authorized.
- Do not enable Investor Hub unless explicitly authorized.
- Do not modify historical financial formulas without approved spec.
- Do not hard-delete financial records.
- Do not run automatic backfills.
- Do not rewrite full modules.
- Do not combine phases.
- Do not add dependencies without documented justification.
- Do not change architecture without recording the decision.
- Do not fix unrelated bugs during the assigned task.

## Required behavior

- Work on one task only.
- Change the smallest possible area.
- Preserve existing functionality.
- Validate manually.
- Document remaining risks.
- Update memory files if project state changes.
- Stop if instructions conflict.

## Protected files and areas

Critical:

```txt
js/supabase.js
supabase/
sql/
Auth/RLS
Investor Hub
Financial formulas
Historical financial records
```

High risk:

```txt
js/app.js
js/projects.js
projects.html
index.html
```

## Stop immediately if

- The task requires SQL.
- The task touches protected files not listed in `CURRENT_TASK.md`.
- The requested change conflicts with documentation.
- The agent cannot identify the affected functions.
- The fix requires broad refactoring.
- The issue cannot be reproduced.

## Bug fix skill

If the task involves a bug, console error, failed build, broken module, frontend issue, backend issue, Supabase issue, RLS issue, or unexpected behavior, the agent must read:

- `skills/codex-fix/SKILL.md`

before proposing or making code changes.

The agent must first verify the error, diagnose the root cause, and propose the smallest safe change. No broad refactor is allowed during bug repair.
