# Guía rápida — codex-fix para NexArtWO

## Dónde va esta skill

Copia esta carpeta completa dentro del repo:

```txt
NexArtWO/
└── skills/
    └── codex-fix/
        ├── SKILL.md
        ├── README.md
        ├── GUIA_RAPIDA_NEXARTWO.md
        └── references/
```

## Cuándo usarla

Usa esta skill cuando exista:

- bug
- error de consola
- build roto
- módulo roto
- error de JavaScript
- error de Supabase
- error de frontend/backend
- comportamiento inesperado

## Prompt recomendado

```txt
Hay un bug en NexArtWO.

Antes de modificar código, lee:

1. AGENTS.md
2. memory/PROJECT_STATE.md
3. memory/CURRENT_TASK.md
4. docs/00-governance/ERROR_RECOVERY.md
5. docs/00-governance/REGRESSION_PREVENTION.md
6. skills/codex-fix/SKILL.md

No edites archivos todavía.

Primero diagnostica:
- problema
- causa probable
- archivo/función afectada
- cambio mínimo recomendado
- validación
- riesgo

Espera mi GO antes de modificar código.
```

## Regla principal

Primero verificar.  
Luego diagnosticar.  
Después aplicar el cambio mínimo seguro, solo si el error está confirmado.
