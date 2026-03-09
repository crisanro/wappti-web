// ── Acordeón de ventajas ──────────────────────────────────────────────────────
function toggleAccordion(el) {
  const body = el.nextElementSibling;
  const icon = el.querySelector('.icon');
  const isOpen = body.classList.contains('open');

  document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.accordion-title').forEach(t => {
    t.classList.remove('active');
    const i = t.querySelector('.icon');
    if (i) i.textContent = '+';
  });

  if (!isOpen) {
    body.classList.add('open');
    el.classList.add('active');
    icon.textContent = '−';
  }
}

// ── FAQ acordeón ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-section__item').forEach(item => {
    item.querySelector('.faq-section__question').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      const col = item.closest('.faq-section__col');
      col.querySelectorAll('.faq-section__item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
});


// 1. Definimos el Observer fuera para poder reutilizarlo
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = 1;
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Función para aplicar los estilos iniciales y observar
function applyAnimation(elements) {
    elements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        scrollObserver.observe(el);
    });
}

async function fetchReviews() {
    const container = document.getElementById('reviews-container');
    const API_URL = "/api-reviews/";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener datos');

        const reviews = await response.json();

        if (reviews.length === 0) {
            container.innerHTML = "<p>No hay reseñas recientes.</p>";
            return;
        }

        // Inyectamos el HTML
        container.innerHTML = reviews.map(rev => {
            const rating = Math.round(rev.rating);
            const fullStars = "⭐".repeat(rating);
            const emptyStars = "☆".repeat(5 - rating);
            const fecha = new Date(rev.created_at).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
            });

            return `
                <div class="testimonio-card">
                    <div class="testimonio-stars" title="Calificación: ${rev.rating} de 5">
                        ${fullStars}${emptyStars}
                    </div>
                    <p>${rev.comment}</p>
                    <div class="testimonio-author">
                        <strong>${rev.customer_name}</strong>
                        <span>${fecha}</span>
                    </div>
                </div>
            `;
        }).join('');

        // --- CLAVE: Observamos las nuevas cards recién creadas ---
        const nuevasCards = container.querySelectorAll('.testimonio-card');
        applyAnimation(nuevasCards);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = "<p>Por el momento no se pueden cargar las opiniones.</p>";
    }
}

// Inicialización general
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar reseñas
    fetchReviews();

    // 2. Animar elementos que ya existen (como precios-card)
    const staticCards = document.querySelectorAll('.precios-card');
    applyAnimation(staticCards);
});


/* ── PHONE MOCKUP ── */
const messagesEl = document.getElementById('messages');
  const typingEl   = document.getElementById('typing');
  const replayBtn  = document.getElementById('replayBtn');
  const statusEl   = document.getElementById('contactStatus');

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const now   = () => new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  function showTyping() {
    typingEl.classList.add('visible');
    statusEl.textContent = 'escribiendo...';
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    typingEl.classList.remove('visible');
    statusEl.textContent = 'en línea';
  }

  function addMsg(type, html) {
    const el = document.createElement('div');
    el.className = `msg msg-${type}`;
    el.innerHTML = html + `<div class="msg-time">${now()}</div>`;
    messagesEl.insertBefore(el, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function addBtns(buttons) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-buttons';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = `wa-btn ${b.cls || ''}`;
      btn.textContent = b.label;
      btn.onclick = () => b.action(wrap);
      wrap.appendChild(btn);
    });
    messagesEl.insertBefore(wrap, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function disableAll(wrap) {
    wrap.querySelectorAll('button').forEach(b => { b.disabled = true; b.style.opacity = '.3'; });
  }

  // ── FLOWS ─────────────────────────────────────────────────────────────────

  async function flowConfirmar(wrap) {
    disableAll(wrap);
    addMsg('out', '✅ Confirmar cita');
    await sleep(500); showTyping();
    await sleep(1800); hideTyping();
    addMsg('in', '🎉 ¡Perfecto Andrés! Te estaremos esperando con gusto. Recuerda llegar unos minutitos antes. ¡Hasta mañana! 😊✨');
    await sleep(600); showTyping();
    await sleep(1400); hideTyping();
    addMsg('in', `📋 Si necesitas algo más, contáctanos directamente:<br><br>
<span style="display:inline-block;background:rgba(74,222,128,.1);border:1px dashed rgba(74,222,128,.4);color:#4ade80;border-radius:5px;padding:1px 6px;font-size:.65rem;font-weight:800;">✏️ Tu negocio aquí</span><br>
📞 <span style="color:#53bdeb;font-size:.65rem;font-style:italic;">Tu número de contacto</span><br>
🌐 <span style="color:#53bdeb;font-size:.65rem;font-style:italic;">Tu sitio web o redes</span><br><br>
<span style="color:rgba(255,255,255,.4);font-size:.58rem">¡Con gusto te atendemos! 😊</span>`);
    replayBtn.classList.add('visible');
  }

  async function flowReagendar(wrap) {
    disableAll(wrap);
    addMsg('out', '📅 Reagendar cita');
    await sleep(500); showTyping();
    await sleep(1800); hideTyping();
    addMsg('in', '¡Claro que sí! 😊 Para reagendar tu cita comunícate directamente con el establecimiento, ellos te ayudarán a encontrar el mejor horario disponible.');
    await sleep(600); showTyping();
    await sleep(1400); hideTyping();
    addMsg('in', `📋 Contáctanos directamente para coordinar tu nueva cita:<br><br>
<span style="display:inline-block;background:rgba(251,191,36,.1);border:1px dashed rgba(251,191,36,.4);color:#fbbf24;border-radius:5px;padding:1px 6px;font-size:.65rem;font-weight:800;">✏️ Tu negocio aquí</span><br>
📞 <span style="color:#53bdeb;font-size:.65rem;font-style:italic;">Tu número de contacto</span><br>
🌐 <span style="color:#53bdeb;font-size:.65rem;font-style:italic;">Tu sitio web o redes</span><br><br>
<span style="color:rgba(255,255,255,.4);font-size:.58rem">¡Te esperamos pronto! 🌟</span>`);
    replayBtn.classList.add('visible');
  }

  // ── MAIN ──────────────────────────────────────────────────────────────────

  async function startSequence() {
    replayBtn.classList.remove('visible');
    messagesEl.querySelectorAll('.msg, .msg-buttons, .date-picker').forEach(e => e.remove());
    hideTyping();

    await sleep(900);
    showTyping();
    await sleep(1900);
    hideTyping();

    addMsg('in', `
      <strong class="title">Recordatorio de cita</strong>
      Hola Andrés 😁, le recordamos que su cita con el equipo de<br>
      <span style="display:inline-block;background:rgba(251,191,36,.15);border:1px dashed rgba(251,191,36,.5);color:#fbbf24;border-radius:5px;padding:0 5px;font-size:.65rem;font-weight:800;">✏️ Tu negocio aquí</span> será el día de mañana a las 01:25 pm 😎<br><br>
      ¿Le gustaría confirmar su asistencia? 😊
      <span class="footer-link">Sistema de citas (wappti.app)</span>
    `);

    await sleep(300);

    addBtns([
      { label: '✅ Confirmar cita', cls: 'confirm',   action: flowConfirmar },
      { label: '📅 Reagendar cita', cls: 'reagendar', action: flowReagendar },
    ]);
  }


  window.addEventListener('load', () => setTimeout(startSequence, 700));

