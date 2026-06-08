const supabaseClientAdmin = window.supabaseClient || null;
const ADMIN_PASSWORD = window.ADMIN_PASSWORD || 'admin123'; // change in admin-config.js in production
let currentAdminStatusFilter = 'all';

function isSupabaseConfiguredAdmin() {
  return window.SUPABASE_CONFIGURED === true && !!supabaseClientAdmin;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString();
}

function getStatusBadge(status) {
  const label = status || 'requested';
  const type = label.toLowerCase();
  return `<span class="status-badge ${type}">${escapeHtml(label)}</span>`;
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

async function fetchAppointmentsAdmin() {
  const root = document.querySelector('#admin-list');
  if (!root) return;
  if (!isSupabaseConfiguredAdmin()) {
    root.textContent = 'Supabase no configurado. Completa supabase-config.js con tus credenciales reales.';
    return;
  }

  root.textContent = 'Cargando...';
  let query = supabaseClientAdmin
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (currentAdminStatusFilter && currentAdminStatusFilter !== 'all') {
    query = query.eq('status', currentAdminStatusFilter);
  }

  const { data, error } = await query;
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
    <thead>
      <tr>
        <th>ID</th>
        <th>Dueño</th>
        <th>Paciente</th>
        <th>Servicio</th>
        <th>Fecha / Hora</th>
        <th>Contacto</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  data.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.id)}</td>
      <td>${escapeHtml(r.owner_name)}<br><small>${escapeHtml(r.email)}</small></td>
      <td>${escapeHtml(r.pet_name)}<br>${escapeHtml(r.pet_type || '')} · ${escapeHtml(r.pet_breed || '')} · ${escapeHtml(r.pet_age || '')}</td>
      <td>${escapeHtml(r.service)}</td>
      <td>${escapeHtml(r.date || '')} ${escapeHtml(r.time || '')}<br><small>${formatDate(r.created_at)}</small></td>
      <td>${escapeHtml(r.phone)}</td>
      <td>${getStatusBadge(r.status)}</td>
      <td>
        <button data-id="${r.id}" data-action="confirm" class="button button-ghost" type="button">Confirmar</button>
        <button data-id="${r.id}" data-action="complete" class="button button-ghost" type="button">Completar</button>
        <button data-id="${r.id}" data-action="cancel" class="button button-danger" type="button">Cancelar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  root.innerHTML = '';
  root.appendChild(table);

  root.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      let newStatus = 'requested';
      if (action === 'confirm') newStatus = 'confirmed';
      if (action === 'complete') newStatus = 'completed';
      if (action === 'cancel') newStatus = 'cancelled';

      btn.disabled = true;
      const { error } = await supabaseClientAdmin.from('appointments').update({ status: newStatus }).eq('id', id);
      if (error) {
        console.error(error);
        alert('No se pudo actualizar la cita en Supabase.');
        btn.disabled = false;
        return;
      }
      fetchAppointmentsAdmin();
    });
  });
}

function attachAdminControls() {
  const refreshButton = document.querySelector('#admin-refresh');
  const filterSelect = document.querySelector('#admin-status-filter');

  if (refreshButton) {
    refreshButton.addEventListener('click', fetchAppointmentsAdmin);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (event) => {
      currentAdminStatusFilter = event.target.value;
      fetchAppointmentsAdmin();
    });
  }
}

document.querySelector('#admin-login').addEventListener('click', () => {
  const pass = document.querySelector('#admin-pass').value;
  if (pass === ADMIN_PASSWORD) {
    document.querySelector('#admin-auth').style.display = 'none';
    document.querySelector('#admin-root').style.display = '';
    attachAdminControls();
    fetchAppointmentsAdmin();
  } else {
    alert('Contraseña incorrecta');
  }
});
