# Prompt 5 — Tarea de código controlada

Usa esto para pedir una mejora o función pequeña.

```txt
TAREA:
[Describe una tarea pequeña y específica]

FASE:
[FASE ACTUAL]

OBJETIVO:
[Qué debe lograr exactamente]

ARCHIVOS PERMITIDOS PARA MODIFICAR:
- [archivo 1]
- [archivo 2]

ARCHIVOS SOLO LECTURA:
- [archivo 1]
- [archivo 2]

ARCHIVOS PROHIBIDOS:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- fórmulas financieras
- registros financieros históricos

CRITERIOS DE ACEPTACIÓN:
- [criterio 1]
- [criterio 2]
- [criterio 3]

QA REQUERIDO:
- La app carga sin errores críticos.
- El flujo modificado funciona.
- Un flujo adyacente sigue funcionando.
- Si hay UI, revisar móvil/tablet.
- No hay cambios fuera del scope.

REGLAS:
- Una tarea solamente.
- Cambios mínimos.
- No refactor amplio.
- No dependencias nuevas sin aprobación.
- No tocar archivos prohibidos.

ANTES DE CODIFICAR:
Dame:
1. plan de 3 líneas
2. archivos que vas a modificar
3. riesgos
4. validación
5. rollback plan

Espera mi GO.
```
