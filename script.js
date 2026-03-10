document.addEventListener('DOMContentLoaded', () => {

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
        chatbotContainer.innerHTML = `
            <div class="chat-widget" id="chat-widget">
                <div class="chat-header">
                    <div class="chat-title">
                         <i class="fas fa-robot"></i> Asistente Virtual
                    </div>
                    <button class="chat-close" id="chat-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">
                        Hola, soy el asistente virtual de Lorena Lliviría. ¿En qué puedo ayudarte con nuestros servicios de Pilates y Fisioterapia?
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Escribe tu mensaje...">
                    <button id="chat-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button class="chat-toggle" id="chat-toggle">
                <i class="fas fa-comment-dots"></i>
            </button>
        `;

        const chatToggle = document.getElementById('chat-toggle');
        const chatWidget = document.getElementById('chat-widget');
        const chatClose = document.getElementById('chat-close');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');

        // Intro animation for the toggle
        chatToggle.style.opacity = '0';
        chatToggle.style.transform = 'scale(0) rotate(-45deg)';
        setTimeout(() => {
            chatToggle.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            chatToggle.style.opacity = '1';
            chatToggle.style.transform = 'scale(1) rotate(0deg)';
        }, 1500);

        function toggleChat() {
            const isActive = chatWidget.classList.contains('active');
            if (!isActive) {
                chatWidget.classList.add('active');
                chatbotContainer.classList.add('chat-active');
                history.pushState({ chatOpen: true }, '');
                setTimeout(() => chatInput.focus(), 50);
            } else {
                closeChatUI();
                if (history.state && history.state.chatOpen) history.back();
            }
        }

        function closeChatUI() {
            chatWidget.classList.remove('active');
            chatbotContainer.classList.remove('chat-active');
        }

        // Generic back button handler (handles modals and chat)
        window.addEventListener('popstate', (e) => {
            if (chatWidget.classList.contains('active')) closeChatUI();

            // Close any active modal
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        });

        chatToggle.addEventListener('click', toggleChat);
        chatClose.addEventListener('click', toggleChat);

        // Dummy send logic
        chatSend.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (!text) return;

            chatMessages.innerHTML += `<div class="message user">${text}</div>`;
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Typing indicator
            const typingId = 'type-' + Date.now();
            chatMessages.innerHTML += `<div class="message bot typing" id="${typingId}"><span></span><span></span><span></span></div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                const tr = document.getElementById(typingId);
                if (tr) tr.remove();
                chatMessages.innerHTML += `<div class="message bot">Gracias por tu mensaje. El chat automático se encuentra en etapa de prueba para Lorena Web. Por favor utiliza el formulario de contacto para comunicarte de manera oficial.</div>`;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1500);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') chatSend.click();
        });
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

    function showNotification(title, text) {
        if (notifOverlay) {
            document.getElementById('notif-title').innerText = title;
            document.getElementById('notif-subtitle').innerText = text;
            notifOverlay.classList.add('active');
        }
    }

    if (notifClose) notifClose.addEventListener('click', () => {
        notifOverlay.classList.remove('active');
    });

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const origText = btn.innerText;
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            setTimeout(() => {
                form.reset();
                showNotification('¡Solicitud Enviada!', 'Has enviado tu consulta con éxito. Me comunicaré a la brevedad.');
                btn.innerText = origText;
                btn.disabled = false;
            }, 1500);
        });
    }
});
