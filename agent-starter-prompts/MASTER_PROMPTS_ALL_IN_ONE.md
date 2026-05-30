# NexArtWO — Master Prompts All In One

Este archivo junta los prompts principales.

---

## 1. Iniciar nueva sesión

```txt
Iniciando nueva sesión de desarrollo para NexArtWO.

Antes de hacer cualquier modificación, lee estos archivos:

1. AGENTS.md
2. CLAUDE.md, si estás usando Claude Code
3. memory/PROJECT_STATE.md
4. memory/CURRENT_TASK.md
5. docs/00-governance/STOP_CONDITIONS.md
6. docs/00-governance/ERROR_RECOVERY.md
7. docs/02-architecture/JAVASCRIPT_GLOBALS_AND_STATE_CONTRACT.md

No modifiques archivos todavía.
No escribas código todavía.
No corras comandos todavía.

Primero confírmame:

1. cuál es la fase actual del proyecto
2. cuál es la tarea activa
3. qué archivos puedes tocar
4. qué archivos están prohibidos
5. cuáles son las reglas estrictas para Vanilla JS
6. cuáles son las stop conditions
7. qué necesitas de mí antes de escribir código

No escribas código hasta que yo diga GO.
```

---

## 2. Primera tarea segura

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
No modifiques código.
No hagas refactor.
No ejecutes SQL.
No arregles bugs todavía.

Antes de comenzar, dame un plan de 3 líneas y espera mi GO.
```

---

## 3. Arreglar bug

```txt
TAREA:
Arreglar un solo bug específico en NexArtWO.

BUG:
[DESCRIBE AQUÍ EL BUG EXACTO]

PASOS PARA REPRODUCIR:
1. [paso 1]
2. [paso 2]
3. [paso 3]

RESULTADO ESPERADO:
[qué debería pasar]

RESULTADO ACTUAL:
[qué está pasando]

ARCHIVOS PERMITIDOS PARA MODIFICAR:
- [archivo exacto 1]

ARCHIVOS PROHIBIDOS:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- fórmulas financieras
- registros financieros históricos

ANTES DE CODIFICAR:
Dame:
1. causa probable
2. archivo y función que vas a tocar
3. plan de corrección mínimo
4. riesgo de regresión
5. cómo vas a validar

Espera mi GO.
```

---

## 4. Si algo se rompe

```txt
Stop.

Estamos en protocolo de recuperación.

Lee:
- docs/00-governance/ERROR_RECOVERY.md
- docs/00-governance/REGRESSION_PREVENTION.md
- memory/BUG_FIX_LOG.md

No agregues features.
No refactorices.
No toques SQL.
No toques Supabase.

Dime:
1. error exacto
2. último archivo modificado
3. función probable afectada
4. plan mínimo para revertir o corregir
5. riesgo de regresión

No modifiques nada hasta mi GO.
```
