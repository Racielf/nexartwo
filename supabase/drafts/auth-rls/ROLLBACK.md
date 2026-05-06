# Rollback de Auth/RLS Hardening

> ⚠️ DRAFT — Solo ejecutar si las migraciones de RLS causan problemas en producción.

## Escenario: Una Política RLS Bloquea Operaciones Legítimas
Si después de aplicar las migraciones un rol válido no puede acceder a datos que debería ver:

### Paso 1 — Diagnóstico rápido (desde SQL Editor como Superuser)
```sql
-- Ver todas las políticas activas en una tabla
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'project_expenses';
```

### Paso 2 — Desactivar temporalmente RLS en la tabla afectada
```sql
-- Solo en emergencia, reversible:
ALTER TABLE project_expenses DISABLE ROW LEVEL SECURITY;
```
Esto restaura el acceso completo mientras se investiga. No borra ningún dato.

### Paso 3 — Corregir la política problemática
```sql
-- Eliminar policy específica y recrearla corregida:
DROP POLICY IF EXISTS "expenses_update" ON project_expenses;

CREATE POLICY "expenses_update" ON project_expenses
  FOR UPDATE USING (
    auth_role() IN ('owner', 'admin')
    -- [corrección aquí]
  );
```

### Paso 4 — Reactivar RLS
```sql
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
```

---

## Escenario: Rollback Completo de Todas las Políticas de Auth/RLS

Si el hardening completo debe revertirse (ej. se detectó un bug crítico de acceso):

```sql
-- Restaurar estado MVP: deshabilitar RLS en tablas financieras
ALTER TABLE projects               DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses       DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_refunds        DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_disbursements  DISABLE ROW LEVEL SECURITY;

-- Eliminar la función helper
DROP FUNCTION IF EXISTS auth_role();

-- Eliminar tabla de roles (solo si no hay datos aún — verificar antes)
-- DROP TABLE IF EXISTS user_roles;
```

> [!CAUTION]
> NO hacer DROP TABLE user_roles si ya tiene datos de producción. Usar `DISABLE ROW LEVEL SECURITY` es seguro; eliminar la tabla de roles puede causar pérdida de asignaciones.

---

## Lo que NUNCA se debe hacer durante un Rollback de RLS
- No borrar tablas financieras (`project_expenses`, etc.)
- No modificar `amount`, `tax` ni campos históricos
- No intentar "limpiar" registros `cancelled` — deben quedar como historia
- No desactivar los triggers de inmutabilidad para "trabajar más rápido"
