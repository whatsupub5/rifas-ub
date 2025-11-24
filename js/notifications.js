// ========== SISTEMA DE NOTIFICACIONES ==========

/**
 * Sistema de Notificaciones para RIFAS UBIA
 * 
 * Funcionalidades:
 * - Notificaciones in-app
 * - Notificaciones email (simuladas)
 * - Notificaciones SMS (simuladas)
 * - Centro de notificaciones
 * - Preferencias de usuario
 */

// Notification Types
const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    DRAW: 'draw',
    WINNER: 'winner',
    PAYMENT: 'payment',
    RIFA_UPDATE: 'rifa_update'
};

// ========== NOTIFICATION FUNCTIONS ==========

/**
 * Create and store a notification
 * @param {Object} notificationData - Notification data
 * @returns {Object} Created notification
 */
function createNotification(notificationData) {
    const {
        userId,
        type = NOTIFICATION_TYPES.INFO,
        title,
        message,
        actionUrl = null,
        actionText = null,
        relatedId = null, // rifaId, purchaseId, etc.
        priority = 'normal' // low, normal, high
    } = notificationData;
    
    const notification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        type: type,
        title: title,
        message: message,
        actionUrl: actionUrl,
        actionText: actionText,
        relatedId: relatedId,
        priority: priority,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    // Save notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift(notification); // Add to beginning
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Send email/SMS if user preferences allow
    sendNotificationChannels(userId, notification);
    
    // Update badge count
    updateNotificationBadge(userId);
    
    return notification;
}

/**
 * Send notification through user's preferred channels
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
function sendNotificationChannels(userId, notification) {
    const prefs = JSON.parse(localStorage.getItem(`notifPrefs_${userId}`) || '{"email": true, "sms": true, "push": true}');
    
    // Email notification
    if (prefs.email && shouldSendEmail(notification)) {
        sendEmailNotification(userId, notification);
    }
    
    // SMS notification
    if (prefs.sms && shouldSendSMS(notification)) {
        sendSMSNotification(userId, notification);
    }
    
    // Push notification (browser notification)
    if (prefs.push && 'Notification' in window && Notification.permission === 'granted') {
        sendPushNotification(notification);
    }
}

/**
 * Check if notification should be sent via email
 * @param {Object} notification - Notification object
 * @returns {boolean}
 */
function shouldSendEmail(notification) {
    // Send email for important notifications
    return notification.priority === 'high' || 
           notification.type === NOTIFICATION_TYPES.WINNER ||
           notification.type === NOTIFICATION_TYPES.DRAW ||
           notification.type === NOTIFICATION_TYPES.PAYMENT;
}

/**
 * Check if notification should be sent via SMS
 * @param {Object} notification - Notification object
 * @returns {boolean}
 */
function shouldSendSMS(notification) {
    // Send SMS only for critical notifications
    return notification.priority === 'high' && 
           (notification.type === NOTIFICATION_TYPES.WINNER || 
            notification.type === NOTIFICATION_TYPES.DRAW);
}

/**
 * Send email notification (simulated)
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
function sendEmailNotification(userId, notification) {
    const user = getUserById(userId);
    if (!user || !user.email) return;
    
    // In production, this would call an email API
    console.log('Email notification sent:', {
        to: user.email,
        subject: notification.title,
        body: notification.message
    });
    
    // Simulate email sending
    const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
    emailLog.push({
        userId: userId,
        email: user.email,
        subject: notification.title,
        message: notification.message,
        sentAt: new Date().toISOString(),
        notificationId: notification.id
    });
    localStorage.setItem('emailLog', JSON.stringify(emailLog));
}

/**
 * Send SMS notification (simulated)
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
function sendSMSNotification(userId, notification) {
    const user = getUserById(userId);
    if (!user || !user.phone) return;
    
    // In production, this would call an SMS API
    console.log('SMS notification sent:', {
        to: user.phone,
        message: notification.message
    });
    
    // Simulate SMS sending
    const smsLog = JSON.parse(localStorage.getItem('smsLog') || '[]');
    smsLog.push({
        userId: userId,
        phone: user.phone,
        message: notification.message,
        sentAt: new Date().toISOString(),
        notificationId: notification.id
    });
    localStorage.setItem('smsLog', JSON.stringify(smsLog));
}

/**
 * Send browser push notification
 * @param {Object} notification - Notification object
 */
function sendPushNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/logo-ub.png',
            badge: '/assets/logo-ub.png',
            tag: notification.id
        });
    }
}

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Array} Array of notifications
 */
function getUserNotifications(userId, filters = {}) {
    let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications = notifications.filter(n => n.userId === userId);
    
    // Apply filters
    if (filters.unreadOnly) {
        notifications = notifications.filter(n => !n.read);
    }
    
    if (filters.type) {
        notifications = notifications.filter(n => n.type === filters.type);
    }
    
    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results
    if (filters.limit) {
        notifications = notifications.slice(0, filters.limit);
    }
    
    return notifications;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
function markNotificationAsRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        notifications[notificationIndex].readAt = new Date().toISOString();
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Update badge
        const userId = notifications[notificationIndex].userId;
        updateNotificationBadge(userId);
    }
}

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 */
function markAllNotificationsAsRead(userId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.forEach(n => {
        if (n.userId === userId && !n.read) {
            n.read = true;
            n.readAt = new Date().toISOString();
        }
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    updateNotificationBadge(userId);
}

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 */
function deleteNotification(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(filtered));
    
    // Update badge
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        updateNotificationBadge(notification.userId);
    }
}

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {number} Unread count
 */
function getUnreadCount(userId) {
    const notifications = getUserNotifications(userId, { unreadOnly: true });
    return notifications.length;
}

/**
 * Update notification badge in UI
 * @param {string} userId - User ID
 */
function updateNotificationBadge(userId) {
    const count = getUnreadCount(userId);
    const badge = document.querySelector('.header-icon .badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User object
 */
function getUserById(userId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id === userId) {
        return user;
    }
    
    // In production, this would fetch from API
    return null;
}

// ========== SPECIFIC NOTIFICATIONS ==========

/**
 * Notify winner
 * @param {string} userId - Winner user ID
 * @param {Object} drawData - Draw data
 */
function notifyWinner(userId, drawData) {
    createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.WINNER,
        title: '¡Felicidades, Ganaste! 🎉',
        message: `Has ganado la rifa "${drawData.rifaTitle}" con el número ${String(drawData.winner.number).padStart(3, '0')}`,
        actionUrl: `rifa-detalle.html?id=${drawData.rifaId}`,
        actionText: 'Ver Detalles',
        relatedId: drawData.rifaId,
        priority: 'high'
    });
}

/**
 * Notify draw completed
 * @param {string} userId - User ID (organizer or participants)
 * @param {Object} drawData - Draw data
 */
function notifyDrawCompleted(userId, drawData) {
    createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.DRAW,
        title: 'Sorteo Realizado',
        message: `El sorteo de "${drawData.rifaTitle}" ha sido realizado. Número ganador: ${String(drawData.winner.number).padStart(3, '0')}`,
        actionUrl: `rifa-detalle.html?id=${drawData.rifaId}`,
        actionText: 'Ver Resultados',
        relatedId: drawData.rifaId,
        priority: 'high'
    });
}

/**
 * Notify payment confirmed
 * @param {string} userId - User ID
 * @param {Object} purchaseData - Purchase data
 */
function notifyPaymentConfirmed(userId, purchaseData) {
    createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.PAYMENT,
        title: 'Pago Confirmado',
        message: `Tu pago de $${purchaseData.amount} por el número ${String(purchaseData.number).padStart(3, '0')} ha sido confirmado`,
        actionUrl: `rifa-detalle.html?id=${purchaseData.rifaId}`,
        actionText: 'Ver Rifa',
        relatedId: purchaseData.rifaId,
        priority: 'normal'
    });
}

/**
 * Notify rifa update
 * @param {string} userId - User ID (participants)
 * @param {Object} rifaData - Rifa data
 * @param {string} updateType - Type of update
 */
function notifyRifaUpdate(userId, rifaData, updateType) {
    let title = 'Actualización de Rifa';
    let message = '';
    
    if (updateType === 'paused') {
        title = 'Rifa Pausada';
        message = `La rifa "${rifaData.title}" ha sido pausada temporalmente`;
    } else if (updateType === 'resumed') {
        title = 'Rifa Reanudada';
        message = `La rifa "${rifaData.title}" ha sido reanudada`;
    } else if (updateType === 'cancelled') {
        title = 'Rifa Cancelada';
        message = `La rifa "${rifaData.title}" ha sido cancelada. Se procesará el reembolso automáticamente`;
    } else if (updateType === 'updated') {
        title = 'Rifa Actualizada';
        message = `La rifa "${rifaData.title}" ha sido actualizada`;
    }
    
    createNotification({
        userId: userId,
        type: NOTIFICATION_TYPES.RIFA_UPDATE,
        title: title,
        message: message,
        actionUrl: `rifa-detalle.html?id=${rifaData.id}`,
        actionText: 'Ver Rifa',
        relatedId: rifaData.id,
        priority: 'normal'
    });
}

// ========== EXPORTS ==========
window.createNotification = createNotification;
window.getUserNotifications = getUserNotifications;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.deleteNotification = deleteNotification;
window.getUnreadCount = getUnreadCount;
window.updateNotificationBadge = updateNotificationBadge;
window.requestNotificationPermission = requestNotificationPermission;
window.notifyWinner = notifyWinner;
window.notifyDrawCompleted = notifyDrawCompleted;
window.notifyPaymentConfirmed = notifyPaymentConfirmed;
window.notifyRifaUpdate = notifyRifaUpdate;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

