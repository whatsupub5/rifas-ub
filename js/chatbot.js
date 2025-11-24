// ========== CHATBOT WIDGET LOGIC ==========

let chatbotOpen = false;
let chatbotHistory = [];

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
    
    // Show welcome message after a delay
    setTimeout(() => {
        if (!chatbotOpen) {
            showChatbotNotification();
        }
    }, 3000);
});

// Initialize chatbot
function initChatbot() {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatbotHistory');
    if (savedHistory) {
        chatbotHistory = JSON.parse(savedHistory);
        if (chatbotHistory.length > 0) {
            renderChatHistory();
        }
    }
    
    // Check for unread messages
    updateChatbotBadge();
}

// Toggle chatbot
function toggleChatbot() {
    const widget = document.getElementById('chatbotWidget');
    const window = document.getElementById('chatbotWindow');
    
    if (!widget || !window) return;
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        window.classList.add('active');
        widget.classList.add('open');
        // Focus input
        setTimeout(() => {
            document.getElementById('chatbotInput')?.focus();
        }, 300);
        // Hide badge
        hideChatbotBadge();
    } else {
        window.classList.remove('active');
        widget.classList.remove('open');
    }
}

// Show chatbot notification
function showChatbotNotification() {
    const button = document.getElementById('chatbotButton');
    if (button && !chatbotOpen) {
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 3000);
    }
}

// Handle chatbot key press
function handleChatbotKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatbotMessage();
    }
}

// Send chatbot message
async function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    input.value = '';
    
    // Hide suggestions after first message
    const suggestions = document.getElementById('chatbotSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    // Show typing indicator
    const typingId = showChatbotTyping();
    
    try {
        // Get AI response
        const response = await getChatbotResponse(message);
        
        // Remove typing indicator
        hideChatbotTyping(typingId);
        
        // Add AI response
        addChatbotMessage(response, 'ai');
        
    } catch (error) {
        hideChatbotTyping(typingId);
        addChatbotMessage('Lo siento, hubo un error. Por favor intenta de nuevo o contáctanos directamente.', 'ai');
        console.error('Chatbot error:', error);
    }
}

// Add message to chatbot
function addChatbotMessage(message, type) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}-message`;
    
    const avatar = type === 'ai' 
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>
        <div class="message-content">
            <p>${formatMessage(message)}</p>
            <small>${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history
    chatbotHistory.push({ type, message, timestamp: new Date().toISOString() });
    localStorage.setItem('chatbotHistory', JSON.stringify(chatbotHistory));
}

// Format message (support line breaks)
function formatMessage(message) {
    return message.replace(/\n/g, '<br>');
}

// Show typing indicator
function showChatbotTyping() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return null;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'chatbot-typing';
    typingDiv.className = 'chatbot-message ai-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return 'chatbot-typing';
}

// Hide typing indicator
function hideChatbotTyping(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Get chatbot AI response
async function getChatbotResponse(message) {
    // Simulate API call (in production, connect to real AI API)
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerMessage = message.toLowerCase();
            let response = '';
            
            // Context-aware responses
            if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
                response = '¡Hola! 👋 Bienvenido a RIFAS UBIA. Estoy aquí para ayudarte con cualquier pregunta sobre nuestra plataforma de rifas. ¿En qué puedo asistirte?';
            }
            else if (lowerMessage.includes('cómo funciona') || lowerMessage.includes('como funciona')) {
                response = 'RIFAS UBIA es muy fácil de usar:\n\n' +
                          '1️⃣ Explora las rifas activas disponibles\n' +
                          '2️⃣ Elige el número que quieras comprar\n' +
                          '3️⃣ Realiza el pago de forma segura (Nequi, Daviplata, PayPal)\n' +
                          '4️⃣ ¡Participa en el sorteo y podrías ganar!\n\n' +
                          '¿Te gustaría saber más sobre algún paso específico?';
            }
            else if (lowerMessage.includes('comprar') || lowerMessage.includes('compro') || lowerMessage.includes('número')) {
                response = 'Para comprar un número:\n\n' +
                          '1. Navega por las rifas activas\n' +
                          '2. Haz clic en "Ver Detalles" de la rifa que te interese\n' +
                          '3. Selecciona el número disponible que quieras\n' +
                          '4. Completa el pago con tu método preferido\n' +
                          '5. Recibirás confirmación y tu boleto digital\n\n' +
                          '¿Necesitas ayuda con algún paso?';
            }
            else if (lowerMessage.includes('pago') || lowerMessage.includes('pagar') || lowerMessage.includes('método')) {
                response = 'Aceptamos los siguientes métodos de pago:\n\n' +
                          '💳 Nequi\n' +
                          '💳 Daviplata\n' +
                          '💳 PayPal\n\n' +
                          'Todos los pagos son 100% seguros y están protegidos. ¿Tienes alguna pregunta sobre el proceso de pago?';
            }
            else if (lowerMessage.includes('precio') || lowerMessage.includes('cuesta') || lowerMessage.includes('costo')) {
                response = 'El precio varía según la rifa. Cada rifa tiene su propio precio por número, que puedes ver en la descripción de cada rifa.\n\n' +
                          'Los precios suelen estar entre $1,000 y $10,000 COP por número, dependiendo del premio.\n\n' +
                          '¿Quieres ver las rifas disponibles ahora?';
            }
            else if (lowerMessage.includes('seguro') || lowerMessage.includes('confiable') || lowerMessage.includes('confianza')) {
                response = '¡Absolutamente! RIFAS UBIA garantiza:\n\n' +
                          '✅ Sorteos 100% transparentes y verificables\n' +
                          '✅ Pagos seguros con encriptación\n' +
                          '✅ Respaldo institucional\n' +
                          '✅ Sistema de verificación de transacciones\n\n' +
                          'Tu seguridad es nuestra prioridad. ¿Tienes alguna preocupación específica?';
            }
            else if (lowerMessage.includes('ganador') || lowerMessage.includes('gané') || lowerMessage.includes('resultado')) {
                response = 'Los resultados de los sorteos se publican en la plataforma una vez completada la rifa.\n\n' +
                          'Si eres ganador, recibirás una notificación automática y te contactaremos para coordinar la entrega del premio.\n\n' +
                          '¿Participaste en alguna rifa y quieres verificar resultados?';
            }
            else if (lowerMessage.includes('crear rifa') || lowerMessage.includes('organizar')) {
                response = 'Para crear una rifa:\n\n' +
                          '1. Inicia sesión como organizador\n' +
                          '2. Ve a tu dashboard de organizador\n' +
                          '3. Haz clic en "Crear Nueva Rifa"\n' +
                          '4. Completa el formulario con los detalles\n' +
                          '5. ¡Publica tu rifa y comienza a vender!\n\n' +
                          '¿Necesitas ayuda para registrarte como organizador?';
            }
            else if (lowerMessage.includes('contacto') || lowerMessage.includes('soporte') || lowerMessage.includes('ayuda')) {
                response = 'Puedes contactarnos de varias formas:\n\n' +
                          '📧 Email: unabayona323@gmail.com\n' +
                          '📱 Teléfono: +34 627 039 947\n' +
                          '💬 Este chat (disponible 24/7)\n\n' +
                          'También puedes usar el formulario de contacto en la página. ¿En qué más puedo ayudarte?';
            }
            else if (lowerMessage.includes('registro') || lowerMessage.includes('registrarse') || lowerMessage.includes('cuenta')) {
                response = 'Para registrarte:\n\n' +
                          '1. Haz clic en "Registrarse" en la parte superior\n' +
                          '2. Completa el formulario con tus datos\n' +
                          '3. Verifica tu email\n' +
                          '4. ¡Listo! Ya puedes empezar a participar\n\n' +
                          '¿Quieres que te guíe paso a paso?';
            }
            else {
                response = 'Entiendo tu consulta. Como asistente de IA 24/7, puedo ayudarte con:\n\n' +
                          '✅ Información sobre cómo funciona RIFAS UBIA\n' +
                          '✅ Proceso de compra de números\n' +
                          '✅ Métodos de pago\n' +
                          '✅ Creación de rifas\n' +
                          '✅ Resultados y ganadores\n' +
                          '✅ Soporte técnico\n\n' +
                          '¿Hay algo específico en lo que pueda ayudarte?';
            }
            
            resolve(response);
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    });
}

// Real AI API integration (uncomment when ready)
/*
async function getChatbotResponseWithAPI(message) {
    const API_KEY = 'YOUR_API_KEY';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { 
                    role: 'system', 
                    content: 'Eres un asistente de atención al cliente de RIFAS UBIA, una plataforma de rifas digitales. Responde de forma amigable, profesional y concisa. Ayuda a los usuarios con información sobre rifas, compras, pagos y la plataforma en general.' 
                },
                ...chatbotHistory.slice(-5).map(h => ({ 
                    role: h.type === 'user' ? 'user' : 'assistant', 
                    content: h.message 
                })),
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 300
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
*/

// Send suggestion
function sendSuggestion(text) {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = text;
        sendChatbotMessage();
    }
}

// Render chat history
function renderChatHistory() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    // Clear initial message if we have history
    if (chatbotHistory.length > 0) {
        messagesContainer.innerHTML = '';
    }
    
    chatbotHistory.forEach(msg => {
        // Render message without saving to history again
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${msg.type}-message`;
        
        const avatar = msg.type === 'ai' 
            ? '<i class="fas fa-robot"></i>'
            : '<i class="fas fa-user"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${formatMessage(msg.message)}</p>
                <small>${new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
}

// Update chatbot badge
function updateChatbotBadge() {
    const badge = document.querySelector('.chatbot-badge');
    if (badge) {
        // Check for unread messages or show default
        const unread = localStorage.getItem('chatbotUnread');
        if (unread && parseInt(unread) > 0) {
            badge.textContent = unread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Hide chatbot badge
function hideChatbotBadge() {
    const badge = document.querySelector('.chatbot-badge');
    if (badge) {
        badge.style.display = 'none';
        localStorage.setItem('chatbotUnread', '0');
    }
}

// Export functions
window.toggleChatbot = toggleChatbot;
window.sendChatbotMessage = sendChatbotMessage;
window.handleChatbotKeyPress = handleChatbotKeyPress;
window.sendSuggestion = sendSuggestion;
