/**
 * WAPPTI MAIN JS
 * Organizado para soportar carga asíncrona de Header/Footer
 */

// ── 1. CONFIGURACIÓN DE ANIMACIONES (Observer) ──────────────────────────────
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = 1;
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

function applyAnimation(elements) {
    elements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        scrollObserver.observe(el);
    });
}

// ── 2. ACORDEONES (Ventajas y FAQ) ──────────────────────────────────────────

// Ventajas (Se llama por atributo onclick="toggleAccordion(this)" en el HTML)
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
        if (icon) icon.textContent = '−';
    }
}

// FAQ (Se inicializa mediante Event Listeners)
function initFAQ() {
    document.querySelectorAll('.faq-section__item').forEach(item => {
        const question = item.querySelector('.faq-section__question');
        if (question) {
            question.onclick = () => {
                const isOpen = item.classList.contains('open');
                const col = item.closest('.faq-section__col');
                if (col) {
                    col.querySelectorAll('.faq-section__item').forEach(i => i.classList.remove('open'));
                }
                if (!isOpen) item.classList.add('open');
            };
        }
    });
}

// ── 3. RESEÑAS API ─────────────────────────────────────────────────────────────
async function fetchReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    const API_URL = "/api-reviews/";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener datos');

        const reviews = await response.json();
        if (reviews.length === 0) {
            container.innerHTML = "<p>No hay reseñas recientes.</p>";
            return;
        }

        container.innerHTML = reviews.map(rev => {
            const rating = Math.round(rev.rating);
            const fullStars = "⭐".repeat(rating);
            const emptyStars = "☆".repeat(5 - rating);
            const fecha = new Date(rev.created_at).toLocaleDateString('es-ES', {
                month: 'long', year: 'numeric'
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
                </div>`;
        }).join('');

        applyAnimation(container.querySelectorAll('.testimonio-card'));

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = "<p>Por el momento no se pueden cargar las opiniones.</p>";
    }
}

// ── 4. PHONE MOCKUP (WhatsApp Flow) ──────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

function initWhatsappMockup() {
    const messagesEl = document.getElementById('messages');
    const typingEl = document.getElementById('typing');
    const replayBtn = document.getElementById('replayBtn');
    const statusEl = document.getElementById('contactStatus');

    if (!messagesEl || !typingEl) return;

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
    }

    const disableAll = (wrap) => {
        wrap.querySelectorAll('button').forEach(b => { b.disabled = true; b.style.opacity = '.3'; });
    };

    const flowConfirmar = async (wrap) => {
        disableAll(wrap);
        addMsg('out', '✅ Confirmar cita');
        await sleep(500); showTyping();
        await sleep(1800); hideTyping();
        addMsg('in', '🎉 ¡Perfecto Andrés! Te estaremos esperando con gusto. Recuerda llegar unos minutitos antes. ¡Hasta mañana! 😊✨');
        await sleep(600); showTyping();
        await sleep(1400); hideTyping();
        addMsg('in', `📋 Si necesitas algo más...<br>📞 <span>Contacto</span>`);
        replayBtn.classList.add('visible');
    };

    const flowReagendar = async (wrap) => {
        disableAll(wrap);
        addMsg('out', '📅 Reagendar cita');
        await sleep(500); showTyping();
        await sleep(1800); hideTyping();
        addMsg('in', '¡Claro que sí! Para reagendar comunícate directamente con el establecimiento...');
        replayBtn.classList.add('visible');
    };

    async function startSequence() {
        replayBtn.classList.remove('visible');
        messagesEl.querySelectorAll('.msg, .msg-buttons').forEach(e => e.remove());
        await sleep(900); showTyping();
        await sleep(1900); hideTyping();
        addMsg('in', `<strong class="title">Recordatorio de cita</strong>
                      Hola Andrés 😁... ¿Le gustaría confirmar?`);
        await sleep(300);
        addBtns([
            { label: '✅ Confirmar cita', cls: 'confirm', action: flowConfirmar },
            { label: '📅 Reagendar cita', cls: 'reagendar', action: flowReagendar }
        ]);
    }

    replayBtn.onclick = startSequence;
    setTimeout(startSequence, 700);
}

// ── 5. INICIALIZADOR MAESTRO ────────────────────────────────────────────────
function initWapptiApp() {
    console.log("Iniciando Scripts...");
    fetchReviews();
    initFAQ();
    initWhatsappMockup();
    
    // Animar elementos estáticos
    applyAnimation(document.querySelectorAll('.precios-card, .step-card, .para-quien-left'));
}

// Ejecución automática si NO hay sistema de includes (fallback)
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('[data-include]')) {
        initWapptiApp();
    }
});


// Añade esta función en tu main.js
function initMenuMovil() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const icon = hamburger ? hamburger.querySelector('i') : null;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Activa o desactiva la clase que muestra el menú
            navLinks.classList.toggle('active');
            
            // Cambia el ícono de hamburguesa a una "X"
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Ocultar menú al hacer click en un link (para que navegue correctamente)
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// ... Y luego no olvides llamarla en tu función principal ...
function initWapptiApp() {
    initMenuMovil(); // <--- LLamada aquí
    fetchReviews();
    initFAQ();
    initWhatsappMockup();
    applyAnimation(document.querySelectorAll('.precios-card, .step-card, .para-quien-left'));
}