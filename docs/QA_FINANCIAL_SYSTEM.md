# QA: Financial System (Smoke Test)

Este documento describe el proceso de QA automatizado para el Módulo Financiero de NexArtWO.

## ¿Qué valida el Smoke Test?
El script `qa/financial_system_smoke_test.sql` ejecuta una validación integral en un entorno completamente seguro y aislado (usando una transacción con `ROLLBACK` al final para no afectar datos reales).

Valida específicamente:
1. **Creación de Entidades**: Creación de un proyecto y registros financieros (Expense, Refund, Disbursement) en estado `pending`.
2. **Ciclo de Aprobación**: Transición exitosa a `approved` y `paid`.
3. **Cálculos Matemáticos SQL**: Verifica que la vista `project_financial_summaries` calcule de manera perfecta:
   - `cost_basis`
   - `cash_invested`
   - `net_expense_cost`
   - `total_disbursements`
   - `net_proceeds`
   - `profit` (Opción A: excluye disbursements)
   - `project_cash_position`
4. **Inmutabilidad (Reglas 9 y 14)**: Atrapa explícitamente excepciones para garantizar que los triggers bloqueen cualquier intento de `DELETE`, así como modificaciones a `amount` y `tax`. Confirma que el `UPDATE` de status sigue permitido.

## Ejecución Automatizada
Este test está configurado para ejecutarse vía GitHub Actions a través del workflow `Supabase Financial QA`. 
Para ejecutarlo, debes tener configurados los siguientes secretos en tu repositorio:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

El workflow fallará automáticamente si alguna aserción del test retorna `FAIL`.

## Ejecución Manual
Si necesitas correr este test manualmente contra la base de datos de Supabase, puedes hacerlo desde el SQL Editor de Supabase:
1. Abre el archivo `qa/financial_system_smoke_test.sql`.
2. Copia todo su contenido.
3. Pégalo en el SQL Editor de Supabase y ejecútalo.
4. Verás una tabla de resultados en consola con las columnas: `test_name`, `expected`, `actual`, `result`.

## Interpretación de Resultados
- **PASS:** El sistema se comporta exactamente según las reglas matemáticas y lógicas definidas.
- **FAIL:** Hay una divergencia entre el valor esperado (o comportamiento del trigger) y la respuesta de la base de datos.

### ¿Qué hacer si falla?
1. Revisa el valor de la columna `actual` frente a `expected`.
2. Si falla un cálculo, NO modifiques el JS del frontend. Modifica la vista `project_financial_summaries` en `sql/003_projects_financial_system.sql`, crea la migración respectiva y aplica el cambio a Supabase.
3. Si falla la inmutabilidad, revisa los triggers y las policies.

### ⚠️ QUÉ NO SE DEBE TOCAR
- **La fórmula de `profit`:** Ha sido definida a nivel de negocio. No debe restar *Disbursements*.
- **La inmutabilidad:** No agregues políticas o permisos que permitan hacer un "hard delete" a tablas financieras bajo ninguna circunstancia.
