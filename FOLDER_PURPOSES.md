# FOLDER_PURPOSES — NexArtWO Mega Pack

## Root files

- `AGENTS.md`: reglas universales para cualquier agente.
- `CLAUDE.md`: reglas específicas para Claude Code.
- `.cursorrules`: reglas para Cursor / Antigravity-style tools.
- `README.md`: índice maestro del pack.
- `00_START_AQUI.md`: instrucciones rápidas para instalar.

## Folders

- `.claude/`: reglas específicas para Claude Code.
- `.cursor/`: reglas específicas para Cursor.
- `.codex/`: reglas específicas para Codex.
- `.github/`: instrucciones para Copilot / VS Code.
- `docs/`: documentación de gobierno, producto, arquitectura, módulos, desarrollo y QA.
- `memory/`: memoria viva del proyecto.
- `skills/`: skills especializadas como `codex-fix`.
- `templates/`: plantillas para issues, bugs, QA, PRs.
- `agent-starter-prompts/`: prompts listos para copiar y pegar.

## Skill principal para bugs

Cuando haya bugs, errores de consola, build roto o comportamiento inesperado, el agente debe leer:

```txt
skills/codex-fix/SKILL.md
```

antes de proponer cambios.
