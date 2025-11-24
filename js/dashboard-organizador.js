// ========== DASHBOARD ORGANIZADOR LOGIC ==========

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (user && user.role === 'organizador') {
        initDashboard(user);
    } else if (user && user.role !== 'organizador') {
        showToast('No tienes permisos para acceder a esta página', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

// Initialize dashboard
function initDashboard(user) {
    updateUserInfo(user);
    loadOrganizerStats(user.id);
    loadMyRifas(user.id);
    loadFundsStatus(user.id);
    loadContacts(user.id);
    loadOrganizerReviews(user.id);
    initSidebarToggle();
    initCreateRifaForm();
    initContactsSection();
    initReviewsSection();
    initVentasSection();
    initPublicProfileLink(user.id);
    initGeneradorIaSection(user);
    initNotifications(user);
    initSorteosSection(user);
    initReportesSection(user);
    initPerfilSection(user);
    console.log('Dashboard de Organizador inicializado');
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

// Initialize public profile link
function initPublicProfileLink(userId) {
    const link = document.getElementById('viewPublicProfileLink');
    if (link) {
        link.href = `perfil-organizador.html?id=${userId}`;
        link.target = '_blank';
    }
}

// Load funds status
function loadFundsStatus(organizerId) {
    if (!window.getAllOrganizerFunds) return;
    
    const funds = window.getAllOrganizerFunds(organizerId);
    const fundsCards = document.getElementById('fundsCards');
    
    if (!fundsCards) return;
    
    if (funds.length === 0) {
        fundsCards.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-wallet" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No hay fondos registrados aún.</p>
            </div>
        `;
        return;
    }
    
    fundsCards.innerHTML = '';
    
    funds.forEach(fund => {
        const card = document.createElement('div');
        card.className = 'fund-card';
        
        const statusBadge = fund.status === 'released' 
            ? '<span class="badge-status badge-active">Liberado</span>'
            : fund.status === 'held'
            ? '<span class="badge-status badge-pending">Retenido</span>'
            : '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">En Disputa</span>';
        
        card.innerHTML = `
            <div class="fund-header">
                <h3>${fund.rifaTitle}</h3>
                ${statusBadge}
            </div>
            <div class="fund-details">
                <div class="fund-item">
                    <span class="fund-label">Total Recaudado:</span>
                    <span class="fund-value">$${formatNumber(fund.totalAmount)}</span>
                </div>
                <div class="fund-item">
                    <span class="fund-label">Fondos Retenidos:</span>
                    <span class="fund-value held">$${formatNumber(fund.heldAmount)}</span>
                </div>
                <div class="fund-item">
                    <span class="fund-label">Fondos Liberados:</span>
                    <span class="fund-value released">$${formatNumber(fund.releasedAmount)}</span>
                </div>
            </div>
            ${fund.status === 'held' ? `
                <div class="fund-notice">
                    <i class="fas fa-clock"></i>
                    <p>Los fondos se liberarán cuando el ganador confirme la recepción del premio.</p>
                </div>
            ` : ''}
        `;
        
        fundsCards.appendChild(card);
    });
}

// Update user info
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

// Load organizer statistics
async function loadOrganizerStats(userId) {
    try {
        const stats = {
            rifasActivas: 5,
            ventasTotales: 125000,
            participantes: 342,
            tasaVenta: 68
        };
        
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-value').textContent = stats.rifasActivas;
            statCards[1].querySelector('.stat-value').textContent = '$' + formatNumber(stats.ventasTotales);
            statCards[2].querySelector('.stat-value').textContent = stats.participantes;
            statCards[3].querySelector('.stat-value').textContent = stats.tasaVenta + '%';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Error al cargar estadísticas', 'error');
    }
}

// Load my rifas
function loadMyRifas(userId) {
    const myRifasGrid = document.getElementById('myRifasGrid');
    if (!myRifasGrid) return;
    
    // Get rifas from localStorage
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizerRifas = myRifas.filter(r => r.organizerId === userId);
    
    if (organizerRifas.length === 0) {
        myRifasGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-ticket-alt" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No has creado rifas aún. Haz clic en "Crear Nueva Rifa" para comenzar.</p>
            </div>
        `;
        return;
    }
    
    myRifasGrid.innerHTML = '';
    organizerRifas.forEach(rifa => {
        const card = createRifaCardWithActions(rifa);
        myRifasGrid.appendChild(card);
    });
}

// Initialize sidebar toggle
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
    }
    
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

// Toggle create rifa form
function toggleCreateRifa() {
    const crearSection = document.getElementById('crearRifaSection');
    const misRifasSection = document.getElementById('misRifasSection');
    
    if (crearSection && misRifasSection) {
        const isVisible = crearSection.style.display !== 'none';
        crearSection.style.display = isVisible ? 'none' : 'block';
        misRifasSection.style.display = isVisible ? 'block' : 'none';
        
        if (!isVisible) {
            // Scroll to form
            crearSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Set minimum date to today
            const dateInput = document.getElementById('rifaEndDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today);
            }
        } else {
            // Reset form
            document.getElementById('createRifaForm')?.reset();
            document.getElementById('imagePreview').style.display = 'none';
        }
    }
}

// Initialize create rifa form
function initCreateRifaForm() {
    const form = document.getElementById('createRifaForm');
    const imageInput = document.getElementById('rifaImage');
    
    if (form) {
        form.addEventListener('submit', handleCreateRifa);
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (file && preview && previewImg) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('La imagen es demasiado grande. Máximo 5MB', 'error');
            e.target.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Por favor selecciona una imagen válida', 'error');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Handle create rifa
async function handleCreateRifa(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const totalNumbers = parseInt(document.getElementById('rifaTotalNumbers').value);
    
    // Validate total numbers
    if (totalNumbers < 10 || totalNumbers > 10000) {
        showToast('La cantidad de números debe estar entre 10 y 10,000', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Organizador';
    
    const rifaData = {
        title: document.getElementById('rifaTitle').value,
        description: document.getElementById('rifaDescription').value,
        price: parseInt(document.getElementById('rifaPrice').value),
        totalNumbers: totalNumbers,
        endDate: document.getElementById('rifaEndDate').value,
        rules: document.getElementById('rifaRules').value,
        image: null,
        organizer: {
            name: userName,
            avatar: document.querySelector('.user-avatar')?.src || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName)
        },
        soldNumbers: 0,
        status: 'active',
        featured: false,
        createdAt: new Date().toISOString()
    };
    
    // Handle image
    const imageInput = document.getElementById('rifaImage');
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            rifaData.image = e.target.result;
            saveRifa(rifaData, submitBtn, originalText);
        };
        reader.readAsDataURL(file);
    } else {
        // Use placeholder image
        rifaData.image = 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(rifaData.title);
        saveRifa(rifaData, submitBtn, originalText);
    }
}

// Save rifa
async function saveRifa(rifaData, submitBtn, originalText) {
    submitBtn.innerHTML = '<span class="loading"></span> Creando...';
    submitBtn.disabled = true;
    
    try {
        // Generate ID
        rifaData.id = Date.now();
        
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        rifaData.organizerId = user.id || 'org-' + Math.random().toString(36).substr(2, 9);
        
        // Save to localStorage (in production, this would be an API call)
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        myRifas.push(rifaData);
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
        
        // Also add to sample rifas for display
        if (typeof sampleRifas !== 'undefined') {
            sampleRifas.unshift(rifaData);
        }
        
        showToast('¡Rifa creada exitosamente!', 'success');
        
        // Reset form and hide
        setTimeout(() => {
            document.getElementById('createRifaForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            toggleCreateRifa();
            
            // Reload rifas
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            loadMyRifas(user.id);
            loadOrganizerStats(user.id);
        }, 1500);
        
    } catch (error) {
        console.error('Error creating rifa:', error);
        showToast('Error al crear la rifa. Intenta de nuevo.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load my rifas (updated to include localStorage)
function loadMyRifas(userId) {
    const myRifasGrid = document.getElementById('myRifasGrid');
    if (!myRifasGrid) return;
    
    // Get rifas from localStorage
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    
    // Also include sample rifas if available
    let allRifas = [...myRifas];
    if (typeof sampleRifas !== 'undefined') {
        // Filter sample rifas by organizer (in production, this would be an API call)
        const sampleRifasByOrg = sampleRifas.filter(r => r.organizer?.name === document.getElementById('userName')?.textContent);
        allRifas = [...myRifas, ...sampleRifasByOrg];
    }
    
    if (allRifas.length === 0) {
        myRifasGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-ticket-alt" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">No tienes rifas creadas aún.</p>
                <button class="btn btn-primary" onclick="toggleCreateRifa()" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Crear tu Primera Rifa
                </button>
            </div>
        `;
        return;
    }
    
    myRifasGrid.innerHTML = '';
    allRifas.forEach(rifa => {
        const card = createRifaCardWithActions(rifa);
        myRifasGrid.appendChild(card);
    });
}

// Create rifa card with actions for organizer
function createRifaCardWithActions(rifa) {
    const card = document.createElement('div');
    card.className = 'rifa-card';
    
    const progressPercentage = ((rifa.soldNumbers || 0) / rifa.totalNumbers) * 100;
    const remainingNumbers = rifa.totalNumbers - (rifa.soldNumbers || 0);
    
    card.innerHTML = `
        <img src="${rifa.image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(rifa.title)}" 
             alt="${rifa.title}" 
             class="rifa-image"
             onerror="this.src='https://via.placeholder.com/400x200?text=Sin+Imagen'">
        
        <div class="rifa-content">
            <h3 class="rifa-title">${rifa.title}</h3>
            
            <p class="rifa-description">${rifa.description || ''}</p>
            
            <div class="rifa-details">
                <div class="rifa-detail">
                    <span class="rifa-detail-label"><i class="fas fa-ticket-alt"></i> Precio</span>
                    <span class="rifa-detail-value">$${formatNumber(rifa.price)}</span>
                </div>
                <div class="rifa-detail">
                    <span class="rifa-detail-label"><i class="fas fa-calendar"></i> Sorteo</span>
                    <span class="rifa-detail-value">${formatDate(rifa.endDate)}</span>
                </div>
            </div>
            
            <div class="rifa-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <p class="progress-text">
                    <strong>${rifa.soldNumbers || 0}/${rifa.totalNumbers}</strong> números vendidos
                    <span style="color: var(--success-color);">(${remainingNumbers} disponibles)</span>
                </p>
            </div>
            
            <div class="rifa-footer">
                <div class="rifa-price-tag">$${formatNumber(rifa.price)}</div>
                <div class="rifa-actions">
                    ${rifa.status === 'active' && new Date(rifa.endDate) <= new Date() && !rifa.drawId ? `
                    <button class="btn btn-primary btn-small" onclick="performRifaDraw('${rifa.id}')" title="Realizar Sorteo" style="background: var(--success-color);">
                        <i class="fas fa-trophy"></i>
                    </button>
                    ` : ''}
                    ${rifa.status === 'active' ? `
                    <button class="btn btn-outline btn-small" onclick="pauseRifa('${rifa.id}')" title="Pausar">
                        <i class="fas fa-pause"></i>
                    </button>
                    ` : rifa.status === 'paused' ? `
                    <button class="btn btn-outline btn-small" onclick="resumeRifa('${rifa.id}')" title="Reanudar">
                        <i class="fas fa-play"></i>
                    </button>
                    ` : ''}
                    <button class="btn btn-primary btn-small" onclick="viewRifaTalonario('${rifa.id}')" title="Ver Talonario">
                        <i class="fas fa-list"></i>
                    </button>
                    ${rifa.status !== 'completed' && rifa.status !== 'cancelled' ? `
                    <button class="btn btn-outline btn-small" onclick="editRifa('${rifa.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ` : ''}
                    ${rifa.status === 'active' || rifa.status === 'paused' ? `
                    <button class="btn btn-outline btn-small" onclick="cancelRifa('${rifa.id}')" title="Cancelar" style="color: var(--danger-color);">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                    <button class="btn btn-outline btn-small" onclick="viewRifaDetails('${rifa.id}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// View rifa talonario
function viewRifaTalonario(rifaId) {
    window.location.href = `talonario.html?id=${rifaId}`;
}

// Edit rifa
function editRifa(rifaId) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifa = myRifas.find(r => r.id === rifaId);
    
    if (!rifa) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    // Check if rifa can be edited
    if (rifa.status === 'completed' || rifa.status === 'cancelled') {
        showToast('No se puede editar una rifa completada o cancelada', 'error');
        return;
    }
    
    // Show edit modal
    showEditRifaModal(rifa);
}

// Show edit rifa modal
function showEditRifaModal(rifa) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>Editar Rifa</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editRifaForm">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label for="editRifaTitle">Nombre de la Rifa *</label>
                            <input type="text" id="editRifaTitle" value="${rifa.title}" required>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="editRifaDescription">Descripción del Premio *</label>
                            <textarea id="editRifaDescription" rows="3" required>${rifa.description || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="editRifaPrice">Precio por Número (COP) *</label>
                            <input type="number" id="editRifaPrice" min="1000" step="1000" value="${rifa.price}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editRifaEndDate">Fecha del Sorteo *</label>
                            <input type="date" id="editRifaEndDate" value="${rifa.endDate ? rifa.endDate.split('T')[0] : ''}" required>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="editRifaRules">Reglas y Términos *</label>
                            <textarea id="editRifaRules" rows="4" required>${rifa.rules || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-large">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                        <button type="button" class="btn btn-outline btn-large" onclick="this.closest('.modal').remove()">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Set minimum date to today
    const dateInput = document.getElementById('editRifaEndDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Handle form submission
    document.getElementById('editRifaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEditRifa(rifa.id);
        modal.remove();
    });
}

// Handle edit rifa
async function handleEditRifa(rifaId) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    
    if (rifaIndex === -1) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    const updatedRifa = {
        ...myRifas[rifaIndex],
        title: document.getElementById('editRifaTitle').value,
        description: document.getElementById('editRifaDescription').value,
        price: parseInt(document.getElementById('editRifaPrice').value),
        endDate: document.getElementById('editRifaEndDate').value,
        rules: document.getElementById('editRifaRules').value,
        updatedAt: new Date().toISOString()
    };
    
    myRifas[rifaIndex] = updatedRifa;
    localStorage.setItem('myRifas', JSON.stringify(myRifas));
    
    // Also update in sampleRifas if exists
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
    if (sampleIndex !== -1) {
        sampleRifas[sampleIndex] = { ...sampleRifas[sampleIndex], ...updatedRifa };
        localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
    }
    
    showToast('Rifa actualizada exitosamente', 'success');
    
    // Notify participants
    notifyRifaParticipants(rifaId, 'updated', updatedRifa);
    
    // Reload rifas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadMyRifas(user.id);
}

// Notify rifa participants about updates
function notifyRifaParticipants(rifaId, updateType, rifaData) {
    if (!window.notifyRifaUpdate) return;
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const rifaPurchases = purchases.filter(p => 
        p.rifaId === rifaId && 
        p.paymentStatus === 'confirmed'
    );
    
    // Get unique user IDs
    const userIds = [...new Set(rifaPurchases.map(p => p.userId))];
    
    userIds.forEach(userId => {
        window.notifyRifaUpdate(userId, rifaData, updateType);
    });
}

// Pause rifa
function pauseRifa(rifaId) {
    if (!confirm('¿Estás seguro de que deseas pausar esta rifa? Los usuarios no podrán comprar números mientras esté pausada.')) {
        return;
    }
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    
    if (rifaIndex === -1) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    myRifas[rifaIndex].status = 'paused';
    myRifas[rifaIndex].pausedAt = new Date().toISOString();
    localStorage.setItem('myRifas', JSON.stringify(myRifas));
    
    // Also update in sampleRifas
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
    if (sampleIndex !== -1) {
        sampleRifas[sampleIndex].status = 'paused';
        sampleRifas[sampleIndex].pausedAt = new Date().toISOString();
        localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
    }
    
    // Notify participants
    notifyRifaParticipants(rifaId, 'paused', myRifas[rifaIndex]);
    
    showToast('Rifa pausada exitosamente', 'success');
    
    // Reload rifas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadMyRifas(user.id);
}

// Resume rifa
function resumeRifa(rifaId) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    
    if (rifaIndex === -1) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    myRifas[rifaIndex].status = 'active';
    myRifas[rifaIndex].resumedAt = new Date().toISOString();
    delete myRifas[rifaIndex].pausedAt;
    localStorage.setItem('myRifas', JSON.stringify(myRifas));
    
    // Also update in sampleRifas
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
    if (sampleIndex !== -1) {
        sampleRifas[sampleIndex].status = 'active';
        sampleRifas[sampleIndex].resumedAt = new Date().toISOString();
        delete sampleRifas[sampleIndex].pausedAt;
        localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
    }
    
    // Notify participants
    notifyRifaParticipants(rifaId, 'resumed', myRifas[rifaIndex]);
    
    showToast('Rifa reanudada exitosamente', 'success');
    
    // Reload rifas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadMyRifas(user.id);
}

// Cancel rifa
function cancelRifa(rifaId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta rifa? Se realizarán reembolsos automáticos a todos los compradores.')) {
        return;
    }
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifa = myRifas.find(r => r.id === rifaId);
    
    if (!rifa) {
        showToast('Rifa no encontrada', 'error');
        return;
    }
    
    // Process refunds
    processRifaRefunds(rifaId);
    
    // Update rifa status
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    myRifas[rifaIndex].status = 'cancelled';
    myRifas[rifaIndex].cancelledAt = new Date().toISOString();
    localStorage.setItem('myRifas', JSON.stringify(myRifas));
    
    // Also update in sampleRifas
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
    if (sampleIndex !== -1) {
        sampleRifas[sampleIndex].status = 'cancelled';
        sampleRifas[sampleIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
    }
    
    // Notify participants
    notifyRifaParticipants(rifaId, 'cancelled', myRifas[rifaIndex]);
    
    showToast('Rifa cancelada. Los reembolsos se procesarán automáticamente.', 'success');
    
    // Reload rifas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadMyRifas(user.id);
}

// Process refunds for cancelled rifa
function processRifaRefunds(rifaId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const rifaPurchases = purchases.filter(p => 
        p.rifaId === rifaId && 
        p.paymentStatus === 'confirmed'
    );
    
    rifaPurchases.forEach(purchase => {
        // Mark for refund
        purchase.refundStatus = 'pending';
        purchase.refundRequestedAt = new Date().toISOString();
        purchase.paymentStatus = 'refunded';
        
        // In production, this would trigger actual refund via payment gateway
        console.log('Processing refund for purchase:', purchase.id);
    });
    
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
}

// Perform rifa draw
async function performRifaDraw(rifaId) {
    if (!confirm('¿Estás seguro de que deseas realizar el sorteo ahora? Esta acción no se puede deshacer.')) {
        return;
    }
    
    // Show loading - find the button that was clicked
    const buttons = document.querySelectorAll(`button[onclick*="performRifaDraw('${rifaId}')"]`);
    let submitBtn = null;
    if (buttons.length > 0) {
        submitBtn = buttons[0];
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
    }
    
    try {
        const result = await window.performDraw(rifaId, {
            method: 'automatic',
            lotteryReference: null // Will be generated automatically
        });
        
        if (result.success) {
            showToast('¡Sorteo realizado exitosamente!', 'success');
            
            // Show winner modal
            showWinnerModal(result.draw);
            
            // Reload rifas
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            loadMyRifas(user.id);
        } else {
            showToast(result.error || 'Error al realizar el sorteo', 'error');
        }
    } catch (error) {
        console.error('Error performing draw:', error);
        showToast('Error al realizar el sorteo', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-trophy"></i>';
            submitBtn.disabled = false;
        }
    }
}

// Show winner modal
function showWinnerModal(draw) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> ¡Sorteo Realizado!</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; color: var(--success-color); margin-bottom: 1rem;">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3 style="margin-bottom: 1rem;">Ganador Anunciado</h3>
                    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Número Ganador</p>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">${String(draw.winner.number).padStart(3, '0')}</p>
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Ganador:</p>
                        <p style="font-weight: 600; margin-bottom: 0.25rem;">${draw.winner.userName}</p>
                        <p style="font-size: 0.875rem; color: var(--text-secondary);">${draw.winner.userEmail}</p>
                    </div>
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Referencia de Lotería</p>
                        <p style="font-family: monospace; font-weight: 600;">${draw.lotteryReference}</p>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text-secondary);">
                        El ganador ha sido notificado automáticamente.
                    </p>
                </div>
                <div class="form-actions" style="margin-top: 2rem;">
                    <button type="button" class="btn btn-primary btn-large" onclick="this.closest('.modal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Export functions
window.formatNumber = formatNumber;
window.toggleCreateRifa = toggleCreateRifa;
window.viewRifaTalonario = viewRifaTalonario;
window.editRifa = editRifa;
window.pauseRifa = pauseRifa;
window.resumeRifa = resumeRifa;
window.cancelRifa = cancelRifa;
// View rifa details
function viewRifaDetails(rifaId) {
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

window.performRifaDraw = performRifaDraw;
window.viewRifaDetails = viewRifaDetails;

// ========== CONTACTS SECTION ==========

function initContactsSection() {
    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#contactos') {
                e.preventDefault();
                showContactsSection();
            }
        });
    });
}

function showContactsSection() {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show contacts section
    const contactsSection = document.getElementById('contactosSection');
    if (contactsSection) {
        contactsSection.style.display = 'block';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        loadContacts(user.id);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#contactos"]')?.classList.add('active');
}

function loadContacts(organizerId) {
    if (!window.getOrganizerContacts) return;
    
    const contacts = window.getOrganizerContacts(organizerId);
    const stats = window.getContactStatistics ? window.getContactStatistics(organizerId) : null;
    
    // Load statistics
    loadContactStats(stats);
    
    // Load contacts grid
    loadContactsGrid(contacts);
}

function loadContactStats(stats) {
    const statsContainer = document.getElementById('contactStats');
    if (!statsContainer || !stats) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Contactos</span>
                <span class="stat-value">${stats.total}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Invertido</span>
                <span class="stat-value">$${formatNumber(stats.totalSpent)}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b;">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Compras</span>
                <span class="stat-value">${stats.totalPurchases}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #8b5cf6;">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Promedio por Cliente</span>
                <span class="stat-value">$${formatNumber(Math.round(stats.averageSpent))}</span>
            </div>
        </div>
    `;
}

function loadContactsGrid(contacts) {
    const grid = document.getElementById('contactsGrid');
    if (!grid) return;
    
    if (contacts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-address-book" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No hay contactos aún. Los contactos se agregarán automáticamente cuando alguien compre números de tus rifas.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    contacts.forEach(contact => {
        const card = createContactCard(contact);
        grid.appendChild(card);
    });
}

function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    
    const aiSuggestion = window.generateAIMessageSuggestion ? window.generateAIMessageSuggestion(contact) : null;
    
    card.innerHTML = `
        <div class="contact-header">
            <div class="contact-avatar">
                ${contact.firstName?.[0] || 'U'}${contact.lastName?.[0] || ''}
            </div>
            <div class="contact-info">
                <h3>${contact.firstName || ''} ${contact.lastName || ''}</h3>
                <p class="contact-email">${contact.email || 'Sin email'}</p>
            </div>
            <div class="contact-actions">
                <button class="btn-icon" onclick="viewContactDetails('${contact.id}')" title="Ver Detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="sendMessageToContact('${contact.id}')" title="Enviar Mensaje">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
        <div class="contact-details">
            <div class="contact-detail-item">
                <i class="fas fa-phone"></i>
                <span>${contact.phone || 'Sin teléfono'}</span>
            </div>
            <div class="contact-detail-item">
                <i class="fas fa-shopping-cart"></i>
                <span>${contact.purchaseCount || 0} compras</span>
            </div>
            <div class="contact-detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span>$${formatNumber(contact.totalSpent || 0)} total</span>
            </div>
            <div class="contact-detail-item">
                <i class="fas fa-calendar"></i>
                <span>Última: ${contact.lastPurchase ? new Date(contact.lastPurchase).toLocaleDateString('es-ES') : 'N/A'}</span>
            </div>
        </div>
        ${aiSuggestion ? `
        <div class="contact-ai-suggestion">
            <div class="ai-suggestion-header">
                <i class="fas fa-robot"></i>
                <span>Sugerencia de IA</span>
            </div>
            <p class="ai-suggestion-text">${aiSuggestion.message.substring(0, 100)}...</p>
            <button class="btn btn-outline btn-small" onclick="useAISuggestion('${contact.id}')">
                <i class="fas fa-magic"></i> Usar Sugerencia
            </button>
        </div>
        ` : ''}
        ${contact.tags && contact.tags.length > 0 ? `
        <div class="contact-tags">
            ${contact.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        ` : ''}
    `;
    
    return card;
}

function filterContacts() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const search = document.getElementById('contactsSearch')?.value || '';
    const filter = document.getElementById('contactsFilter')?.value || 'all';
    
    let filters = { search: search };
    
    if (filter === 'recent') {
        filters.sortBy = 'lastPurchase';
    } else if (filter === 'top') {
        filters.sortBy = 'totalSpent';
    } else if (filter === 'new') {
        filters.minPurchases = 1;
    }
    
    const contacts = window.getOrganizerContacts(user.id, filters);
    loadContactsGrid(contacts);
}

function viewContactDetails(contactId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const contacts = window.getOrganizerContacts(user.id);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    // Show contact details modal
    showContactDetailsModal(contact);
}

function sendMessageToContact(contactId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const contacts = window.getOrganizerContacts(user.id);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    // Show message modal
    showMessageModal(contact);
}

function useAISuggestion(contactId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const contacts = window.getOrganizerContacts(user.id);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact || !window.generateAIMessageSuggestion) return;
    
    const suggestion = window.generateAIMessageSuggestion(contact);
    showMessageModal(contact, suggestion);
}

function showContactDetailsModal(contact) {
    // Implementation for contact details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Detalles del Contacto</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="contact-detail-view">
                    <div class="detail-row">
                        <strong>Nombre:</strong> ${contact.firstName} ${contact.lastName}
                    </div>
                    <div class="detail-row">
                        <strong>Email:</strong> ${contact.email || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Teléfono:</strong> ${contact.phone || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Total Compras:</strong> ${contact.purchaseCount || 0}
                    </div>
                    <div class="detail-row">
                        <strong>Total Invertido:</strong> $${formatNumber(contact.totalSpent || 0)}
                    </div>
                    <div class="detail-row">
                        <strong>Última Compra:</strong> ${contact.lastPurchase ? new Date(contact.lastPurchase).toLocaleDateString('es-ES') : 'N/A'}
                    </div>
                    ${contact.rifas && contact.rifas.length > 0 ? `
                    <div class="detail-section">
                        <strong>Rifas Participadas:</strong>
                        <ul>
                            ${contact.rifas.map(r => `<li>${r.rifaTitle} - Número ${r.number} - $${formatNumber(r.amount)}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function showMessageModal(contact, suggestion = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Enviar Mensaje a ${contact.firstName}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">×</span>
            </div>
            <div class="modal-body">
                <form id="messageForm">
                    <div class="form-group">
                        <label>Tipo de Mensaje</label>
                        <select id="messageType" class="form-control">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Asunto</label>
                        <input type="text" id="messageSubject" class="form-control" value="${suggestion?.subject || ''}" placeholder="Asunto del mensaje">
                    </div>
                    <div class="form-group">
                        <label>Mensaje</label>
                        <textarea id="messageText" class="form-control" rows="8" placeholder="Escribe tu mensaje...">${suggestion?.message || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Enviar Mensaje</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('messageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const messageData = {
            type: document.getElementById('messageType').value,
            subject: document.getElementById('messageSubject').value,
            message: document.getElementById('messageText').value
        };
        
        const result = await window.sendMessageToContact(user.id, contact.id, messageData);
        if (result.success) {
            showToast('Mensaje enviado exitosamente', 'success');
            modal.remove();
        } else {
            showToast(result.error || 'Error al enviar mensaje', 'error');
        }
    });
}

function showBulkMessageModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const contacts = window.getOrganizerContacts(user.id);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Enviar Mensaje Masivo</h2>
                <span class="close" onclick="this.closest('.modal').remove()">×</span>
            </div>
            <div class="modal-body">
                <form id="bulkMessageForm">
                    <div class="form-group">
                        <label>Seleccionar Contactos</label>
                        <div class="contacts-selector" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md);">
                            ${contacts.map(c => `
                                <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;">
                                    <input type="checkbox" name="contacts" value="${c.id}" checked>
                                    <span>${c.firstName} ${c.lastName} (${c.email})</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Mensaje</label>
                        <select id="bulkMessageType" class="form-control">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Asunto</label>
                        <input type="text" id="bulkMessageSubject" class="form-control" placeholder="Asunto del mensaje">
                    </div>
                    <div class="form-group">
                        <label>Mensaje</label>
                        <textarea id="bulkMessageText" class="form-control" rows="8" placeholder="Escribe tu mensaje..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Enviar a Seleccionados</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('bulkMessageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedContacts = Array.from(document.querySelectorAll('input[name="contacts"]:checked')).map(cb => cb.value);
        
        if (selectedContacts.length === 0) {
            showToast('Selecciona al menos un contacto', 'warning');
            return;
        }
        
        const messageData = {
            type: document.getElementById('bulkMessageType').value,
            subject: document.getElementById('bulkMessageSubject').value,
            message: document.getElementById('bulkMessageText').value
        };
        
        const result = await window.sendBulkMessages(user.id, selectedContacts, messageData);
        if (result.success) {
            showToast(`Mensaje enviado a ${result.sent} contactos`, 'success');
            modal.remove();
        } else {
            showToast('Error al enviar mensajes', 'error');
        }
    });
}

window.filterContacts = filterContacts;
window.viewContactDetails = viewContactDetails;
window.sendMessageToContact = sendMessageToContact;
window.useAISuggestion = useAISuggestion;
window.showBulkMessageModal = showBulkMessageModal;

// ========== REVIEWS SECTION ==========

function initReviewsSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#reseñas') {
                e.preventDefault();
                showReviewsSection();
            }
        });
    });
}

function showReviewsSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('reseñasSection');
    if (section) {
        section.style.display = 'block';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        loadOrganizerReviews(user.id);
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#reseñas"]')?.classList.add('active');
}

function loadOrganizerReviews(organizerId) {
    if (!window.getOrganizerReviews || !window.getOrganizerRatingStats) return;
    
    const stats = window.getOrganizerRatingStats(organizerId);
    const reviews = window.getOrganizerReviews(organizerId);
    
    loadRatingStats(stats);
    loadReviewsList(reviews);
}

function loadRatingStats(stats) {
    const container = document.getElementById('ratingStats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="rating-stat-card">
            <div class="rating-average">
                <div class="rating-number">${stats.averageRating.toFixed(1)}</div>
                <div class="rating-stars-large">${generateStars(Math.round(stats.averageRating))}</div>
                <p>${stats.totalReviews} reseñas</p>
            </div>
        </div>
        <div class="rating-distribution">
            ${[5, 4, 3, 2, 1].map(rating => `
                <div class="rating-bar-item">
                    <span>${rating} <i class="fas fa-star"></i></span>
                    <div class="rating-bar">
                        <div class="rating-bar-fill" style="width: ${stats.percentageByRating[rating] || 0}%"></div>
                    </div>
                    <span>${stats.ratingDistribution[rating] || 0} (${stats.percentageByRating[rating] || 0}%)</span>
                </div>
            `).join('')}
        </div>
    `;
}

function loadReviewsList(reviews) {
    const container = document.getElementById('organizerReviewsList');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-star" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Aún no tienes reseñas. Las reseñas aparecerán aquí cuando los clientes califiquen tus rifas.</p>
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
            </div>
        </div>
    `).join('');
}

function filterOrganizerReviews() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const filter = document.getElementById('reviewsFilter')?.value || 'all';
    const sort = document.getElementById('reviewsSort')?.value || 'newest';
    
    const filters = {
        sortBy: sort
    };
    
    if (filter !== 'all') {
        filters.minRating = parseInt(filter);
    }
    
    const reviews = window.getOrganizerReviews(user.id, filters);
    loadReviewsList(reviews);
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

window.filterOrganizerReviews = filterOrganizerReviews;

// ========== VENTAS SECTION ==========

function initVentasSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#ventas') {
                e.preventDefault();
                showVentasSection();
            }
        });
    });
}

function showVentasSection() {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show ventas section
    const ventasSection = document.getElementById('ventasSection');
    if (ventasSection) {
        ventasSection.style.display = 'block';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        loadVentasData(user.id);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#ventas"]')?.classList.add('active');
}

function loadVentasData(organizerId) {
    // Get all purchases for organizer's rifas
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIds = myRifas.map(r => r.id);
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const ventas = purchases.filter(p => rifaIds.includes(p.rifaId));
    
    // Load rifas for filter
    loadVentasRifasFilter(myRifas);
    
    // Load stats
    loadVentasStats(ventas);
    
    // Load table
    loadVentasTable(ventas);
}

function loadVentasRifasFilter(rifas) {
    const select = document.getElementById('ventasRifaFilter');
    if (!select) return;
    
    select.innerHTML = '<option value="all">Todas las Rifas</option>';
    rifas.forEach(rifa => {
        const option = document.createElement('option');
        option.value = rifa.id;
        option.textContent = rifa.title;
        select.appendChild(option);
    });
}

function loadVentasStats(ventas) {
    const statsContainer = document.getElementById('ventasStats');
    if (!statsContainer) return;
    
    const totalVentas = ventas.length;
    const totalIngresos = ventas
        .filter(v => v.paymentStatus === 'confirmed')
        .reduce((sum, v) => sum + (v.amount || 0), 0);
    const pendientes = ventas.filter(v => v.paymentStatus === 'pending').length;
    const confirmadas = ventas.filter(v => v.paymentStatus === 'confirmed').length;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Ventas</span>
                <span class="stat-value">${totalVentas}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Ingresos Totales</span>
                <span class="stat-value">$${formatNumber(totalIngresos)}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b;">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Pendientes</span>
                <span class="stat-value">${pendientes}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #8b5cf6;">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Confirmadas</span>
                <span class="stat-value">${confirmadas}</span>
            </div>
        </div>
    `;
}

function loadVentasTable(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    if (!tbody) return;
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay ventas registradas aún</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    ventas.sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));
    
    tbody.innerHTML = ventas.map(venta => {
        const fecha = new Date(venta.purchaseDate || venta.createdAt);
        const fechaStr = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        
        let estadoBadge = '';
        if (venta.paymentStatus === 'confirmed') {
            estadoBadge = '<span class="badge-status badge-active">Confirmado</span>';
        } else if (venta.paymentStatus === 'pending') {
            estadoBadge = '<span class="badge-status badge-pending">Pendiente</span>';
        } else if (venta.paymentStatus === 'failed') {
            estadoBadge = '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Fallido</span>';
        } else if (venta.paymentStatus === 'refunded') {
            estadoBadge = '<span class="badge-status" style="background: rgba(107, 114, 128, 0.1); color: var(--text-secondary);">Reembolsado</span>';
        }
        
        return `
            <tr>
                <td>
                    <input type="checkbox" class="venta-checkbox" value="${venta.id}" ${venta.paymentStatus === 'pending' ? '' : 'disabled'}>
                </td>
                <td>${fechaStr}</td>
                <td>${venta.rifaTitle || 'N/A'}</td>
                <td>${venta.userName || 'Usuario'}</td>
                <td><span class="number-badge">${String(venta.number).padStart(3, '0')}</span></td>
                <td>$${formatNumber(venta.amount || 0)}</td>
                <td>${venta.paymentMethod || 'N/A'}</td>
                <td>${estadoBadge}</td>
                <td>
                    <div class="rifa-actions">
                        ${venta.paymentStatus === 'pending' ? `
                        <button class="btn-icon" onclick="confirmPayment('${venta.id}')" title="Confirmar Pago">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                        </button>
                        <button class="btn-icon" onclick="rejectPayment('${venta.id}')" title="Rechazar Pago">
                            <i class="fas fa-times" style="color: var(--danger-color);"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon" onclick="viewVentaDetails('${venta.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterVentas() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIds = myRifas.map(r => r.id);
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    let ventas = purchases.filter(p => rifaIds.includes(p.rifaId));
    
    // Apply filters
    const search = document.getElementById('ventasSearch')?.value.toLowerCase() || '';
    const rifaFilter = document.getElementById('ventasRifaFilter')?.value || 'all';
    const estadoFilter = document.getElementById('ventasEstadoFilter')?.value || 'all';
    const metodoFilter = document.getElementById('ventasMetodoFilter')?.value || 'all';
    const fechaDesde = document.getElementById('ventasFechaDesde')?.value || '';
    const fechaHasta = document.getElementById('ventasFechaHasta')?.value || '';
    
    if (search) {
        ventas = ventas.filter(v => 
            (v.rifaTitle || '').toLowerCase().includes(search) ||
            (v.userName || '').toLowerCase().includes(search) ||
            String(v.number).includes(search)
        );
    }
    
    if (rifaFilter !== 'all') {
        ventas = ventas.filter(v => v.rifaId === rifaFilter);
    }
    
    if (estadoFilter !== 'all') {
        ventas = ventas.filter(v => v.paymentStatus === estadoFilter);
    }
    
    if (metodoFilter !== 'all') {
        ventas = ventas.filter(v => v.paymentMethod === metodoFilter);
    }
    
    if (fechaDesde) {
        const desde = new Date(fechaDesde);
        desde.setHours(0, 0, 0, 0);
        ventas = ventas.filter(v => {
            const fecha = new Date(v.purchaseDate || v.createdAt);
            fecha.setHours(0, 0, 0, 0);
            return fecha >= desde;
        });
    }
    
    if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        ventas = ventas.filter(v => {
            const fecha = new Date(v.purchaseDate || v.createdAt);
            fecha.setHours(23, 59, 59, 999);
            return fecha <= hasta;
        });
    }
    
    // Reload stats and table
    loadVentasStats(ventas);
    loadVentasTable(ventas);
}

function confirmPayment(purchaseId) {
    if (!confirm('¿Confirmar este pago?')) return;
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    
    if (purchaseIndex === -1) {
        showToast('Venta no encontrada', 'error');
        return;
    }
    
    purchases[purchaseIndex].paymentStatus = 'confirmed';
    purchases[purchaseIndex].confirmedAt = new Date().toISOString();
    purchases[purchaseIndex].confirmedBy = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
    
    // Notify buyer about payment confirmation
    if (window.notifyPaymentConfirmed) {
        window.notifyPaymentConfirmed(
            purchases[purchaseIndex].userId,
            purchases[purchaseIndex]
        );
    }
    
    showToast('Pago confirmado exitosamente', 'success');
    
    // Reload ventas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadVentasData(user.id);
}

function rejectPayment(purchaseId) {
    if (!confirm('¿Rechazar este pago? El número quedará disponible nuevamente.')) return;
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    
    if (purchaseIndex === -1) {
        showToast('Venta no encontrada', 'error');
        return;
    }
    
    purchases[purchaseIndex].paymentStatus = 'failed';
    purchases[purchaseIndex].rejectedAt = new Date().toISOString();
    purchases[purchaseIndex].rejectedBy = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    // Free the number
    if (window.updateRifaNumberStatus) {
        window.updateRifaNumberStatus(
            purchases[purchaseIndex].rifaId,
            purchases[purchaseIndex].number,
            'available',
            null
        );
    }
    
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
    
    showToast('Pago rechazado', 'info');
    
    // Reload ventas
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadVentasData(user.id);
}

function toggleSelectAllVentas() {
    const selectAll = document.getElementById('selectAllVentas');
    const checkboxes = document.querySelectorAll('.venta-checkbox:not(:disabled)');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
}

function showConfirmPaymentModal() {
    const selected = Array.from(document.querySelectorAll('.venta-checkbox:checked')).map(cb => cb.value);
    
    if (selected.length === 0) {
        showToast('Selecciona al menos un pago para confirmar', 'warning');
        return;
    }
    
    if (!confirm(`¿Confirmar ${selected.length} pago(s)?`)) return;
    
    selected.forEach(purchaseId => {
        confirmPayment(purchaseId);
    });
}

function exportVentasCSV() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIds = myRifas.map(r => r.id);
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const ventas = purchases.filter(p => rifaIds.includes(p.rifaId));
    
    // Create CSV
    const headers = ['Fecha', 'Rifa', 'Comprador', 'Email', 'Número', 'Monto', 'Método', 'Estado'];
    const rows = ventas.map(v => {
        const fecha = new Date(v.purchaseDate || v.createdAt).toLocaleDateString('es-ES');
        return [
            fecha,
            v.rifaTitle || '',
            v.userName || '',
            v.userEmail || '',
            v.number || '',
            v.amount || 0,
            v.paymentMethod || '',
            v.paymentStatus || ''
        ];
    });
    
    const csv = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('Ventas exportadas exitosamente', 'success');
}

function viewVentaDetails(purchaseId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const venta = purchases.find(p => p.id === purchaseId);
    
    if (!venta) {
        showToast('Venta no encontrada', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Detalles de Venta</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="contact-detail-view">
                    <div class="detail-row">
                        <strong>Rifa:</strong> ${venta.rifaTitle || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Comprador:</strong> ${venta.userName || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Email:</strong> ${venta.userEmail || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Número:</strong> <span class="number-badge">${String(venta.number).padStart(3, '0')}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Monto:</strong> $${formatNumber(venta.amount || 0)}
                    </div>
                    <div class="detail-row">
                        <strong>Método de Pago:</strong> ${venta.paymentMethod || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Estado:</strong> ${venta.paymentStatus || 'N/A'}
                    </div>
                    <div class="detail-row">
                        <strong>Fecha:</strong> ${new Date(venta.purchaseDate || venta.createdAt).toLocaleString('es-ES')}
                    </div>
                    ${venta.transactionId ? `
                    <div class="detail-row">
                        <strong>ID de Transacción:</strong> ${venta.transactionId}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

window.filterVentas = filterVentas;
window.confirmPayment = confirmPayment;
window.rejectPayment = rejectPayment;
window.toggleSelectAllVentas = toggleSelectAllVentas;
window.showConfirmPaymentModal = showConfirmPaymentModal;
window.exportVentasCSV = exportVentasCSV;
window.viewVentaDetails = viewVentaDetails;

// ========== SORTEOS SECTION ==========

function initSorteosSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#sorteos') {
                e.preventDefault();
                showSorteosSection(user);
            }
        });
    });
}

function showSorteosSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show sorteos section
    const sorteosSection = document.getElementById('sorteosSection');
    if (sorteosSection) {
        sorteosSection.style.display = 'block';
        loadSorteosData(user.id);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#sorteos"]')?.classList.add('active');
}

function loadSorteosData(organizerId) {
    // Load rifas ready for draw
    loadSorteosReady(organizerId);
    
    // Load draw history
    loadSorteosHistory(organizerId);
}

function loadSorteosReady(organizerId) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizerRifas = myRifas.filter(r => r.organizerId === organizerId);
    
    // Filter rifas ready for draw
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const readyRifas = organizerRifas.filter(rifa => {
        if (rifa.status !== 'active') return false;
        if (rifa.drawId) return false; // Already drawn
        if (!rifa.soldNumbers || rifa.soldNumbers === 0) return false; // No sales
        
        const drawDate = new Date(rifa.endDate);
        drawDate.setHours(0, 0, 0, 0);
        return drawDate <= today; // Draw date has arrived
    });
    
    const grid = document.getElementById('sorteosReadyGrid');
    if (!grid) return;
    
    if (readyRifas.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-trophy" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No hay rifas listas para sorteo en este momento.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    readyRifas.forEach(rifa => {
        const card = createSorteoReadyCard(rifa);
        grid.appendChild(card);
    });
}

function createSorteoReadyCard(rifa) {
    const card = document.createElement('div');
    card.className = 'rifa-card';
    
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const rifaPurchases = purchases.filter(p => 
        p.rifaId === rifa.id && 
        p.paymentStatus === 'confirmed'
    );
    
    card.innerHTML = `
        <img src="${rifa.image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(rifa.title)}" 
             alt="${rifa.title}" 
             class="rifa-image"
             onerror="this.src='https://via.placeholder.com/400x200?text=Sin+Imagen'">
        
        <div class="rifa-content">
            <h3 class="rifa-title">${rifa.title}</h3>
            
            <div class="rifa-details">
                <div class="rifa-detail">
                    <span class="rifa-detail-label"><i class="fas fa-users"></i> Participantes</span>
                    <span class="rifa-detail-value">${rifaPurchases.length}</span>
                </div>
                <div class="rifa-detail">
                    <span class="rifa-detail-label"><i class="fas fa-calendar"></i> Fecha Sorteo</span>
                    <span class="rifa-detail-value">${formatDate(rifa.endDate)}</span>
                </div>
            </div>
            
            <div class="rifa-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%; background: var(--success-color);"></div>
                </div>
                <p class="progress-text">
                    <strong>${rifa.soldNumbers || 0}/${rifa.totalNumbers}</strong> números vendidos
                </p>
            </div>
            
            <div class="rifa-footer">
                <div class="rifa-actions" style="width: 100%; justify-content: center;">
                    <button class="btn btn-primary" onclick="performRifaDraw('${rifa.id}')" style="width: 100%;">
                        <i class="fas fa-trophy"></i> Realizar Sorteo
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function loadSorteosHistory(organizerId) {
    if (!window.getAllDraws) return;
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizerRifaIds = myRifas
        .filter(r => r.organizerId === organizerId)
        .map(r => r.id);
    
    const draws = window.getAllDraws({ organizerId: organizerId });
    const filteredDraws = draws.filter(d => organizerRifaIds.includes(d.rifaId));
    
    const tbody = document.getElementById('sorteosHistoryBody');
    if (!tbody) return;
    
    if (filteredDraws.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay sorteos realizados aún</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredDraws.map(draw => {
        const fecha = new Date(draw.drawDate);
        const fechaStr = fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoBadge = draw.state === 'completed'
            ? '<span class="badge-status badge-active">Completado</span>'
            : draw.state === 'cancelled'
            ? '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Cancelado</span>'
            : '<span class="badge-status badge-pending">Pendiente</span>';
        
        return `
            <tr>
                <td>${fechaStr}</td>
                <td>${draw.rifaTitle}</td>
                <td><code style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px;">${draw.lotteryReference}</code></td>
                <td>${draw.totalParticipants}</td>
                <td>${draw.winner.userName || 'Usuario'}</td>
                <td><span class="number-badge" style="background: var(--success-color); color: white;">${String(draw.winner.number).padStart(3, '0')}</span></td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn-icon" onclick="viewDrawDetails('${draw.id}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterSorteos() {
    const filter = document.getElementById('sorteosFilter')?.value || 'all';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (filter === 'all') {
        loadSorteosHistory(user.id);
    } else {
        const draws = window.getAllDraws({ organizerId: user.id, state: filter });
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const organizerRifaIds = myRifas
            .filter(r => r.organizerId === user.id)
            .map(r => r.id);
        
        const filteredDraws = draws.filter(d => organizerRifaIds.includes(d.rifaId));
        
        const tbody = document.getElementById('sorteosHistoryBody');
        if (!tbody) return;
        
        if (filteredDraws.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <p>No hay sorteos con este filtro</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filteredDraws.map(draw => {
            const fecha = new Date(draw.drawDate);
            const fechaStr = fecha.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const estadoBadge = draw.state === 'completed'
                ? '<span class="badge-status badge-active">Completado</span>'
                : draw.state === 'cancelled'
                ? '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Cancelado</span>'
                : '<span class="badge-status badge-pending">Pendiente</span>';
            
            return `
                <tr>
                    <td>${fechaStr}</td>
                    <td>${draw.rifaTitle}</td>
                    <td><code style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px;">${draw.lotteryReference}</code></td>
                    <td>${draw.totalParticipants}</td>
                    <td>${draw.winner.userName || 'Usuario'}</td>
                    <td><span class="number-badge" style="background: var(--success-color); color: white;">${String(draw.winner.number).padStart(3, '0')}</span></td>
                    <td>${estadoBadge}</td>
                    <td>
                        <button class="btn-icon" onclick="viewDrawDetails('${draw.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

function viewDrawDetails(drawId) {
    if (!window.getDrawById) return;
    
    const draw = window.getDrawById(drawId);
    if (!draw) {
        showToast('Sorteo no encontrado', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> Detalles del Sorteo</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <label style="font-weight: 600; color: var(--text-secondary);">Rifa</label>
                        <p style="font-size: 1.125rem; margin-top: 0.5rem;">${draw.rifaTitle}</p>
                    </div>
                    
                    <div>
                        <label style="font-weight: 600; color: var(--text-secondary);">Fecha del Sorteo</label>
                        <p style="margin-top: 0.5rem;">${new Date(draw.drawDate).toLocaleString('es-ES')}</p>
                    </div>
                    
                    <div>
                        <label style="font-weight: 600; color: var(--text-secondary);">Referencia de Lotería</label>
                        <p style="margin-top: 0.5rem;"><code style="background: var(--bg-secondary); padding: 0.5rem 1rem; border-radius: 8px; font-size: 1rem;">${draw.lotteryReference}</code></p>
                    </div>
                    
                    <div>
                        <label style="font-weight: 600; color: var(--text-secondary);">Total de Participantes</label>
                        <p style="margin-top: 0.5rem; font-size: 1.125rem;">${draw.totalParticipants}</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, var(--success-color), #059669); padding: 2rem; border-radius: var(--radius-lg); color: white; text-align: center;">
                        <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">🎉 Ganador</h3>
                        <div style="font-size: 3rem; font-weight: 800; margin-bottom: 0.5rem;">
                            ${String(draw.winner.number).padStart(3, '0')}
                        </div>
                        <p style="font-size: 1.125rem; opacity: 0.9;">${draw.winner.userName || 'Usuario'}</p>
                        <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem;">${draw.winner.userEmail || ''}</p>
                    </div>
                    
                    <div>
                        <label style="font-weight: 600; color: var(--text-secondary);">Método de Sorteo</label>
                        <p style="margin-top: 0.5rem; text-transform: capitalize;">${draw.method}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding: 1.5rem; border-top: 1px solid var(--border-light);">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

window.filterSorteos = filterSorteos;
window.viewDrawDetails = viewDrawDetails;

// ========== REPORTES SECTION ==========

function initReportesSection(user) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#reportes') {
                e.preventDefault();
                showReportesSection(user);
            }
        });
    });
}

function showReportesSection(user) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show reportes section
    const reportesSection = document.getElementById('reportesSection');
    if (reportesSection) {
        reportesSection.style.display = 'block';
        loadReportes(user);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#reportes"]')?.classList.add('active');
}

function loadReportes(user) {
    const period = document.getElementById('reportesPeriod')?.value || 'month';
    const userId = user.id || user;
    
    // Get all rifas from this organizer
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizerRifas = myRifas.filter(r => r.organizerId === userId);
    
    // Get all purchases for these rifas
    const allPurchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const rifaIds = organizerRifas.map(r => r.id);
    const relevantPurchases = allPurchases.filter(p => rifaIds.includes(p.rifaId));
    
    // Filter by period
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'all':
            startDate = new Date(0);
            break;
    }
    
    const filteredPurchases = relevantPurchases.filter(p => {
        const purchaseDate = new Date(p.purchaseDate || p.createdAt);
        return purchaseDate >= startDate;
    });
    
    // Calculate stats
    const totalVentas = filteredPurchases.filter(p => p.paymentStatus === 'confirmed').length;
    const totalIngresos = filteredPurchases
        .filter(p => p.paymentStatus === 'confirmed')
        .reduce((sum, p) => sum + (p.price || 0), 0);
    const comisionPlataforma = totalIngresos * 0.05; // 5% commission
    const gananciaNeta = totalIngresos - comisionPlataforma;
    const rifasActivas = organizerRifas.filter(r => r.status === 'active').length;
    
    // Update stats cards
    const statsContainer = document.getElementById('reportesStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #3b82f6;">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Boletos Vendidos</span>
                    <span class="stat-value">${totalVentas}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #10b981;">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Ingresos Totales</span>
                    <span class="stat-value">$${formatNumber(totalIngresos)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #f59e0b;">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Comisión Plataforma</span>
                    <span class="stat-value">$${formatNumber(comisionPlataforma)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #8b5cf6;">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Ganancia Neta</span>
                    <span class="stat-value">$${formatNumber(gananciaNeta)}</span>
                </div>
            </div>
        `;
    }
    
    // Update table
    const tableBody = document.getElementById('reportesTableBody');
    if (tableBody) {
        const rifaStats = organizerRifas.map(rifa => {
            const rifaPurchases = filteredPurchases.filter(p => p.rifaId === rifa.id && p.paymentStatus === 'confirmed');
            const boletosVendidos = rifaPurchases.length;
            const ingresosTotales = rifaPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
            const comision = ingresosTotales * 0.05;
            const ganancia = ingresosTotales - comision;
            
            return {
                rifa,
                boletosVendidos,
                ingresosTotales,
                comision,
                ganancia
            };
        });
        
        if (rifaStats.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-chart-bar" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">No hay datos para el período seleccionado</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = rifaStats.map(({ rifa, boletosVendidos, ingresosTotales, comision, ganancia }) => `
                <tr>
                    <td>
                        <div class="table-rifa-info">
                            <img src="${rifa.image || 'https://via.placeholder.com/100'}" alt="${rifa.title}" onerror="this.src='https://via.placeholder.com/100'">
                            <span>${rifa.title}</span>
                        </div>
                    </td>
                    <td>${boletosVendidos}</td>
                    <td>$${formatNumber(ingresosTotales)}</td>
                    <td>$${formatNumber(comision)}</td>
                    <td>$${formatNumber(ganancia)}</td>
                    <td><span class="badge-status ${rifa.status === 'active' ? 'badge-active' : 'badge-completed'}">${rifa.status === 'active' ? 'Activa' : 'Completada'}</span></td>
                    <td>
                        <button class="btn-icon" onclick="viewRifaDetails('${rifa.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // Note: Charts would require Chart.js library
    // For now, we'll leave placeholders
}

function exportReportesPDF() {
    showToast('Funcionalidad de exportación PDF en desarrollo', 'info');
    // In production, this would generate a PDF using jsPDF or similar
}

function exportReportesCSV() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizerRifas = myRifas.filter(r => r.organizerId === user.id);
    const allPurchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    
    let csv = 'Rifa,Boletos Vendidos,Ingresos Totales,Comisión,Ganancia Neta,Estado\n';
    
    organizerRifas.forEach(rifa => {
        const rifaPurchases = allPurchases.filter(p => p.rifaId === rifa.id && p.paymentStatus === 'confirmed');
        const boletosVendidos = rifaPurchases.length;
        const ingresosTotales = rifaPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
        const comision = ingresosTotales * 0.05;
        const ganancia = ingresosTotales - comision;
        
        csv += `"${rifa.title}",${boletosVendidos},${ingresosTotales},${comision},${ganancia},${rifa.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Reporte CSV descargado exitosamente', 'success');
}

window.loadReportes = loadReportes;
window.exportReportesPDF = exportReportesPDF;
window.exportReportesCSV = exportReportesCSV;

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
    const form = document.getElementById('organizerPerfilForm');
    if (form) {
        form.addEventListener('submit', handleUpdateOrganizerPerfil);
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
        loadOrganizerPerfilData(user);
    }
    
    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#perfil"]')?.classList.add('active');
}

function loadOrganizerPerfilData(user) {
    // Load user data
    document.getElementById('orgPerfilFirstName').value = user.firstName || '';
    document.getElementById('orgPerfilLastName').value = user.lastName || '';
    document.getElementById('orgPerfilEmail').value = user.email || '';
    document.getElementById('orgPerfilPhone').value = user.phone || '';
    document.getElementById('orgPerfilBio').value = user.bio || '';
    document.getElementById('orgPerfilLocation').value = user.location || '';
    
    // Load notification preferences
    const notifPrefs = JSON.parse(localStorage.getItem(`notifPrefs_${user.id}`) || '{"email": true, "sms": true, "push": true}');
    document.getElementById('orgNotifEmail').checked = notifPrefs.email !== false;
    document.getElementById('orgNotifSMS').checked = notifPrefs.sms !== false;
    document.getElementById('orgNotifPush').checked = notifPrefs.push !== false;
    
    // Load organizer settings
    const orgSettings = JSON.parse(localStorage.getItem(`orgSettings_${user.id}`) || '{"autoApprove": false, "emailOnSale": true, "publicProfile": true}');
    document.getElementById('orgAutoApprove').checked = orgSettings.autoApprove === true;
    document.getElementById('orgEmailOnSale').checked = orgSettings.emailOnSale !== false;
    document.getElementById('orgPublicProfile').checked = orgSettings.publicProfile !== false;
}

async function handleUpdateOrganizerPerfil(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const updatedUser = {
        ...user,
        firstName: document.getElementById('orgPerfilFirstName').value,
        lastName: document.getElementById('orgPerfilLastName').value,
        phone: document.getElementById('orgPerfilPhone').value,
        bio: document.getElementById('orgPerfilBio').value,
        location: document.getElementById('orgPerfilLocation').value,
        updatedAt: new Date().toISOString()
    };
    
    // Save notification preferences
    const notifPrefs = {
        email: document.getElementById('orgNotifEmail').checked,
        sms: document.getElementById('orgNotifSMS').checked,
        push: document.getElementById('orgNotifPush').checked
    };
    localStorage.setItem(`notifPrefs_${user.id}`, JSON.stringify(notifPrefs));
    
    // Save organizer settings
    const orgSettings = {
        autoApprove: document.getElementById('orgAutoApprove').checked,
        emailOnSale: document.getElementById('orgEmailOnSale').checked,
        publicProfile: document.getElementById('orgPublicProfile').checked
    };
    localStorage.setItem(`orgSettings_${user.id}`, JSON.stringify(orgSettings));
    
    // Update user
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update UI
    updateUserInfo(updatedUser);
    
    showToast('Perfil actualizado exitosamente', 'success');
}

function resetOrganizerPerfilForm() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadOrganizerPerfilData(user);
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
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // In production, this would make an API call
        showToast('Contraseña actualizada exitosamente', 'success');
        modal.remove();
    });
}

window.showChangePasswordModal = showChangePasswordModal;
window.resetOrganizerPerfilForm = resetOrganizerPerfilForm;
