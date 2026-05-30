# Prompt 3 — QA solamente, sin tocar código

Usa esto cuando quieras que el agente revise y reporte, pero no arregle nada.

```txt
TAREA:
Hacer QA manual/documental del módulo [NOMBRE DEL MÓDULO].

FASE:
[FASE ACTUAL]

OBJETIVO:
Revisar el comportamiento actual y crear un reporte de bugs, riesgos y pruebas necesarias sin modificar código.

ARCHIVOS PERMITIDOS PARA MODIFICAR:
- docs/05-qa/[NOMBRE_DEL_REPORTE].md
- memory/KNOWN_ISSUES.md, solo si encuentras bugs confirmados

ARCHIVOS SOLO LECTURA:
- index.html
- projects.html
- js/app.js
- js/projects.js
- css/styles.css

ARCHIVOS PROHIBIDOS:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- fórmulas financieras

REGLAS:
- No modifiques código.
- No ejecutes SQL.
- No hagas refactor.
- No corrijas bugs.
- Clasifica bugs como P1, P2 o P3.
- Incluye pasos para reproducir cada bug.

Antes de comenzar, dame un plan de 3 líneas y espera mi GO.
```
