Despliegue a GitHub + Netlify y configuración de Supabase

Pasos que yo preparé en el repo (archivos ya creados):
- `.github/workflows/deploy-netlify.yml` — workflow para desplegar a Netlify cuando `main` reciba push.
- `.gitignore` — excluye `supabase-config.js` y `emailjs-config.js`.
- `supabase.sql` — esquema extendido con `services`, `availability`, `prices`, `appointments`.

Pasos que debes completar (más seguro):

1) Crear repo en GitHub y subir el código
- En tu máquina, desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit: Serena Vet site + Supabase integration"
git branch -M main
# sustituye OWNER y REPO
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

2) Añadir Secrets en GitHub (Settings → Secrets and variables → Actions)
- `NETLIFY_AUTH_TOKEN`: token personal de Netlify (User settings → Applications → Personal access tokens)
- `NETLIFY_SITE_ID`: identificador del sitio en Netlify (si ya existe)
- `SUPABASE_URL` y `SUPABASE_ANON_KEY` (si quieres que el sitio pueda leer/insertar)
- `SUPABASE_SERVICE_ROLE_KEY` (solo si vas a ejecutar tareas administrativas en CI)
- `SENDGRID_API_KEY` (si implementas Edge Function para emails)

3) Crear proyecto en Supabase y ejecutar el esquema
- Ve a https://app.supabase.com → crea un proyecto.
- Abre SQL Editor → pega y ejecuta `supabase.sql`.
	- Después ejecuta `seeds.sql` para poblar `services` y `prices` con valores base.
	- Para seguridad, ejecuta `rls_policies.sql` para habilitar Row Level Security y aplicar políticas.

Creación de usuario admin (rápido):
- En Supabase, abre Authentication → Users → Add user. Crea un usuario admin con el email que quieras.
- Para otorgar claims personalizados (p.ej. is_admin), en Supabase Dashboard → Authentication → Settings → JWT Custom Claims (o usar una función para asignar). Alternativamente, administra roles desde tu backend.

Nota sobre RLS y administración
- Las políticas en `rls_policies.sql` son ejemplos. Revisa y adapta las condiciones a tu modelo de autenticación (p.ej. usar `is_admin` claim).


4) Netlify
- Conecta Netlify con tu repo (o usa el token y site id para que el GitHub Action despliegue).
- El workflow ya subirá la carpeta raíz como `publish-dir`.

5) Configuraciones adicionales
- No subas `supabase-config.js` ni `emailjs-config.js` con claves; usa Secrets.
- Si quieres, crea una Edge Function en Supabase para enviar emails con SendGrid y guarda `SENDGRID_API_KEY` como Secret.

Si quieres, puedo:
- crear un script para poblar `services` y `prices` con los valores base que me diste,
- añadir una Edge Function de ejemplo para enviar emails con SendGrid,
- o generar los pasos para que me des acceso y yo haga el push y configuración (pégame PAT y tokens).

Dime cuál prefieres y continúo.
