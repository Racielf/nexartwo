# NexArtWO — Agent Starter Prompts

Este pack es para que no tengas que buscar entre muchos prompts.

## Cómo usarlo

Usa estos prompts en este orden:

1. `01_START_NEW_SESSION_PROMPT.md`
   - Siempre que abras una nueva sesión con Claude Code, Codex, Cursor, Antigravity o Copilot.

2. `02_FIRST_SAFE_TASK_FUNCTION_INDEX.md`
   - Primera tarea recomendada después de instalar el Project Control Pack v2.

3. Según el caso:
   - Para revisar sin tocar código: `03_QA_ONLY_PROMPT.md`
   - Para arreglar un bug: `04_SAFE_BUG_FIX_PROMPT.md`
   - Para pedir código nuevo: `05_SAFE_CODE_TASK_PROMPT.md`
   - Para actualizar memoria: `06_UPDATE_MEMORY_PROMPT.md`
   - Para cerrar sesión: `07_AGENT_HANDOFF_PROMPT.md`

## Regla principal

Nunca empieces una sesión pidiendo código directamente.

Primero obliga al agente a leer:

- `AGENTS.md`
- `CLAUDE.md`, si aplica
- `memory/PROJECT_STATE.md`
- `memory/CURRENT_TASK.md`
- `docs/00-governance/STOP_CONDITIONS.md`
- `docs/00-governance/ERROR_RECOVERY.md`
- `docs/02-architecture/JAVASCRIPT_GLOBALS_AND_STATE_CONTRACT.md`

## Frase clave

El agente no debe tocar código hasta que tú digas:

```txt
GO
```
