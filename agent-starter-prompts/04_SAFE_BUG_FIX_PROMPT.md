# Prompt 4 — Arreglar un bug de forma segura

Usa esto cuando ya sabes qué bug quieres arreglar.

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

FASE:
[FASE ACTUAL]

ARCHIVOS PERMITIDOS PARA MODIFICAR:
- [archivo exacto 1]
- [archivo exacto 2]

ARCHIVOS SOLO LECTURA:
- [archivos que puede leer pero no modificar]

ARCHIVOS PROHIBIDOS:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- fórmulas financieras
- registros financieros históricos

REGLAS:
- Arregla solo este bug.
- No hagas refactor.
- No arregles bugs relacionados.
- No cambies estilos si el bug es de lógica.
- No cambies lógica si el bug es visual.
- No ejecutes SQL.
- No modifiques archivos fuera de la lista permitida.

ANTES DE CODIFICAR:
Dame:
1. causa probable
2. archivo y función que vas a tocar
3. plan de corrección mínimo
4. riesgo de regresión
5. cómo vas a validar

Espera mi GO antes de modificar.
```
