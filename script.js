document.addEventListener('DOMContentLoaded', () => {

    // --- API Data Load (direct from PostgreSQL via studio-main) ---
    const API_BASE = 'https://studio-main-1--studio-4748759464-52942.us-east4.hosted.app';
    const GIMNASIO_ID = '06008afc-fff8-459a-b3cc-b53e79dd6c67';

    async function loadWebData() {
        try {
            const [horariosRes, preciosRes] = await Promise.all([
                fetch(`${API_BASE}/api/web/horarios?gimnasio_id=${GIMNASIO_ID}`),
                fetch(`${API_BASE}/api/web/precios?gimnasio_id=${GIMNASIO_ID}`)
            ]);

            if (horariosRes.ok) {
                const horarios = await horariosRes.json();
                renderDynamicSchedules(horarios || []);
            } else {
                console.error('Error cargando horarios:', horariosRes.status);
            }

            if (preciosRes.ok) {
                const precios = await preciosRes.json();
                renderDynamicPrices(precios || []);
                renderPrecioBadge(precios || []);
            } else {
                console.error('Error cargando precios:', preciosRes.status);
            }

        } catch (error) {
            console.error('Error cargando datos de la web:', error);
            renderFallbacks();
        }
    }

    loadWebData();

    function renderDynamicSchedules(horarios) {
        const container = document.getElementById('horarios-grid-container');
        if (!container) return;

        if (!horarios || horarios.length === 0) {
            container.innerHTML = '<div class="col-span-6 p-10 text-center text-professional-grey/40 italic">No hay horarios disponibles.</div>';
            return;
        }

        const diasMostrados = [1, 2, 3, 4, 5]; // Lunes a Viernes
        const nombreDias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

        // Get unique times sorted
        const times = [...new Set(horarios.map(h => (h.hora || '').substring(0, 5)))]
            .filter(Boolean).sort();

        // Color por actividad (paleta Lorena)
        function getCellStyle(actName) {
            const lower = (actName || '').toLowerCase();
            if (lower.includes('pilates')) return 'background: linear-gradient(135deg,#00bdd6,#009bb5); color:#fff;';
            if (lower.includes('fisio'))  return 'background: linear-gradient(135deg,#6366f1,#4f46e5); color:#fff;';
            if (lower.includes('laboral')) return 'background: linear-gradient(135deg,#10b981,#059669); color:#fff;';
            return 'background: linear-gradient(135deg,#00bdd6,#009bb5); color:#fff;';
        }

        // Header row
        let html = '<div></div>'; // empty top-left cell
        diasMostrados.forEach(diaNum => {
            html += `<div style="background:#f5f8f8; border:1px solid #e5e7eb; border-radius:12px; padding:12px 6px; font-size:11px; font-weight:700; letter-spacing:0.08em; color:#00bdd6; display:flex; align-items:center; justify-content:center;">${nombreDias[diaNum]}</div>`;
        });

        // Time rows
        times.forEach(time => {
            // Time label
            html += `<div style="display:flex; align-items:center; justify-content:flex-end; padding-right:12px; font-size:13px; font-weight:700; color:#00bdd6; white-space:nowrap;">${time}</div>`;

            diasMostrados.forEach(diaNum => {
                const clase = horarios.find(h =>
                    Number(h.dia_semana) === diaNum && (h.hora || '').startsWith(time)
                );

                if (clase) {
                    const act = clase.nombre_actividad || 'Pilates';
                    const dur = clase.duracion_min ? `${clase.duracion_min}m` : '';
                    const sinCupos = clase.cupos_disponibles != null && clase.cupos_disponibles <= 0;
                    const cuposLabel = clase.cupos_disponibles != null
                        ? (sinCupos ? 'SIN CUPOS' : `${clase.cupos_disponibles} cupos`)
                        : '';

                    // Cells WITH availability: vibrant cyan gradient + full opacity
                    // Cells WITHOUT availability: desaturated grey-blue + lower opacity, strikethrough feel
                    const cellStyle = sinCupos
                        ? 'background: linear-gradient(135deg,#b0c4ce,#8fa8b5); color:rgba(255,255,255,0.7); opacity:0.6;'
                        : getCellStyle(act);
                    const shadowStyle = sinCupos
                        ? 'box-shadow: none;'
                        : 'box-shadow: 0 2px 8px rgba(0,189,214,0.20);';
                    const hoverIn  = sinCupos ? '' : `this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 20px rgba(0,189,214,0.35)'`;
                    const hoverOut = sinCupos ? '' : `this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(0,189,214,0.20)'`;
                    const cursor   = sinCupos ? 'default' : 'pointer';
                    const onclick  = sinCupos ? '' : `onclick="document.getElementById('contacto').scrollIntoView({behavior:'smooth'})"`;

                    html += `<div style="${cellStyle} ${shadowStyle} border-radius:10px; padding:10px 6px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60px; cursor:${cursor}; transition:transform .2s, box-shadow .2s;" onmouseenter="${hoverIn}" onmouseleave="${hoverOut}" ${onclick}>
                        <span>${act}</span>
                        ${dur ? `<span style="font-size:9px;opacity:0.85;font-weight:400;margin-top:3px;">${dur}</span>` : ''}
                        ${cuposLabel ? `<span style="font-size:9px;opacity:0.85;font-weight:600;margin-top:2px;">${cuposLabel}</span>` : ''}
                    </div>`;
                } else {
                    html += '<div></div>';
                }
            });
        });

        container.innerHTML = html;
    }

    function renderDynamicPrices(precios) {
        const container = document.getElementById('precios-cards-container');
        if (!container) return;

        if (!precios || precios.length === 0) {
            container.innerHTML = '<div class="col-span-3 p-6 text-center text-professional-grey/40 italic text-sm">Consultar precios por privado.</div>';
            return;
        }

        // Build card HTML — overflow-visible so badge pops above
        container.innerHTML = precios.map((p, i) => {
            const precio = Math.round(p.ultimo_precio || 0);
            return `
            <article class="precio-card relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-500"
                     style="border-top: 3px solid #00bdd6; overflow: visible;">
                <div class="precio-badge" style="display:none; position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:linear-gradient(90deg,#00bdd6,#007a8a); color:#fff; padding:4px 16px; border-radius:999px; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; white-space:nowrap; z-index:30; box-shadow:0 4px 12px rgba(0,189,214,0.4);">
                    MÁS ELEGIDO
                </div>
                <div class="mb-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-[#00bdd6] mb-1">Plan</p>
                    <h3 class="precio-titulo text-lg font-black text-professional-grey">${p.modalidad}</h3>
                </div>
                <div class="flex items-baseline gap-1 mb-4">
                    <span class="precio-valor text-3xl font-black text-professional-grey">$ ${precio.toLocaleString('es-UY')}</span>
                    <span class="text-professional-grey/60 text-sm">/ mes</span>
                </div>
                <button class="precio-btn mt-auto w-full py-2.5 rounded-xl border border-[#00bdd6] text-[#00bdd6] text-sm font-bold uppercase tracking-wide hover:bg-[#00bdd6]/5 transition-colors"
                        onclick="document.getElementById('modal-pilates').classList.remove('active'); document.getElementById('contacto').scrollIntoView({behavior:'smooth'});">
                    Empezar
                </button>
            </article>`;
        }).join('');

        // --- Rotating highlight (like JPS) ---
        const cards = container.querySelectorAll('.precio-card');
        let activeIdx = Math.floor(precios.length / 2); // start on middle card

        function updateHighlight(idx) {
            cards.forEach((card, i) => {
                const badge = card.querySelector('.precio-badge');
                const btn   = card.querySelector('.precio-btn');
                if (i === idx) {
                    card.style.transform   = 'translateY(-14px) scale(1.04)';
                    card.style.borderColor = '#00bdd6';
                    card.style.boxShadow   = '0 8px 32px rgba(0,189,214,0.25)';
                    card.style.zIndex      = '10';
                    if (badge) badge.style.display = 'block';
                    if (btn) {
                        btn.className = 'precio-btn mt-auto w-full py-2.5 rounded-xl text-white text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:opacity-90';
                        btn.style.background = 'linear-gradient(90deg,#00bdd6,#007a8a)';
                    }
                } else {
                    card.style.transform   = 'translateY(0) scale(1)';
                    card.style.borderColor = '';
                    card.style.boxShadow   = '';
                    card.style.zIndex      = '1';
                    if (badge) badge.style.display = 'none';
                    if (btn) {
                        btn.className = 'precio-btn mt-auto w-full py-2.5 rounded-xl border border-[#00bdd6] text-[#00bdd6] text-sm font-bold uppercase tracking-wide hover:bg-[#00bdd6]/5 transition-colors';
                        btn.style.background = '';
                    }
                }
            });
        }

        updateHighlight(activeIdx);
        setInterval(() => {
            activeIdx = (activeIdx + 1) % cards.length;
            updateHighlight(activeIdx);
        }, 3500);
    }

    // --- Mini rotating price badge under schedule ---
    function renderPrecioBadge(precios) {
        const badge = document.getElementById('horarios-precio-badge');
        if (!badge || !precios || precios.length === 0) return;

        let idx = 0;

        function show(i) {
            const p = precios[i];
            const precio = Math.round(p.ultimo_precio || 0);
            badge.innerHTML = `
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#00bdd6,#007a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <span style="color:#fff;font-size:18px;" class="material-symbols-outlined">calendar_month</span>
                </div>
                <div style="flex:1;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#00bdd6;margin:0 0 2px;">Plan · ${p.modalidad}</p>
                    <p style="font-size:22px;font-weight:900;color:#1f2937;margin:0;">
                        $ ${precio.toLocaleString('es-UY')} <span style="font-size:13px;font-weight:400;color:#6b7280;">/ mes</span>
                    </p>
                </div>
                <a href="#contacto" style="background:linear-gradient(90deg,#00bdd6,#007a8a);color:#fff;padding:8px 18px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;text-decoration:none;transition:opacity .2s;" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
                    Empezar
                </a>`;
        }

        show(0);
        setInterval(() => {
            idx = (idx + 1) % precios.length;
            badge.style.opacity = '0';
            badge.style.transition = 'opacity 0.35s';
            setTimeout(() => {
                show(idx);
                badge.style.opacity = '1';
            }, 350);
        }, 3500);
    }

    function calcularFin(horaStr, duracionMin) {
        const [h, m] = horaStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + duracionMin);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    function renderFallbacks() {
        // En caso de error, podríamos poner los valores estáticos por defecto
        console.log("Cargando fallbacks por error de conexión.");
    }

    // Custom Cursor (Desktop Only)
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-left, .reveal-bottom, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Hero Entry Animation Trigger
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        setTimeout(() => {
            heroSection.classList.add('hero-active');
        }, 100);
    }

    // Glassmorphism Navbar Effect on Scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        }
    });

    // --- Chatbot Logic ---
    const chatbotContainer = document.getElementById('chatbot-container');

    if (chatbotContainer) {
        const chatToggle = document.getElementById('chat-toggle');
        const chatWidget = document.getElementById('chat-widget');
        const chatClose = document.getElementById('chat-close');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');

        if (!chatToggle || !chatWidget) return;

        // Intro animation for the toggle
        chatToggle.style.opacity = '0';
        chatToggle.style.transform = 'scale(0) rotate(-45deg)';
        setTimeout(() => {
            chatToggle.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            chatToggle.style.opacity = '1';
            chatToggle.style.transform = 'scale(1) rotate(0deg)';
        }, 1500);

        // Generate or retrieve a unique session ID (persistent across page visits)
        if (!localStorage.getItem('lorena_session_id')) {
            localStorage.setItem('lorena_session_id', 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));
        }
        let SESSION_ID = localStorage.getItem('lorena_session_id');
        console.log('Chat Session ID:', SESSION_ID);

        async function sendToChatwoot(content, messageType) {
            const config = window.LORENA_CONFIG || {};
            const CHATWOOT_PUBLIC_URL = config.CHATWOOT_PUBLIC_URL || 'https://chatwoot.nico-family.com/public/api/v1/inboxes/S4GujY1dBKvvA381tjBpxC5X';
            const IDENTITY_SECRET = config.CHATWOOT_IDENTITY_SECRET || 'xQb3MSBCn3MmaBYCGuHYXSMM';

            // Prefix bot messages so they are distinguishable in Chatwoot
            const finalContent = messageType === 'outgoing' ? `[Asistente]: ${content}` : content;

            // ── Helper: compute HMAC-SHA256 using the browser Web Crypto API ──────
            async function computeHmac(message, secret) {
                const enc = new TextEncoder();
                const key = await window.crypto.subtle.importKey(
                    'raw', enc.encode(secret),
                    { name: 'HMAC', hash: 'SHA-256' },
                    false, ['sign']
                );
                const sig = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
                return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
            }

            try {
                // ── PASO 1: Obtener o crear contacto ─────────────────────────────
                let contactSourceId = sessionStorage.getItem('lorena_chatwoot_api_contact_source_id');

                if (!contactSourceId) {
                    // Compute identity hash required by Chatwoot identity validation
                    const identifierHash = await computeHmac(SESSION_ID, IDENTITY_SECRET);

                    const contactRes = await fetch(`${CHATWOOT_PUBLIC_URL}/contacts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            identifier: SESSION_ID,
                            identifier_hash: identifierHash,
                            name: 'Visitante Web'
                        })
                    });

                    if (contactRes.ok) {
                        const contactData = await contactRes.json();
                        contactSourceId = contactData.source_id;
                        sessionStorage.setItem('lorena_chatwoot_api_contact_source_id', contactSourceId);
                    } else {
                        const errText = await contactRes.text();
                        throw new Error('[Chatwoot] Error al crear contacto: ' + contactRes.status + ' ' + errText);
                    }
                }

                if (!contactSourceId) throw new Error('[Chatwoot] No se pudo obtener/crear contacto');

                // ── PASO 2: Obtener o crear conversación ─────────────────────────
                let conversationId = sessionStorage.getItem('lorena_chatwoot_api_conversation_id');

                if (!conversationId) {
                    const convRes = await fetch(`${CHATWOOT_PUBLIC_URL}/contacts/${contactSourceId}/conversations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (convRes.ok) {
                        const convData = await convRes.json();
                        conversationId = convData.id;
                        sessionStorage.setItem('lorena_chatwoot_api_conversation_id', conversationId);
                    } else {
                        const errText = await convRes.text();
                        throw new Error('[Chatwoot] Error al crear conversación: ' + convRes.status + ' ' + errText);
                    }
                }

                if (!conversationId) throw new Error('[Chatwoot] No se pudo obtener/crear conversación');

                // ── PASO 3: Enviar mensaje ────────────────────────────────────────
                const msgRes = await fetch(`${CHATWOOT_PUBLIC_URL}/contacts/${contactSourceId}/conversations/${conversationId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: finalContent })
                });
                if (!msgRes.ok) {
                    const errText = await msgRes.text();
                    throw new Error('[Chatwoot] Error enviando mensaje: ' + msgRes.status + ' ' + errText);
                }

            } catch (error) {
                console.error('Error in sendToChatwoot:', error);
            }
        }

        // ── Persistence: History Logic ──────────────────────────────────
        function getHistory() {
            return JSON.parse(localStorage.getItem('lorena_chat_history') || '[]');
        }

        function saveMessageToLocal(text, sender) {
            const history = getHistory();
            history.push({ text, sender, timestamp: Date.now() });
            localStorage.setItem('lorena_chat_history', JSON.stringify(history));
        }

        function clearChatHistory() {
            localStorage.removeItem('lorena_chat_history');
            localStorage.removeItem('lorena_session_id');
            sessionStorage.removeItem('lorena_chatwoot_api_contact_source_id');
            sessionStorage.removeItem('lorena_chatwoot_api_conversation_id');
            sessionStorage.removeItem('lorena_last_seen_msg_id');
            lastSeenMessageId = 0;
            // Regenerate session ID for a fresh conversation
            localStorage.setItem('lorena_session_id', 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));
            SESSION_ID = localStorage.getItem('lorena_session_id');

            // Reset UI to welcome message
            chatMessages.innerHTML = `
                <div class="message bot">
                    Hola, soy Loreley, tu asistente virtual. ¿En qué puedo ayudarte hoy sobre mis servicios de Pilates o Fisioterapia?
                </div>
            `;
            showNotification('Conversación Reiniciada', 'Se ha generado una nueva sesión de chat.');
        }

        function loadChatHistory() {
            const history = getHistory();
            if (history.length > 0) {
                chatMessages.innerHTML = '';
                history.forEach(msg => {
                    const div = document.createElement('div');
                    div.classList.add('message', msg.sender);
                    if (msg.sender === 'bot') {
                        div.innerHTML = formatMessage(msg.text);
                    } else {
                        div.textContent = msg.text;
                    }
                    chatMessages.appendChild(div);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        // ── End Persistence ─────────────────────────────────────────────

        let pollingIntervalId = null;
        // Cursor: último ID de mensaje ya procesado (evita duplicados sin comparar texto)
        let lastSeenMessageId = parseInt(sessionStorage.getItem('lorena_last_seen_msg_id') || '0', 10);

        const API_MESSAGES_URL = `${API_BASE}/api/web/messages`;

        async function fetchAgentMessages() {
            const conversationId = sessionStorage.getItem('lorena_chatwoot_api_conversation_id');
            if (!conversationId) return; // Sin conversación activa, nada que hacer

            try {
                const res = await fetch(
                    `${API_MESSAGES_URL}?conversation_id=${conversationId}&after_id=${lastSeenMessageId}`
                );
                if (!res.ok) return;

                const messages = await res.json();
                if (!Array.isArray(messages) || messages.length === 0) return;

                // Quitar typing indicators antes de mostrar nuevos mensajes
                document.querySelectorAll('.message.bot.typing').forEach(el => el.remove());

                messages.forEach(msg => {
                    addMessage(msg.content, 'bot');
                    // Avanzar el cursor
                    if (msg.id > lastSeenMessageId) {
                        lastSeenMessageId = msg.id;
                        sessionStorage.setItem('lorena_last_seen_msg_id', lastSeenMessageId);
                    }
                });

            } catch (err) {
                console.error('Error polling agent messages:', err);
            }
        }

        function startPolling() {
            if (pollingIntervalId) return;
            fetchAgentMessages();
            pollingIntervalId = setInterval(fetchAgentMessages, 4000);
        }

        function stopPolling() {
            if (pollingIntervalId) {
                clearInterval(pollingIntervalId);
                pollingIntervalId = null;
            }
        }

        let originalScrollY = 0;

        function toggleChat() {
            chatWidget.classList.toggle('active');
            chatbotContainer.classList.toggle('chat-active');
            
            if (chatWidget.classList.contains('active')) {
                history.pushState({ chatOpen: true }, '');
                startPolling();
                if (window.innerWidth <= 768) {
                    originalScrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.top = `-${originalScrollY}px`;
                    document.body.style.width = '100%';
                    setTimeout(adjustChatHeight, 50);
                } else {
                    chatInput.focus();
                }
            } else {
                closeChatUI();
                if (history.state && history.state.chatOpen) history.back();
            }
        }

        function closeChatUI() {
            chatWidget.classList.remove('active');
            chatbotContainer.classList.remove('chat-active');
            stopPolling();
            if (window.innerWidth <= 768) {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, originalScrollY);
            }
        }

        function adjustChatHeight() {
            if (window.innerWidth <= 768 && chatWidget.classList.contains('active')) {
                let vh = window.innerHeight;
                if (window.visualViewport) vh = window.visualViewport.height;
                chatWidget.style.height = `${vh}px`;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                window.scrollTo(0, 0);
            }
        }

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', adjustChatHeight);
            window.visualViewport.addEventListener('scroll', () => {
                if (chatWidget.classList.contains('active')) window.scrollTo(0, 0);
            });
        }

        window.addEventListener('popstate', (e) => {
            if (chatWidget.classList.contains('active')) closeChatUI();
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (chatWidget.classList.contains('active')) {
                    closeChatUI();
                    if (history.state && history.state.chatOpen) history.back();
                }
                const activeModals = document.querySelectorAll('.modal-overlay.active');
                if (activeModals.length > 0) {
                    activeModals.forEach(modal => modal.classList.remove('active'));
                    if (history.state && history.state.modalOpen) history.back();
                }
            }
        });

        chatToggle.addEventListener('click', toggleChat);
        chatClose.addEventListener('click', toggleChat);

        // Wire up clear button
        const chatClear = document.getElementById('chat-clear');
        if (chatClear) chatClear.addEventListener('click', clearChatHistory);

        // Load previous conversation history on init
        loadChatHistory();
        startPolling();

        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';
            
            // Show typing indicator until Chatwoot responds
            addTypingIndicator();

            // ── Enviar solo el mensaje del cliente a Chatwoot ────────────────────
            sendToChatwoot(text, 'incoming');
        }


        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

        function addMessage(text, sender) {
            const div = document.createElement('div');
            const id = 'msg-' + Date.now();
            div.id = id;
            div.classList.add('message', sender);
            
            if (sender === 'bot') {
                div.innerHTML = formatMessage(text);
            } else {
                div.textContent = text;
            }
            
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Save to localStorage for session persistence
            saveMessageToLocal(text, sender);

            return id;
        }

        function formatMessage(text) {
            if (!text) return '';
            
            let content = text.trim();
            
            // Bold & Italic
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Split into blocks by double newlines (paragraphs)
            const blocks = content.split(/\n\n+/);
            
            const formattedBlocks = blocks.map(block => {
                block = block.trim();
                if (!block) return '';

                // Handle Lists (lines starting with - or *)
                if (block.match(/^\s*[-*]\s+/m)) {
                    const items = block.split(/\n/).map(line => {
                        const match = line.match(/^\s*[-*]\s+(.*)$/);
                        return match ? `<li>${match[1]}</li>` : line;
                    }).join('');
                    return `<ul class="chat-list">${items}</ul>`;
                }
                
                // Regular paragraph: replace single newlines with <br>
                return `<p>${block.replace(/\n/g, '<br>')}</p>`;
            });
            
            return formattedBlocks.join('');
        }

        function addTypingIndicator() {
            const div = document.createElement('div');
            const id = 'typing-' + Date.now();
            div.id = id;
            div.classList.add('message', 'bot', 'typing');
            div.innerHTML = '<span></span><span></span><span></span>';
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return id;
        }

        function removeMessage(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }
    }


    // --- Modals Logic ---
    function setupModal(triggerSelector, modalId) {
        const trigger = document.querySelector(triggerSelector);
        const modal = document.getElementById(modalId);
        if (!trigger || !modal) return;

        const closeBtn = modal.querySelector('.modal-close');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            history.pushState({ modalOpen: true }, ''); // Push state so back button works for modal
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                if (history.state && history.state.modalOpen) history.back();
            });
        }

        // Close when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (history.state && history.state.modalOpen) history.back();
            }
        });
    }

    // Setup the 4 new Modals
    setupModal('#btn-filosofia', 'modal-filosofia');
    setupModal('#card-pilates', 'modal-pilates');
    setupModal('#card-fisio', 'modal-fisio');
    setupModal('#card-laboral', 'modal-laboral');

    // --- Form & Notifications ---
    const notifOverlay = document.getElementById('form-notification-overlay');
    const notifClose = document.getElementById('notif-close-btn');
    
    let notifTimeout;
    function showNotification(title, text) {
        if (notifOverlay) {
            document.getElementById('notif-title').innerText = title;
            document.getElementById('notif-subtitle').innerText = text;
            notifOverlay.classList.add('active');

            // Auto-close after 3 seconds
            if (notifTimeout) clearTimeout(notifTimeout);
            notifTimeout = setTimeout(() => {
                notifOverlay.classList.remove('active');
            }, 3000);
        }
    }

    if (notifClose) notifClose.addEventListener('click', () => {
        notifOverlay.classList.remove('active');
        if (notifTimeout) clearTimeout(notifTimeout);
    });

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            const origText = btn.innerText;
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const formData = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                telefono: document.getElementById('telefono').value,
                email: document.getElementById('email').value,
                proyecto: document.getElementById('proyecto').value,
                cliente: 'lorenalliviria', // Identificador para n8n
                fuente: 'WEB' // Tracking para nicolabs parity
            };

            try {
                const response = await fetch('https://n8n.nico-family.com/webhook/a1e59b22-4770-43dc-b4bd-42186903cfd4', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    form.reset();
                    
                    // Trigger Premium Notification
                    showNotification('Solicitud enviada con éxito', 'Lo estaremos contactando a la brevedad.');
                    
                    // Trigger Confetti (like Nico Labs)
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#00bdd6', '#ffffff', '#2d2d2d']
                        });
                    }
                } else {
                    throw new Error('Error en el servidor');
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                showNotification('Error', 'Hubo un problema al enviar tu solicitud. Por favor intenta nuevamente o contactame por WhatsApp.');
            } finally {
                btn.innerText = origText;
                btn.disabled = false;
            }
        });
    }

    // Logo Stamp Animation Trigger on Scroll
    const stampBoxes = document.querySelectorAll('.acrylic-stamp-box');
    const stampObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to trigger CSS animations
                entry.target.classList.add('animate-stamp');
            } else {
                // Remove class when out of view to allow re-triggering when scrolling back
                entry.target.classList.remove('animate-stamp');
            }
        });
    }, {
        threshold: 0.6 // Trigger when 60% of the box is visible for better effect
    });

    stampBoxes.forEach(box => stampObserver.observe(box));

    // --- Contact Tooltip Trigger Logic ---
    const contactSection = document.getElementById('contacto');
    const chatTooltip = document.getElementById('chat-tooltip');
    let hasShownTooltipContact = false;
    let tooltipTimeout;

    function showChatTooltip() {
        if (!chatTooltip) return;
        
        // Clear any existing timeout to avoid hiding prematurely if triggered twice
        if (tooltipTimeout) clearTimeout(tooltipTimeout);

        // Show tooltip
        chatTooltip.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-95');
        chatTooltip.classList.add('opacity-100', 'translate-y-0', 'scale-100');
        
        // Hide automatically after 6 seconds
        tooltipTimeout = setTimeout(() => {
            chatTooltip.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
            chatTooltip.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-95');
        }, 6000);
    }

    // Trigger 1: Shortly after page load (chat icon animation is 1500ms)
    setTimeout(() => {
        showChatTooltip();
    }, 2500);

    // Trigger 2: When reaching contact section
    if (contactSection && chatTooltip) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasShownTooltipContact) {
                    hasShownTooltipContact = true;
                    showChatTooltip();
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% of contact section is visible

        contactObserver.observe(contactSection);
    }

    // Stories Promo removido
});
