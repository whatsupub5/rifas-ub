// ========== SUBSCRIPTION SYSTEM ==========

/**
 * Sistema de Suscripciones para RIFAS UBIA
 * 
 * Restricciones:
 * - Generador de IA solo disponible para:
 *   1. Usuarios con suscripción activa
 *   2. Organizadores de rifas
 */

// Subscription Plans
const SUBSCRIPTION_PLANS = {
    basic: {
        id: 'basic',
        name: 'Básico',
        price: 9900, // COP
        duration: 30, // días
        features: {
            imageGenerations: 10,
            videoGenerations: 0,
            chatMessages: 50,
            prioritySupport: false
        },
        popular: false
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 19900, // COP
        duration: 30, // días
        features: {
            imageGenerations: 50,
            videoGenerations: 5,
            chatMessages: 200,
            prioritySupport: true
        },
        popular: true
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 39900, // COP
        duration: 30, // días
        features: {
            imageGenerations: 200,
            videoGenerations: 20,
            chatMessages: 1000,
            prioritySupport: true
        },
        popular: false
    }
};

// Subscription States
const SUBSCRIPTION_STATES = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    PENDING: 'pending'
};

// ========== SUBSCRIPTION MANAGEMENT ==========

/**
 * Check if user has access to AI generator
 * @param {string} userId - User ID
 * @returns {Object} Access information
 */
function checkAIGeneratorAccess(userId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check if user is organizer (always has access)
    if (user.role === 'organizador') {
        return {
            hasAccess: true,
            reason: 'organizer',
            message: 'Acceso completo como organizador',
            remaining: {
                imageGenerations: 'unlimited',
                videoGenerations: 'unlimited',
                chatMessages: 'unlimited'
            }
        };
    }
    
    // Check subscription
    const subscription = getUserSubscription(userId);
    
    if (subscription && subscription.status === SUBSCRIPTION_STATES.ACTIVE) {
        const usage = getUserUsage(userId);
        const plan = SUBSCRIPTION_PLANS[subscription.planId];
        
        return {
            hasAccess: true,
            reason: 'subscription',
            message: `Suscripción ${plan.name} activa`,
            subscription: subscription,
            plan: plan,
            remaining: {
                imageGenerations: Math.max(0, plan.features.imageGenerations - (usage.imageGenerations || 0)),
                videoGenerations: Math.max(0, plan.features.videoGenerations - (usage.videoGenerations || 0)),
                chatMessages: Math.max(0, plan.features.chatMessages - (usage.chatMessages || 0))
            }
        };
    }
    
    // No access
    return {
        hasAccess: false,
        reason: 'no_subscription',
        message: 'Se requiere suscripción o ser organizador',
        subscription: null,
        plan: null,
        remaining: {
            imageGenerations: 0,
            videoGenerations: 0,
            chatMessages: 0
        }
    };
}

/**
 * Get user subscription
 */
function getUserSubscription(userId) {
    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    const userSub = subscriptions.find(s => s.userId === userId && s.status === SUBSCRIPTION_STATES.ACTIVE);
    
    if (userSub) {
        // Check if expired
        const now = new Date();
        const expiryDate = new Date(userSub.expiresAt);
        
        if (now > expiryDate) {
            // Mark as expired
            userSub.status = SUBSCRIPTION_STATES.EXPIRED;
            updateSubscription(userSub);
            return null;
        }
        
        return userSub;
    }
    
    return null;
}

/**
 * Create subscription
 */
async function createSubscription(userId, planId, paymentMethod) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
        return { success: false, error: 'Plan no válido' };
    }
    
    // Process payment
    const paymentResult = await processSubscriptionPayment(userId, plan.price, paymentMethod);
    
    if (!paymentResult.success) {
        return paymentResult;
    }
    
    // Create subscription
    const subscription = {
        id: 'SUB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        planId: planId,
        planName: plan.name,
        price: plan.price,
        status: SUBSCRIPTION_STATES.ACTIVE,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: paymentMethod,
        transactionId: paymentResult.transactionId,
        createdAt: new Date().toISOString()
    };
    
    // Save subscription
    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    subscriptions.push(subscription);
    localStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));
    
    // Initialize usage
    initializeUserUsage(userId);
    
    return {
        success: true,
        subscription: subscription,
        message: `Suscripción ${plan.name} activada exitosamente`
    };
}

/**
 * Process subscription payment
 */
async function processSubscriptionPayment(userId, amount, method) {
    // Simulate payment (replace with real payment processing)
    return new Promise((resolve) => {
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                resolve({
                    success: true,
                    transactionId: 'TXN-SUB-' + Date.now()
                });
            } else {
                resolve({
                    success: false,
                    error: 'Error al procesar el pago'
                });
            }
        }, 2000);
    });
}

/**
 * Update subscription
 */
function updateSubscription(subscription) {
    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    const index = subscriptions.findIndex(s => s.id === subscription.id);
    
    if (index !== -1) {
        subscriptions[index] = subscription;
        localStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));
    }
}

/**
 * Initialize user usage
 */
function initializeUserUsage(userId) {
    const usage = JSON.parse(localStorage.getItem('userUsage') || '{}');
    if (!usage[userId]) {
        usage[userId] = {
            imageGenerations: 0,
            videoGenerations: 0,
            chatMessages: 0,
            resetDate: new Date().toISOString()
        };
        localStorage.setItem('userUsage', JSON.stringify(usage));
    }
}

/**
 * Get user usage
 */
function getUserUsage(userId) {
    const usage = JSON.parse(localStorage.getItem('userUsage') || '{}');
    return usage[userId] || {
        imageGenerations: 0,
        videoGenerations: 0,
        chatMessages: 0
    };
}

/**
 * Increment usage
 */
function incrementUsage(userId, type) {
    const usage = JSON.parse(localStorage.getItem('userUsage') || '{}');
    if (!usage[userId]) {
        initializeUserUsage(userId);
        return incrementUsage(userId, type);
    }
    
    usage[userId][type] = (usage[userId][type] || 0) + 1;
    localStorage.setItem('userUsage', JSON.stringify(usage));
}

/**
 * Check if user can generate image
 */
function canGenerateImage(userId) {
    const access = checkAIGeneratorAccess(userId);
    
    if (!access.hasAccess) {
        return { can: false, reason: 'no_access' };
    }
    
    if (access.reason === 'organizer') {
        return { can: true, reason: 'organizer' };
    }
    
    if (access.remaining.imageGenerations === 'unlimited') {
        return { can: true, reason: 'unlimited' };
    }
    
    if (access.remaining.imageGenerations > 0) {
        return { can: true, reason: 'subscription', remaining: access.remaining.imageGenerations };
    }
    
    return { can: false, reason: 'limit_reached' };
}

/**
 * Check if user can generate video
 */
function canGenerateVideo(userId) {
    const access = checkAIGeneratorAccess(userId);
    
    if (!access.hasAccess) {
        return { can: false, reason: 'no_access' };
    }
    
    if (access.reason === 'organizer') {
        return { can: true, reason: 'organizer' };
    }
    
    if (access.remaining.videoGenerations === 'unlimited') {
        return { can: true, reason: 'unlimited' };
    }
    
    if (access.remaining.videoGenerations > 0) {
        return { can: true, reason: 'subscription', remaining: access.remaining.videoGenerations };
    }
    
    return { can: false, reason: 'limit_reached' };
}

/**
 * Check if user can use chat
 */
function canUseChat(userId) {
    const access = checkAIGeneratorAccess(userId);
    
    if (!access.hasAccess) {
        return { can: false, reason: 'no_access' };
    }
    
    if (access.reason === 'organizer') {
        return { can: true, reason: 'organizer' };
    }
    
    if (access.remaining.chatMessages === 'unlimited') {
        return { can: true, reason: 'unlimited' };
    }
    
    if (access.remaining.chatMessages > 0) {
        return { can: true, reason: 'subscription', remaining: access.remaining.chatMessages };
    }
    
    return { can: false, reason: 'limit_reached' };
}

// ========== EXPORTS ==========

window.checkAIGeneratorAccess = checkAIGeneratorAccess;
window.createSubscription = createSubscription;
window.getUserSubscription = getUserSubscription;
window.canGenerateImage = canGenerateImage;
window.canGenerateVideo = canGenerateVideo;
window.canUseChat = canUseChat;
window.incrementUsage = incrementUsage;
window.SUBSCRIPTION_PLANS = SUBSCRIPTION_PLANS;
window.SUBSCRIPTION_STATES = SUBSCRIPTION_STATES;
