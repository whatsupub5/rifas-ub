// ========== DASHBOARD COMPRADOR LOGIC ==========

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (user) {
        initDashboard(user);
    }
});

// Initialize dashboard
function initDashboard(user) {
    // Update user info
    updateUserInfo(user);
    
    // Check verification status
    checkVerificationStatus(user.id);
    
    // Load user data
    loadUserStats(user.id);
    loadUserRifas(user.id);
    loadHistorialCompras(user.id);
    loadRecommendedRifas();
    checkWinners(user.id);
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize historial filter
    const filterSelect = document.getElementById('historialFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            filterHistorial(e.target.value, user.id);
        });
    }
    
    // Initialize reviews section
    initReviewsSection(user);
    
    // Initialize favoritos section
    initFavoritosSection(user);
    
    // Initialize explorar section
    initExplorarSection(user);
    
    // Initialize overview section (home)
    initOverviewSection(user);
    
    // Initialize perfil section
    initPerfilSection(user);
    
    // Initialize generador IA section
    initGeneradorIaSection(user);
    
    // Initialize mis compras section
    initMisComprasSection(user);
    
    // Initialize mis pagos section
    initMisPagosSection(user);
    
    // Initialize calificaciones recibidas section
    initCalificacionesRecibidasSection(user);
    
    // Initialize estado cliente section
    initEstadoClienteSection(user);
    
    // Initialize notifications
    initNotifications(user);
    
    console.log('Dashboard de Comprador inicializado');
}

// ========== GENERADOR IA SECTION ==========

function initGeneradorIaSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#generador-ia') {
                e.preventDefault();
                showGeneradorIaSection(user);
            }
        });
    });
}

function showGeneradorIaSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show generador IA section
    const generadorSection = document.getElementById('generadorIaSection');
    if (generadorSection) {
        generadorSection.style.display = 'block';
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#generador-ia"]')?.classList.add('active');
}

// ========== NOTIFICATIONS ==========

function initNotifications(user) {
    // Request notification permission
    if (window.requestNotificationPermission) {
        window.requestNotificationPermission();
    }
    
    // Update badge on load
    if (window.updateNotificationBadge) {
        window.updateNotificationBadge(user.id);
    }
    
    // Update badge periodically
    setInterval(() => {
        if (window.updateNotificationBadge) {
            window.updateNotificationBadge(user.id);
        }
    }, 30000); // Every 30 seconds
}

function showNotificationsCenter() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const notifications = window.getUserNotifications ? window.getUserNotifications(user.id) : [];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="position: sticky; top: 0; background: var(--bg-primary); z-index: 10; border-bottom: 1px solid var(--border-light);">
                <h2><i class="fas fa-bell"></i> Notificaciones</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button class="btn btn-outline btn-small" onclick="markAllNotificationsAsRead('${user.id}'); this.closest('.modal').remove(); showNotificationsCenter();">
                        Marcar todas como leídas
                    </button>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
            </div>
            <div class="modal-body" style="padding: 0;">
                ${notifications.length === 0 ? `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No tienes notificaciones</p>
                </div>
                ` : `
                <div class="notifications-list">
                    ${notifications.map(notif => `
                        <div class="notification-item ${notif.read ? '' : 'unread'}" style="padding: 1rem; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: var(--transition);" 
                             onclick="handleNotificationClick('${notif.id}', '${notif.actionUrl || ''}')">
                            <div style="display: flex; gap: 1rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: ${getNotificationColor(notif.type)}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="fas fa-${getNotificationIcon(notif.type)}" style="color: white;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                        <h4 style="margin: 0; font-size: 0.875rem; font-weight: 600;">${notif.title}</h4>
                                        ${!notif.read ? '<span style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; flex-shrink: 0; margin-top: 0.25rem;"></span>' : ''}
                                    </div>
                                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">${notif.message}</p>
                                    <p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--text-light);">${formatNotificationDate(notif.createdAt)}</p>
                                    ${notif.actionUrl ? `
                                    <button class="btn btn-outline btn-small" style="margin-top: 0.5rem;" onclick="event.stopPropagation(); window.location.href='${notif.actionUrl}'">
                                        ${notif.actionText || 'Ver'}
                                    </button>
                                    ` : ''}
                                </div>
                                <button class="btn-icon" onclick="event.stopPropagation(); deleteNotification('${notif.id}'); this.closest('.notification-item').remove();" title="Eliminar">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function getNotificationColor(type) {
    const colors = {
        'info': 'var(--primary-color)',
        'success': 'var(--success-color)',
        'warning': 'var(--warning-color)',
        'error': 'var(--danger-color)',
        'draw': 'var(--primary-color)',
        'winner': 'var(--success-color)',
        'payment': 'var(--primary-color)',
        'rifa_update': 'var(--warning-color)'
    };
    return colors[type] || 'var(--primary-color)';
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'draw': 'trophy',
        'winner': 'trophy',
        'payment': 'credit-card',
        'rifa_update': 'bell'
    };
    return icons[type] || 'bell';
}

function formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function handleNotificationClick(notificationId, actionUrl) {
    // Mark as read
    if (window.markNotificationAsRead) {
        window.markNotificationAsRead(notificationId);
    }
    
    // Navigate if action URL exists
    if (actionUrl) {
        window.location.href = actionUrl;
    }
    
    // Close modal
    document.querySelector('.modal')?.remove();
    
    // Update badge
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (window.updateNotificationBadge) {
        window.updateNotificationBadge(user.id);
    }
}

window.showNotificationsCenter = showNotificationsCenter;
window.handleNotificationClick = handleNotificationClick;

// ========== REVIEWS SECTION ==========

function initReviewsSection(user) {
    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#reseñas') {
                e.preventDefault();
                showReviewsSection(user);
            }
        });
    });
}

function showReviewsSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show reviews section
    const reviewsSection = document.getElementById('reseñasSection');
    if (reviewsSection) {
        reviewsSection.style.display = 'block';
        loadReviewsSection(user);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#reseñas"]')?.classList.add('active');
}

function loadReviewsSection(user) {
    loadPendingReviews(user.id);
    loadMyReviews(user.id);
}

function loadPendingReviews(userId) {
    const container = document.getElementById('pendingReviewsList');
    if (!container) return;
    
    // Get purchases that can be reviewed
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    
    const pendingReviews = purchases
        .filter(p => p.paymentStatus === 'confirmed')
        .map(purchase => {
            const rifa = allRifas.find(r => r.id === purchase.rifaId);
            if (!rifa) return null;
            
            const canReview = window.canUserReview ? window.canUserReview(userId, rifa.organizerId, purchase.rifaId) : { canReview: false };
            
            if (canReview.canReview) {
                return { purchase, rifa };
            }
            return null;
        })
        .filter(item => item !== null);
    
    if (pendingReviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #10b981;"></i>
                <p>No tienes rifas pendientes de calificar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingReviews.map(({ purchase, rifa }) => `
        <div class="pending-review-card">
            <div class="review-rifa-info">
                <img src="${rifa.image || 'https://via.placeholder.com/100'}" alt="${rifa.title}" onerror="this.src='https://via.placeholder.com/100'">
                <div>
                    <h4>${rifa.title}</h4>
                    <p>Organizador: ${rifa.organizer?.name || 'Organizador'}</p>
                    <p class="review-date">Comprado: ${new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}</p>
                </div>
            </div>
            <button class="btn btn-primary" onclick="openReviewModal('${rifa.id}', '${rifa.organizerId}', '${purchase.id}')">
                <i class="fas fa-star"></i> Dejar Reseña
            </button>
        </div>
    `).join('');
}

function loadMyReviews(userId) {
    const container = document.getElementById('myReviewsList');
    if (!container || !window.getUserReviews) return;
    
    const reviews = window.getUserReviews(userId);
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Aún no has dejado ninguna reseña</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-user">
                    <div class="review-avatar">${review.userName?.[0] || 'U'}</div>
                    <div>
                        <strong>${review.userName || 'Usuario'}</strong>
                        <p class="review-date">${new Date(review.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <div class="review-content">
                <h4>${review.rifaTitle}</h4>
                ${review.comment ? `<p>${review.comment}</p>` : '<p style="color: var(--text-secondary); font-style: italic;">Sin comentario</p>'}
            </div>
            <div class="review-footer">
                ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Compra Verificada</span>' : ''}
                <span class="helpful-count">${review.helpful || 0} útil</span>
            </div>
        </div>
    `).join('');
}

function openReviewModal(rifaId, organizerId, purchaseId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    const rifa = allRifas.find(r => r.id === rifaId);
    
    if (!rifa) return;
    
    let selectedRating = 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Dejar Reseña</h2>
                <span class="close" onclick="this.closest('.modal').remove()">×</span>
            </div>
            <div class="modal-body">
                <div class="review-modal-content">
                    <div class="review-rifa-preview">
                        <img src="${rifa.image || 'https://via.placeholder.com/100'}" alt="${rifa.title}" onerror="this.src='https://via.placeholder.com/100'">
                        <div>
                            <h3>${rifa.title}</h3>
                            <p>Organizador: ${rifa.organizer?.name || 'Organizador'}</p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Calificación *</label>
                        <div class="rating-input-large" id="ratingInput">
                            ${[5, 4, 3, 2, 1].map(rating => `
                                <label class="star-label-large" data-rating="${rating}">
                                    <input type="radio" name="rating" value="${rating}" style="display: none;">
                                    <i class="far fa-star"></i>
                                </label>
                            `).join('')}
                        </div>
                        <small>Selecciona de 1 a 5 estrellas</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Comentario (Opcional)</label>
                        <textarea id="reviewComment" class="form-control" rows="5" placeholder="Comparte tu experiencia con este organizador..."></textarea>
                        <small>Tu comentario ayudará a otros compradores</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="submitReview('${rifaId}', '${organizerId}', '${purchaseId}')">
                            <i class="fas fa-paper-plane"></i> Publicar Reseña
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Initialize star rating
    const starLabels = modal.querySelectorAll('.star-label-large');
    starLabels.forEach((label, index) => {
        label.addEventListener('click', () => {
            const rating = parseInt(label.dataset.rating);
            selectedRating = rating;
            
            // Update stars
            starLabels.forEach((l, i) => {
                const star = l.querySelector('i');
                if (i < 5 - rating + 1) {
                    star.className = 'fas fa-star';
                    star.style.color = '#fbbf24';
                } else {
                    star.className = 'far fa-star';
                    star.style.color = '#d1d5db';
                }
            });
        });
        
        label.addEventListener('mouseenter', () => {
            const rating = parseInt(label.dataset.rating);
            starLabels.forEach((l, i) => {
                const star = l.querySelector('i');
                if (i < 5 - rating + 1) {
                    star.style.color = '#fbbf24';
                }
            });
        });
    });
    
    modal.querySelector('.rating-input-large').addEventListener('mouseleave', () => {
        if (selectedRating > 0) {
            starLabels.forEach((l, i) => {
                const star = l.querySelector('i');
                if (i < 5 - selectedRating + 1) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '#d1d5db';
                }
            });
        }
    });
}

function submitReview(rifaId, organizerId, purchaseId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('reviewComment')?.value || '';
    
    if (!rating) {
        showToast('Selecciona una calificación', 'error');
        return;
    }
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    const rifa = allRifas.find(r => r.id === rifaId);
    
    if (!rifa) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    const reviewData = {
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
        userAvatar: user.avatar || '',
        organizerId: organizerId,
        rifaId: rifaId,
        rifaTitle: rifa.title,
        rating: parseInt(rating),
        comment: comment,
        purchaseId: purchaseId
    };
    
    const result = window.createReview(reviewData);
    
    if (result.success) {
        showToast('Reseña publicada exitosamente', 'success');
        document.querySelector('.modal').remove();
        loadReviewsSection(user);
    } else {
        showToast(result.error || 'Error al publicar reseña', 'error');
    }
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

window.openReviewModal = openReviewModal;
window.submitReview = submitReview;

// Check verification status
function checkVerificationStatus(userId) {
    if (!window.getUserVerificationStatus) return;
    
    const verification = window.getUserVerificationStatus(userId);
    const isVerified = verification.overallStatus === 'completed';
    
    if (!isVerified) {
        const banner = document.createElement('div');
        banner.className = 'verification-warning';
        banner.style.cssText = 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 250px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>Verificación de Identidad Pendiente</strong>
                    <p style="margin: 0; font-size: 0.875rem; opacity: 0.9;">Completa la verificación para participar en rifas y retirar premios.</p>
                </div>
            </div>
            <a href="verificacion-identidad.html" class="btn" style="background: white; color: #f59e0b; border: none; white-space: nowrap;">
                <i class="fas fa-id-card"></i> Verificar Ahora
            </a>
        `;
        
        const main = document.querySelector('.dashboard-main');
        if (main) {
            main.insertBefore(banner, main.firstChild);
        }
    }
}

// Check for winners that need to confirm prize delivery
function checkWinners(userId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const winners = purchases.filter(p => 
        p.rifaStatus === 'won' && 
        !p.prizeDelivered &&
        p.paymentStatus === 'confirmed'
    );
    
    if (winners.length > 0) {
        showWinnerConfirmation(winners[0], userId);
    }
}

// Show winner confirmation section
function showWinnerConfirmation(winningPurchase, userId) {
    const winnerSection = document.getElementById('winnerSection');
    const winnerAlert = document.getElementById('winnerAlert');
    
    if (!winnerSection || !winnerAlert) return;
    
    winnerSection.style.display = 'block';
    
    winnerAlert.innerHTML = `
        <div class="winner-card">
            <div class="winner-header">
                <i class="fas fa-trophy" style="font-size: 3rem; color: var(--warning-color);"></i>
                <h3>¡Felicidades! Ganaste la rifa</h3>
                <p class="winner-rifa-title">${winningPurchase.rifaTitle}</p>
            </div>
            
            <div class="winner-info">
                <div class="info-item">
                    <span class="info-label">Tu número ganador:</span>
                    <span class="info-value">${String(winningPurchase.number).padStart(3, '0')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Premio:</span>
                    <span class="info-value">${winningPurchase.rifaTitle}</span>
                </div>
            </div>
            
            <div class="protection-notice">
                <i class="fas fa-shield-alt"></i>
                <div>
                    <strong>Protección al Comprador</strong>
                    <p>El dinero del organizador está retenido hasta que confirmes la recepción del premio. Esto garantiza tu seguridad.</p>
                </div>
            </div>
            
            <div class="confirmation-form" id="prizeConfirmationForm">
                <h4>Confirma la recepción del premio</h4>
                <div class="form-group">
                    <label>Método de entrega *</label>
                    <select id="deliveryMethod" class="form-control">
                        <option value="personal">Entrega Personal</option>
                        <option value="envio">Envío a Domicilio</option>
                        <option value="retiro">Retiro en Tienda</option>
                        <option value="digital">Premio Digital</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Calificación (opcional)</label>
                    <div class="rating-input">
                        <input type="radio" name="rating" value="5" id="rating5">
                        <label for="rating5" class="star">★</label>
                        <input type="radio" name="rating" value="4" id="rating4">
                        <label for="rating4" class="star">★</label>
                        <input type="radio" name="rating" value="3" id="rating3">
                        <label for="rating3" class="star">★</label>
                        <input type="radio" name="rating" value="2" id="rating2">
                        <label for="rating2" class="star">★</label>
                        <input type="radio" name="rating" value="1" id="rating1">
                        <label for="rating1" class="star">★</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Comentarios (opcional)</label>
                    <textarea id="confirmationNotes" class="form-control" rows="3" placeholder="Comparte tu experiencia..."></textarea>
                </div>
                <button class="btn btn-primary btn-large" onclick="confirmPrizeReceived('${winningPurchase.rifaId}', '${userId}')">
                    <i class="fas fa-check-circle"></i> Confirmar Recepción del Premio
                </button>
                <button class="btn btn-outline" onclick="reportPrizeIssue('${winningPurchase.rifaId}')" style="margin-top: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i> Reportar Problema
                </button>
            </div>
        </div>
    `;
    
    // Scroll to winner section
    winnerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Confirm prize received
async function confirmPrizeReceived(rifaId, userId) {
    const deliveryMethod = document.getElementById('deliveryMethod')?.value;
    const notes = document.getElementById('confirmationNotes')?.value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    
    if (!deliveryMethod) {
        showToast('Por favor selecciona el método de entrega', 'warning');
        return;
    }
    
    try {
        const result = await window.confirmPrizeDelivery(rifaId, userId, {
            deliveryMethod: deliveryMethod,
            notes: notes,
            rating: rating ? parseInt(rating) : null
        });
        
        if (result.success) {
            showToast('¡Premio confirmado! Los fondos han sido liberados al organizador.', 'success');
            
            // Hide winner section
            setTimeout(() => {
                const winnerSection = document.getElementById('winnerSection');
                if (winnerSection) {
                    winnerSection.style.display = 'none';
                }
                // Reload historial
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                loadHistorialCompras(user.id);
            }, 2000);
        } else {
            showToast(result.error || 'Error al confirmar el premio', 'error');
        }
    } catch (error) {
        console.error('Error confirming prize:', error);
        showToast('Error al confirmar el premio', 'error');
    }
}

// Report prize issue
function reportPrizeIssue(rifaId) {
    const reason = prompt('Describe el problema con la entrega del premio:');
    if (!reason) return;
    
    const result = window.disputePrizeDelivery(rifaId, {
        reason: reason,
        reportedBy: JSON.parse(localStorage.getItem('user') || '{}').id
    });
    
    if (result.success) {
        showToast('Problema reportado. Nuestro equipo revisará el caso.', 'info');
    } else {
        showToast(result.error || 'Error al reportar el problema', 'error');
    }
}

// Update user info in header
function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar && user.avatar) {
        userAvatar.src = user.avatar;
    }
}

// Load user statistics
async function loadUserStats(userId) {
    try {
        // Get real data from localStorage
        const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        const userPurchases = purchases.filter(p => p.userId === userId || !p.userId);
        
        // Calculate statistics
        const totalBoletos = userPurchases.length;
        const rifasGanadas = userPurchases.filter(p => p.rifaStatus === 'won').length;
        const enProceso = userPurchases.filter(p => 
            p.rifaStatus === 'active' && p.paymentStatus === 'confirmed'
        ).length;
        const totalInvertido = userPurchases
            .filter(p => p.paymentStatus === 'confirmed')
            .reduce((sum, p) => sum + (p.price || 0), 0);
        
        const stats = {
            totalBoletos,
            rifasGanadas,
            enProceso,
            totalInvertido
        };
        
        // Update stats in UI
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-value').textContent = stats.totalBoletos;
            statCards[1].querySelector('.stat-value').textContent = stats.rifasGanadas;
            statCards[2].querySelector('.stat-value').textContent = stats.enProceso;
            statCards[3].querySelector('.stat-value').textContent = '$' + formatNumber(stats.totalInvertido);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Error al cargar estadísticas', 'error');
    }
}

// Load user rifas
async function loadUserRifas(userId) {
    try {
        // Get real purchases from localStorage
        const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        const userPurchases = purchases.filter(p => p.userId === userId || !p.userId);
        
        // Get rifa details
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
        const allRifas = [...myRifas, ...sampleRifas];
        
        // Map purchases to rifas with details
        const userRifas = userPurchases
            .filter(p => p.rifaStatus === 'active' && p.paymentStatus === 'confirmed')
            .map(purchase => {
                const rifa = allRifas.find(r => r.id === purchase.rifaId);
                return {
                    id: purchase.id,
                    rifaId: purchase.rifaId,
                    rifaTitle: purchase.rifaTitle || rifa?.title || 'Rifa',
                    number: purchase.number,
                    price: purchase.price,
                    drawDate: purchase.endDate || rifa?.endDate,
                    status: purchase.rifaStatus,
                    image: purchase.rifaImage || rifa?.image || 'https://via.placeholder.com/100'
                };
            });
        
        // Update table
        const tableBody = document.querySelector('.data-table tbody');
        if (tableBody && userRifas.length > 0) {
            tableBody.innerHTML = userRifas.map(rifa => `
                <tr>
                    <td>
                        <div class="table-rifa-info">
                            <img src="${rifa.image}" alt="${rifa.rifaTitle}" onerror="this.src='https://via.placeholder.com/100'">
                            <span>${rifa.rifaTitle}</span>
                        </div>
                    </td>
                    <td><span class="number-badge">${String(rifa.number).padStart(3, '0')}</span></td>
                    <td>$${formatNumber(rifa.price)}</td>
                    <td>${rifa.drawDate ? formatDate(rifa.drawDate) : 'N/A'}</td>
                    <td><span class="badge-status badge-active">Activa</span></td>
                    <td>
                        <button class="btn-icon" onclick="viewDashboardRifa('${rifa.rifaId}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="downloadTicket('${rifa.rifaId}', '${rifa.number}')" title="Descargar Boleto">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else if (tableBody && userRifas.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-ticket-alt" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">No tienes rifas activas aún.</p>
                        <a href="#explorar" class="btn btn-primary" style="margin-top: 1rem;">
                            <i class="fas fa-search"></i> Explorar Rifas
                        </a>
                    </td>
                </tr>
            `;
        }
        
        console.log('User rifas loaded:', userRifas);
    } catch (error) {
        console.error('Error loading user rifas:', error);
        showToast('Error al cargar tus rifas', 'error');
    }
}

// Load recommended rifas
function loadRecommendedRifas() {
    const recommendedGrid = document.getElementById('recommendedRifas');
    if (!recommendedGrid) return;
    
    // Get 3 random rifas from sample data
    const recommended = sampleRifas.slice(0, 3);
    
    recommendedGrid.innerHTML = '';
    recommended.forEach(rifa => {
        const card = createRifaCard(rifa);
        recommendedGrid.appendChild(card);
    });
}

// Initialize sidebar toggle for mobile
function initSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        // Close sidebar when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (sidebar && sidebar.classList.contains('active')) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                        overlay.classList.remove('active');
                    }
                }
            }
        });
    }
    
    // Active link highlighting
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.getAttribute('onclick')) { // Don't interfere with onclick handlers
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Download ticket
function downloadTicket(rifaId, number) {
    showToast('Descargando boleto...', 'info');
    
    // Simular descarga
    setTimeout(() => {
        showToast('¡Boleto descargado exitosamente!', 'success');
        console.log(`Descargando boleto de rifa ${rifaId}, número ${number}`);
    }, 1000);
}

// View rifa from dashboard
function viewDashboardRifa(rifaId) {
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

// Add to favorites
function addToFavorites(rifaId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (!favorites.includes(rifaId)) {
        favorites.push(rifaId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('Agregado a favoritos', 'success');
    } else {
        const index = favorites.indexOf(rifaId);
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('Eliminado de favoritos', 'info');
    }
}

// Check if rifa is in favorites
function isFavorite(rifaId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(rifaId);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Load historial de compras
function loadHistorialCompras(userId) {
    const tableBody = document.getElementById('historialTableBody');
    if (!tableBody) return;
    
    // Get purchases from localStorage
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    
    // If no purchases, create sample data
    if (purchases.length === 0) {
        const samplePurchases = [
            {
                id: 1,
                rifaId: 1,
                rifaTitle: 'iPhone 15 Pro Max',
                rifaImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100',
                number: '042',
                price: 5000,
                purchaseDate: '2024-11-15',
                paymentStatus: 'confirmed',
                rifaStatus: 'active',
                endDate: '2024-12-31'
            },
            {
                id: 2,
                rifaId: 2,
                rifaTitle: 'PlayStation 5',
                rifaImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=100',
                number: '127',
                price: 3000,
                purchaseDate: '2024-11-14',
                paymentStatus: 'confirmed',
                rifaStatus: 'active',
                endDate: '2024-12-25'
            }
        ];
        localStorage.setItem('userPurchases', JSON.stringify(samplePurchases));
        renderHistorial(samplePurchases);
    } else {
        renderHistorial(purchases);
    }
}

// Render historial
function renderHistorial(purchases) {
    const tableBody = document.getElementById('historialTableBody');
    if (!tableBody) return;
    
    if (purchases.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No tienes compras aún.</p>
                    <a href="index.html#rifas" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-ticket-alt"></i> Explorar Rifas
                    </a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    purchases.forEach(purchase => {
        const row = createHistorialRow(purchase);
        tableBody.appendChild(row);
    });
}

// Create historial row
function createHistorialRow(purchase) {
    const row = document.createElement('tr');
    
    const paymentStatusBadge = getPaymentStatusBadge(purchase.paymentStatus);
    const rifaStatusBadge = getRifaStatusBadge(purchase.rifaStatus);
    
    row.innerHTML = `
        <td>
            <div class="table-rifa-info">
                <img src="${purchase.rifaImage || 'https://via.placeholder.com/100'}" 
                     alt="${purchase.rifaTitle}" 
                     onerror="this.src='https://via.placeholder.com/100'">
                <span>${purchase.rifaTitle}</span>
            </div>
        </td>
        <td><span class="number-badge">${String(purchase.number).padStart(3, '0')}</span></td>
        <td>$${formatNumber(purchase.price)}</td>
        <td>${formatDate(purchase.purchaseDate)}</td>
        <td>${paymentStatusBadge}</td>
        <td>${rifaStatusBadge}</td>
        <td>
            <button class="btn-icon" onclick="viewRifaFromHistorial(${purchase.rifaId})" title="Ver Rifa">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="downloadTicketFromHistorial(${purchase.id})" title="Descargar Boleto">
                <i class="fas fa-download"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Get payment status badge
function getPaymentStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge-status badge-pending">Pendiente</span>',
        'confirmed': '<span class="badge-status badge-active">Confirmado</span>',
        'rejected': '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Rechazado</span>'
    };
    return badges[status] || badges.pending;
}

// Get rifa status badge
function getRifaStatusBadge(status) {
    const badges = {
        'active': '<span class="badge-status badge-active">Activa</span>',
        'completed': '<span class="badge-status badge-completed">Completada</span>',
        'won': '<span class="badge-status" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);">¡Ganaste!</span>',
        'lost': '<span class="badge-status badge-completed">Finalizada</span>'
    };
    return badges[status] || badges.active;
}

// Filter historial
function filterHistorial(filter, userId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    
    let filtered = purchases;
    
    if (filter === 'active') {
        filtered = purchases.filter(p => p.rifaStatus === 'active');
    } else if (filter === 'completed') {
        filtered = purchases.filter(p => p.rifaStatus === 'completed' || p.rifaStatus === 'lost');
    } else if (filter === 'won') {
        filtered = purchases.filter(p => p.rifaStatus === 'won');
    }
    
    renderHistorial(filtered);
}

// View rifa from historial
function viewRifaFromHistorial(rifaId) {
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

// Download ticket from historial
function downloadTicketFromHistorial(purchaseId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const purchase = purchases.find(p => p.id === purchaseId);
    
    if (purchase) {
        downloadTicket(purchase.rifaId, purchase.number);
    }
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Export functions
window.downloadTicket = downloadTicket;
window.viewDashboardRifa = viewDashboardRifa;
window.addToFavorites = addToFavorites;

// ========== FAVORITOS SECTION ==========

function initFavoritosSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#favoritos') {
                e.preventDefault();
                showFavoritosSection(user);
            }
        });
    });
}

function showFavoritosSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show favoritos section
    const favoritosSection = document.getElementById('favoritosSection');
    if (favoritosSection) {
        favoritosSection.style.display = 'block';
        loadFavoritos(user.id);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#favoritos"]')?.classList.add('active');
}

function loadFavoritos(userId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    
    const favoritosRifas = allRifas.filter(r => favorites.includes(r.id));
    
    const grid = document.getElementById('favoritosGrid');
    if (!grid) return;
    
    if (favoritosRifas.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-heart" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No tienes rifas favoritas aún</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Agrega rifas a favoritos haciendo clic en el ícono de corazón</p>
            </div>
        `;
        return;
    }
    
    // Use rifas.js to render cards
    if (window.createRifaCard) {
        grid.innerHTML = '';
        favoritosRifas.forEach(rifa => {
            const card = window.createRifaCard(rifa);
            grid.appendChild(card);
        });
    } else {
        // Fallback rendering
        grid.innerHTML = favoritosRifas.map(rifa => {
            const progressPercentage = ((rifa.soldNumbers || 0) / rifa.totalNumbers) * 100;
            return `
                <div class="rifa-card">
                    <img src="${rifa.image || 'https://via.placeholder.com/400x200'}" alt="${rifa.title}" class="rifa-image">
                    <div class="rifa-content">
                        <h3 class="rifa-title">${rifa.title}</h3>
                        <p class="rifa-description">${rifa.description || ''}</p>
                        <div class="rifa-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <p class="progress-text">${rifa.soldNumbers || 0}/${rifa.totalNumbers} vendidos</p>
                        </div>
                        <div class="rifa-footer">
                            <div class="rifa-price-tag">$${formatNumber(rifa.price)}</div>
                            <button class="btn btn-primary btn-small" onclick="window.location.href='rifa-detalle.html?id=${rifa.id}'">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ========== EXPLORAR SECTION ==========

function initExplorarSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#explorar') {
                e.preventDefault();
                showExplorarSection(user);
            }
        });
    });
}

function showExplorarSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show explorar section
    const explorarSection = document.getElementById('explorarSection');
    if (explorarSection) {
        explorarSection.style.display = 'block';
        loadExplorarRifas();
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#explorar"]')?.classList.add('active');
}

function loadExplorarRifas() {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas].filter(r => r.status === 'active');
    
    filterExplorarRifas(allRifas);
}

function filterExplorarRifas(allRifas = null) {
    if (!allRifas) {
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
        allRifas = [...myRifas, ...sampleRifas].filter(r => r.status === 'active');
    }
    
    let filtered = [...allRifas];
    
    // Apply search
    const search = document.getElementById('explorarSearch')?.value.toLowerCase() || '';
    if (search) {
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(search) ||
            (r.description || '').toLowerCase().includes(search) ||
            (r.organizerName || '').toLowerCase().includes(search)
        );
    }
    
    // Apply price filters
    const precioMin = parseInt(document.getElementById('explorarPrecioMin')?.value) || 0;
    const precioMax = parseInt(document.getElementById('explorarPrecioMax')?.value) || Infinity;
    filtered = filtered.filter(r => r.price >= precioMin && r.price <= precioMax);
    
    // Apply date filter
    const fechaFilter = document.getElementById('explorarFechaFilter')?.value || 'all';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (fechaFilter !== 'all') {
        filtered = filtered.filter(r => {
            const drawDate = new Date(r.endDate);
            drawDate.setHours(0, 0, 0, 0);
            
            if (fechaFilter === 'today') {
                return drawDate.getTime() === today.getTime();
            } else if (fechaFilter === 'week') {
                const weekFromNow = new Date(today);
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return drawDate >= today && drawDate <= weekFromNow;
            } else if (fechaFilter === 'month') {
                const monthFromNow = new Date(today);
                monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                return drawDate >= today && drawDate <= monthFromNow;
            } else if (fechaFilter === 'upcoming') {
                return drawDate >= today;
            }
            return true;
        });
    }
    
    // Apply sort
    const sort = document.getElementById('explorarSort')?.value || 'newest';
    filtered.sort((a, b) => {
        if (sort === 'newest') {
            return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
        } else if (sort === 'oldest') {
            return new Date(a.createdAt || a.id) - new Date(b.createdAt || b.id);
        } else if (sort === 'price-low') {
            return a.price - b.price;
        } else if (sort === 'price-high') {
            return b.price - a.price;
        } else if (sort === 'popular') {
            return (b.soldNumbers || 0) - (a.soldNumbers || 0);
        }
        return 0;
    });
    
    // Render
    const grid = document.getElementById('explorarRifasGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No se encontraron rifas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }
    
    // Use rifas.js to render cards
    if (window.createRifaCard) {
        grid.innerHTML = '';
        filtered.forEach(rifa => {
            const card = window.createRifaCard(rifa);
            grid.appendChild(card);
        });
    } else {
        // Fallback rendering
        grid.innerHTML = filtered.map(rifa => {
            const progressPercentage = ((rifa.soldNumbers || 0) / rifa.totalNumbers) * 100;
            return `
                <div class="rifa-card">
                    <img src="${rifa.image || 'https://via.placeholder.com/400x200'}" alt="${rifa.title}" class="rifa-image">
                    <div class="rifa-content">
                        <h3 class="rifa-title">${rifa.title}</h3>
                        <p class="rifa-description">${rifa.description || ''}</p>
                        <div class="rifa-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <p class="progress-text">${rifa.soldNumbers || 0}/${rifa.totalNumbers} vendidos</p>
                        </div>
                        <div class="rifa-footer">
                            <div class="rifa-price-tag">$${formatNumber(rifa.price)}</div>
                            <button class="btn btn-primary btn-small" onclick="window.location.href='rifa-detalle.html?id=${rifa.id}'">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ========== PERFIL SECTION ==========

function initPerfilSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#perfil') {
                e.preventDefault();
                showPerfilSection(user);
            }
        });
    });
    
    // Initialize form
    const form = document.getElementById('perfilForm');
    if (form) {
        form.addEventListener('submit', handleUpdatePerfil);
    }
}

function showPerfilSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show perfil section
    const perfilSection = document.getElementById('perfilSection');
    if (perfilSection) {
        perfilSection.style.display = 'block';
        loadPerfilData(user);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#perfil"]')?.classList.add('active');
}

function loadPerfilData(user) {
    // Load user data
    document.getElementById('perfilFirstName').value = user.firstName || '';
    document.getElementById('perfilLastName').value = user.lastName || '';
    document.getElementById('perfilEmail').value = user.email || '';
    document.getElementById('perfilEmail').disabled = true; // Email cannot be changed
    document.getElementById('perfilPhone').value = user.phone || '';
    
    // Load notification preferences
    const notifPrefs = JSON.parse(localStorage.getItem(`notifPrefs_${user.id}`) || '{"email": true, "sms": true, "push": true}');
    document.getElementById('notifEmail').checked = notifPrefs.email !== false;
    document.getElementById('notifSMS').checked = notifPrefs.sms !== false;
    document.getElementById('notifPush').checked = notifPrefs.push !== false;
}

async function handleUpdatePerfil(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const updatedUser = {
        ...user,
        firstName: document.getElementById('perfilFirstName').value,
        lastName: document.getElementById('perfilLastName').value,
        phone: document.getElementById('perfilPhone').value,
        updatedAt: new Date().toISOString()
    };
    
    // Save notification preferences
    const notifPrefs = {
        email: document.getElementById('notifEmail').checked,
        sms: document.getElementById('notifSMS').checked,
        push: document.getElementById('notifPush').checked
    };
    localStorage.setItem(`notifPrefs_${user.id}`, JSON.stringify(notifPrefs));
    
    // Update user
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update UI
    updateUserInfo(updatedUser);
    
    showToast('Perfil actualizado exitosamente', 'success');
}

function resetPerfilForm() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadPerfilData(user);
}

function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Cambiar Contraseña</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label for="currentPassword">Contraseña Actual *</label>
                        <input type="password" id="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">Nueva Contraseña *</label>
                        <input type="password" id="newPassword" required minlength="6">
                        <small>Mínimo 6 caracteres</small>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Nueva Contraseña *</label>
                        <input type="password" id="confirmPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Cambiar Contraseña</button>
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleChangePassword();
        modal.remove();
    });
}

function handleChangePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    // In production, this would verify current password and update via API
    // For now, we'll just show a success message
    showToast('Contraseña actualizada exitosamente', 'success');
    console.log('Password changed (simulated)');
}

// Format number helper
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ========== OVERVIEW SECTION ==========

function initOverviewSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#overview') {
                e.preventDefault();
                showOverviewSection(user);
            }
        });
    });
}

function showOverviewSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show overview sections (stats, mis rifas activas, historial, recomendadas)
    document.querySelectorAll('.stats-cards').forEach(section => {
        section.style.display = 'grid';
    });
    
    const sectionsToShow = document.querySelectorAll('.dashboard-section:not([id$="Section"]):not([id="favoritosSection"]):not([id="explorarSection"]):not([id="perfilSection"]):not([id="generadorIaSection"]):not([id="misComprasSection"]):not([id="misPagosSection"]):not([id="calificacionesRecibidasSection"]):not([id="estadoClienteSection"])');
    sectionsToShow.forEach(section => {
        section.style.display = 'block';
    });
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#overview"]')?.classList.add('active');
}

// ========== MIS COMPRAS SECTION ==========

function initMisComprasSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#mis-compras') {
                e.preventDefault();
                showMisComprasSection(user);
            }
        });
    });
}

function showMisComprasSection(user) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const comprasSection = document.getElementById('misComprasSection');
    if (comprasSection) {
        comprasSection.style.display = 'block';
        loadMisCompras(user.id);
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#mis-compras"]')?.classList.add('active');
}

function loadMisCompras(userId) {
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const userPurchases = purchases.filter(p => p.userId === userId);
    
    // Update stats
    document.getElementById('totalCompras').textContent = userPurchases.length;
    const totalBoletos = userPurchases.reduce((sum, p) => sum + (p.numbers?.length || 1), 0);
    document.getElementById('totalBoletos').textContent = totalBoletos;
    const totalGastado = userPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    document.getElementById('totalGastado').textContent = `$${formatNumber(totalGastado.toFixed(0))}`;
    const comprasActivas = userPurchases.filter(p => p.status === 'active' || p.status === 'pending').length;
    document.getElementById('comprasActivas').textContent = comprasActivas;
    
    // Group purchases by rifa
    const comprasPorRifa = {};
    userPurchases.forEach(purchase => {
        const rifaId = purchase.rifaId;
        if (!comprasPorRifa[rifaId]) {
            comprasPorRifa[rifaId] = {
                rifaId,
                purchases: [],
                total: 0,
                numbers: []
            };
        }
        comprasPorRifa[rifaId].purchases.push(purchase);
        comprasPorRifa[rifaId].total += purchase.totalAmount || 0;
        if (purchase.numbers) {
            comprasPorRifa[rifaId].numbers.push(...purchase.numbers);
        }
    });
    
    loadComprasTable(Object.values(comprasPorRifa));
}

function loadComprasTable(compras) {
    const tableBody = document.getElementById('comprasTableBody');
    if (!tableBody) return;
    
    const rifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...rifas, ...sampleRifas];
    
    if (compras.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No has realizado compras aún</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = compras.map(compra => {
        const rifa = allRifas.find(r => r.id === compra.rifaId);
        if (!rifa) return '';
        
        const organizer = rifa.organizer || { name: 'Organizador', avatar: '' };
        const statusBadge = {
            pending: '<span class="badge-status badge-pending">Pendiente</span>',
            paid: '<span class="badge-status badge-active">Pagado</span>',
            active: '<span class="badge-status badge-active">Activa</span>',
            completed: '<span class="badge-status" style="background: rgba(107, 114, 128, 0.1); color: #6b7280;">Completada</span>',
            won: '<span class="badge-status" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Ganada</span>'
        }[rifa.status] || statusBadge.active;
        
        return `
            <tr>
                <td>
                    <div class="table-rifa-info">
                        <img src="${rifa.image || 'https://via.placeholder.com/50'}" alt="${rifa.title}" onerror="this.src='https://via.placeholder.com/50'">
                        <span>${rifa.title}</span>
                    </div>
                </td>
                <td>
                    <div class="table-rifa-info">
                        <img src="${organizer.avatar || 'https://ui-avatars.com/api/?name=' + organizer.name}" alt="${organizer.name}" style="width: 30px; height: 30px; border-radius: 50%;" onerror="this.src='https://ui-avatars.com/api/?name=' + organizer.name">
                        <span>${organizer.name}</span>
                    </div>
                </td>
                <td>
                    <span class="number-badge">${compra.numbers.length} número(s)</span>
                    <small style="display: block; color: var(--text-secondary); margin-top: 0.25rem;">${compra.numbers.slice(0, 3).join(', ')}${compra.numbers.length > 3 ? '...' : ''}</small>
                </td>
                <td><strong>$${formatNumber(compra.total.toFixed(0))}</strong></td>
                <td>${new Date(compra.purchases[0].purchaseDate).toLocaleDateString('es-ES')}</td>
                <td>${statusBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-icon" onclick="window.location.href='rifa-detalle.html?id=${rifa.id}'" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterCompras() {
    // Implementation for filtering purchases
    const search = document.getElementById('comprasSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('comprasStatusFilter')?.value || 'all';
    const dateFilter = document.getElementById('comprasDateFilter')?.value || 'all';
    
    // Filter logic here
}

// ========== MIS PAGOS SECTION ==========

function initMisPagosSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#mis-pagos') {
                e.preventDefault();
                showMisPagosSection(user);
            }
        });
    });
}

function showMisPagosSection(user) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const pagosSection = document.getElementById('misPagosSection');
    if (pagosSection) {
        pagosSection.style.display = 'block';
        loadMisPagos(user.id);
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#mis-pagos"]')?.classList.add('active');
}

function loadMisPagos(userId) {
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const userPurchases = purchases.filter(p => p.userId === userId);
    
    const pagosCompletados = userPurchases.filter(p => p.paymentStatus === 'completed' || p.paymentStatus === 'confirmed').length;
    const pagosPendientes = userPurchases.filter(p => p.paymentStatus === 'pending').length;
    const pagosRechazados = userPurchases.filter(p => p.paymentStatus === 'rejected' || p.paymentStatus === 'failed').length;
    const totalPagado = userPurchases
        .filter(p => p.paymentStatus === 'completed' || p.paymentStatus === 'confirmed')
        .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    
    document.getElementById('pagosCompletados').textContent = pagosCompletados;
    document.getElementById('pagosPendientes').textContent = pagosPendientes;
    document.getElementById('pagosRechazados').textContent = pagosRechazados;
    document.getElementById('totalPagado').textContent = `$${formatNumber(totalPagado.toFixed(0))}`;
    
    loadPagosTable(userPurchases);
}

function loadPagosTable(pagos) {
    const tableBody = document.getElementById('pagosTableBody');
    if (!tableBody) return;
    
    const rifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...rifas, ...sampleRifas];
    
    if (pagos.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-money-bill-wave" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No tienes pagos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = pagos.map(pago => {
        const rifa = allRifas.find(r => r.id === pago.rifaId);
        const paymentMethodBadge = {
            revolut: '<span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">Revolut</span>',
            bizum: '<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">Bizum</span>',
            paypal: '<span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">PayPal</span>',
            tarjeta: '<span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">Tarjeta</span>',
            transferencia: '<span style="background: rgba(107, 114, 128, 0.1); color: #6b7280; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">Transferencia</span>'
        }[pago.paymentMethod] || '<span style="background: rgba(107, 114, 128, 0.1); color: #6b7280; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem;">Otro</span>';
        
        const statusBadge = {
            completed: '<span class="badge-status badge-active">Completado</span>',
            confirmed: '<span class="badge-status badge-active">Confirmado</span>',
            pending: '<span class="badge-status badge-pending">Pendiente</span>',
            rejected: '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Rechazado</span>',
            failed: '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Fallido</span>',
            refunded: '<span class="badge-status" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Reembolsado</span>'
        }[pago.paymentStatus] || statusBadge.pending;
        
        return `
            <tr>
                <td><code style="font-size: 0.75rem;">${pago.id || pago.transactionId || 'N/A'}</code></td>
                <td>${rifa ? rifa.title : 'Rifa no encontrada'}</td>
                <td><strong>$${formatNumber((pago.totalAmount || 0).toFixed(0))}</strong></td>
                <td>${paymentMethodBadge}</td>
                <td>${new Date(pago.purchaseDate || Date.now()).toLocaleDateString('es-ES')}</td>
                <td>${statusBadge}</td>
                <td>
                    ${pago.receipt ? `<a href="${pago.receipt}" target="_blank" class="btn-icon" title="Ver Comprobante"><i class="fas fa-receipt"></i></a>` : 'N/A'}
                </td>
                <td>
                    <button class="btn-icon" onclick="viewPagoDetails('${pago.id || pago.transactionId}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterPagos() {
    // Implementation for filtering payments
}

function viewPagoDetails(pagoId) {
    showToast('Detalles de pago en desarrollo', 'info');
}

// ========== CALIFICACIONES RECIBIDAS SECTION ==========

function initCalificacionesRecibidasSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#calificaciones-recibidas') {
                e.preventDefault();
                showCalificacionesRecibidasSection(user);
            }
        });
    });
}

function showCalificacionesRecibidasSection(user) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const calificacionesSection = document.getElementById('calificacionesRecibidasSection');
    if (calificacionesSection) {
        calificacionesSection.style.display = 'block';
        loadCalificacionesRecibidas(user.id);
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#calificaciones-recibidas"]')?.classList.add('active');
}

function loadCalificacionesRecibidas(userId) {
    // Load seller reviews for this buyer
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const buyerReviews = reviews.filter(r => r.reviewedUserId === userId && r.reviewerRole === 'organizer');
    
    const promedio = buyerReviews.length > 0 
        ? (buyerReviews.reduce((sum, r) => sum + r.rating, 0) / buyerReviews.length).toFixed(1)
        : '0.0';
    
    document.getElementById('calificacionPromedio').textContent = promedio;
    document.getElementById('totalCalificaciones').textContent = buyerReviews.length;
    
    const vendedoresUnicos = [...new Set(buyerReviews.map(r => r.reviewerId))];
    document.getElementById('vendedoresCalificaron').textContent = vendedoresUnicos.length;
    
    loadCalificacionesRecibidasList(buyerReviews);
}

function loadCalificacionesRecibidasList(reviews) {

function loadCalificacionesRecibidasList(reviews) {
    const listContainer = document.getElementById('calificacionesRecibidasList');
    if (!listContainer) return;
    
    const organizers = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'organizador' || u.role === 'organizer');
    
    if (reviews.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-star" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">Aún no has recibido calificaciones de vendedores</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = reviews.map(review => {
        const organizer = organizers.find(o => o.id === review.reviewerId) || { firstName: 'Vendedor', lastName: '', avatar: '' };
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <img src="${organizer.avatar || 'https://ui-avatars.com/api/?name=' + organizer.firstName}" alt="${organizer.firstName}" class="review-avatar" onerror="this.src='https://ui-avatars.com/api/?name=' + organizer.firstName">
                    <div class="review-info">
                        <strong>${organizer.firstName} ${organizer.lastName}</strong>
                        <div class="review-rating">
                            ${generateStars(review.rating)}
                        </div>
                    </div>
                    <span class="review-date">${new Date(review.createdAt || Date.now()).toLocaleDateString('es-ES')}</span>
                </div>
                <p class="review-text">${review.comment || 'Sin comentario'}</p>
            </div>
        `;
    }).join('');
}

// ========== ESTADO CLIENTE SECTION ==========

function initEstadoClienteSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#estado-cliente') {
                e.preventDefault();
                showEstadoClienteSection(user);
            }
        });
    });
}

function showEstadoClienteSection(user) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const estadoSection = document.getElementById('estadoClienteSection');
    if (estadoSection) {
        estadoSection.style.display = 'block';
        loadEstadoCliente(user.id);
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#estado-cliente"]')?.classList.add('active');
}

function loadEstadoCliente(userId) {
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const userPurchases = purchases.filter(p => p.userId === userId);
    
    const pagosAlDia = userPurchases.filter(p => {
        const paymentDate = new Date(p.purchaseDate || Date.now());
        const dueDate = new Date(paymentDate);
        dueDate.setDate(dueDate.getDate() + 3); // 3 days to pay
        return (p.paymentStatus === 'completed' || p.paymentStatus === 'confirmed') && new Date() <= dueDate;
    }).length;
    
    const pagosRetrasados = userPurchases.filter(p => {
        const paymentDate = new Date(p.purchaseDate || Date.now());
        const dueDate = new Date(paymentDate);
        dueDate.setDate(dueDate.getDate() + 3);
        return p.paymentStatus === 'pending' && new Date() > dueDate;
    }).length;
    
    const pagosRechazados = userPurchases.filter(p => p.paymentStatus === 'rejected' || p.paymentStatus === 'failed').length;
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const buyerReviews = reviews.filter(r => r.reviewedUserId === userId && r.reviewerRole === 'organizer');
    const calificacionPromedio = buyerReviews.length > 0 
        ? (buyerReviews.reduce((sum, r) => sum + r.rating, 0) / buyerReviews.length).toFixed(1)
        : '0.0';
    
    document.getElementById('pagosAlDia').textContent = pagosAlDia;
    document.getElementById('pagosRetrasados').textContent = pagosRetrasados;
    document.getElementById('pagosRechazadosCliente').textContent = pagosRechazados;
    document.getElementById('calificacionPromedioCliente').textContent = calificacionPromedio;
    
    // Determine client status
    let status = 'buen-cliente';
    let title = 'Buen Cliente';
    let description = 'Tu historial es excelente. Sigues cumpliendo con tus pagos y mantienes una buena relación con los vendedores.';
    
    if (pagosRetrasados > 2 || pagosRechazados > 3) {
        status = 'moroso';
        title = 'Cliente Moroso';
        description = 'Tienes varios pagos retrasados o rechazados. Por favor, actualiza tus pagos pendientes para mejorar tu estado.';
    }
    
    if (pagosRechazados > 5 || calificacionPromedio < 2.0) {
        status = 'infractor';
        title = 'Infractor de Normas';
        description = 'Tu comportamiento en la plataforma ha sido reportado como infractor. Contacta al soporte para más información.';
    }
    
    document.getElementById('clientStatusTitle').textContent = title;
    document.getElementById('clientStatusDescription').textContent = description;
    
    // Show/hide badges
    document.getElementById('badgeBuenCliente').style.display = status === 'buen-cliente' ? 'flex' : 'none';
    document.getElementById('badgeMoroso').style.display = status === 'moroso' ? 'flex' : 'none';
    document.getElementById('badgeInfractor').style.display = status === 'infractor' ? 'flex' : 'none';
    
    // Update details
    const detailsContent = document.getElementById('statusDetailsContent');
    detailsContent.innerHTML = `
        <ul style="list-style: none; padding: 0;">
            <li><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Total de compras: ${userPurchases.length}</li>
            <li><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Pagos completados: ${pagosAlDia}</li>
            ${pagosRetrasados > 0 ? `<li><i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 0.5rem;"></i> Pagos retrasados: ${pagosRetrasados}</li>` : ''}
            ${pagosRechazados > 0 ? `<li><i class="fas fa-times" style="color: #ef4444; margin-right: 0.5rem;"></i> Pagos rechazados: ${pagosRechazados}</li>` : ''}
            <li><i class="fas fa-star" style="color: #f59e0b; margin-right: 0.5rem;"></i> Calificación promedio: ${calificacionPromedio}/5.0</li>
        </ul>
    `;
}

function mejorarEstadoCliente() {
    showToast('Guía de mejora en desarrollo', 'info');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star" style="color: #f59e0b;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #d1d5db;"></i>';
        }
    }
    return stars;
}

window.filterExplorarRifas = filterExplorarRifas;
window.showChangePasswordModal = showChangePasswordModal;
window.resetPerfilForm = resetPerfilForm;
window.isFavorite = isFavorite;
window.filterCompras = filterCompras;
window.filterPagos = filterPagos;
window.viewPagoDetails = viewPagoDetails;
window.mejorarEstadoCliente = mejorarEstadoCliente;
window.viewRifaFromHistorial = viewRifaFromHistorial;
window.downloadTicketFromHistorial = downloadTicketFromHistorial;
window.confirmPrizeReceived = confirmPrizeReceived;
window.reportPrizeIssue = reportPrizeIssue;

