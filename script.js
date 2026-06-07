const body = document.body;
const currentPage = body.dataset.page;
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const pageLinks = document.querySelectorAll("[data-page-link]");
const yearNodes = document.querySelectorAll("[data-year]");
const appointmentForm = document.querySelector("#appointment-form");
const appointmentMessage = document.querySelector("#form-message");
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterMessage = document.querySelector("#newsletter-message");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Supabase client (if configured via supabase-config.js)
const supabaseClient = window.supabaseClient || null;

async function loadAppointments() {
  const listNode = document.querySelector('#appointments-list');
  if (!listNode) return;

  if (!supabaseClient) {
    listNode.textContent = 'Supabase no configurado.';
    return;
  }

  listNode.textContent = 'Cargando...';
  const { data, error } = await supabaseClient
    .from('appointments')
    .select('*')
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
    item.innerHTML = `
      <strong>${escapeHtml(row.owner_name)} — ${escapeHtml(row.pet_name || '')}</strong>
      <div>${escapeHtml(row.service || '')} · ${row.date ? new Date(row.date).toLocaleDateString() : ''} ${escapeHtml(row.time || '')}</div>
      <div class="small">${escapeHtml(row.email || '')} · ${escapeHtml(row.phone || '')}</div>
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

    const payload = {
      owner_name: appointmentForm.querySelector('#owner-name')?.value || null,
      email: appointmentForm.querySelector('#email')?.value || null,
      phone: appointmentForm.querySelector('#phone')?.value || null,
      pet_name: appointmentForm.querySelector('#pet-name')?.value || null,
      service: appointmentForm.querySelector('#service')?.value || null,
      date: appointmentForm.querySelector('#date')?.value || null,
      time: appointmentForm.querySelector('#time')?.value || null,
      notes: appointmentForm.querySelector('#notes')?.value || null,
    };

    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from('appointments').insert([payload]);
        if (error) throw error;
        appointmentMessage.textContent = 'Solicitud enviada con éxito. Recibirás confirmación por correo o teléfono.';
        appointmentForm.reset();
        loadAppointments();
        // Send notification email to clinic owner (if EmailJS configured)
        try {
          if (window.emailjs && window.emailConfig) {
            const params = {
              owner_name: payload.owner_name,
              pet_name: payload.pet_name,
              service: payload.service,
              date: payload.date,
              time: payload.time,
              email: payload.email,
              phone: payload.phone,
              notes: payload.notes || '',
            };
            await window.emailjs.send(window.emailConfig.service, window.emailConfig.template, params);
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
      appointmentMessage.textContent = 'Error al enviar la solicitud. Intenta nuevamente.';
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
