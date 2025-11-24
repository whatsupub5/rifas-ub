// ========== SUBSCRIPTION PAGE LOGIC ==========

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) {
        showToast('Debes iniciar sesión para suscribirte', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadSubscriptionPlans();
});

function loadSubscriptionPlans() {
    const plansContainer = document.getElementById('subscriptionPlans');
    if (!plansContainer || !window.SUBSCRIPTION_PLANS) return;
    
    const plans = Object.values(window.SUBSCRIPTION_PLANS);
    const currentSubscription = window.getUserSubscription ? window.getUserSubscription(JSON.parse(localStorage.getItem('user') || '{}').id) : null;
    
    plansContainer.innerHTML = '';
    
    plans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = `subscription-plan-card ${plan.popular ? 'popular' : ''}`;
        
        const isCurrentPlan = currentSubscription && currentSubscription.planId === plan.id;
        
        planCard.innerHTML = `
            ${plan.popular ? '<div class="popular-badge">Más Popular</div>' : ''}
            <div class="plan-header">
                <h3>${plan.name}</h3>
                <div class="plan-price">
                    <span class="price-amount">$${formatNumber(plan.price)}</span>
                    <span class="price-period">/mes</span>
                </div>
            </div>
            
            <div class="plan-features">
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>${plan.features.imageGenerations === 'unlimited' ? 'Ilimitadas' : plan.features.imageGenerations} generaciones de imágenes</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>${plan.features.videoGenerations === 'unlimited' ? 'Ilimitados' : plan.features.videoGenerations} generaciones de videos</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>${plan.features.chatMessages === 'unlimited' ? 'Ilimitados' : plan.features.chatMessages} mensajes en chat</span>
                </div>
                ${plan.features.prioritySupport ? `
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>Soporte prioritario</span>
                </div>
                ` : ''}
            </div>
            
            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-large" 
                    onclick="subscribeToPlan('${plan.id}')" 
                    ${isCurrentPlan ? 'disabled' : ''}
                    style="width: 100%; margin-top: 2rem;">
                ${isCurrentPlan ? '<i class="fas fa-check-circle"></i> Plan Actual' : '<i class="fas fa-crown"></i> Suscribirse'}
            </button>
        `;
        
        plansContainer.appendChild(planCard);
    });
}

async function subscribeToPlan(planId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
        showToast('Error: Usuario no identificado', 'error');
        return;
    }
    
    // Show payment modal
    showPaymentModal(planId);
}

function showPaymentModal(planId) {
    const plan = window.SUBSCRIPTION_PLANS[planId];
    if (!plan) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'subscriptionPaymentModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Suscribirse a ${plan.name}</h2>
                <button class="modal-close" onclick="closeSubscriptionModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="payment-summary">
                    <div class="payment-item">
                        <span>Plan:</span>
                        <span>${plan.name}</span>
                    </div>
                    <div class="payment-item">
                        <span>Precio:</span>
                        <span><strong>$${formatNumber(plan.price)}</strong> /mes</span>
                    </div>
                    <div class="payment-item">
                        <span>Duración:</span>
                        <span>${plan.duration} días</span>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h3>Método de Pago</h3>
                    <div class="payment-method" data-method="nequi" onclick="selectSubscriptionPaymentMethod('nequi')">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Nequi</span>
                    </div>
                    <div class="payment-method" data-method="daviplata" onclick="selectSubscriptionPaymentMethod('daviplata')">
                        <i class="fas fa-wallet"></i>
                        <span>Daviplata</span>
                    </div>
                    <div class="payment-method" data-method="paypal" onclick="selectSubscriptionPaymentMethod('paypal')">
                        <i class="fab fa-paypal"></i>
                        <span>PayPal</span>
                    </div>
                </div>
                
                <div id="subscriptionPaymentForm" style="display: none; margin-top: 1.5rem;">
                    <div id="phoneForm" class="form-group" style="display: none;">
                        <label>Número de teléfono *</label>
                        <input type="tel" id="subscriptionPhone" placeholder="627 039 947" maxlength="9">
                    </div>
                    <div id="emailForm" class="form-group" style="display: none;">
                        <label>Email *</label>
                        <input type="email" id="subscriptionEmail" placeholder="tu@email.com">
                    </div>
                    <button class="btn btn-primary btn-large" onclick="processSubscriptionPayment('${planId}')" style="width: 100%;">
                        Confirmar Suscripción
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function selectSubscriptionPaymentMethod(method) {
    document.querySelectorAll('#subscriptionPaymentModal .payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    event.target.closest('.payment-method').classList.add('selected');
    
    const form = document.getElementById('subscriptionPaymentForm');
    const phoneForm = document.getElementById('phoneForm');
    const emailForm = document.getElementById('emailForm');
    
    if (form) form.style.display = 'block';
    
    if (method === 'nequi' || method === 'daviplata') {
        if (phoneForm) phoneForm.style.display = 'block';
        if (emailForm) emailForm.style.display = 'none';
    } else if (method === 'paypal') {
        if (phoneForm) phoneForm.style.display = 'none';
        if (emailForm) emailForm.style.display = 'block';
    }
}

async function processSubscriptionPayment(planId) {
    const selectedMethod = document.querySelector('#subscriptionPaymentModal .payment-method.selected');
    if (!selectedMethod) {
        showToast('Por favor selecciona un método de pago', 'warning');
        return;
    }
    
    const method = selectedMethod.getAttribute('data-method');
    const phone = document.getElementById('subscriptionPhone')?.value;
    const email = document.getElementById('subscriptionEmail')?.value;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if ((method === 'nequi' || method === 'daviplata') && !phone) {
        showToast('Por favor ingresa tu número de teléfono', 'warning');
        return;
    }
    
    if (method === 'paypal' && !email) {
        showToast('Por favor ingresa tu email', 'warning');
        return;
    }
    
    showToast('Procesando suscripción...', 'info');
    
    try {
        const result = await window.createSubscription(user.id, planId, method);
        
        if (result.success) {
            showToast('¡Suscripción activada exitosamente!', 'success');
            closeSubscriptionModal();
            setTimeout(() => {
                window.location.href = 'ai-generator.html';
            }, 2000);
        } else {
            showToast(result.error || 'Error al procesar la suscripción', 'error');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showToast('Error al procesar la suscripción', 'error');
    }
}

function closeSubscriptionModal() {
    const modal = document.getElementById('subscriptionPaymentModal');
    if (modal) {
        modal.remove();
    }
}

function formatNumber(number) {
    return new Intl.NumberFormat('es-CO').format(number);
}

window.subscribeToPlan = subscribeToPlan;
window.selectSubscriptionPaymentMethod = selectSubscriptionPaymentMethod;
window.processSubscriptionPayment = processSubscriptionPayment;
window.closeSubscriptionModal = closeSubscriptionModal;
