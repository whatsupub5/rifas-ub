// ========== ORGANIZER PROFILE LOGIC ==========

let currentOrganizer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const organizerId = urlParams.get('id');
    
    if (organizerId) {
        loadOrganizerProfile(organizerId);
    } else {
        showError('No se especificó un organizador');
    }
});

// Load organizer profile
function loadOrganizerProfile(organizerId) {
    // Get organizer from users or create from rifas
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let organizer = users.find(u => u.id === organizerId && (u.role === 'organizer' || u.role === 'organizador'));
    
    // If not found in users, try to get from rifas
    if (!organizer) {
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
        const allRifas = [...myRifas, ...sampleRifas];
        const rifa = allRifas.find(r => r.organizerId === organizerId);
        
        if (rifa && rifa.organizer) {
            const nameParts = rifa.organizer.name.split(' ');
            organizer = {
                id: organizerId,
                firstName: nameParts[0] || 'Organizador',
                lastName: nameParts.slice(1).join(' ') || '',
                email: '',
                phone: '',
                avatar: rifa.organizer.avatar,
                role: 'organizer',
                location: 'Madrid, España', // Default location
                bio: 'Organizador de rifas en RIFAS UBIA',
                joinedDate: rifa.createdAt || new Date().toISOString()
            };
        }
    }
    
    // If still not found, try to get from current user if it's the same ID
    if (!organizer) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id === organizerId && (currentUser.role === 'organizer' || currentUser.role === 'organizador')) {
            organizer = {
                ...currentUser,
                location: currentUser.location || 'Madrid, España',
                bio: currentUser.bio || 'Organizador de rifas en RIFAS UBIA'
            };
        }
    }
    
    if (!organizer) {
        showError('Organizador no encontrado');
        return;
    }
    
    currentOrganizer = organizer;
    
    // Get organizer rifas
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    const organizerRifas = allRifas.filter(r => r.organizerId === organizerId);
    
    // Get organizer stats
    const stats = getOrganizerStats(organizerId, organizerRifas);
    
    // Get reviews
    const reviews = window.getOrganizerReviews ? window.getOrganizerReviews(organizerId) : [];
    const ratingStats = window.getOrganizerRatingStats ? window.getOrganizerRatingStats(organizerId) : null;
    
    renderOrganizerProfile(organizer, stats, organizerRifas, reviews, ratingStats);
}

// Get organizer statistics
function getOrganizerStats(organizerId, rifas) {
    const activeRifas = rifas.filter(r => r.status === 'active').length;
    const completedRifas = rifas.filter(r => r.status === 'completed').length;
    const totalSales = rifas.reduce((sum, r) => sum + (r.soldNumbers || 0), 0);
    const totalParticipants = new Set(rifas.flatMap(r => {
        const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        return purchases.filter(p => p.rifaId === r.id).map(p => p.userId);
    })).size;
    
    return {
        totalRifas: rifas.length,
        activeRifas: activeRifas,
        completedRifas: completedRifas,
        totalSales: totalSales,
        totalParticipants: totalParticipants
    };
}

// Render organizer profile
function renderOrganizerProfile(organizer, stats, rifas, reviews, ratingStats) {
    const content = document.getElementById('organizerProfileContent');
    if (!content) return;
    
    const organizerName = `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim() || 'Organizador';
    const location = organizer.location || 'Ubicación no especificada';
    const bio = organizer.bio || 'Este organizador aún no ha agregado una biografía.';
    const joinedDate = organizer.joinedDate ? new Date(organizer.joinedDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'Fecha no disponible';
    
    content.innerHTML = `
        <!-- Profile Header -->
        <div class="organizer-profile-header">
            <div class="organizer-header-content">
                <img src="${organizer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(organizerName)}" 
                     alt="${organizerName}" 
                     class="organizer-avatar-large"
                     onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${organizerName}')">
                <div class="organizer-header-info">
                    <h1 class="organizer-name-large">${organizerName}</h1>
                    <div class="organizer-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${location}</span>
                    </div>
                    <div class="organizer-rating-header">
                        ${ratingStats && ratingStats.totalReviews > 0 ? `
                        <div class="organizer-rating-large">
                            <div class="stars">${generateStars(ratingStats.averageRating)}</div>
                            <div>
                                <strong>${ratingStats.averageRating.toFixed(1)}</strong>
                                <span style="opacity: 0.9; font-size: 0.875rem;"> (${ratingStats.totalReviews} reseñas)</span>
                            </div>
                        </div>
                        ` : '<div class="organizer-rating-large"><span>Sin calificaciones aún</span></div>'}
                    </div>
                    <div class="organizer-stats-header">
                        <div class="organizer-stat-header">
                            <span class="stat-value">${stats.totalRifas}</span>
                            <span class="stat-label">Rifas Totales</span>
                        </div>
                        <div class="organizer-stat-header">
                            <span class="stat-value">${stats.activeRifas}</span>
                            <span class="stat-label">Rifas Activas</span>
                        </div>
                        <div class="organizer-stat-header">
                            <span class="stat-value">${stats.totalSales}</span>
                            <span class="stat-label">Números Vendidos</span>
                        </div>
                        <div class="organizer-stat-header">
                            <span class="stat-value">${stats.totalParticipants}</span>
                            <span class="stat-label">Participantes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Content -->
        <div class="organizer-profile-content">
            <!-- Sidebar -->
            <aside class="organizer-sidebar">
                <div class="organizer-info-card">
                    <h3><i class="fas fa-info-circle"></i> Información</h3>
                    <div class="organizer-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="organizer-info-item-content">
                            <div class="organizer-info-item-label">Ubicación</div>
                            <div class="organizer-info-item-value">${location}</div>
                        </div>
                    </div>
                    <div class="organizer-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div class="organizer-info-item-content">
                            <div class="organizer-info-item-label">Miembro desde</div>
                            <div class="organizer-info-item-value">${joinedDate}</div>
                        </div>
                    </div>
                    <div class="organizer-info-item">
                        <i class="fas fa-ticket-alt"></i>
                        <div class="organizer-info-item-content">
                            <div class="organizer-info-item-label">Rifas Completadas</div>
                            <div class="organizer-info-item-value">${stats.completedRifas}</div>
                        </div>
                    </div>
                    ${ratingStats && ratingStats.totalReviews > 0 ? `
                    <div class="organizer-info-item">
                        <i class="fas fa-star"></i>
                        <div class="organizer-info-item-content">
                            <div class="organizer-info-item-label">Calificación Promedio</div>
                            <div class="organizer-info-item-value">${ratingStats.averageRating.toFixed(1)} / 5.0</div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="organizer-info-card">
                    <h3><i class="fas fa-user"></i> Sobre Mí</h3>
                    <p class="organizer-bio">${bio}</p>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="organizer-main-content">
                <!-- Tabs -->
                <div class="organizer-tabs">
                    <button class="organizer-tab active" onclick="switchTab('rifas')">
                        <i class="fas fa-ticket-alt"></i> Rifas (${rifas.length})
                    </button>
                    ${reviews.length > 0 ? `
                    <button class="organizer-tab" onclick="switchTab('reviews')">
                        <i class="fas fa-star"></i> Reseñas (${reviews.length})
                    </button>
                    ` : ''}
                </div>

                <!-- Rifas Tab -->
                <div class="organizer-tab-content active" id="rifasTab">
                    ${rifas.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-ticket-alt" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>Este organizador aún no ha creado rifas.</p>
                    </div>
                    ` : `
                    <div class="organizer-rifas-grid">
                        ${rifas.map(rifa => createOrganizerRifaCard(rifa)).join('')}
                    </div>
                    `}
                </div>

                <!-- Reviews Tab -->
                ${reviews.length > 0 ? `
                <div class="organizer-tab-content" id="reviewsTab">
                    ${renderReviewsSection(reviews, ratingStats)}
                </div>
                ` : ''}
            </main>
        </div>
    `;
}

// Create organizer rifa card
function createOrganizerRifaCard(rifa) {
    const progressPercentage = rifa.totalNumbers > 0 ? (rifa.soldNumbers / rifa.totalNumbers) * 100 : 0;
    const remainingNumbers = rifa.totalNumbers - (rifa.soldNumbers || 0);
    const statusClass = rifa.status === 'active' ? 'active' : rifa.status === 'completed' ? 'completed' : 'cancelled';
    const statusText = rifa.status === 'active' ? 'Activa' : rifa.status === 'completed' ? 'Completada' : 'Cancelada';
    
    return `
        <div class="organizer-rifa-card" onclick="viewRifaDetails('${rifa.id}')">
            <img src="${rifa.image || 'https://assets/logo-ub.png/400x200'}" 
                 alt="${rifa.title}" 
                 class="organizer-rifa-image"
                 onerror="this.src='https://assets/logo-ub.png/400x200?text=Sin+Imagen'">
            <div class="organizer-rifa-content">
                <span class="organizer-rifa-status ${statusClass}">${statusText}</span>
                <h3 class="organizer-rifa-title">${rifa.title}</h3>
                <div class="organizer-rifa-details">
                    <span><i class="fas fa-dollar-sign"></i> Precio: <strong>$${formatNumber(rifa.price)}</strong></span>
                    <span><i class="fas fa-ticket-alt"></i> ${rifa.totalNumbers} números</span>
                </div>
                <div class="organizer-rifa-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <p class="progress-text" style="font-size: 0.75rem; margin-top: 0.5rem;">
                        ${rifa.soldNumbers || 0}/${rifa.totalNumbers} vendidos (${remainingNumbers} disponibles)
                    </p>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </div>
        </div>
    `;
}

// Render reviews section
function renderReviewsSection(reviews, ratingStats) {
    if (!ratingStats) {
        return '<p>No hay reseñas disponibles.</p>';
    }
    
    return `
        <div class="organizer-reviews-summary">
            <div class="organizer-reviews-stats">
                <div class="organizer-reviews-average">
                    <div class="organizer-reviews-average-number">${ratingStats.averageRating.toFixed(1)}</div>
                    <div class="organizer-reviews-average-stars">${generateStars(ratingStats.averageRating)}</div>
                    <div class="organizer-reviews-average-count">${ratingStats.totalReviews} reseñas</div>
                </div>
                <div class="organizer-reviews-distribution">
                    ${[5, 4, 3, 2, 1].map(rating => `
                        <div class="organizer-reviews-bar-item">
                            <span>${rating} <i class="fas fa-star"></i></span>
                            <div class="organizer-reviews-bar">
                                <div class="organizer-reviews-bar-fill" style="width: ${ratingStats.percentageByRating[rating] || 0}%"></div>
                            </div>
                            <span>${ratingStats.ratingDistribution[rating] || 0} (${ratingStats.percentageByRating[rating] || 0}%)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="organizer-reviews-list">
            ${reviews.slice(0, 10).map(review => `
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
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Switch tab
function switchTab(tabName) {
    // Update tabs
    document.querySelectorAll('.organizer-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.organizer-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// View rifa details
function viewRifaDetails(rifaId) {
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

// Generate stars
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Show error
function showError(message) {
    const content = document.getElementById('organizerProfileContent');
    if (content) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h2>${message}</h2>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
                    Volver al Inicio
                </a>
            </div>
        `;
    }
}

window.switchTab = switchTab;
window.viewRifaDetails = viewRifaDetails;

