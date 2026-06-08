const body = document.body;
const currentPage = body.dataset.page;
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const pageLinks = document.querySelectorAll("[data-page-link]");
const yearNodes = document.querySelectorAll("[data-year]");
const appointmentForm = document.querySelector("#appointment-form");
const appointmentMessage = document.querySelector("#form-message");
const appointmentDateInput = document.querySelector('#date');
const appointmentTimeSelect = document.querySelector('#time');
const timeHelper = document.querySelector('#time-helper');
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterMessage = document.querySelector("#newsletter-message");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clinicHours = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00'
];

// Supabase client (if configured via supabase-config.js)
const supabaseClient = window.supabaseClient || null;

function isSupabaseConfigured() {
  return (
    typeof window.SUPABASE_CONFIGURED !== 'undefined' &&
    window.SUPABASE_CONFIGURED === true
  );
}

async function loadAppointments() {
  const listNode = document.querySelector('#appointments-list');
  if (!listNode) return;

  if (!supabaseClient || !isSupabaseConfigured()) {
    listNode.textContent = 'Supabase no configurado o falta la configuración correcta. Completa supabase-config.js con tu URL y anon key.';
    return;
  }

  listNode.textContent = 'Cargando...';
  const { data, error } = await supabaseClient
    .from('appointments')
    .select('id, service, date, time, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    listNode.textContent = 'Error al cargar citas.';
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    listNode.textContent = 'No hay solicitudes recientes.';
    return;
  }

  listNode.innerHTML = '';
  data.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'appointment-item';
    const localDate = row.date ? new Date(row.date).toLocaleDateString('es-BO', { day: 'numeric', month: 'long' }) : '';
    item.innerHTML = `
      <strong>${escapeHtml(row.service || 'Cita')}</strong>
      <div>${localDate} ${escapeHtml(row.time || '')}</div>
      <div class="small">Estado: ${escapeHtml(row.status || 'requested')}</div>
    `;
    listNode.appendChild(item);
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

function isEmailJsConfigured() {
  return (
    window.emailjs &&
    window.emailConfig &&
    window.emailConfig.publicKey &&
    window.emailConfig.service &&
    window.emailConfig.template &&
    window.emailConfig.receiver &&
    !window.emailConfig.publicKey.includes('your_') &&
    !window.emailConfig.service.includes('your_') &&
    !window.emailConfig.template.includes('your_') &&
    !window.emailConfig.receiver.includes('tu-correo')
  );
}

function setTimeOptions(bookedTimes = []) {
  if (!appointmentTimeSelect) return;
  const selectedTime = appointmentTimeSelect.value;
  appointmentTimeSelect.innerHTML = '<option value="">Selecciona un turno</option>';
  clinicHours.forEach((time) => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    if (bookedTimes.includes(time)) {
      option.disabled = true;
      option.textContent = `${time} — Ocupado`;
    }
    appointmentTimeSelect.appendChild(option);
  });
  if (timeHelper) {
    if (!appointmentDateInput?.value) {
      timeHelper.textContent = 'Selecciona una fecha para ver los horarios disponibles.';
    } else if (bookedTimes.length === 0) {
      timeHelper.textContent = 'Todos los horarios están disponibles para esta fecha.';
    } else {
      timeHelper.textContent = `Horarios ocupados: ${bookedTimes.join(', ')}.`;
    }
  }
  if (selectedTime && bookedTimes.includes(selectedTime)) {
    appointmentTimeSelect.value = '';
  }
}

async function loadBookedTimesForDate(dateValue) {
  if (!supabaseClient || !isSupabaseConfigured() || !dateValue) {
    setTimeOptions([]);
    return;
  }

  const { data, error } = await supabaseClient
    .from('appointments')
    .select('time')
    .eq('date', dateValue)
    .order('time', { ascending: true });

  if (error) {
    console.error('Error cargando horarios ocupados:', error);
    if (timeHelper) {
      timeHelper.textContent = 'No se pudieron cargar horarios. Intenta más tarde.';
    }
    setTimeOptions([]);
    return;
  }

  const bookedTimes = (data || []).map((appt) => appt.time).filter(Boolean);
  setTimeOptions(bookedTimes);
}

function validateAppointmentForm() {
  const errors = [];
  if (!appointmentForm) return errors;
  const requiredFields = [
    { selector: '#owner-name', message: 'Ingresa tu nombre completo.' },
    { selector: '#email', message: 'Ingresa un correo electrónico válido.' },
    { selector: '#phone', message: 'Ingresa un teléfono de contacto.' },
    { selector: '#pet-name', message: 'Ingresa el nombre de la mascota.' },
    { selector: '#pet-type', message: 'Selecciona la especie de tu mascota.' },
    { selector: '#pet-breed', message: 'Ingresa la raza de la mascota.' },
    { selector: '#pet-age', message: 'Ingresa la edad de la mascota.' },
    { selector: '#service', message: 'Selecciona un servicio.' },
    { selector: '#date', message: 'Selecciona una fecha.' },
    { selector: '#time', message: 'Selecciona una hora disponible.' },
  ];

  requiredFields.forEach((field) => {
    const el = appointmentForm.querySelector(field.selector);
    if (!el || !el.value || String(el.value).trim() === '') {
      errors.push(field.message);
    }
  });

  if (appointmentDateInput && appointmentDateInput.value) {
    const selected = new Date(appointmentDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.push('La fecha debe ser hoy o posterior.');
    }
  }

  return errors;
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(date);
}

function getDayLabel(date) {
  return new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startWeekDay; i += 1) {
    days.push(null);
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    days.push(new Date(year, month, date));
  }

  return days;
}

function getWeekStart(date) {
  const cloned = new Date(date);
  const day = cloned.getDay();
  cloned.setDate(cloned.getDate() - day);
  return cloned;
}

function getWeekDates(date) {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function formatSlotList(appointments) {
  if (!appointments.length) return 'Libre';
  const times = appointments.map((appt) => appt.time || 'Sin hora');
  return [...new Set(times)].join(' · ');
}

let calendarView = 'month';
let selectedDate = new Date();
let calendarDate = new Date(selectedDate);

function updateAppointmentDateInput(date) {
  const dateInput = document.querySelector('#date');
  if (dateInput) {
    dateInput.value = new Date(date).toISOString().split('T')[0];
  }
}

function syncCalendarDate(date) {
  const nextDate = new Date(date);
  selectedDate = nextDate;
  calendarDate = new Date(nextDate);
  updateAppointmentDateInput(nextDate);
}

function setCalendarView(view, referenceDate = calendarDate) {
  calendarView = view;
  syncCalendarDate(referenceDate);
  const buttons = document.querySelectorAll('.calendar-view-toggle button');
  buttons.forEach((button) => {
    button.classList.toggle('is-active', button.id === `view-${view}`);
  });
  const description = document.querySelector('#calendar-description');
  if (description) {
    if (view === 'month') {
      description.textContent = 'Vista mensual: ve los días con citas y haz clic para inspeccionar.';
    } else if (view === 'week') {
      description.textContent = 'Vista semanal: consulta cuántas citas hay cada día de la semana.';
    } else {
      description.textContent = 'Vista diaria: revisa horarios ocupados y espacios libres para ese día.';
    }
  }
  loadCalendar(calendarDate);
}

function getRangeForView(date) {
  if (calendarView === 'week') {
    const weekDates = getWeekDates(date);
    return {
      start: weekDates[0].toISOString().split('T')[0],
      end: weekDates[6].toISOString().split('T')[0],
    };
  }

  if (calendarView === 'day') {
    const iso = date.toISOString().split('T')[0];
    return { start: iso, end: iso };
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: monthStart.toISOString().split('T')[0],
    end: monthEnd.toISOString().split('T')[0],
  };
}

function renderDayDetails(date, appointments) {
  const detail = document.querySelector('#calendar-detail');
  if (!detail) return;
  const dayLabel = getDayLabel(date);
  const appointmentsByTime = clinicHours.map((time) => {
    const appointment = appointments.find((appt) => appt.time === time);
    return {
      time,
      status: appointment ? 'Reservado' : 'Disponible',
      details: appointment ? `${escapeHtml(appointment.owner_name)} (${escapeHtml(appointment.pet_name)}) — ${escapeHtml(appointment.service)}` : 'Horario libre',
    };
  });

  const appointmentItems = appointmentsByTime
    .map((slot) => `
      <li>
        <strong>${escapeHtml(slot.time)}</strong>: ${slot.status} — ${slot.details}
      </li>`)
    .join('');

  detail.innerHTML = `
    <div class="calendar-detail-card">
      <strong>${dayLabel}</strong>
      <p>${appointments.length ? `Hay ${appointments.length} cita${appointments.length === 1 ? '' : 's'} este día.` : 'No hay citas en este día.'}</p>
      <ul>${appointmentItems}</ul>
    </div>
  `;
}

function renderCalendar(appointments, currentDate) {
  const grid = document.querySelector('#calendar-grid');
  const monthLabel = document.querySelector('#calendar-month');
  const summary = document.querySelector('#calendar-summary');
  if (!grid || !monthLabel || !summary) return;

  grid.innerHTML = '';
  if (calendarView === 'month') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthLabel.textContent = getMonthLabel(currentDate);
    const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    weekDays.forEach((day) => {
      const headerCell = document.createElement('div');
      headerCell.className = 'calendar-cell calendar-header-cell';
      headerCell.textContent = day;
      headerCell.style.fontWeight = '700';
      headerCell.style.background = 'transparent';
      headerCell.style.border = 'none';
      headerCell.style.cursor = 'default';
      grid.appendChild(headerCell);
    });

    grid.style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))';
    const days = buildCalendarDays(year, month);
    const today = new Date();
    const appointmentsByDate = appointments.reduce((acc, appointment) => {
      const key = appointment.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(appointment);
      return acc;
    }, {});

    days.forEach((date) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-cell';
      if (!date) {
        cell.classList.add('calendar-empty');
        cell.disabled = true;
        cell.style.background = 'transparent';
        cell.style.border = 'none';
        cell.style.cursor = 'default';
        grid.appendChild(cell);
        return;
      }

      const isoDate = date.toISOString().split('T')[0];
      const dayCount = appointmentsByDate[isoDate] ? appointmentsByDate[isoDate].length : 0;
      const bookedAppointments = appointmentsByDate[isoDate] || [];

      cell.innerHTML = `
        <span class="day-number">${date.getDate()}</span>
        <span class="slot-count">${dayCount ? `${dayCount} cita${dayCount === 1 ? '' : 's'}` : 'Libre'}</span>
        ${dayCount ? `<span class="slot-count">${formatSlotList(bookedAppointments)}</span>` : ''}
      `;

      if (date.toDateString() === today.toDateString()) {
        cell.classList.add('calendar-today');
      }
      if (dayCount > 0) {
        cell.classList.add('calendar-booked');
      }

      cell.addEventListener('click', () => {
        setCalendarView('day', date);
      });

      grid.appendChild(cell);
    });

    summary.textContent = `Hay ${appointments.length} cita${appointments.length === 1 ? '' : 's'} agendada${appointments.length === 1 ? '' : 's'} este mes.`;
    const detail = document.querySelector('#calendar-detail');
    if (detail) {
      detail.innerHTML = '';
    }
    return;
  }

  if (calendarView === 'week') {
    const weekDates = getWeekDates(currentDate);
    monthLabel.textContent = `Semana de ${new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long' }).format(weekDates[0])}`;
    grid.style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))';
    const appointmentsByDate = appointments.reduce((acc, appointment) => {
      const key = appointment.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(appointment);
      return acc;
    }, {});

    weekDates.forEach((date) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-cell';
      const isoDate = date.toISOString().split('T')[0];
      const dayCount = appointmentsByDate[isoDate] ? appointmentsByDate[isoDate].length : 0;
      const bookedAppointments = appointmentsByDate[isoDate] || [];

      cell.innerHTML = `
        <span class="day-number">${new Intl.DateTimeFormat('es-BO', { weekday: 'short' }).format(date)}</span>
        <span class="slot-count">${date.getDate()}</span>
        <span class="slot-count">${dayCount ? `${dayCount} cita${dayCount === 1 ? '' : 's'}` : 'Libre'}</span>
        ${dayCount ? `<span class="slot-count">${formatSlotList(bookedAppointments)}</span>` : ''}
      `;

      if (date.toDateString() === new Date().toDateString()) {
        cell.classList.add('calendar-today');
      }
      if (dayCount > 0) {
        cell.classList.add('calendar-booked');
      }

      cell.addEventListener('click', () => {
        setCalendarView('day', date);
      });

      grid.appendChild(cell);
    });

    summary.textContent = `Esta semana hay ${appointments.length} cita${appointments.length === 1 ? '' : 's'} programada${appointments.length === 1 ? '' : 's'}.`;
    const detail = document.querySelector('#calendar-detail');
    if (detail) {
      detail.innerHTML = '';
    }
    return;
  }

  if (calendarView === 'day') {
    monthLabel.textContent = getDayLabel(currentDate);
    grid.style.gridTemplateColumns = '1fr';

    const appointmentsByTime = clinicHours.map((time) => ({
      time,
      appointment: appointments.find((appt) => appt.time === time) || null,
    }));

    appointmentsByTime.forEach(({ time, appointment }) => {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell calendar-day-cell';
      cell.innerHTML = `
        <div class="slot-header">
          <strong>${escapeHtml(time)}</strong>
          <span>${appointment ? 'Reservado' : 'Disponible'}</span>
        </div>
        ${appointment ? `
          <div class="slot-entry">
            <strong>${escapeHtml(appointment.owner_name)}</strong> — ${escapeHtml(appointment.pet_name)}<br>
            ${escapeHtml(appointment.service)} · ${escapeHtml(appointment.status || 'requested')}<br>
            ${escapeHtml(appointment.email)} · ${escapeHtml(appointment.phone)}
          </div>
        ` : '<div class="slot-entry">Horario libre</div>'}
      `;
      if (!appointment) {
        cell.classList.add('calendar-free-slot');
      }
      grid.appendChild(cell);
    });

    summary.textContent = `Este día tiene ${appointments.length} cita${appointments.length === 1 ? '' : 's'}.`;
    renderDayDetails(currentDate, appointments);
    return;
  }
}

async function loadCalendar(currentDate = new Date()) {
  const grid = document.querySelector('#calendar-grid');
  const summary = document.querySelector('#calendar-summary');
  const detail = document.querySelector('#calendar-detail');
  if (!summary || !grid) return;
  if (!supabaseClient || !isSupabaseConfigured()) {
    const message = 'No se puede cargar el calendario: configura Supabase primero.';
    summary.textContent = message;
    grid.innerHTML = `<div class="calendar-error">${message}</div>`;
    if (detail) detail.innerHTML = '';
    return;
  }

  const range = getRangeForView(currentDate);

  const { data, error } = await supabaseClient
    .from('appointments')
    .select('id, date, time, service, status, created_at')
    .gte('date', range.start)
    .lte('date', range.end)
    .order('date', { ascending: true });

  if (error) {
    const message = 'Error al cargar el calendario: revisa la conexión con Supabase.';
    summary.textContent = message;
    const grid = document.querySelector('#calendar-grid');
    if (grid) grid.innerHTML = `<div class="calendar-error">${message}</div>`;
    console.error(error);
    return;
  }

  renderCalendar(data || [], currentDate);
}

function attachCalendarControls() {
  const prevButton = document.querySelector('#calendar-prev');
  const nextButton = document.querySelector('#calendar-next');
  const monthButton = document.querySelector('#view-month');
  const weekButton = document.querySelector('#view-week');
  const dayButton = document.querySelector('#view-day');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (calendarView === 'week') {
        calendarDate.setDate(calendarDate.getDate() - 7);
      } else if (calendarView === 'day') {
        calendarDate.setDate(calendarDate.getDate() - 1);
      } else {
        calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
      }
      selectedDate = new Date(calendarDate);
      loadCalendar(calendarDate);
    });
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (calendarView === 'week') {
        calendarDate.setDate(calendarDate.getDate() + 7);
      } else if (calendarView === 'day') {
        calendarDate.setDate(calendarDate.getDate() + 1);
      } else {
        calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
      }
      selectedDate = new Date(calendarDate);
      loadCalendar(calendarDate);
    });
  }
  if (monthButton) {
    monthButton.addEventListener('click', () => setCalendarView('month', calendarDate));
  }
  if (weekButton) {
    weekButton.addEventListener('click', () => setCalendarView('week', calendarDate));
  }
  if (dayButton) {
    dayButton.addEventListener('click', () => setCalendarView('day', calendarDate));
  }
}

const navEntry = performance.getEntriesByType("navigation")[0];
const navType = navEntry ? navEntry.type : "navigate";
const hasVisitedSite = sessionStorage.getItem("serena-vet-visited") === "true";
const shouldShowLoader = !prefersReducedMotion && (!hasVisitedSite || navType === "reload");

const loader = document.createElement("div");
loader.className = "page-loader";
loader.innerHTML = `
  <div class="loader-mark">
    <div class="loader-ring" aria-hidden="true"></div>
    <strong>Serena Vet</strong>
    <span>Cargando experiencia clínica...</span>
  </div>
`;

document.body.append(loader);

pageLinks.forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add("is-active");
  }
});

yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const hideLoader = () => {
  loader.classList.add("is-hidden");
  document.body.classList.add("is-loaded");
  sessionStorage.setItem("serena-vet-visited", "true");
};

if (!shouldShowLoader) {
  loader.classList.add("is-hidden");
  document.body.classList.add("is-loaded");
  sessionStorage.setItem("serena-vet-visited", "true");
} else if (prefersReducedMotion) {
  hideLoader();
} else {
  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 700);
  });
}

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (prefersReducedMotion) {
      return;
    }

    link.classList.add("is-clicked");

    window.setTimeout(() => {
      link.classList.remove("is-clicked");
    }, 320);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (appointmentForm && appointmentMessage) {
  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = appointmentForm.querySelector("button[type='submit']");
    if (button) {
      button.disabled = true;
      button.textContent = "Enviando solicitud...";
    }

    const validationErrors = validateAppointmentForm();
    if (validationErrors.length) {
      appointmentMessage.textContent = validationErrors[0];
      if (button) {
        button.disabled = false;
        button.textContent = "Confirmar solicitud de cita";
      }
      return;
    }

    const payload = {
      owner_name: appointmentForm.querySelector('#owner-name')?.value || null,
      email: appointmentForm.querySelector('#email')?.value || null,
      phone: appointmentForm.querySelector('#phone')?.value || null,
      pet_name: appointmentForm.querySelector('#pet-name')?.value || null,
      pet_type: appointmentForm.querySelector('#pet-type')?.value || null,
      pet_breed: appointmentForm.querySelector('#pet-breed')?.value || null,
      pet_age: appointmentForm.querySelector('#pet-age')?.value || null,
      service: appointmentForm.querySelector('#service')?.value || null,
      date: appointmentForm.querySelector('#date')?.value || null,
      time: appointmentForm.querySelector('#time')?.value || null,
      notes: appointmentForm.querySelector('#notes')?.value || null,
      status: 'requested',
    };

    try {
      if (appointmentDateInput?.value) {
        await loadBookedTimesForDate(appointmentDateInput.value);
      }

      if (supabaseClient && isSupabaseConfigured()) {
        const conflictCheck = await supabaseClient
          .from('appointments')
          .select('id')
          .eq('date', payload.date)
          .eq('time', payload.time)
          .maybeSingle();

        if (conflictCheck.data) {
          throw new Error('La hora seleccionada ya está reservada, por favor elige otro turno.');
        }

        const { data, error } = await supabaseClient.from('appointments').insert([payload]);
        if (error) throw error;
        appointmentMessage.textContent = 'Solicitud enviada con éxito. Recibirás confirmación por correo o teléfono.';
        appointmentForm.reset();
        loadAppointments();
        loadCalendar(calendarDate);
        // Send notification email to clinic owner (if EmailJS configured)
        try {
          if (isEmailJsConfigured()) {
            const params = {
              owner_name: payload.owner_name,
              pet_name: payload.pet_name,
              pet_type: payload.pet_type,
              pet_breed: payload.pet_breed,
              pet_age: payload.pet_age,
              service: payload.service,
              date: payload.date,
              time: payload.time,
              email: payload.email,
              phone: payload.phone,
              notes: payload.notes || '',
              to_email: window.emailConfig.receiver,
            };
            await window.emailjs.send(window.emailConfig.service, window.emailConfig.template, params);
          } else {
            console.log('EmailJS no configurado o falta service/template/receiver. No se envía correo de notificación.');
          }
        } catch (e) {
          console.warn('Error sending email notification', e);
        }
      } else {
        // Fallback: local simulated send
        await new Promise((r) => setTimeout(r, 800));
        appointmentForm.reset();
        appointmentMessage.textContent =
          "Solicitud enviada con éxito (modo local). El equipo de Serena Vet te contactará muy pronto.";
      }
    } catch (err) {
      console.error(err);
      appointmentMessage.textContent =
        'Error al enviar la solicitud. Revisa la configuración de Supabase y los datos del formulario.';
      if (err && err.message) {
        appointmentMessage.textContent += ' (' + err.message + ')';
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Confirmar solicitud de cita";
      }
    }

  });

  // Try loading recent appointments on the page if supabase is configured
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadAppointments();
      attachCalendarControls();
      setCalendarView(calendarView, calendarDate);
      if (appointmentDateInput) {
        appointmentDateInput.addEventListener('change', () => {
          loadBookedTimesForDate(appointmentDateInput.value);
        });
        if (appointmentDateInput.value) {
          loadBookedTimesForDate(appointmentDateInput.value);
        }
      }
    }, 300);
  });
}

if (newsletterForm && newsletterMessage) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterForm.reset();
    newsletterMessage.textContent =
      "Suscripción recibida. Te enviaremos novedades y consejos útiles para el cuidado de tu mascota.";
  });
}

document.querySelectorAll(".faq-item").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) {
      return;
    }

    document.querySelectorAll(".faq-item").forEach((otherDetail) => {
      if (otherDetail !== detail) {
        otherDetail.open = false;
      }
    });
  });
});


