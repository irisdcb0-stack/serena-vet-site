# Integración con Supabase — Serena Vet

Pasos rápidos para crear la base de datos y conectar la web a Supabase:

1. Crear proyecto Supabase
   - Ve a https://app.supabase.com y crea un nuevo proyecto.
   - Anota la `API URL` y la `anon public` key (la encontrarás en Settings → API).

2. Ejecutar esquema
   - Abre el SQL editor del proyecto y ejecuta el contenido de `supabase.sql`.

3. Añadir archivo de configuración
   - Copia `supabase-config.example.js` a `supabase-config.js` y rellena `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

4. Incluir scripts en tu HTML
   - Asegúrate de que `agendar-cita.html` incluye estos scripts antes de `script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js"></script>
<script src="supabase-config.js"></script>
<script src="script.js"></script>
```

5. Probar
   - Abre `agendar-cita.html` en un servidor local (por ejemplo, `Live Server` en VS Code) y prueba agendar una cita.

   - Notificaciones por correo (opcional): puedes usar EmailJS (sin servidor) para que cada vez que alguien solicite una cita te llegue un correo.
      1. Regístrate en https://www.emailjs.com y crea un `service` y `template`.
      2. Copia `emailjs-config.example.js` a `emailjs-config.js` y rellena `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_USER_ID`.
      3. Personaliza el template para mostrar los datos que quieras.

   - Panel administrativo: abre `admin.html` (requiere `supabase-config.js`) para ver/confirmar/cancelar citas. Este panel tiene una protección básica por contraseña; para producción usa autenticación real.

   - Ejemplo rápido para servir localmente:

```bash
python -m http.server 8000
# luego abre http://localhost:8000/agendar-cita.html
```

Notas de seguridad
- No subas `supabase-config.js` con la `anon` key a repositorios públicos si no quieres exponerla. Para producción usa funciones server-side o reglas de seguridad/Row Level Security (RLS).

Soporte
- Si quieres que cree reglas RLS, webhooks o un panel administrativo (Dashboard), dime y lo configuro.
