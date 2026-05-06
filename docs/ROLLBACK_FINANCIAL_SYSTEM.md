# Estrategia de Rollback: NexArtWO Financial System

Ante la existencia de un fallo crítico en producción después de desplegar la integración financiera, debes ejecutar este protocolo de rollback. Debido a las leyes de inmutabilidad financiera aplicadas a este sistema, un "rollback completo destructivo" (borrar datos) no es viable ni legalmente correcto.

## 1. Contención Front-End (Reversión de Interfaz)
La forma más rápida y segura de apagar un fuego sin riesgo a corromper datos es desconectar la interfaz financiera. 

- **Git Revert:** Puedes hacer un `git revert` del commit de integración de Fase 2 en `projects.html` y `js/projects.js`.
- **Apagado en Frío (Killswitch):** En el archivo `js/supabase.js`, puedes forzar que la conexión retorne falso:
  ```javascript
  function isSupabaseReady() {
    return false; // FORZADO A OFFLINE MODE TEMPORALMENTE
  }
  ```
Esto obliga a la aplicación a usar `localStorage` (sin funcionalidad financiera en tiempo real) aislando la base de datos instantáneamente.

## 2. Reversión de la Base de Datos (SQL Rollback)

### QUÉ SE PUEDE REVERTIR:
- **La Vista de KPIs (`project_financial_summaries`):** Si hay un error matemático, simplemente aplica una nueva migración con un `CREATE OR REPLACE VIEW` usando la lógica de negocio antigua. Al ser una vista, no destruye ningún dato subyacente.
- **Triggers y Procedimientos:** Se pueden ajustar o desactivar si están causando problemas graves en la captura de registros.

### QUÉ **NO** DEBE BORRARSE BAJO NINGUNA CIRCUNSTANCIA:
- Tablas `projects`, `project_expenses`, `project_refunds`, `project_disbursements`.
- Secuencias como `project_seq`.
- Columnas transaccionales base (`amount`, `tax`, `receipt_date`).

> [!CAUTION]
> **Peligro de Auditoría.** Si por un bug el sistema grabó 100 gastos incorrectos, el protocolo contable dicta que NO debes borrarlos de la tabla (hard-delete). Debes ejecutar un script SQL controlado (o hacerlo manualmente) que marque todos esos registros como `status = 'cancelled'`. La historia inmutable siempre debe conservarse.
