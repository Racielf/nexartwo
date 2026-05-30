# Agregar esta regla a AGENTS.md

Copia esta sección dentro de `AGENTS.md` en la parte de reglas de bugs/debugging.

```md
## Bug fix skill

If the task involves a bug, console error, failed build, broken module, frontend issue, backend issue, Supabase issue, RLS issue, or unexpected behavior, the agent must read:

- `skills/codex-fix/SKILL.md`

before proposing or making code changes.

The agent must first verify the error, diagnose the root cause, and propose the smallest safe change. No broad refactor is allowed during bug repair.
```
