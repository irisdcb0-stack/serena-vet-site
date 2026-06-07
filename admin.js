// Simple admin UI to list and update appointments
const supabaseClientAdmin = window.supabaseClient || null;

const ADMIN_PASSWORD = 'admin123'; // change in admin-config.js in production

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString();
}

async function fetchAppointmentsAdmin() {
  const root = document.querySelector('#admin-list');
  if (!root) return;
  if (!supabaseClientAdmin) {
    root.textContent = 'Supabase no configurado.';
    return;
  }

  root.textContent = 'Cargando...';
  const { data, error } = await supabaseClientAdmin
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    root.textContent = 'Error al cargar.';
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    root.textContent = 'No hay citas.';
    return;
  }

  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead><tr><th>ID</th><th>Nombre</th><th>Pet</th><th>Servicio</th><th>Fecha</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr></thead>
  `;
  const tbody = document.createElement('tbody');

  data.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${escapeHtml(r.owner_name)}</td>
      <td>${escapeHtml(r.pet_name)}</td>
      <td>${escapeHtml(r.service)} ${r.date ? '· ' + r.date : ''} ${r.time || ''}</td>
      <td>${formatDate(r.created_at)}</td>
      <td>${escapeHtml(r.email)}<br>${escapeHtml(r.phone)}</td>
      <td>${escapeHtml(r.status || '')}</td>
      <td>
        <button data-id="${r.id}" data-action="confirm">Confirmar</button>
        <button data-id="${r.id}" data-action="cancel">Cancelar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  root.innerHTML = '';
  root.appendChild(table);

  root.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      btn.disabled = true;
      await supabaseClientAdmin.from('appointments').update({ status: newStatus }).eq('id', id);
      fetchAppointmentsAdmin();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.querySelector('#admin-login').addEventListener('click', () => {
  const pass = document.querySelector('#admin-pass').value;
  if (pass === ADMIN_PASSWORD) {
    document.querySelector('#admin-auth').style.display = 'none';
    document.querySelector('#admin-root').style.display = '';
    fetchAppointmentsAdmin();
  } else {
    alert('Contraseña incorrecta');
  }
});
