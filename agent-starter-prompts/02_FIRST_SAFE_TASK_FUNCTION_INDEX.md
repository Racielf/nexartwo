# Prompt 2 — Primera tarea segura: Function Index

Usa este prompt después de que el agente haya leído las reglas y confirmado contexto.

```txt
TAREA:
Crear el Function Index inicial para NexArtWO.

FASE:
Phase A — Manual QA and Function Map.

OBJETIVO:
Revisar js/app.js y js/projects.js en modo solo lectura y documentar las funciones principales en docs/02-architecture/FUNCTION_INDEX.md.

ARCHIVOS PERMITIDOS PARA MODIFICAR:
- docs/02-architecture/FUNCTION_INDEX.md

ARCHIVOS SOLO LECTURA:
- js/app.js
- js/projects.js
- index.html
- projects.html

ARCHIVOS PROHIBIDOS:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- fórmulas financieras
- registros financieros históricos

REGLAS:
- No modifiques código.
- No hagas refactor.
- No ejecutes SQL.
- No arregles bugs todavía.
- Solo documenta funciones principales, propósito, llamadas y riesgo.

Antes de comenzar, dame un plan de 3 líneas y espera mi GO.
```
