document.addEventListener('DOMContentLoaded', () => {

    // --- API Data Load (direct from PostgreSQL via studio-main) ---
    const API_BASE = 'https://studio-main-1--studio-4748759464-52942.us-east4.hosted.app';

    async function loadWebData() {
        try {
            const [horariosRes, preciosRes] = await Promise.all([
                fetch(`${API_BASE}/api/web/horarios`),
                fetch(`${API_BASE}/api/web/precios`)
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
        const container = document.getElementById('horarios-dynamic-container');
        if (!container) return;

        if (horarios.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="p-8 text-center">No hay horarios disponibles.</td></tr>';
            return;
        }

        // Agrupar por día para armar la tabla
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        let html = '';

        diasSemana.forEach((dia, index) => {
            const horariosDia = horarios.filter(h => h.nombre_dia === dia);
            if (horariosDia.length === 0 && index > 3) return; // Omitir viernes/fin de semana si no hay nada

            const am = horariosDia.find(h => parseInt(h.hora.split(':')[0]) < 12);
            const pm = horariosDia.filter(h => parseInt(h.hora.split(':')[0]) >= 12);

            html += `<tr class="border-b ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}">
                <td class="p-4 font-semibold">${dia}</td>
                <td class="p-4">${am ? `
                    <div class="text-[#00bdd6] font-bold">${am.hora.substring(0, 5)} a ${calcularFin(am.hora, am.duracion_min)}</div>
                    <div class="text-[10px] sm:text-xs text-professional-grey/60 mt-1 leading-tight">*Horario de inicio.</div>
                ` : '--'}</td>
                <td class="p-4">${pm.length > 0 ? pm.map(p => `
                    <div class="mb-2 last:mb-0">
                        <div class="text-[#00bdd6] font-bold">${p.hora.substring(0, 5)} hs</div>
                        <div class="text-[10px] sm:text-xs text-professional-grey/60 leading-tight">*Inicio. Duración ${p.duracion_min}m</div>
                    </div>
                `).join('') : '--'}</td>
            </tr>`;
        });

        container.innerHTML = html;
    }

    function renderDynamicPrices(precios) {
        const container = document.getElementById('precios-dynamic-container');
        if (!container) return;

        if (precios.length === 0) {
            container.innerHTML = '<tr><td colspan="2" class="p-8 text-center">Consultar precios por privado.</td></tr>';
            return;
        }

        container.innerHTML = precios.map((p, i) => `
            <tr class="${i < precios.length - 1 ? 'border-b' : ''}">
                <td class="p-4">${p.modalidad}</td>
                <td class="p-4 font-bold text-[#00bdd6]">$ ${Math.round(p.ultimo_precio).toLocaleString('es-UY')}</td>
            </tr>
        `).join('');
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

        let originalScrollY = 0;

        function toggleChat() {
            chatWidget.classList.toggle('active');
            chatbotContainer.classList.toggle('chat-active');
            
            if (chatWidget.classList.contains('active')) {
                history.pushState({ chatOpen: true }, '');
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

        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';
            const typingId = addTypingIndicator();

            try {
                const response = await fetch('https://n8n.nico-family.com/webhook/3b1ec272-8ba1-4e6f-abf5-a9d567a6e28a/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatInput: text,
                        sessionId: SESSION_ID,
                        cliente: 'lorenalliviria',
                        fuente: 'WEB'
                    })
                });

                // Always read as text first
                const rawText = await response.text();
                removeMessage(typingId);
                console.log('n8n raw response [status=' + response.status + ']:', rawText);

                if (!response.ok) {
                    showNotification(
                        'Error de Conexión',
                        'No se pudo comunicar con el servidor (HTTP ' + response.status + '). Verificá que n8n esté activo.'
                    );
                    return;
                }

                if (!rawText) {
                    showNotification(
                        'Sin Respuesta',
                        'El agente no devolvió ninguna respuesta. Verificá que el flujo en n8n esté correctamente configurado.'
                    );
                    return;
                }

                // 1. Check if it is NDJSON (streaming format from n8n)
                let combinedText = '';
                let isNdjson = false;
                const lines = rawText.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    try {
                        const parsedLine = JSON.parse(line);
                        if (parsedLine && parsedLine.type === 'item' && parsedLine.content !== undefined) {
                            combinedText += parsedLine.content;
                            isNdjson = true;
                        }
                    } catch (e) {
                        // Ignore lines that are not valid JSON
                    }
                }

                // The text we will try to unwrap
                let textToProcess = (isNdjson && combinedText) ? combinedText : rawText;

                // 2. Helper: deeply extract the text content from potentially nested JSON responses.
                function extractBotText(raw) {
                    let value = raw;
                    // Keep unwrapping as long as it looks like a JSON string
                    for (let i = 0; i < 3; i++) {
                        if (typeof value !== 'string') break;
                        const trimmed = value.trim();
                        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) break;
                        try {
                            const parsed = JSON.parse(trimmed);
                            const candidate = Array.isArray(parsed)
                                ? (parsed[0]?.output ?? parsed[0]?.text ?? parsed[0]?.message)
                                : (parsed.output ?? parsed.text ?? parsed.message);
                            
                            if (candidate === undefined || candidate === null) break;
                            value = candidate;
                        } catch (e) {
                            break;
                        }
                    }
                    
                    // Failsafe: If it still looks like it's wrapped in {} but failed parsing (malformed JSON)
                    let result = String(value).trim();
                    if (result.startsWith('{') && result.endsWith('}')) {
                        let cleaned = result.substring(1, result.length - 1).trim();
                        // If it's also wrapped in quotes, strip them
                        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
                        }
                        result = cleaned;
                    }

                    // Handle escaped newlines if they are literal \n strings
                    result = result.replace(/\\n/g, '\n');

                    return result;
                }

                let botReply = extractBotText(textToProcess);

                // Helper: strip all "Calling <tool> with input: {...}" traces from n8n
                function stripToolTraces(text) {
                    return text.replace(/Calling\s+[\w-]+\s+with\s+input:\s*\{[^{}]*\}/g, '').trim();
                }

                addMessage(stripToolTraces(botReply), 'bot');

            } catch (error) {
                removeMessage(typingId);
                console.error('Chat fetch error:', error.name, error.message, error);
                showNotification(
                    'Error de Sistema',
                    'Hubo un problema técnico al enviar el mensaje: ' + error.name + ' — ' + error.message
                );
            }
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
});
