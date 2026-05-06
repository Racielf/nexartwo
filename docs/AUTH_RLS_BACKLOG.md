# Backlog de Seguridad: Roles y RLS para NexArtWO

Actualmente, las tablas del Módulo Financiero cuentan con Row Level Security (RLS) habilitado, pero configurado con políticas `FOR ALL USING (true)`. Esta estructura asume un entorno "Single-Tenant MVP" en el que todos los usuarios tienen el mismo nivel de confianza interno y la aplicación actúa como administrador.

A medida que NexArtWO expanda sus usuarios (ej: Subcontratistas, Contadores, Agentes Vendedores), estas políticas deben endurecerse.

## Tareas Prioritarias (Siguientes Fases)
- [ ] **Desactivar Políticas Públicas:** Eliminar `USING (true)` y reemplazarlas con validaciones de JWT o roles (e.g. `auth.uid() = user_id`).
- [ ] **Bloqueo Selectivo por Rol:** Permitir inserciones (Crear Gastos/Desembolsos) a los perfiles base (Field Users), pero restringir la edición de columnas críticas y del campo `status` estrictamente a administradores.
- [ ] **Múltiples Aprobadores:** Crear un flujo lógico en el backend (Edge Function o Trigger) para la transición de estado: `pending` -> `manager_approved` -> `paid`.
- [ ] **Vista Internal/Admin:** Añadir flag de roles a la vista `project_financial_summaries`. Un contratista de campo no debería poder consultar las ganancias `profit` de la compañía. Solo un perfil `admin` debería poder instanciar un SELECT en la tabla.
