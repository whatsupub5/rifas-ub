// ========== AI GENERATOR LOGIC ==========

let selectedProvider = 'openai';
let currentGeneratedImage = null;
let currentGeneratedVideo = null;
let chatHistory = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) {
        showToast('Debes iniciar sesión para usar el generador de IA', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Check AI generator access
    const access = window.checkAIGeneratorAccess ? window.checkAIGeneratorAccess(user.id) : { hasAccess: false };
    
    if (!access.hasAccess) {
        showAccessRestriction(access);
        return;
    }
    
    initAIGenerator();
    loadMyCreations();
    initSidebarToggle();
    showAccessInfo(access);
});

// Initialize AI Generator
function initAIGenerator() {
    // Set default provider
    selectProvider('openai');
    
    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            if (target.startsWith('#')) {
                scrollToSection(target);
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    console.log('Generador de IA inicializado');
}

// Initialize sidebar toggle
function initSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// Select AI Provider
function selectProvider(provider) {
    selectedProvider = provider;
    
    // Update UI
    document.querySelectorAll('.provider-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-provider="${provider}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    showToast(`Proveedor cambiado a: ${getProviderName(provider)}`, 'success');
}

// Get provider name
function getProviderName(provider) {
    const names = {
        'openai': 'ChatGPT',
        'gemini': 'Google Gemini',
        'copilot': 'Microsoft Copilot',
        'dalle': 'DALL-E',
        'midjourney': 'Midjourney',
        'stable-diffusion': 'Stable Diffusion'
    };
    return names[provider] || provider;
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========== ACCESS RESTRICTIONS ==========

function showAccessRestriction(access) {
    const mainContent = document.querySelector('.dashboard-main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="access-restriction">
            <div class="restriction-card">
                <i class="fas fa-lock" style="font-size: 4rem; color: var(--warning-color); margin-bottom: 2rem;"></i>
                <h2>Acceso Restringido</h2>
                <p>El generador de IA está disponible solo para:</p>
                <ul class="access-options">
                    <li>
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                        <strong>Organizadores de rifas</strong> - Acceso completo gratuito
                    </li>
                    <li>
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                        <strong>Usuarios con suscripción activa</strong> - Planes desde $9,900/mes
                    </li>
                </ul>
                <div class="restriction-actions">
                    <button class="btn btn-primary btn-large" onclick="window.location.href='subscription.html'">
                        <i class="fas fa-crown"></i> Ver Planes de Suscripción
                    </button>
                    <button class="btn btn-outline" onclick="window.location.href='dashboard-organizador.html'">
                        <i class="fas fa-ticket-alt"></i> Crear Rifa (Acceso Gratis)
                    </button>
                    <button class="btn btn-outline" onclick="window.location.href='index.html'">
                        <i class="fas fa-arrow-left"></i> Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showAccessInfo(access) {
    const header = document.querySelector('.dashboard-header');
    if (!header) return;
    
    let infoText = '';
    if (access.reason === 'organizer') {
        infoText = '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i> Acceso completo como organizador</span>';
    } else if (access.reason === 'subscription') {
        infoText = `<span style="color: var(--primary-color);"><i class="fas fa-crown"></i> Suscripción ${access.plan.name} - `;
        if (access.remaining.imageGenerations !== 'unlimited') {
            infoText += `${access.remaining.imageGenerations} imágenes restantes`;
        } else {
            infoText += 'Ilimitado';
        }
        infoText += '</span>';
    }
    
    if (infoText) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'access-info';
        infoDiv.innerHTML = infoText;
        header.appendChild(infoDiv);
    }
}

// ========== IMAGE GENERATION ==========

async function generateImage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check access
    if (!window.canGenerateImage) {
        showToast('Sistema de acceso no disponible', 'error');
        return;
    }
    
    const canGenerate = window.canGenerateImage(user.id);
    
    if (!canGenerate.can) {
        if (canGenerate.reason === 'no_access') {
            showToast('No tienes acceso al generador de imágenes. Se requiere suscripción o ser organizador.', 'warning');
            setTimeout(() => {
                window.location.href = 'subscription.html';
            }, 2000);
            return;
        } else if (canGenerate.reason === 'limit_reached') {
            showToast('Has alcanzado el límite de generaciones de imágenes. Considera actualizar tu plan.', 'warning');
            setTimeout(() => {
                window.location.href = 'subscription.html';
            }, 2000);
            return;
        }
    }
    
    const prompt = document.getElementById('imagePrompt').value;
    const style = document.getElementById('imageStyle').value;
    const size = document.getElementById('imageSize').value;
    const quality = document.getElementById('imageQuality').value;
    
    if (!prompt.trim()) {
        showToast('Por favor describe la imagen que quieres generar', 'warning');
        return;
    }
    
    const previewContainer = document.getElementById('imagePreviewContainer');
    const actions = document.getElementById('imageActions');
    
    // Show loading state
    previewContainer.innerHTML = `
        <div class="preview-placeholder generating">
            <div class="loading" style="width: 50px; height: 50px; margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-secondary);">Generando imagen con ${getProviderName(selectedProvider)}...</p>
            <small style="color: var(--text-light);">Esto puede tardar unos segundos</small>
        </div>
    `;
    actions.style.display = 'none';
    
    try {
        // Simulate API call (in production, replace with real API)
        const imageUrl = await simulateImageGeneration(prompt, style, size, quality);
        
        // Display generated image
        previewContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image" id="generatedImage">`;
        actions.style.display = 'flex';
        
        currentGeneratedImage = {
            url: imageUrl,
            prompt: prompt,
            style: style,
            size: size,
            quality: quality,
            provider: selectedProvider,
            createdAt: new Date().toISOString()
        };
        
        // Increment usage (only if not organizer)
        if (canGenerate.reason !== 'organizer' && window.incrementUsage) {
            window.incrementUsage(user.id, 'imageGenerations');
        }
        
        showToast('¡Imagen generada exitosamente!', 'success');
        
    } catch (error) {
        console.error('Error generating image:', error);
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">Error al generar la imagen</p>
                <button class="btn btn-primary" onclick="generateImage()" style="margin-top: 1rem;">
                    Intentar de nuevo
                </button>
            </div>
        `;
        showToast('Error al generar la imagen. Intenta de nuevo.', 'error');
    }
}

// Simulate image generation (replace with real API call)
async function simulateImageGeneration(prompt, style, size, quality) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate a placeholder image based on prompt
            const encodedPrompt = encodeURIComponent(prompt.substring(0, 50));
            const [width, height] = size.split('x');
            
            // Use placeholder service (in production, use real API)
            const imageUrl = `https://assets/logo-ub.png/${width}x${height}?text=${encodedPrompt}`;
            resolve(imageUrl);
        }, 3000); // Simulate 3 second generation time
    });
}

// Real API integration example (uncomment and configure when ready)
/*
async function generateImageWithAPI(prompt, style, size, quality) {
    const apiKey = 'YOUR_API_KEY'; // Get from environment or config
    
    let endpoint, body;
    
    switch(selectedProvider) {
        case 'openai':
        case 'dalle':
            endpoint = 'https://api.openai.com/v1/images/generations';
            body = {
                model: 'dall-e-3',
                prompt: prompt,
                size: size,
                quality: quality,
                n: 1
            };
            break;
        case 'stable-diffusion':
            endpoint = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
            body = {
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: parseInt(size.split('x')[1]),
                width: parseInt(size.split('x')[0]),
                steps: 30
            };
            break;
        // Add more providers...
    }
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return data.data[0].url; // Adjust based on API response structure
}
*/

// Download image
function downloadImage() {
    if (!currentGeneratedImage) return;
    
    const img = document.getElementById('generatedImage');
    if (!img) return;
    
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `imagen-ia-${Date.now()}.png`;
    link.click();
    
    showToast('Imagen descargada', 'success');
}

// Save to gallery
function saveToGallery() {
    if (!currentGeneratedImage) return;
    
    const creations = JSON.parse(localStorage.getItem('aiCreations') || '[]');
    currentGeneratedImage.id = Date.now();
    currentGeneratedImage.type = 'image';
    creations.push(currentGeneratedImage);
    localStorage.setItem('aiCreations', JSON.stringify(creations));
    
    showToast('Imagen guardada en tu galería', 'success');
    loadMyCreations();
}

// Regenerate image
function regenerateImage() {
    generateImage();
}

// ========== VIDEO GENERATION ==========

async function generateVideo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check access
    if (!window.canGenerateVideo) {
        showToast('Sistema de acceso no disponible', 'error');
        return;
    }
    
    const canGenerate = window.canGenerateVideo(user.id);
    
    if (!canGenerate.can) {
        if (canGenerate.reason === 'no_access') {
            showToast('No tienes acceso al generador de videos. Se requiere suscripción Premium o ser organizador.', 'warning');
            setTimeout(() => {
                window.location.href = 'subscription.html';
            }, 2000);
            return;
        } else if (canGenerate.reason === 'limit_reached') {
            showToast('Has alcanzado el límite de generaciones de videos. Considera actualizar tu plan.', 'warning');
            setTimeout(() => {
                window.location.href = 'subscription.html';
            }, 2000);
            return;
        }
    }
    
    const prompt = document.getElementById('videoPrompt').value;
    const duration = document.getElementById('videoDuration').value;
    const resolution = document.getElementById('videoResolution').value;
    const style = document.getElementById('videoStyle').value;
    
    if (!prompt.trim()) {
        showToast('Por favor describe el video que quieres generar', 'warning');
        return;
    }
    
    const previewContainer = document.getElementById('videoPreviewContainer');
    const actions = document.getElementById('videoActions');
    
    // Show loading state
    previewContainer.innerHTML = `
        <div class="preview-placeholder generating">
            <div class="loading" style="width: 50px; height: 50px; margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-secondary);">Generando video con ${getProviderName(selectedProvider)}...</p>
            <small style="color: var(--text-light);">Esto puede tardar varios minutos</small>
            <div style="margin-top: 1rem; width: 100%; max-width: 300px;">
                <div class="progress-bar">
                    <div class="progress-fill" id="videoProgress" style="width: 0%"></div>
                </div>
            </div>
        </div>
    `;
    actions.style.display = 'none';
    
    try {
        // Simulate progress
        simulateVideoProgress();
        
        // Simulate API call
        const videoUrl = await simulateVideoGeneration(prompt, duration, resolution, style);
        
        // Display generated video
        previewContainer.innerHTML = `
            <video id="generatedVideo" controls style="max-width: 100%; max-height: 500px; border-radius: var(--radius-md);">
                <source src="${videoUrl}" type="video/mp4">
                Tu navegador no soporta videos HTML5.
            </video>
        `;
        actions.style.display = 'flex';
        
        currentGeneratedVideo = {
            url: videoUrl,
            prompt: prompt,
            duration: duration,
            resolution: resolution,
            style: style,
            provider: selectedProvider,
            createdAt: new Date().toISOString()
        };
        
        // Increment usage (only if not organizer)
        if (canGenerate.reason !== 'organizer' && window.incrementUsage) {
            window.incrementUsage(user.id, 'videoGenerations');
        }
        
        showToast('¡Video generado exitosamente!', 'success');
        
    } catch (error) {
        console.error('Error generating video:', error);
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">Error al generar el video</p>
                <button class="btn btn-primary" onclick="generateVideo()" style="margin-top: 1rem;">
                    Intentar de nuevo
                </button>
            </div>
        `;
        showToast('Error al generar el video. Intenta de nuevo.', 'error');
    }
}

// Simulate video progress
function simulateVideoProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const progressBar = document.getElementById('videoProgress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 500);
}

// Simulate video generation
async function simulateVideoGeneration(prompt, duration, resolution, style) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In production, use real video generation API
            // For now, return a placeholder
            const videoUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
            resolve(videoUrl);
        }, 5000); // Simulate 5 second generation time
    });
}

// Download video
function downloadVideo() {
    if (!currentGeneratedVideo) return;
    
    const video = document.getElementById('generatedVideo');
    if (!video) return;
    
    const link = document.createElement('a');
    link.href = video.src;
    link.download = `video-ia-${Date.now()}.mp4`;
    link.click();
    
    showToast('Video descargado', 'success');
}

// Save video to gallery
function saveVideoToGallery() {
    if (!currentGeneratedVideo) return;
    
    const creations = JSON.parse(localStorage.getItem('aiCreations') || '[]');
    currentGeneratedVideo.id = Date.now();
    currentGeneratedVideo.type = 'video';
    creations.push(currentGeneratedVideo);
    localStorage.setItem('aiCreations', JSON.stringify(creations));
    
    showToast('Video guardado en tu galería', 'success');
    loadMyCreations();
}

// Regenerate video
function regenerateVideo() {
    generateVideo();
}

// ========== AI CHAT ==========

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check access
    if (window.canUseChat) {
        const canChat = window.canUseChat(user.id);
        
        if (!canChat.can) {
            if (canChat.reason === 'no_access') {
                showToast('No tienes acceso al chat con IA. Se requiere suscripción o ser organizador.', 'warning');
                return;
            } else if (canChat.reason === 'limit_reached') {
                showToast('Has alcanzado el límite de mensajes. Considera actualizar tu plan.', 'warning');
                return;
            }
        }
    }
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add AI response
        addChatMessage(response, 'ai');
        
        // Increment usage (only if not organizer)
        if (window.canUseChat && window.incrementUsage) {
            const canChat = window.canUseChat(user.id);
            if (canChat.reason !== 'organizer') {
                window.incrementUsage(user.id, 'chatMessages');
            }
        }
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addChatMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'ai');
        console.error('Chat error:', error);
    }
}

function addChatMessage(message, type) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const avatar = type === 'ai' 
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>
        <div class="message-content">
            <p>${message}</p>
            <small>${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history
    chatHistory.push({ type, message, timestamp: new Date().toISOString() });
}

function addTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return null;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message ai-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div style="display: flex; gap: 0.25rem;">
                <span style="animation: bounce 1s infinite;">.</span>
                <span style="animation: bounce 1s infinite 0.2s;">.</span>
                <span style="animation: bounce 1s infinite 0.4s;">.</span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

async function getAIResponse(message) {
    // Simulate API call (replace with real API)
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simple response logic (in production, use real AI API)
            let response = '';
            
            if (message.toLowerCase().includes('descripción') || message.toLowerCase().includes('descripcion')) {
                response = `Te ayudo a crear una descripción atractiva para tu rifa. Aquí tienes algunas ideas:\n\n` +
                          `1. Destaca el premio principal de forma llamativa\n` +
                          `2. Menciona la fecha del sorteo claramente\n` +
                          `3. Incluye información sobre el precio y cantidad de números\n` +
                          `4. Agrega un toque emocional que motive a participar\n\n` +
                          `¿Quieres que genere una descripción específica para tu rifa?`;
            } else if (message.toLowerCase().includes('premio') || message.toLowerCase().includes('premios')) {
                response = `Los premios más populares en rifas incluyen:\n\n` +
                          `📱 Dispositivos electrónicos (iPhone, iPad, laptops)\n` +
                          `🎮 Consolas de videojuegos (PlayStation, Xbox)\n` +
                          `💰 Dinero en efectivo\n` +
                          `🏠 Electrodomésticos\n` +
                          `🚗 Vehículos (motos, carros)\n` +
                          `✈️ Viajes y experiencias\n\n` +
                          `¿Qué tipo de premio estás considerando?`;
            } else if (message.toLowerCase().includes('marketing') || message.toLowerCase().includes('promocionar')) {
                response = `Estrategias efectivas para promocionar tu rifa:\n\n` +
                          `1. Redes sociales: Publica regularmente con imágenes atractivas\n` +
                          `2. WhatsApp: Crea grupos y comparte el enlace\n` +
                          `3. Influencers: Colabora con personas con audiencia relevante\n` +
                          `4. Descuentos: Ofrece promociones por compras múltiples\n` +
                          `5. Transparencia: Muestra el progreso de ventas en tiempo real\n\n` +
                          `¿Quieres que te ayude a crear contenido para alguna de estas estrategias?`;
            } else {
                response = `Entiendo tu consulta. Como asistente de IA 24/7, puedo ayudarte con:\n\n` +
                          `✅ Crear descripciones atractivas para rifas\n` +
                          `✅ Generar ideas de premios\n` +
                          `✅ Estrategias de marketing y promoción\n` +
                          `✅ Responder preguntas sobre la plataforma\n` +
                          `✅ Ayudar con problemas técnicos\n\n` +
                          `¿En qué más puedo ayudarte?`;
            }
            
            resolve(response);
        }, 1500); // Simulate response time
    });
}

// Real AI API integration example
/*
async function getAIResponseWithAPI(message) {
    const apiKey = 'YOUR_API_KEY';
    
    let endpoint, body;
    
    switch(selectedProvider) {
        case 'openai':
            endpoint = 'https://api.openai.com/v1/chat/completions';
            body = {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'Eres un asistente experto en rifas y marketing digital.' },
                    ...chatHistory.map(h => ({ role: h.type === 'user' ? 'user' : 'assistant', content: h.message })),
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            };
            break;
        case 'gemini':
            endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
            body = {
                contents: [{
                    parts: [{ text: message }]
                }]
            };
            break;
        // Add more providers...
    }
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return data.choices[0].message.content; // Adjust based on API response
}
*/

function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendChatMessage();
}

// ========== MY CREATIONS ==========

function loadMyCreations() {
    const grid = document.getElementById('creationsGrid');
    if (!grid) return;
    
    const creations = JSON.parse(localStorage.getItem('aiCreations') || '[]');
    
    if (creations.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">No tienes creaciones guardadas aún.</p>
            </div>
        `;
        return;
    }
    
    // Filter if needed
    const filter = document.getElementById('creationsFilter')?.value || 'all';
    let filtered = creations;
    
    if (filter === 'images') {
        filtered = creations.filter(c => c.type === 'image');
    } else if (filter === 'videos') {
        filtered = creations.filter(c => c.type === 'video');
    }
    
    grid.innerHTML = '';
    filtered.forEach(creation => {
        const item = createCreationItem(creation);
        grid.appendChild(item);
    });
}

function createCreationItem(creation) {
    const item = document.createElement('div');
    item.className = 'creation-item';
    
    const isImage = creation.type === 'image';
    const thumbnail = isImage 
        ? `<img src="${creation.url}" alt="${creation.prompt}" class="creation-thumbnail">`
        : `<video src="${creation.url}" class="creation-thumbnail" muted></video>`;
    
    item.innerHTML = `
        ${thumbnail}
        <div class="creation-info">
            <div class="creation-title">${creation.prompt.substring(0, 50)}${creation.prompt.length > 50 ? '...' : ''}</div>
            <div class="creation-meta">
                <span><i class="fas fa-${isImage ? 'image' : 'video'}"></i> ${isImage ? 'Imagen' : 'Video'}</span>
                <span>${new Date(creation.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="creation-actions">
                <button class="btn btn-primary btn-small" onclick="downloadCreation(${creation.id})">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-outline btn-small" onclick="deleteCreation(${creation.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return item;
}

function downloadCreation(id) {
    const creations = JSON.parse(localStorage.getItem('aiCreations') || '[]');
    const creation = creations.find(c => c.id === id);
    
    if (!creation) return;
    
    const link = document.createElement('a');
    link.href = creation.url;
    link.download = `${creation.type}-ia-${id}.${creation.type === 'image' ? 'png' : 'mp4'}`;
    link.click();
    
    showToast('Descargado exitosamente', 'success');
}

function deleteCreation(id) {
    if (!confirm('¿Estás seguro de eliminar esta creación?')) return;
    
    const creations = JSON.parse(localStorage.getItem('aiCreations') || '[]');
    const filtered = creations.filter(c => c.id !== id);
    localStorage.setItem('aiCreations', JSON.stringify(filtered));
    
    showToast('Creación eliminada', 'success');
    loadMyCreations();
}

// Initialize creations filter
document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('creationsFilter');
    if (filter) {
        filter.addEventListener('change', () => {
            loadMyCreations();
        });
    }
});

// Export functions
window.selectProvider = selectProvider;
window.generateImage = generateImage;
window.generateVideo = generateVideo;
window.downloadImage = downloadImage;
window.saveToGallery = saveToGallery;
window.regenerateImage = regenerateImage;
window.downloadVideo = downloadVideo;
window.saveVideoToGallery = saveVideoToGallery;
window.regenerateVideo = regenerateVideo;
window.sendChatMessage = sendChatMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.sendSuggestion = sendSuggestion;
window.downloadCreation = downloadCreation;
window.deleteCreation = deleteCreation;
