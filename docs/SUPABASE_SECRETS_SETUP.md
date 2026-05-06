# Guía de Configuración de GitHub Secrets para Supabase

El workflow de CI/CD `Supabase Financial QA` y los despliegues de base de datos dependen de tres variables secretas en tu repositorio. Estas credenciales otorgan permisos para interactuar con la nube de Supabase sin necesidad de exponer credenciales locales en texto plano ni compartir cuentas.

## Dónde Configurar los Secretos
1. Ve a tu repositorio en GitHub (`Racielf/nexartwo`).
2. Haz clic en **Settings** > **Secrets and variables** > **Actions**.
3. Añade los siguientes `New repository secret` con exactamente los nombres indicados abajo.

## Secretos Requeridos

### 1. `SUPABASE_ACCESS_TOKEN`
- **¿Qué es?:** Un token de autenticación de la CLI de Supabase que permite a las GitHub Actions autenticarse bajo tu cuenta en los servidores de Supabase de manera programática.
- **¿Dónde obtenerlo?:**
  1. Inicia sesión en tu Supabase Dashboard.
  2. Haz clic en tu cuenta/avatar y ve a **Access Tokens** (`https://supabase.com/dashboard/account/tokens`).
  3. Genera un nuevo token personal, dale nombre (ej. "GitHub Actions QA"), cópialo y pégalo como Secret en GitHub. No compartas ni commitees este token.

### 2. `SUPABASE_PROJECT_REF`
- **¿Qué es?:** Es el identificador único (ID Público) de tu proyecto específico en Supabase.
- **¿Dónde obtenerlo?:**
  - Ve a la URL de tu proyecto en Supabase (ej: `https://supabase.com/dashboard/project/abcdefghijklmnopq`).
  - La cadena alfanumérica de letras (en el ejemplo: `abcdefghijklmnopq`) es tu Project Ref. 
  - *No es confidencial, pero se guarda en Secrets para mayor versatilidad.*

### 3. `SUPABASE_DB_PASSWORD`
- **¿Qué es?:** Es la contraseña maestra del servicio de base de datos (`postgres`) en tu proyecto.
- **¿Para qué se usa?:** Es esencial para ejecutar comandos remotos, migraciones (db push) y especialmente el testing vía `psql` para validar el modelo de finanzas.
- **¿Dónde obtenerlo?:** Es la contraseña que definiste manualmente al crear el proyecto en la plataforma por primera vez. Si no la recuerdas, debes resetearla desde los Database Settings de tu Supabase Dashboard.

---
> [!WARNING]
> Nunca inyectes Service Role Keys ni contraseñas hardcodeadas directamente en los archivos `.yml`. Si necesitas dar acceso a un colaborador, haz que usen el CLI pero sin darles la Master Password, o simplemente confía en que las Actions harán la validación por ellos de forma oculta.
