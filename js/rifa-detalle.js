// ========== RIFA DETALLE LOGIC ==========

let currentRifa = null;
let selectedNumber = null;
let currentImageIndex = 0;
let currentImages = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rifaId = urlParams.get('id');
    
    if (rifaId) {
        loadRifaDetail(rifaId);
    } else {
        showError('No se especificó una rifa');
    }
});

// Load rifa detail with error handling
function loadRifaDetail(rifaId) {
    const content = document.getElementById('rifaDetailContent');
    
    // Validate rifaId
    if (!rifaId) {
        showError('No se especificó un ID de rifa válido');
        return;
    }
    
    // Show loading state
    if (content) {
        content.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando detalles de la rifa...</p>
            </div>
        `;
    }
    
    try {
        // Simulate loading delay (in production, this would be an API call)
        setTimeout(() => {
            try {
                if (!window.getRifaById) {
                    throw new Error('Función getRifaById no está disponible');
                }
                
                const rifa = getRifaById(rifaId);
                
                if (!rifa) {
                    showError(`Rifa con ID "${rifaId}" no encontrada. Puede que haya sido eliminada o el ID sea incorrecto.`);
                    return;
                }
                
                // Validate rifa has required fields
                if (!rifa.title || !rifa.price || !rifa.totalNumbers) {
                    showError('La rifa tiene información incompleta. Por favor contacta al soporte.', {
                        message: 'Campos requeridos faltantes en la rifa'
                    });
                    return;
                }
                
                currentRifa = rifa;
                renderRifaDetail(rifa);
            } catch (error) {
                showError('Error al cargar los detalles de la rifa', error);
            }
        }, 300);
    } catch (error) {
        showError('Error al iniciar la carga de la rifa', error);
    }
}

// Render rifa detail
function renderRifaDetail(rifa) {
    const content = document.getElementById('rifaDetailContent');
    if (!content) return;
    
    // Get real sold numbers from localStorage
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifa.id}_numbers`) || '{}');
    const realSoldNumbers = Object.keys(numbersState).filter(num => numbersState[num].status === 'sold').length;
    const actualSoldNumbers = realSoldNumbers > 0 ? realSoldNumbers : (rifa.soldNumbers || 0);
    
    const progressPercentage = (actualSoldNumbers / rifa.totalNumbers) * 100;
    const remainingNumbers = rifa.totalNumbers - actualSoldNumbers;
    
    // Get rifa status
    const rifaStatus = rifa.status || 'active';
    const statusInfo = getRifaStatusInfo(rifaStatus, rifa);
    
    // Check if in favorites
    const isFavorite = window.isFavorite ? window.isFavorite(rifa.id) : false;
    
    // Get winner info if rifa is completed
    const winnerInfo = getRifaWinner(rifa);
    
    // Get prize information
    const prizeInfo = rifa.prize || rifa.title;
    
    // Get images array (support both single image and multiple images)
    const images = rifa.images && Array.isArray(rifa.images) && rifa.images.length > 0 
        ? rifa.images 
        : (rifa.image ? [rifa.image] : []);
    const hasMultipleImages = images.length > 1;
    
    // Store images globally for navigation
    currentImages = images;
    currentImageIndex = 0;
    
    content.innerHTML = `
        <div class="rifa-detail-container">
            <div class="rifa-detail-image">
                ${hasMultipleImages ? `
                <div class="image-gallery">
                    <div class="main-image-container">
                        <img id="mainImage" src="${images[0]}" alt="${rifa.title}" 
                             onerror="this.src='https://via.placeholder.com/600x400?text=Sin+Imagen'"
                             onclick="${hasMultipleImages ? 'openImageLightbox(0)' : ''}">
                        ${hasMultipleImages ? `
                        <button class="image-nav-btn prev-btn" onclick="changeImage(-1)" title="Imagen anterior">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="image-nav-btn next-btn" onclick="changeImage(1)" title="Siguiente imagen">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="image-counter">
                            <span id="currentImageIndex">1</span> / ${images.length}
                        </div>
                        ` : ''}
                    </div>
                    ${hasMultipleImages ? `
                    <div class="image-thumbnails">
                        ${images.map((img, index) => `
                            <img src="${img}" alt="${rifa.title} - Imagen ${index + 1}" 
                                 class="thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="selectThumbnail(${index})"
                                 onerror="this.src='https://via.placeholder.com/100?text=Sin+Imagen'">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : `
                <img src="${images[0] || 'https://via.placeholder.com/600x400?text=Sin+Imagen'}" 
                     alt="${rifa.title}" 
                     onerror="this.src='https://via.placeholder.com/600x400?text=Sin+Imagen'"
                     onclick="${images.length > 0 ? 'openImageLightbox(0)' : ''}">
                `}
                ${statusInfo.badge}
            </div>
            
            <div class="rifa-detail-info">
                <div class="rifa-detail-header">
                    <h1>${rifa.title}</h1>
            <div class="rifa-organizer">
                <img src="${rifa.organizer.avatar}" alt="${rifa.organizer.name}" class="organizer-avatar">
                <div class="organizer-info">
                    <a href="perfil-organizador.html?id=${rifa.organizerId || 'org-' + rifa.organizer.name.toLowerCase().replace(/\s+/g, '-')}" 
                       class="organizer-name-link">
                        Organizado por ${rifa.organizer.name}
                    </a>
                    ${rifa.organizerId && window.getOrganizerRatingStats ? `
                    <div class="organizer-rating-small">
                        ${getOrganizerRatingDisplay(rifa.organizerId)}
                    </div>
                    ` : ''}
                </div>
            </div>
                </div>
                
                ${winnerInfo ? `
                <div class="rifa-winner-section">
                    <div class="winner-badge">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <strong>¡Rifa Completada!</strong>
                            <p>Ganador: Número ${String(winnerInfo.number).padStart(3, '0')}</p>
                            ${winnerInfo.buyer ? `<small>Comprado por: ${winnerInfo.buyer}</small>` : ''}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="rifa-detail-description">
                    <h3><i class="fas fa-gift"></i> Premio</h3>
                    <p><strong>${prizeInfo}</strong></p>
                    <p>${rifa.description}</p>
                    ${rifa.conditions ? `
                    <div class="rifa-conditions">
                        <h4>Condiciones:</h4>
                        <ul>
                            ${Array.isArray(rifa.conditions) ? rifa.conditions.map(c => `<li>${c}</li>`).join('') : `<li>${rifa.conditions}</li>`}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                <div class="rifa-detail-stats">
                    <div class="detail-stat">
                        <i class="fas fa-ticket-alt"></i>
                        <div>
                            <span class="stat-label">Precio por Número</span>
                            <span class="stat-value">$${formatNumber(rifa.price)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-stat">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <span class="stat-label">Fecha del Sorteo</span>
                            <span class="stat-value">${formatDate(rifa.endDate)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-stat">
                        <i class="fas fa-chart-pie"></i>
                        <div>
                            <span class="stat-label">Progreso</span>
                            <span class="stat-value">${actualSoldNumbers}/${rifa.totalNumbers} vendidos</span>
                        </div>
                    </div>
                </div>
                
                ${rifa.createdAt || rifa.updatedAt ? `
                <div class="rifa-additional-info">
                    ${rifa.createdAt ? `
                    <div class="info-item">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Creada: <strong>${formatDate(rifa.createdAt)}</strong></span>
                    </div>
                    ` : ''}
                    ${rifa.updatedAt ? `
                    <div class="info-item">
                        <i class="fas fa-edit"></i>
                        <span>Actualizada: <strong>${formatDate(rifa.updatedAt)}</strong></span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <div class="rifa-progress-section">
                    <div class="progress-bar" style="height: 20px;">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <p class="progress-text">${remainingNumbers} números disponibles</p>
                </div>
                
                <div class="rifa-detail-actions">
                    ${rifaStatus === 'active' && remainingNumbers > 0 ? `
                    <button class="btn btn-primary btn-large" onclick="openNumberSelector()">
                        <i class="fas fa-shopping-cart"></i>
                        Comprar Número
                    </button>
                    ` : rifaStatus === 'completed' ? `
                    <button class="btn btn-disabled btn-large" disabled>
                        <i class="fas fa-check-circle"></i>
                        Rifa Completada
                    </button>
                    ` : rifaStatus === 'paused' ? `
                    <button class="btn btn-disabled btn-large" disabled>
                        <i class="fas fa-pause-circle"></i>
                        Rifa Pausada
                    </button>
                    ` : `
                    <button class="btn btn-disabled btn-large" disabled>
                        <i class="fas fa-ban"></i>
                        No Disponible
                    </button>
                    `}
                    <button class="btn btn-outline btn-large ${isFavorite ? 'favorite-active' : ''}" 
                            onclick="toggleFavorite(${rifa.id})" id="favoriteBtn">
                        <i class="fas fa-heart"></i>
                        <span id="favoriteText">${isFavorite ? 'Eliminar de Favoritos' : 'Agregar a Favoritos'}</span>
                    </button>
                    <button class="btn btn-outline btn-large" onclick="shareRifa(${rifa.id})">
                        <i class="fas fa-share-alt"></i>
                        Compartir
                    </button>
                </div>
            </div>
        </div>
        
        <div class="number-selector-section" id="numberSelector" style="display: none;">
            <h2>Selecciona tu Número</h2>
            <div class="number-search" style="margin-bottom: 1rem;">
                <input type="number" id="numberSearch" placeholder="Buscar número..." 
                       min="1" max="${rifa.totalNumbers}" 
                       oninput="filterNumbers(this.value)">
            </div>
            <div class="number-grid" id="numberGrid">
                <!-- Se llenará dinámicamente -->
            </div>
            <div class="selected-number-info" id="selectedNumberInfo" style="display: none;">
                <p>Número seleccionado: <strong id="selectedNumberDisplay"></strong></p>
                <p>Precio: <strong>$${formatNumber(rifa.price)}</strong></p>
                <button class="btn btn-primary btn-large" onclick="proceedToPayment()">
                    Continuar con el Pago
                </button>
            </div>
        </div>
        
        <div class="rifa-reviews-section" id="reviewsSection">
            <h2>Reseñas del Organizador</h2>
            <div id="reviewsContainer">
                <!-- Se llenará dinámicamente -->
            </div>
        </div>
        
        <div class="rifa-recent-buyers-section" id="recentBuyersSection">
            <h2>Últimos Compradores</h2>
            <div id="recentBuyersContainer">
                <!-- Se llenará dinámicamente -->
            </div>
        </div>
        
        <div class="rifa-questions-section" id="questionsSection">
            <h2>Preguntas y Respuestas</h2>
            <div id="questionsContainer">
                <!-- Se llenará dinámicamente -->
            </div>
            <div class="ask-question-form">
                <h3>Haz una pregunta</h3>
                ${!checkAuth() ? `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>Tu nombre *</label>
                    <input type="text" id="questionName" placeholder="Juan Pérez" required>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>Tu email *</label>
                    <input type="email" id="questionEmail" placeholder="tu@email.com" required>
                </div>
                ` : ''}
                <textarea id="questionText" placeholder="Escribe tu pregunta aquí..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="submitQuestion(${rifa.id})">
                    <i class="fas fa-paper-plane"></i> Enviar Pregunta
                </button>
            </div>
        </div>
    `;
    
    // Add styles if not already added
    addDetailStyles();
    
    // Load reviews
    loadRifaReviews(rifa);
    
    // Load recent buyers
    loadRecentBuyers(rifa);
    
    // Load questions
    loadRifaQuestions(rifa);
    
    // Update favorite button state after a short delay to ensure DOM is ready
    setTimeout(() => {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn && window.isFavorite) {
            const isFav = window.isFavorite(rifa.id);
            if (isFav) {
                favoriteBtn.classList.add('favorite-active');
                const favoriteText = document.getElementById('favoriteText');
                if (favoriteText) {
                    favoriteText.textContent = 'Eliminar de Favoritos';
                }
            }
        }
    }, 100);
}

// Open number selector (no requiere autenticación)
function openNumberSelector() {
    // Validate rifa status
    if (!currentRifa) {
        showToast('Error al cargar la información de la rifa', 'error');
        return;
    }
    
    const rifaStatus = currentRifa.status || 'active';
    if (rifaStatus !== 'active') {
        const statusMessages = {
            'paused': 'Esta rifa está pausada temporalmente',
            'completed': 'Esta rifa ya fue completada',
            'cancelled': 'Esta rifa fue cancelada',
            'sorteada': 'Esta rifa ya fue sorteada'
        };
        showToast(statusMessages[rifaStatus] || 'Esta rifa no está disponible para compras', 'warning');
        return;
    }
    
    // Check if rifa has available numbers
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${currentRifa.id}_numbers`) || '{}');
    const realSoldNumbers = Object.keys(numbersState).filter(num => numbersState[num].status === 'sold').length;
    const remainingNumbers = currentRifa.totalNumbers - realSoldNumbers;
    
    if (remainingNumbers <= 0) {
        showToast('No hay números disponibles en esta rifa', 'warning');
        return;
    }
    
    const selector = document.getElementById('numberSelector');
    if (selector) {
        selector.style.display = 'block';
        selector.scrollIntoView({ behavior: 'smooth' });
        generateNumberGrid();
    }
}

// Generate number grid with real sold numbers
function generateNumberGrid() {
    const grid = document.getElementById('numberGrid');
    if (!grid || !currentRifa) return;
    
    // Show loading state
    grid.innerHTML = '<div class="loading-skeleton-numbers"></div>';
    
    // Simulate loading delay
    setTimeout(() => {
        grid.innerHTML = '';
        
        // Get real sold numbers from localStorage
        const numbersState = JSON.parse(localStorage.getItem(`rifa_${currentRifa.id}_numbers`) || '{}');
        
        for (let i = 1; i <= currentRifa.totalNumbers; i++) {
        const numberBtn = document.createElement('button');
        numberBtn.className = 'number-btn';
        numberBtn.textContent = String(i).padStart(3, '0');
        numberBtn.dataset.number = i;
        numberBtn.onclick = () => selectNumber(i);
        
        // Check if number is actually sold
        const numberData = numbersState[i];
        if (numberData && numberData.status === 'sold') {
            numberBtn.classList.add('sold');
            numberBtn.disabled = true;
            numberBtn.title = `Vendido${numberData.buyer ? ' a ' + numberData.buyer : ''}`;
        }
        
            grid.appendChild(numberBtn);
        }
    }, 300);
}

// Filter numbers in grid
function filterNumbers(searchValue) {
    const grid = document.getElementById('numberGrid');
    if (!grid) return;
    
    const searchNum = parseInt(searchValue);
    const buttons = grid.querySelectorAll('.number-btn');
    
    if (!searchValue || isNaN(searchNum)) {
        buttons.forEach(btn => btn.style.display = '');
        return;
    }
    
    buttons.forEach(btn => {
        const btnNum = parseInt(btn.dataset.number);
        if (btnNum === searchNum) {
            btn.style.display = '';
            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            btn.style.display = 'none';
        }
    });
}

// Select number
function selectNumber(number) {
    selectedNumber = number;
    
    const info = document.getElementById('selectedNumberInfo');
    const display = document.getElementById('selectedNumberDisplay');
    
    if (info && display) {
        display.textContent = String(number).padStart(3, '0');
        info.style.display = 'block';
    }
    
    // Update button states
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.classList.remove('selected');
        const btnNumber = parseInt(btn.textContent.trim(), 10);
        if (!isNaN(btnNumber) && btnNumber === number) {
            btn.classList.add('selected');
        }
    });
}

// Proceed to payment
function proceedToPayment() {
    if (!selectedNumber) {
        showToast('Por favor selecciona un número', 'warning');
        return;
    }
    
    // Validate that the selected number is not sold
    if (!currentRifa) {
        showToast('Error al validar el número seleccionado', 'error');
        return;
    }
    
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${currentRifa.id}_numbers`) || '{}');
    const numberData = numbersState[selectedNumber];
    
    if (numberData && numberData.status === 'sold') {
        showToast(`El número ${String(selectedNumber).padStart(3, '0')} ya está vendido. Por favor selecciona otro.`, 'error');
        // Clear selection
        selectedNumber = null;
        const info = document.getElementById('selectedNumberInfo');
        if (info) info.style.display = 'none';
        
        // Update button states
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        return;
    }
    
    // Validate rifa is still active
    const rifaStatus = currentRifa.status || 'active';
    if (rifaStatus !== 'active') {
        showToast('Esta rifa ya no está disponible para compras', 'error');
        return;
    }
    
    openPaymentModal();
}

// Check verification before payment (opcional para usuarios no registrados)
function checkVerificationBeforePayment() {
    const user = checkAuth();
    
    // Si no hay usuario, no requiere verificación
    if (!user || !user.id) {
        return true;
    }
    
    // Solo usuarios registrados necesitan verificación (opcional, puede comentarse)
    // if (window.isUserVerified && !window.isUserVerified(user.id)) {
    //     showToast('Para mayor seguridad, te recomendamos completar la verificación de identidad', 'info');
    //     return true; // Permitir compra aunque no esté verificado
    // }
    
    return true;
}

// Open payment modal
function openPaymentModal() {
    // Check verification first
    if (!checkVerificationBeforePayment()) {
        return;
    }
    const modal = document.getElementById('paymentModal');
    const content = document.getElementById('paymentContent');
    
    if (!modal || !content || !currentRifa) return;
    
    // Check if user is logged in
    const user = checkAuth();
    const isLoggedIn = user && user.id;
    
    content.innerHTML = `
        <div class="payment-summary">
            <h3>Resumen de Compra</h3>
            <div class="payment-item">
                <span>Rifa:</span>
                <span>${currentRifa.title}</span>
            </div>
            <div class="payment-item">
                <span>Número:</span>
                <span><strong>${String(selectedNumber).padStart(3, '0')}</strong></span>
            </div>
            <div class="payment-item">
                <span>Precio:</span>
                <span><strong>$${formatNumber(currentRifa.price)}</strong></span>
            </div>
        </div>
        
        ${!isLoggedIn ? `
        <div class="guest-info-section">
            <h3>Datos de Contacto</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
                No necesitas registrarte para comprar. Solo necesitamos algunos datos para contactarte.
            </p>
            <div class="form-group">
                <label>Nombre completo *</label>
                <input type="text" id="guestName" placeholder="Juan Pérez" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="guestEmail" placeholder="tu@email.com" required>
            </div>
            <div class="form-group">
                <label>Teléfono *</label>
                <input type="tel" id="guestPhone" placeholder="627 039 947" maxlength="10" required>
            </div>
        </div>
        ` : ''}
        
        <div class="payment-methods">
            <h3>Método de Pago</h3>
            <div class="payment-method" data-method="nequi" onclick="selectPaymentMethod('nequi', this)">
                <i class="fas fa-mobile-alt"></i>
                <span>Nequi</span>
                <small>Confirmación instantánea</small>
            </div>
            <div class="payment-method" data-method="daviplata" onclick="selectPaymentMethod('daviplata', this)">
                <i class="fas fa-wallet"></i>
                <span>Daviplata</span>
                <small>Confirmación instantánea</small>
            </div>
            <div class="payment-method" data-method="paypal" onclick="selectPaymentMethod('paypal', this)">
                <i class="fab fa-paypal"></i>
                <span>PayPal</span>
                <small>2-5 minutos</small>
            </div>
        </div>
        
        <div id="paymentForm" style="display: none;">
            <div id="phoneForm" class="form-group" style="display: none;">
                <label>Número de teléfono para pago *</label>
                <input type="tel" id="paymentPhone" placeholder="627 039 947" maxlength="10">
                <small>Ingresa tu número de teléfono asociado a ${isLoggedIn ? 'tu cuenta' : 'tu método de pago'}</small>
            </div>
            <div id="emailForm" class="form-group" style="display: none;">
                <label>Email para PayPal *</label>
                <input type="email" id="paymentEmail" placeholder="tu@email.com">
                <small>Ingresa tu email de PayPal</small>
            </div>
            <div class="payment-summary-total">
                <div class="payment-item">
                    <span>Subtotal:</span>
                    <span>$${formatNumber(currentRifa.price)}</span>
                </div>
                <div class="payment-item" id="feeItem" style="display: none;">
                    <span>Comisión:</span>
                    <span id="feeAmount">$0</span>
                </div>
                <div class="payment-item total">
                    <span>Total a pagar:</span>
                    <span id="totalAmount">$${formatNumber(currentRifa.price)}</span>
                </div>
            </div>
            <button class="btn btn-primary btn-large" onclick="processRifaPayment()" style="width: 100%;">
                Confirmar Pago
            </button>
        </div>
    `;
    
    openModal(modal);
    
    const closeBtn = document.getElementById('closePayment');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal(modal);
    }
}

// Select payment method
function selectPaymentMethod(method, eventElement) {
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    const targetElement = eventElement || event?.target || document.querySelector(`[data-method="${method}"]`);
    if (targetElement) {
        targetElement.closest('.payment-method')?.classList.add('selected');
    }
    
    const form = document.getElementById('paymentForm');
    const phoneForm = document.getElementById('phoneForm');
    const emailForm = document.getElementById('emailForm');
    const feeItem = document.getElementById('feeItem');
    const feeAmount = document.getElementById('feeAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    if (form) {
        form.style.display = 'block';
    }
    
    // Show appropriate form based on method
    if (method === 'nequi' || method === 'daviplata') {
        if (phoneForm) phoneForm.style.display = 'block';
        if (emailForm) emailForm.style.display = 'none';
    } else if (method === 'paypal') {
        if (phoneForm) phoneForm.style.display = 'none';
        if (emailForm) emailForm.style.display = 'block';
    }
    
    // Calculate and show fee
    if (window.calculateFee && currentRifa) {
        const fee = window.calculateFee(currentRifa.price, method);
        const total = window.calculateTotal(currentRifa.price, method);
        
        if (fee > 0) {
            if (feeItem) feeItem.style.display = 'flex';
            if (feeAmount) feeAmount.textContent = '$' + formatNumber(fee);
        } else {
            if (feeItem) feeItem.style.display = 'none';
        }
        
        if (totalAmount) totalAmount.textContent = '$' + formatNumber(total);
    }
}

// Process payment (wrapper function that uses the main processPayment from payments.js)
async function processRifaPayment() {
    const selectedMethod = document.querySelector('.payment-method.selected');
    if (!selectedMethod) {
        showToast('Por favor selecciona un método de pago', 'warning');
        return;
    }
    
    const method = selectedMethod.getAttribute('data-method');
    const user = checkAuth();
    const isLoggedIn = user && user.id;
    
    // Validate guest information if not logged in
    if (!isLoggedIn) {
        const guestName = document.getElementById('guestName')?.value?.trim();
        const guestEmail = document.getElementById('guestEmail')?.value?.trim();
        const guestPhone = document.getElementById('guestPhone')?.value?.trim();
        
        if (!guestName || guestName.length < 3) {
            showToast('Por favor ingresa tu nombre completo', 'warning');
            document.getElementById('guestName')?.focus();
            return;
        }
        
        if (!guestEmail || !guestEmail.includes('@')) {
            showToast('Por favor ingresa un email válido', 'warning');
            document.getElementById('guestEmail')?.focus();
            return;
        }
        
        if (!guestPhone || guestPhone.length < 10) {
            showToast('Por favor ingresa un número de teléfono válido', 'warning');
            document.getElementById('guestPhone')?.focus();
            return;
        }
    }
    
    const phone = document.getElementById('paymentPhone')?.value || document.getElementById('guestPhone')?.value;
    const email = document.getElementById('paymentEmail')?.value || document.getElementById('guestEmail')?.value || user?.email;
    
    // Validate based on method
    if ((method === 'nequi' || method === 'daviplata') && !phone) {
        showToast('Por favor ingresa tu número de teléfono', 'warning');
        return;
    }
    
    if (method === 'paypal' && !email) {
        showToast('Por favor ingresa tu email', 'warning');
        return;
    }
    
    showToast('Procesando pago...', 'info');
    
    try {
        // Prepare guest or user data
        const buyerData = isLoggedIn ? {
            userId: user.id,
            userName: user.firstName + ' ' + (user.lastName || ''),
            userEmail: user.email
        } : {
            userId: null,
            userName: document.getElementById('guestName')?.value?.trim(),
            userEmail: document.getElementById('guestEmail')?.value?.trim(),
            userPhone: document.getElementById('guestPhone')?.value?.trim(),
            isGuest: true
        };
        
        // Use structured payment system from payments.js
        const paymentData = {
            rifaId: currentRifa.id,
            rifaTitle: currentRifa.title,
            rifaImage: currentRifa.image,
            number: selectedNumber,
            amount: currentRifa.price,
            method: method,
            phone: phone,
            email: email,
            userId: buyerData.userId,
            userName: buyerData.userName,
            userEmail: buyerData.userEmail,
            isGuest: buyerData.isGuest || false,
            endDate: currentRifa.endDate
        };
        
        // Use the main processPayment function from payments.js
        if (!window.processPayment) {
            throw new Error('Sistema de pagos no disponible');
        }
        
        const result = await window.processPayment(paymentData);
        
        if (result.success) {
            showToast('¡Compra realizada exitosamente!', 'success');
            
            // Save guest purchase if not logged in
            if (!isLoggedIn) {
                saveGuestPurchase(paymentData, buyerData);
            }
            
            setTimeout(() => {
                closeModal(document.getElementById('paymentModal'));
                if (isLoggedIn) {
                    window.location.href = 'dashboard-comprador.html';
                } else {
                    // Show success message and option to register
                    if (confirm('¿Deseas crear una cuenta para ver tus compras y recibir notificaciones?')) {
                        window.location.href = 'index.html#register';
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            }, 2000);
        } else {
            showToast(result.error || 'Error al procesar el pago', 'error');
        }
    } catch (error) {
        console.error('Payment error in rifa-detalle.js:', error);
        
        // More specific error messages
        let errorMessage = 'Error al procesar el pago';
        
        if (error.message) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'La solicitud tardó demasiado. Por favor intenta nuevamente.';
            } else {
                errorMessage = error.message;
            }
        }
        
        showToast(errorMessage, 'error');
        
        // Log error for debugging
        if (window.console && console.error) {
            console.error('Payment processing error:', {
                error: error,
                rifaId: currentRifa?.id,
                number: selectedNumber,
                method: method
            });
        }
    }
}

// Save guest purchase
function saveGuestPurchase(paymentData, buyerData) {
    try {
        const guestPurchases = JSON.parse(localStorage.getItem('guestPurchases') || '[]');
        
        const purchase = {
            id: 'GUEST-' + Date.now(),
            rifaId: paymentData.rifaId,
            rifaTitle: paymentData.rifaTitle,
            rifaImage: paymentData.rifaImage,
            number: paymentData.number,
            price: paymentData.amount,
            purchaseDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'confirmed',
            rifaStatus: 'active',
            endDate: paymentData.endDate,
            paymentMethod: paymentData.method,
            phone: paymentData.phone,
            email: buyerData.userEmail,
            buyerName: buyerData.userName,
            buyerPhone: buyerData.userPhone,
            isGuest: true
        };
        
        guestPurchases.push(purchase);
        localStorage.setItem('guestPurchases', JSON.stringify(guestPurchases));
    } catch (error) {
        console.error('Error saving guest purchase:', error);
    }
}

// Save purchase to historial
function savePurchaseToHistorial(rifa, number) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const purchase = {
        id: Date.now(),
        rifaId: rifa.id,
        rifaTitle: rifa.title,
        rifaImage: rifa.image,
        number: number,
        price: rifa.price,
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'confirmed',
        rifaStatus: 'active',
        endDate: rifa.endDate,
        paymentMethod: 'nequi',
        phone: document.getElementById('paymentPhone')?.value || ''
    };
    
    purchases.push(purchase);
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
}

// Update rifa sold numbers
function updateRifaSoldNumbers(rifaId, number) {
    // Update in myRifas (organizer's rifas)
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    
    if (rifaIndex !== -1) {
        myRifas[rifaIndex].soldNumbers = (myRifas[rifaIndex].soldNumbers || 0) + 1;
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    }
    
    // Update in talonario state
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifaId}_numbers`) || '{}');
    numbersState[number] = {
        status: 'sold',
        buyer: JSON.parse(localStorage.getItem('user') || '{}').firstName || 'Comprador',
        purchaseDate: new Date().toISOString()
    };
    localStorage.setItem(`rifa_${rifaId}_numbers`, JSON.stringify(numbersState));
}

// Show error with better error handling
function showError(message, error = null) {
    const content = document.getElementById('rifaDetailContent');
    if (content) {
        let errorDetails = '';
        
        if (error) {
            console.error('Rifa detail error:', error);
            errorDetails = `
                <details style="margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <summary style="cursor: pointer; color: var(--text-secondary);">Detalles técnicos</summary>
                    <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); margin-top: 0.5rem; overflow-x: auto; font-size: 0.875rem;">${error.message || JSON.stringify(error, null, 2)}</pre>
                </details>
            `;
        }
        
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h2>${message}</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">Por favor intenta nuevamente o contacta al soporte si el problema persiste.</p>
                ${errorDetails}
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i> Volver al Inicio
                    </a>
                    <button class="btn btn-outline" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            </div>
        `;
    }
}

// Add detail styles
function addDetailStyles() {
    if (document.getElementById('rifaDetailStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'rifaDetailStyles';
    style.textContent = `
        .rifa-detail-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }
        .rifa-detail-image {
            position: relative;
        }
        .rifa-detail-image img {
            width: 100%;
            border-radius: var(--radius-xl);
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .rifa-detail-image img:hover {
            transform: scale(1.02);
        }
        .image-gallery {
            position: relative;
        }
        .main-image-container {
            position: relative;
            margin-bottom: 1rem;
        }
        .main-image-container img {
            width: 100%;
            border-radius: var(--radius-xl);
            cursor: pointer;
            display: block;
        }
        .image-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.6);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
            z-index: 10;
        }
        .image-nav-btn:hover {
            background: rgba(0, 0, 0, 0.8);
        }
        .image-nav-btn.prev-btn {
            left: 1rem;
        }
        .image-nav-btn.next-btn {
            right: 1rem;
        }
        .image-counter {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
        }
        .image-thumbnails {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 0.5rem;
        }
        .image-thumbnails .thumbnail {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
            border-radius: var(--radius-md);
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s ease;
            opacity: 0.7;
        }
        .image-thumbnails .thumbnail:hover {
            opacity: 1;
            transform: scale(1.05);
        }
        .image-thumbnails .thumbnail.active {
            border-color: var(--primary-color);
            opacity: 1;
        }
        .image-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .lightbox-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .lightbox-content img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: var(--radius-lg);
        }
        .lightbox-close {
            position: absolute;
            top: -3rem;
            right: 0;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: background 0.3s ease;
            z-index: 10001;
        }
        .lightbox-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: background 0.3s ease;
            z-index: 10001;
        }
        .lightbox-nav:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .lightbox-nav.prev {
            left: -3rem;
        }
        .lightbox-nav.next {
            right: -3rem;
        }
        .lightbox-counter {
            position: absolute;
            bottom: -3rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
        }
        .lightbox-thumbnails {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            max-width: 100%;
            overflow-x: auto;
            padding: 0.5rem;
        }
        .lightbox-thumbnails .lightbox-thumb {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: var(--radius-md);
            cursor: pointer;
            border: 2px solid transparent;
            opacity: 0.6;
            transition: all 0.3s ease;
        }
        .lightbox-thumbnails .lightbox-thumb:hover {
            opacity: 1;
        }
        .lightbox-thumbnails .lightbox-thumb.active {
            border-color: white;
            opacity: 1;
        }
        @media (max-width: 768px) {
            .lightbox-nav.prev {
                left: 0.5rem;
            }
            .lightbox-nav.next {
                right: 0.5rem;
            }
            .lightbox-close {
                top: 0.5rem;
                right: 0.5rem;
            }
            .lightbox-counter {
                bottom: 0.5rem;
            }
        }
        .rifa-status-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }
        .badge-active {
            background: rgba(34, 197, 94, 0.9);
            color: white;
        }
        .badge-paused {
            background: rgba(251, 191, 36, 0.9);
            color: white;
        }
        .badge-completed {
            background: rgba(59, 130, 246, 0.9);
            color: white;
        }
        .badge-cancelled {
            background: rgba(239, 68, 68, 0.9);
            color: white;
        }
        .rifa-winner-section {
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: var(--radius-lg);
            color: white;
        }
        .winner-badge {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .winner-badge i {
            font-size: 2rem;
        }
        .rifa-conditions {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
        }
        .rifa-conditions ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
        }
        .rifa-conditions li {
            margin: 0.5rem 0;
            color: var(--text-secondary);
        }
        .favorite-active {
            background: var(--primary-color) !important;
            color: white !important;
        }
        .favorite-active i {
            color: white !important;
        }
        .number-search input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
        }
        .number-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 0.5rem;
            max-height: 400px;
            overflow-y: auto;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        .number-btn {
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            background: var(--bg-primary);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: var(--transition-fast);
        }
        .number-btn:hover:not(.sold) {
            border-color: var(--primary-color);
            background: rgba(37, 99, 235, 0.1);
        }
        .number-btn.selected {
            border-color: var(--primary-color);
            background: var(--primary-color);
            color: white;
        }
        .number-btn.sold {
            background: var(--border-light);
            color: var(--text-light);
            cursor: not-allowed;
            opacity: 0.6;
        }
        .rifa-reviews-section {
            margin-top: 3rem;
            padding-top: 3rem;
            border-top: 2px solid var(--border-light);
        }
        .rifa-reviews-section h2 {
            margin-bottom: 2rem;
        }
        .review-item {
            padding: 1.5rem;
            margin-bottom: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
        }
        .review-user {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .review-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
        .review-rating {
            margin-top: 0.25rem;
        }
        .review-comment {
            margin-top: 0.75rem;
            color: var(--text-primary);
        }
        .review-verified {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
        }
        .share-menu {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .share-menu-content {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: var(--radius-xl);
            max-width: 400px;
            width: 90%;
        }
        .share-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .share-btn {
            padding: 1rem;
            border: 2px solid var(--border-color);
            background: var(--bg-primary);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .share-btn:hover {
            border-color: var(--primary-color);
            background: rgba(37, 99, 235, 0.1);
        }
        .share-whatsapp:hover {
            border-color: #25d366;
            background: rgba(37, 211, 102, 0.1);
        }
        .share-facebook:hover {
            border-color: #1877f2;
            background: rgba(24, 119, 242, 0.1);
        }
        .share-twitter:hover {
            border-color: #1da1f2;
            background: rgba(29, 161, 242, 0.1);
        }
        .rifa-recent-buyers-section {
            margin-top: 3rem;
            padding-top: 3rem;
            border-top: 2px solid var(--border-light);
        }
        .rifa-recent-buyers-section h2 {
            margin-bottom: 2rem;
        }
        .recent-buyer-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            border-left: 3px solid var(--primary-color);
        }
        .buyer-number {
            font-size: 1.125rem;
            color: var(--primary-color);
        }
        .buyer-info {
            text-align: right;
        }
        .buyer-name {
            display: block;
            font-weight: 600;
            color: var(--text-primary);
        }
        .buyer-date {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        .rifa-questions-section {
            margin-top: 3rem;
            padding-top: 3rem;
            border-top: 2px solid var(--border-light);
        }
        .rifa-questions-section h2 {
            margin-bottom: 2rem;
        }
        .question-item {
            padding: 1.5rem;
            margin-bottom: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        .question-header {
            margin-bottom: 0.75rem;
        }
        .question-user strong {
            color: var(--text-primary);
        }
        .question-user small {
            color: var(--text-secondary);
            margin-left: 0.5rem;
        }
        .question-text {
            color: var(--text-primary);
            margin-bottom: 1rem;
            line-height: 1.6;
        }
        .answer-item {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--bg-primary);
            border-radius: var(--radius-md);
            border-left: 3px solid var(--primary-color);
        }
        .answer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .answer-header strong {
            color: var(--primary-color);
        }
        .answer-header small {
            color: var(--text-secondary);
        }
        .answer-text {
            color: var(--text-primary);
            line-height: 1.6;
        }
        .answer-pending {
            margin-top: 1rem;
            padding: 0.75rem;
            background: rgba(251, 191, 36, 0.1);
            border-radius: var(--radius-md);
            text-align: center;
        }
        .answer-pending small {
            color: #f59e0b;
        }
        .ask-question-form {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        .ask-question-form h3 {
            margin-bottom: 1rem;
        }
        .ask-question-form textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-family: inherit;
            font-size: 1rem;
            resize: vertical;
            margin-bottom: 1rem;
        }
        .ask-question-form textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        .guest-info-section {
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        .guest-info-section h3 {
            margin-bottom: 0.5rem;
        }
        .guest-info-section .form-group {
            margin-bottom: 1rem;
        }
        .guest-info-section label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        .guest-info-section input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        .guest-info-section input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        .rifa-additional-info {
            margin-top: 1.5rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .info-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        .info-item i {
            color: var(--primary-color);
            width: 16px;
        }
        .info-item strong {
            color: var(--text-primary);
        }
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--border-light);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-skeleton {
            padding: 1rem;
        }
        .skeleton-line {
            height: 20px;
            background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-secondary) 50%, var(--border-light) 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s ease-in-out infinite;
            border-radius: var(--radius-md);
            margin-bottom: 0.75rem;
        }
        .skeleton-line:first-child {
            width: 80%;
        }
        .skeleton-line:last-child {
            width: 60%;
        }
        .loading-skeleton-numbers {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 0.5rem;
        }
        .loading-skeleton-numbers::before {
            content: '';
            display: block;
            grid-column: 1 / -1;
            height: 20px;
            background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-secondary) 50%, var(--border-light) 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s ease-in-out infinite;
            border-radius: var(--radius-md);
        }
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
            .rifa-detail-container {
                grid-template-columns: 1fr;
            }
            .share-buttons {
                grid-template-columns: 1fr;
            }
            .recent-buyer-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            .buyer-info {
                text-align: left;
            }
        }
    `;
    document.head.appendChild(style);
}

// Get rifa status info
function getRifaStatusInfo(status, rifa) {
    const statusConfig = {
        'active': {
            badge: '<span class="rifa-status-badge badge-active"><i class="fas fa-check-circle"></i> Activa</span>',
            canBuy: true
        },
        'paused': {
            badge: '<span class="rifa-status-badge badge-paused"><i class="fas fa-pause-circle"></i> Pausada</span>',
            canBuy: false
        },
        'completed': {
            badge: '<span class="rifa-status-badge badge-completed"><i class="fas fa-check-circle"></i> Completada</span>',
            canBuy: false
        },
        'cancelled': {
            badge: '<span class="rifa-status-badge badge-cancelled"><i class="fas fa-times-circle"></i> Cancelada</span>',
            canBuy: false
        },
        'sorteada': {
            badge: '<span class="rifa-status-badge badge-completed"><i class="fas fa-trophy"></i> Sorteada</span>',
            canBuy: false
        }
    };
    
    return statusConfig[status] || statusConfig['active'];
}

// Get rifa winner info
function getRifaWinner(rifa) {
    if (rifa.status !== 'completed' && rifa.status !== 'sorteada' && !rifa.winnerNumber) {
        return null;
    }
    
    const winnerNumber = rifa.winnerNumber;
    if (!winnerNumber) return null;
    
    // Get buyer info from numbers state
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifa.id}_numbers`) || '{}');
    const numberData = numbersState[winnerNumber];
    
    return {
        number: winnerNumber,
        buyer: numberData?.buyer || rifa.winnerName || 'No disponible'
    };
}

// Toggle favorite
function toggleFavorite(rifaId) {
    if (!window.addToFavorites) {
        showToast('Función de favoritos no disponible', 'error');
        return;
    }
    
    window.addToFavorites(rifaId);
    
    // Update button state
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteText = document.getElementById('favoriteText');
    
    if (favoriteBtn && favoriteText) {
        const isFavorite = window.isFavorite ? window.isFavorite(rifaId) : false;
        if (isFavorite) {
            favoriteBtn.classList.add('favorite-active');
            favoriteText.textContent = 'Eliminar de Favoritos';
        } else {
            favoriteBtn.classList.remove('favorite-active');
            favoriteText.textContent = 'Agregar a Favoritos';
        }
    }
}

// Share rifa
function shareRifa(rifaId) {
    const rifa = currentRifa || getRifaById(rifaId);
    if (!rifa) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${rifaId}`;
    const shareText = `¡Mira esta rifa: ${rifa.title}!`;
    
    // Create share menu
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-menu-content">
            <h3>Compartir Rifa</h3>
            <div class="share-buttons">
                <button class="share-btn share-whatsapp" onclick="shareToWhatsApp('${shareUrl}', '${shareText}')">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button class="share-btn share-facebook" onclick="shareToFacebook('${shareUrl}')">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button class="share-btn share-twitter" onclick="shareToTwitter('${shareUrl}', '${shareText}')">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="share-btn share-copy" onclick="copyShareLink('${shareUrl}')">
                    <i class="fas fa-copy"></i> Copiar Enlace
                </button>
            </div>
            <button class="btn btn-outline" onclick="this.closest('.share-menu').remove()">Cerrar</button>
        </div>
    `;
    
    document.body.appendChild(shareMenu);
    
    // Close on outside click
    setTimeout(() => {
        shareMenu.addEventListener('click', (e) => {
            if (e.target === shareMenu) {
                shareMenu.remove();
            }
        });
    }, 100);
}

// Share functions
function shareToWhatsApp(url, text) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    document.querySelector('.share-menu')?.remove();
}

function shareToFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    document.querySelector('.share-menu')?.remove();
}

function shareToTwitter(url, text) {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    document.querySelector('.share-menu')?.remove();
}

function copyShareLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('Enlace copiado al portapapeles', 'success');
        document.querySelector('.share-menu')?.remove();
    }).catch(() => {
        showToast('Error al copiar enlace', 'error');
    });
}

// Load rifa reviews
function loadRifaReviews(rifa) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading-skeleton"><div class="skeleton-line"></div><div class="skeleton-line"></div></div>';
    
    // Simulate loading delay
    setTimeout(() => {
        // Try to get reviews for this rifa
        let rifaReviews = [];
        
        if (window.getRifaReviews) {
            rifaReviews = window.getRifaReviews(rifa.id);
        } else if (window.getOrganizerReviews && rifa.organizerId) {
            const reviews = window.getOrganizerReviews(rifa.organizerId);
            rifaReviews = reviews.filter(r => r.rifaId === rifa.id || r.rifaId === parseInt(rifa.id));
        }
        
        if (rifaReviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aún no hay reseñas para esta rifa</p>';
            return;
        }
        
        container.innerHTML = rifaReviews.slice(0, 5).map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-user">
                        <img src="${review.userAvatar || 'https://ui-avatars.com/api/?name=' + (review.userName || 'Usuario')}" 
                             alt="${review.userName || 'Usuario'}" class="review-avatar">
                        <div>
                            <strong>${review.userName || 'Usuario'}</strong>
                            <div class="review-rating">
                                ${generateReviewStars(review.rating || 5)}
                            </div>
                        </div>
                    </div>
                    <small>${review.createdAt ? formatDate(review.createdAt) : 'Fecha no disponible'}</small>
                </div>
                ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                ${review.verified ? '<span class="review-verified"><i class="fas fa-check-circle"></i> Compra verificada</span>' : ''}
            </div>
        `).join('');
        
        if (rifaReviews.length > 5 && rifa.organizerId) {
            container.innerHTML += `
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="perfil-organizador.html?id=${rifa.organizerId}" class="btn btn-outline">
                        Ver todas las reseñas (${rifaReviews.length})
                    </a>
                </div>
            `;
        }
    }, 200);
}

// Generate review stars
function generateReviewStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star" style="color: #fbbf24;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #d1d5db;"></i>';
        }
    }
    return stars;
}

// Load recent buyers
function loadRecentBuyers(rifa) {
    const container = document.getElementById('recentBuyersContainer');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading-skeleton"><div class="skeleton-line"></div><div class="skeleton-line"></div></div>';
    
    // Simulate loading delay
    setTimeout(() => {
        // Get purchases for this rifa
        const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        const rifaPurchases = purchases.filter(p => p.rifaId === rifa.id || p.rifaId === parseInt(rifa.id));
        
        // Also get from numbers state
        const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifa.id}_numbers`) || '{}');
        const recentNumbers = Object.entries(numbersState)
            .filter(([num, data]) => data.status === 'sold')
            .sort((a, b) => {
                const dateA = new Date(a[1].purchaseDate || 0);
                const dateB = new Date(b[1].purchaseDate || 0);
                return dateB - dateA;
            })
            .slice(0, 10);
        
        if (recentNumbers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aún no hay compradores</p>';
            return;
        }
        
        container.innerHTML = recentNumbers.map(([number, data]) => `
            <div class="recent-buyer-item">
                <div class="buyer-number">
                    <strong>Número ${String(number).padStart(3, '0')}</strong>
                </div>
                <div class="buyer-info">
                    <span class="buyer-name">${data.buyer || 'Comprador'}</span>
                    <small class="buyer-date">${data.purchaseDate ? formatDate(data.purchaseDate) : 'Fecha no disponible'}</small>
                </div>
            </div>
        `).join('');
    }, 200);
}

// Load rifa questions
function loadRifaQuestions(rifa) {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    // Get questions from localStorage (in production, this would come from API)
    const questions = JSON.parse(localStorage.getItem(`rifa_${rifa.id}_questions`) || '[]');
    
    if (questions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aún no hay preguntas. ¡Sé el primero en preguntar!</p>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedQuestions = questions.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    container.innerHTML = sortedQuestions.map(q => `
        <div class="question-item">
            <div class="question-header">
                <div class="question-user">
                    <strong>${q.userName || 'Usuario'}</strong>
                    <small>${q.createdAt ? formatDate(q.createdAt) : ''}</small>
                </div>
            </div>
            <div class="question-text">${q.question}</div>
            ${q.answer ? `
            <div class="answer-item">
                <div class="answer-header">
                    <strong><i class="fas fa-reply"></i> ${rifa.organizer.name}</strong>
                    <small>${q.answeredAt ? formatDate(q.answeredAt) : ''}</small>
                </div>
                <div class="answer-text">${q.answer}</div>
            </div>
            ` : `
            <div class="answer-pending">
                <small><i class="fas fa-clock"></i> Esperando respuesta del organizador</small>
            </div>
            `}
        </div>
    `).join('');
}

// Submit question with validation
function submitQuestion(rifaId) {
    try {
        // Validate rifaId
        if (!rifaId) {
            showToast('Error: ID de rifa no válido', 'error');
            return;
        }
        
        const questionInput = document.getElementById('questionText');
        if (!questionInput) {
            showToast('Error: Campo de pregunta no encontrado', 'error');
            return;
        }
        
        const questionText = questionInput.value?.trim();
        
        // Validate question text
        if (!questionText) {
            showToast('Por favor escribe tu pregunta', 'warning');
            questionInput.focus();
            return;
        }
        
        if (questionText.length < 10) {
            showToast('La pregunta debe tener al menos 10 caracteres', 'warning');
            questionInput.focus();
            return;
        }
        
        if (questionText.length > 500) {
            showToast('La pregunta no puede exceder 500 caracteres', 'warning');
            questionInput.focus();
            return;
        }
        
        const user = checkAuth();
        const isLoggedIn = user && user.id;
        
        // Validate guest information if not logged in
        if (!isLoggedIn) {
            const guestName = document.getElementById('questionName')?.value?.trim();
            const guestEmail = document.getElementById('questionEmail')?.value?.trim();
            
            if (!guestName || guestName.length < 3) {
                showToast('Por favor ingresa tu nombre', 'warning');
                document.getElementById('questionName')?.focus();
                return;
            }
            
            if (!guestEmail || !guestEmail.includes('@')) {
                showToast('Por favor ingresa un email válido', 'warning');
                document.getElementById('questionEmail')?.focus();
                return;
            }
        }
        
        // Get existing questions
        let questions = [];
        try {
            const stored = localStorage.getItem(`rifa_${rifaId}_questions`);
            if (stored) {
                questions = JSON.parse(stored);
                if (!Array.isArray(questions)) {
                    questions = [];
                }
            }
        } catch (e) {
            console.error('Error reading questions from storage:', e);
            questions = [];
        }
        
        // Add new question
        const newQuestion = {
            id: 'Q-' + Date.now(),
            rifaId: rifaId,
            userId: isLoggedIn ? user.id : null,
            userName: isLoggedIn 
                ? (user.firstName || '') + ' ' + (user.lastName || '')
                : document.getElementById('questionName')?.value?.trim(),
            userEmail: isLoggedIn 
                ? user.email 
                : document.getElementById('questionEmail')?.value?.trim(),
            question: questionText,
            answer: null,
            createdAt: new Date().toISOString(),
            answeredAt: null,
            isGuest: !isLoggedIn
        };
        
        questions.push(newQuestion);
        
        try {
            localStorage.setItem(`rifa_${rifaId}_questions`, JSON.stringify(questions));
        } catch (e) {
            console.error('Error saving question:', e);
            showToast('Error al guardar la pregunta. Por favor intenta nuevamente.', 'error');
            return;
        }
        
        // Clear inputs
        questionInput.value = '';
        if (!isLoggedIn) {
            document.getElementById('questionName').value = '';
            document.getElementById('questionEmail').value = '';
        }
        
        showToast('Pregunta enviada exitosamente', 'success');
        
        // Reload questions
        if (currentRifa) {
            loadRifaQuestions(currentRifa);
        }
    } catch (error) {
        console.error('Error submitting question:', error);
        showToast('Error inesperado al enviar la pregunta. Por favor intenta nuevamente.', 'error');
    }
}

// Export functions
window.openNumberSelector = openNumberSelector;
window.selectNumber = selectNumber;
window.proceedToPayment = proceedToPayment;
window.selectPaymentMethod = selectPaymentMethod;
window.processRifaPayment = processRifaPayment;
// Image gallery functions
function changeImage(direction) {
    if (currentImages.length <= 1) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    
    updateMainImage();
    updateThumbnails();
}

function selectThumbnail(index) {
    if (index < 0 || index >= currentImages.length) return;
    
    currentImageIndex = index;
    updateMainImage();
    updateThumbnails();
}

function updateMainImage() {
    const mainImage = document.getElementById('mainImage');
    const counter = document.getElementById('currentImageIndex');
    
    if (mainImage && currentImages[currentImageIndex]) {
        mainImage.src = currentImages[currentImageIndex];
        mainImage.onerror = function() {
            this.src = 'https://via.placeholder.com/600x400?text=Sin+Imagen';
        };
    }
    
    if (counter) {
        counter.textContent = currentImageIndex + 1;
    }
}

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function openImageLightbox(index) {
    if (!currentImages || currentImages.length === 0) return;
    
    currentImageIndex = index || 0;
    
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeImageLightbox()">
                <i class="fas fa-times"></i>
            </button>
            ${currentImages.length > 1 ? `
            <button class="lightbox-nav prev" onclick="navigateLightbox(-1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-nav next" onclick="navigateLightbox(1)">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="lightbox-counter">
                <span id="lightboxIndex">${currentImageIndex + 1}</span> / ${currentImages.length}
            </div>
            ` : ''}
            <img src="${currentImages[currentImageIndex]}" 
                 alt="Imagen ${currentImageIndex + 1}"
                 id="lightboxImage"
                 onerror="this.src='https://via.placeholder.com/800x600?text=Sin+Imagen'">
            ${currentImages.length > 1 ? `
            <div class="lightbox-thumbnails">
                ${currentImages.map((img, idx) => `
                    <img src="${img}" 
                         class="lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}"
                         onclick="selectLightboxImage(${idx})"
                         onerror="this.src='https://via.placeholder.com/80?text=Sin+Imagen'">
                `).join('')}
            </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeImageLightbox();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeImageLightbox();
        }
    });
}

function navigateLightbox(direction) {
    if (currentImages.length <= 1) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxIndex = document.getElementById('lightboxIndex');
    const lightboxThumbs = document.querySelectorAll('.lightbox-thumb');
    
    if (lightboxImage) {
        lightboxImage.src = currentImages[currentImageIndex];
        lightboxImage.onerror = function() {
            this.src = 'https://via.placeholder.com/800x600?text=Sin+Imagen';
        };
    }
    
    if (lightboxIndex) {
        lightboxIndex.textContent = currentImageIndex + 1;
    }
    
    lightboxThumbs.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function selectLightboxImage(index) {
    if (index < 0 || index >= currentImages.length) return;
    currentImageIndex = index;
    navigateLightbox(0);
}

function closeImageLightbox() {
    const lightbox = document.querySelector('.image-lightbox');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
    }
}

// Export functions
window.openNumberSelector = openNumberSelector;
window.selectNumber = selectNumber;
window.proceedToPayment = proceedToPayment;
window.selectPaymentMethod = selectPaymentMethod;
window.processRifaPayment = processRifaPayment;
window.toggleFavorite = toggleFavorite;
window.shareRifa = shareRifa;
window.filterNumbers = filterNumbers;
window.submitQuestion = submitQuestion;
window.changeImage = changeImage;
window.selectThumbnail = selectThumbnail;
window.openImageLightbox = openImageLightbox;
window.navigateLightbox = navigateLightbox;
window.selectLightboxImage = selectLightboxImage;
window.closeImageLightbox = closeImageLightbox;

// Get organizer rating display
function getOrganizerRatingDisplay(organizerId) {
    if (!window.getOrganizerRatingStats) {
        return '';
    }
    
    const stats = window.getOrganizerRatingStats(organizerId);
    
    if (stats.totalReviews === 0) {
        return '';
    }
    
    const fullStars = Math.floor(stats.averageRating);
    const hasHalfStar = stats.averageRating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star" style="color: #fbbf24; font-size: 0.875rem;"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt" style="color: #fbbf24; font-size: 0.875rem;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #d1d5db; font-size: 0.875rem;"></i>';
        }
    }
    
    return `
        <span style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: var(--text-secondary);">
            ${stars}
            <span>${stats.averageRating.toFixed(1)} (${stats.totalReviews})</span>
        </span>
    `;
}
