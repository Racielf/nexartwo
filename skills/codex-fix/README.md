# Codex Fix

> Status note (2026-07-12): The current repository copy contains `SKILL.md`, this README, `GUIA_RAPIDA_NEXARTWO.md`, and a placeholder `references/README.md`. The optional reference files and `agents/openai.yaml` described below are not installed.

Codex Fix is a debugging and code-repair skill designed to analyze code errors conservatively. It should activate when the user reports bugs, syntax errors, runtime failures, logic issues, broken modules, failed builds, warnings, console errors, API issues, database issues, or frontend/backend behavior that does not match expectations.

## Main goal

Fix code without breaking existing behavior.

The skill should:

- inspect the complete affected block
- identify the root cause
- verify whether the code already works under valid conditions
- propose the smallest safe correction
- preserve the current architecture
- avoid unnecessary refactors
- include validation steps

## Optional packaged structure

```text
codex-fix/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    ├── errores_comunes.md
    ├── plantilla_analisis.md
    └── guia_validacion.md
```

The current repository installation is listed in the status note above. The tree below describes optional packaging, not files that should be assumed present.

## Markdown files

### SKILL.md

Main skill entrypoint. Contains the frontmatter, activation description, objective, workflow, restrictions, and output format.

### references/errores_comunes.md

Catalog of frequent bug patterns and conservative fixes.

### references/plantilla_analisis.md

Reusable diagnostic templates and response examples.

### references/guia_validacion.md

Validation checklist by stack and issue type.

### GUIA_RAPIDA_NEXARTWO.md

Quick usage guide with prompt examples.

## Important packaging note

A separately packaged skill can also provide UI metadata at:

```text
agents/openai.yaml
```

That optional UI metadata is not installed here. Repository use is controlled by `AGENTS.md` and the frontmatter in `SKILL.md`.

## Core rule

First verify. Then diagnose. Then apply the minimum safe change only if the error is confirmed.

## Version fusionada

Esta version integra referencias avanzadas sin duplicar el flujo principal de `SKILL.md`.

Archivos base:

- `SKILL.md`
- `GUIA_RAPIDA_NEXARTWO.md`
- `references/errores_comunes.md`
- `references/plantilla_analisis.md`
- `references/guia_validacion.md`

Archivos avanzados agregados:

- `references/errores_comunes_avanzados.md`
- `references/anti_patterns.md`
- `references/false_positives.md`

Regla de uso: el flujo principal vive en `SKILL.md`; los archivos de `references/` se consultan solo cuando el caso lo requiere.
