// ========== DASHBOARD ADMIN LOGIC ==========

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    
    // Only main admin can access (not team members)
    if (user && user.role === 'admin' && !user.isTeamMember) {
        initDashboard(user);
    } else if (user && user.role === 'admin' && user.isTeamMember) {
        // Team members should use their own dashboard
        showToast('Los miembros del equipo tienen acceso limitado. Contacta al administrador principal.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else if (user && user.role !== 'admin') {
        showToast('No tienes permisos de administrador', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

// Initialize dashboard
function initDashboard(user) {
    updateUserInfo(user);
    loadAdminStats();
    loadGlobalContacts();
    initSidebarToggle();
    initGlobalContactsSection();
    initUsuariosSection();
    initOrganizadoresSection();
    initRifasSection();
    initTransaccionesSection();
    initConfiguracionSection();
    initReportesSection();
    initEquipoSection();
    loadSystemConfig();
    console.log('Dashboard de Administrador inicializado');
}

// ========== GLOBAL CONTACTS SECTION ==========

function initGlobalContactsSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#contactos-globales') {
                e.preventDefault();
                showGlobalContactsSection();
            }
        });
    });
}

function showGlobalContactsSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('contactosGlobalesSection');
    if (section) {
        section.style.display = 'block';
        loadGlobalContacts();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#contactos-globales"]')?.classList.add('active');
}

function loadGlobalContacts() {
    if (!window.getGlobalContacts) return;
    
    const contacts = window.getGlobalContacts();
    const stats = calculateGlobalStats(contacts);
    
    loadGlobalContactStats(stats);
    loadGlobalContactsTable(contacts);
}

function calculateGlobalStats(contacts) {
    return {
        total: contacts.length,
        totalSpent: contacts.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        totalPurchases: contacts.reduce((sum, c) => sum + (c.purchaseCount || 0), 0),
        averageSpent: contacts.length > 0 ? contacts.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / contacts.length : 0
    };
}

function loadGlobalContactStats(stats) {
    const container = document.getElementById('globalContactStats');
    if (!container || !stats) return;
    
    container.innerHTML = `
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

function loadGlobalContactsTable(contacts) {
    const tbody = document.getElementById('globalContactsTable');
    if (!tbody) return;
    
    if (contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-database" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay contactos en la base de datos global aún.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td><strong>${contact.firstName || ''} ${contact.lastName || ''}</strong></td>
            <td>${contact.email || 'N/A'}</td>
            <td>${contact.phone || 'N/A'}</td>
            <td>${contact.purchaseCount || 0}</td>
            <td>$${formatNumber(contact.totalSpent || 0)}</td>
            <td>${contact.lastPurchase ? new Date(contact.lastPurchase).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td>
                <button class="btn-icon" onclick="viewGlobalContactDetails('${contact.id}')" title="Ver Detalles">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterGlobalContacts() {
    const search = document.getElementById('globalContactsSearch')?.value || '';
    const filter = document.getElementById('globalContactsFilter')?.value || 'all';
    
    let filters = { search: search };
    
    if (filter === 'top') {
        filters.sortBy = 'totalSpent';
    } else if (filter === 'recent') {
        filters.sortBy = 'lastPurchase';
    }
    
    const contacts = window.getGlobalContacts(filters);
    loadGlobalContactsTable(contacts);
}

function viewGlobalContactDetails(contactId) {
    const contacts = window.getGlobalContacts();
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Detalles del Contacto Global</h2>
                <span class="close" onclick="this.closest('.modal').remove()">×</span>
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
                    ${contact.organizers && contact.organizers.length > 0 ? `
                    <div class="detail-section">
                        <strong>Organizadores con los que ha comprado:</strong>
                        <ul>
                            ${contact.organizers.map(o => `<li>${o.rifaTitle}</li>`).join('')}
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

function exportGlobalContacts() {
    const contacts = window.getGlobalContacts();
    
    // Create CSV
    const headers = ['Nombre', 'Email', 'Teléfono', 'Total Compras', 'Total Invertido', 'Última Compra'];
    const rows = contacts.map(c => [
        `${c.firstName} ${c.lastName}`,
        c.email || '',
        c.phone || '',
        c.purchaseCount || 0,
        c.totalSpent || 0,
        c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString('es-ES') : ''
    ]);
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contactos_globales_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('Base de datos exportada exitosamente', 'success');
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

window.filterGlobalContacts = filterGlobalContacts;
window.viewGlobalContactDetails = viewGlobalContactDetails;
window.exportGlobalContacts = exportGlobalContacts;

// Load admin statistics
async function loadAdminStats() {
    try {
        const stats = {
            totalRifas: 247,
            totalUsuarios: 1542,
            ingresosTotales: 2500000,
            organizadores: 89
        };
        
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-value').textContent = stats.totalRifas;
            statCards[1].querySelector('.stat-value').textContent = stats.totalUsuarios;
            statCards[2].querySelector('.stat-value').textContent = '$' + formatNumber(stats.ingresosTotales);
            statCards[3].querySelector('.stat-value').textContent = stats.organizadores;
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
        showToast('Error al cargar estadísticas', 'error');
    }
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

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ========== USUARIOS SECTION ==========

function initUsuariosSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#usuarios') {
                e.preventDefault();
                showUsuariosSection();
            }
        });
    });
}

function showUsuariosSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('usuariosSection');
    if (section) {
        section.style.display = 'block';
        loadUsuarios();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#usuarios"]')?.classList.add('active');
}

function loadUsuarios() {
    // Get all users from localStorage (simulated)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    
    // Create user list from purchases and rifas
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const userMap = new Map();
    
    purchases.forEach(p => {
        if (!userMap.has(p.userId)) {
            userMap.set(p.userId, {
                id: p.userId,
                firstName: p.userName?.split(' ')[0] || 'Usuario',
                lastName: p.userName?.split(' ').slice(1).join(' ') || '',
                email: p.userEmail || '',
                role: 'comprador',
                status: 'active',
                createdAt: p.createdAt || new Date().toISOString()
            });
        }
    });
    
    myRifas.forEach(r => {
        if (r.organizerId && !userMap.has(r.organizerId)) {
            userMap.set(r.organizerId, {
                id: r.organizerId,
                firstName: r.organizerName?.split(' ')[0] || 'Organizador',
                lastName: r.organizerName?.split(' ').slice(1).join(' ') || '',
                email: '',
                role: 'organizador',
                status: 'active',
                createdAt: r.createdAt || new Date().toISOString()
            });
        }
    });
    
    const allUsers = Array.from(userMap.values());
    loadUsuariosTable(allUsers);
}

function loadUsuariosTable(users) {
    const tbody = document.getElementById('usuariosTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay usuarios registrados aún.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const estadoBadge = user.status === 'active'
            ? '<span class="badge-status badge-active">Activo</span>'
            : user.status === 'suspended'
            ? '<span class="badge-status badge-pending">Suspendido</span>'
            : '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Bloqueado</span>';
        
        const rolBadge = user.role === 'admin'
            ? '<span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Admin</span>'
            : user.role === 'organizador'
            ? '<span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Organizador</span>'
            : '<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Comprador</span>';
        
        return `
            <tr>
                <td><strong>${user.firstName} ${user.lastName}</strong></td>
                <td>${user.email || 'N/A'}</td>
                <td>${rolBadge}</td>
                <td>${estadoBadge}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                    <div class="rifa-actions">
                        ${user.status === 'active' ? `
                        <button class="btn-icon" onclick="suspendUser('${user.id}')" title="Suspender">
                            <i class="fas fa-pause" style="color: var(--warning-color);"></i>
                        </button>
                        <button class="btn-icon" onclick="blockUser('${user.id}')" title="Bloquear">
                            <i class="fas fa-ban" style="color: var(--danger-color);"></i>
                        </button>
                        ` : user.status === 'suspended' ? `
                        <button class="btn-icon" onclick="activateUser('${user.id}')" title="Activar">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                        </button>
                        <button class="btn-icon" onclick="blockUser('${user.id}')" title="Bloquear">
                            <i class="fas fa-ban" style="color: var(--danger-color);"></i>
                        </button>
                        ` : `
                        <button class="btn-icon" onclick="activateUser('${user.id}')" title="Activar">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                        </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function suspendUser(userId) {
    if (!confirm('¿Estás seguro de suspender este usuario?')) return;
    showToast('Usuario suspendido', 'success');
    loadUsuarios();
}

function blockUser(userId) {
    if (!confirm('¿Estás seguro de bloquear este usuario? Esta acción es permanente.')) return;
    showToast('Usuario bloqueado', 'success');
    loadUsuarios();
}

function activateUser(userId) {
    showToast('Usuario activado', 'success');
    loadUsuarios();
}

function filterUsuarios() {
    loadUsuarios(); // Reload with filters
}

// ========== ORGANIZADORES SECTION ==========

function initOrganizadoresSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#organizadores') {
                e.preventDefault();
                showOrganizadoresSection();
            }
        });
    });
}

function showOrganizadoresSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('organizadoresSection');
    if (section) {
        section.style.display = 'block';
        loadOrganizadores();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#organizadores"]')?.classList.add('active');
}

function loadOrganizadores() {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const organizers = [];
    const organizerMap = new Map();
    
    myRifas.forEach(rifa => {
        if (rifa.organizerId && !organizerMap.has(rifa.organizerId)) {
            organizerMap.set(rifa.organizerId, {
                id: rifa.organizerId,
                name: rifa.organizerName || 'Organizador',
                email: '',
                verificationStatus: 'pending',
                documentsVerified: false,
                requestDate: rifa.createdAt || new Date().toISOString()
            });
        }
    });
    
    loadOrganizadoresTable(Array.from(organizerMap.values()));
}

function loadOrganizadoresTable(organizers) {
    const tbody = document.getElementById('organizadoresTableBody');
    if (!tbody) return;
    
    if (organizers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-user-tie" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay organizadores registrados aún.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = organizers.map(org => {
        const estadoBadge = org.verificationStatus === 'approved'
            ? '<span class="badge-status badge-active">Aprobado</span>'
            : org.verificationStatus === 'rejected'
            ? '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Rechazado</span>'
            : '<span class="badge-status badge-pending">Pendiente</span>';
        
        return `
            <tr>
                <td><strong>${org.name}</strong></td>
                <td>${org.email || 'N/A'}</td>
                <td>
                    ${org.documentsVerified 
                        ? '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i> Verificados</span>'
                        : '<span style="color: var(--warning-color);"><i class="fas fa-clock"></i> Pendientes</span>'}
                </td>
                <td>${estadoBadge}</td>
                <td>${new Date(org.requestDate).toLocaleDateString('es-ES')}</td>
                <td>
                    <div class="rifa-actions">
                        ${org.verificationStatus === 'pending' ? `
                        <button class="btn-icon" onclick="approveOrganizer('${org.id}')" title="Aprobar">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                        </button>
                        <button class="btn-icon" onclick="rejectOrganizer('${org.id}')" title="Rechazar">
                            <i class="fas fa-times" style="color: var(--danger-color);"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon" onclick="viewOrganizerDocuments('${org.id}')" title="Ver Documentos">
                            <i class="fas fa-file-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function approveOrganizer(organizerId) {
    if (!confirm('¿Aprobar este organizador?')) return;
    showToast('Organizador aprobado', 'success');
    loadOrganizadores();
}

function rejectOrganizer(organizerId) {
    if (!confirm('¿Rechazar este organizador?')) return;
    showToast('Organizador rechazado', 'info');
    loadOrganizadores();
}

function viewOrganizerDocuments(organizerId) {
    showToast('Visualización de documentos (requiere integración con sistema de verificación)', 'info');
}

function filterOrganizadores() {
    loadOrganizadores();
}

// ========== RIFAS SECTION ==========

function initRifasSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#rifas') {
                e.preventDefault();
                showRifasSection();
            }
        });
    });
}

function showRifasSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('rifasSection');
    if (section) {
        section.style.display = 'block';
        loadRifasAdmin();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#rifas"]')?.classList.add('active');
}

function loadRifasAdmin() {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    
    loadRifasTable(allRifas);
}

function loadRifasTable(rifas) {
    const tbody = document.getElementById('rifasTableBody');
    if (!tbody) return;
    
    if (rifas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-ticket-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay rifas registradas aún.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = rifas.map(rifa => {
        const estadoBadge = rifa.adminStatus === 'approved' || (!rifa.adminStatus && rifa.status === 'active')
            ? '<span class="badge-status badge-active">Aprobada</span>'
            : rifa.adminStatus === 'rejected'
            ? '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Rechazada</span>'
            : rifa.adminStatus === 'suspended' || rifa.status === 'paused'
            ? '<span class="badge-status badge-pending">Suspendida</span>'
            : '<span class="badge-status badge-pending">Pendiente</span>';
        
        return `
            <tr>
                <td><strong>${rifa.title}</strong></td>
                <td>${rifa.organizerName || 'N/A'}</td>
                <td>${estadoBadge}</td>
                <td>${rifa.soldNumbers || 0}/${rifa.totalNumbers}</td>
                <td>$${formatNumber((rifa.soldNumbers || 0) * (rifa.price || 0))}</td>
                <td>${new Date(rifa.createdAt || rifa.endDate).toLocaleDateString('es-ES')}</td>
                <td>
                    <div class="rifa-actions">
                        ${(!rifa.adminStatus || rifa.adminStatus === 'pending') ? `
                        <button class="btn-icon" onclick="approveRifa('${rifa.id}')" title="Aprobar">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                        </button>
                        <button class="btn-icon" onclick="rejectRifa('${rifa.id}')" title="Rechazar">
                            <i class="fas fa-times" style="color: var(--danger-color);"></i>
                        </button>
                        ` : ''}
                        ${rifa.adminStatus === 'approved' ? `
                        <button class="btn-icon" onclick="suspendRifa('${rifa.id}')" title="Suspender">
                            <i class="fas fa-pause" style="color: var(--warning-color);"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon" onclick="viewRifaDetails('${rifa.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function approveRifa(rifaId) {
    if (!confirm('¿Aprobar esta rifa?')) return;
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    if (rifaIndex !== -1) {
        myRifas[rifaIndex].adminStatus = 'approved';
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    } else {
        const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
        if (sampleIndex !== -1) {
            sampleRifas[sampleIndex].adminStatus = 'approved';
            localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
        }
    }
    
    showToast('Rifa aprobada', 'success');
    loadRifasAdmin();
}

function rejectRifa(rifaId) {
    if (!confirm('¿Rechazar esta rifa?')) return;
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    if (rifaIndex !== -1) {
        myRifas[rifaIndex].adminStatus = 'rejected';
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    } else {
        const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
        if (sampleIndex !== -1) {
            sampleRifas[sampleIndex].adminStatus = 'rejected';
            localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
        }
    }
    
    showToast('Rifa rechazada', 'info');
    loadRifasAdmin();
}

function suspendRifa(rifaId) {
    if (!confirm('¿Suspender esta rifa?')) return;
    
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    if (rifaIndex !== -1) {
        myRifas[rifaIndex].adminStatus = 'suspended';
        myRifas[rifaIndex].status = 'paused';
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    } else {
        const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
        if (sampleIndex !== -1) {
            sampleRifas[sampleIndex].adminStatus = 'suspended';
            sampleRifas[sampleIndex].status = 'paused';
            localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
        }
    }
    
    showToast('Rifa suspendida', 'warning');
    loadRifasAdmin();
}

function viewRifaDetails(rifaId) {
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

function filterRifasAdmin() {
    loadRifasAdmin();
}

// ========== TRANSACCIONES SECTION ==========

function initTransaccionesSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#transacciones') {
                e.preventDefault();
                showTransaccionesSection();
            }
        });
    });
}

function showTransaccionesSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('transaccionesSection');
    if (section) {
        section.style.display = 'block';
        loadTransacciones();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#transacciones"]')?.classList.add('active');
}

function loadTransacciones() {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
    
    // Combine purchases and transactions
    const allTransactions = [...purchases.map(p => ({
        id: p.id,
        rifaTitle: p.rifaTitle,
        userName: p.userName,
        number: p.number,
        amount: p.amount || p.total,
        method: p.paymentMethod,
        status: p.paymentStatus,
        date: p.purchaseDate || p.createdAt
    })), ...transactions.map(t => ({
        id: t.id,
        rifaTitle: t.rifaTitle,
        userName: 'Usuario',
        number: t.number,
        amount: t.total,
        method: t.method,
        status: t.status,
        date: t.createdAt
    }))];
    
    loadTransaccionesStats(allTransactions);
    loadTransaccionesTable(allTransactions);
}

function loadTransaccionesStats(transactions) {
    const container = document.getElementById('transaccionesStats');
    if (!container) return;
    
    const total = transactions.length;
    const confirmed = transactions.filter(t => t.status === 'confirmed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;
    const totalAmount = transactions
        .filter(t => t.status === 'confirmed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
                <i class="fas fa-list"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Transacciones</span>
                <span class="stat-value">${total}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Confirmadas</span>
                <span class="stat-value">${confirmed}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b;">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Pendientes</span>
                <span class="stat-value">${pending}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #8b5cf6;">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Recaudado</span>
                <span class="stat-value">$${formatNumber(totalAmount)}</span>
            </div>
        </div>
    `;
}

function loadTransaccionesTable(transactions) {
    const tbody = document.getElementById('transaccionesTableBody');
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-money-bill-wave" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay transacciones registradas aún.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = transactions.map(trans => {
        const fecha = new Date(trans.date);
        const fechaStr = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const estadoBadge = trans.status === 'confirmed'
            ? '<span class="badge-status badge-active">Confirmada</span>'
            : trans.status === 'pending'
            ? '<span class="badge-status badge-pending">Pendiente</span>'
            : trans.status === 'failed'
            ? '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Fallida</span>'
            : '<span class="badge-status" style="background: rgba(107, 114, 128, 0.1); color: var(--text-secondary);">Reembolsada</span>';
        
        return `
            <tr>
                <td>${fechaStr}</td>
                <td>${trans.rifaTitle || 'N/A'}</td>
                <td>${trans.userName || 'Usuario'}</td>
                <td><span class="number-badge">${String(trans.number || 0).padStart(3, '0')}</span></td>
                <td>$${formatNumber(trans.amount || 0)}</td>
                <td>${trans.method || 'N/A'}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn-icon" onclick="viewTransactionDetails('${trans.id}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewTransactionDetails(transactionId) {
    showToast('Detalles de transacción (implementar modal)', 'info');
}

function filterTransacciones() {
    loadTransacciones();
}

function exportTransaccionesCSV() {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
    
    const allTransactions = [...purchases, ...transactions];
    
    const headers = ['Fecha', 'Rifa', 'Comprador', 'Número', 'Monto', 'Método', 'Estado'];
    const rows = allTransactions.map(t => {
        const fecha = new Date(t.purchaseDate || t.createdAt).toLocaleDateString('es-ES');
        return [
            fecha,
            t.rifaTitle || '',
            t.userName || '',
            t.number || '',
            t.amount || t.total || 0,
            t.paymentMethod || t.method || '',
            t.paymentStatus || t.status || ''
        ];
    });
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('Transacciones exportadas exitosamente', 'success');
}

// ========== CONFIGURACIÓN SECTION ==========

function initConfiguracionSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#configuracion') {
                e.preventDefault();
                showConfiguracionSection();
            }
        });
    });
    
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', handleSaveConfig);
    }
}

function showConfiguracionSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('configuracionSection');
    if (section) {
        section.style.display = 'block';
        loadSystemConfig();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#configuracion"]')?.classList.add('active');
}

function loadSystemConfig() {
    const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
    
    if (document.getElementById('platformCommission')) {
        document.getElementById('platformCommission').value = config.platformCommission || 5;
    }
    if (document.getElementById('organizerCommission')) {
        document.getElementById('organizerCommission').value = config.organizerCommission || 0;
    }
    if (document.getElementById('fundRetentionDays')) {
        document.getElementById('fundRetentionDays').value = config.fundRetentionDays || 7;
    }
    if (document.getElementById('minRifaAmount')) {
        document.getElementById('minRifaAmount').value = config.minRifaAmount || 1000;
    }
    if (document.getElementById('maxRifaAmount')) {
        document.getElementById('maxRifaAmount').value = config.maxRifaAmount || 10000000;
    }
    if (document.getElementById('requireVerification')) {
        document.getElementById('requireVerification').value = config.requireVerification !== false ? 'true' : 'false';
    }
}

function handleSaveConfig(e) {
    e.preventDefault();
    
    const config = {
        platformCommission: parseFloat(document.getElementById('platformCommission').value),
        organizerCommission: parseFloat(document.getElementById('organizerCommission').value),
        fundRetentionDays: parseInt(document.getElementById('fundRetentionDays').value),
        minRifaAmount: parseInt(document.getElementById('minRifaAmount').value),
        maxRifaAmount: parseInt(document.getElementById('maxRifaAmount').value),
        requireVerification: document.getElementById('requireVerification').value === 'true',
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('systemConfig', JSON.stringify(config));
    showToast('Configuración guardada exitosamente', 'success');
}

// ========== REPORTES SECTION ==========

function initReportesSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#reportes') {
                e.preventDefault();
                showReportesSection();
            }
        });
    });
}

function showReportesSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const section = document.getElementById('reportesSection');
    if (section) {
        section.style.display = 'block';
        loadReportes();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#reportes"]')?.classList.add('active');
}

function loadReportes() {
    const periodo = document.getElementById('reportePeriodo')?.value || 'month';
    
    // Calculate stats based on period
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    
    const now = new Date();
    let startDate = new Date();
    
    switch(periodo) {
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
    
    const filteredPurchases = purchases.filter(p => {
        const purchaseDate = new Date(p.purchaseDate || p.createdAt);
        return purchaseDate >= startDate;
    });
    
    const stats = {
        totalVentas: filteredPurchases.length,
        totalIngresos: filteredPurchases
            .filter(p => p.paymentStatus === 'confirmed')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
        totalRifas: allRifas.length,
        rifasActivas: allRifas.filter(r => r.status === 'active').length
    };
    
    loadReportesStats(stats);
}

function loadReportesStats(stats) {
    const container = document.getElementById('reportesStats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Ventas</span>
                <span class="stat-value">${stats.totalVentas}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Ingresos</span>
                <span class="stat-value">$${formatNumber(stats.totalIngresos)}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b;">
                <i class="fas fa-ticket-alt"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Total Rifas</span>
                <span class="stat-value">${stats.totalRifas}</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background-color: #8b5cf6;">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Rifas Activas</span>
                <span class="stat-value">${stats.rifasActivas}</span>
            </div>
        </div>
    `;
}

function exportReportePDF() {
    showToast('Exportación PDF (requiere librería de PDF)', 'info');
}

// Update user info
function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin Demo';
    }
}

// Export functions
window.formatNumber = formatNumber;
window.filterUsuarios = filterUsuarios;
window.suspendUser = suspendUser;
window.blockUser = blockUser;
window.activateUser = activateUser;
window.filterOrganizadores = filterOrganizadores;
window.approveOrganizer = approveOrganizer;
window.rejectOrganizer = rejectOrganizer;
window.viewOrganizerDocuments = viewOrganizerDocuments;
window.filterRifasAdmin = filterRifasAdmin;
window.approveRifa = approveRifa;
window.rejectRifa = rejectRifa;
window.suspendRifa = suspendRifa;
window.viewRifaDetails = viewRifaDetails;
window.filterTransacciones = filterTransacciones;
window.viewTransactionDetails = viewTransactionDetails;
window.exportTransaccionesCSV = exportTransaccionesCSV;
window.loadReportes = loadReportes;
window.exportReportePDF = exportReportePDF;

// ========== EQUIPO DE TRABAJO SECTION ==========

let teamMember2FAState = {
    step: 0, // 0: inicio, 1: SMS, 2: Email, 3: Facial, 4: Clave, 5: completado
    smsCode: null,
    emailCode: null,
    facialVerified: false,
    adminKey: null
};

function initEquipoSection() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#equipo') {
                e.preventDefault();
                showEquipoSection();
            }
        });
    });
}

function showEquipoSection() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const equipoSection = document.getElementById('equipoSection');
    if (equipoSection) {
        equipoSection.style.display = 'block';
        loadTeamMembers();
    }
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.sidebar-link[href="#equipo"]')?.classList.add('active');
}

function loadTeamMembers() {
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    // Update stats
    document.getElementById('totalTeamMembers').textContent = teamMembers.length;
    document.getElementById('activeTeamMembers').textContent = teamMembers.filter(m => m.status === 'active').length;
    document.getElementById('pendingTeamMembers').textContent = teamMembers.filter(m => m.status === 'pending').length;
    
    const accessLevels = [...new Set(teamMembers.map(m => m.accessLevel))];
    document.getElementById('accessLevels').textContent = accessLevels.length;
    
    // Load table
    loadTeamMembersTable(teamMembers);
}

function loadTeamMembersTable(members) {
    const tableBody = document.getElementById('teamMembersTableBody');
    if (!tableBody) return;
    
    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No hay miembros del equipo aún</p>
                    <button class="btn btn-primary" onclick="showAddTeamMemberModal()" style="margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i> Agregar Primer Miembro
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = members.map(member => {
        const statusBadge = {
            active: '<span class="badge-status badge-active">Activo</span>',
            pending: '<span class="badge-status badge-pending">Pendiente</span>',
            suspended: '<span class="badge-status" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">Suspendido</span>'
        }[member.status] || statusBadge.pending;
        
        const accessLevelBadge = {
            viewer: '<span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Solo Lectura</span>',
            moderator: '<span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Moderador</span>',
            manager: '<span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Gestor</span>'
        }[member.accessLevel] || accessLevelBadge.viewer;
        
        const permissionsList = member.permissions.map(p => {
            const icons = {
                'view_users': '<i class="fas fa-users"></i>',
                'edit_users': '<i class="fas fa-user-edit"></i>',
                'view_rifas': '<i class="fas fa-ticket-alt"></i>',
                'moderate_rifas': '<i class="fas fa-gavel"></i>',
                'view_transactions': '<i class="fas fa-money-bill-wave"></i>',
                'view_reports': '<i class="fas fa-chart-bar"></i>'
            };
            return `<span style="display: inline-flex; align-items: center; gap: 0.25rem; margin-right: 0.5rem;">${icons[p] || ''} ${p.replace(/_/g, ' ')}</span>`;
        }).join('');
        
        return `
            <tr>
                <td>
                    <div class="table-rifa-info">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                            ${member.firstName[0]}${member.lastName[0]}
                        </div>
                        <span>${member.firstName} ${member.lastName}</span>
                    </div>
                </td>
                <td>${member.email}</td>
                <td>${member.role || 'Miembro del Equipo'}</td>
                <td style="font-size: 0.875rem;">${permissionsList || 'Sin permisos'}</td>
                <td>${statusBadge}</td>
                <td>${member.lastAccess ? new Date(member.lastAccess).toLocaleDateString('es-ES') : 'Nunca'}</td>
                <td>
                    <button class="btn-icon" onclick="editTeamMember('${member.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="suspendTeamMember('${member.id}')" title="${member.status === 'suspended' ? 'Activar' : 'Suspender'}">
                        <i class="fas fa-${member.status === 'suspended' ? 'check' : 'ban'}"></i>
                    </button>
                    <button class="btn-icon" onclick="removeTeamMember('${member.id}')" title="Eliminar" style="color: var(--danger-color);">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddTeamMemberModal() {
    // Reset 2FA state
    teamMember2FAState = {
        step: 0,
        smsCode: null,
        emailCode: null,
        facialVerified: false,
        adminKey: null
    };
    
    show2FAModal();
}

function show2FAModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'teamMember2FAModal';
    
    if (teamMember2FAState.step === 0) {
        // Show member form first
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Agregar Miembro del Equipo</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="security-notice" style="background: rgba(37, 99, 235, 0.05); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border-left: 3px solid var(--primary-color);">
                        <i class="fas fa-shield-alt" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                        <strong>Autenticación de Dos Factores Requerida</strong>
                        <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                            Para agregar un miembro del equipo, deberás completar la verificación de seguridad en múltiples pasos.
                        </p>
                    </div>
                    
                    <form id="teamMemberForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="teamMemberFirstName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Apellido *</label>
                                <input type="text" id="teamMemberLastName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="teamMemberEmail" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Teléfono *</label>
                                <input type="tel" id="teamMemberPhone" class="form-control" placeholder="+34 627 039 947" required>
                            </div>
                            <div class="form-group">
                                <label>Nivel de Acceso *</label>
                                <select id="teamMemberAccessLevel" class="form-control" required onchange="updatePermissionsByAccessLevel()">
                                    <option value="viewer">Solo Lectura - Ver información</option>
                                    <option value="moderator">Moderador - Ver y moderar contenido</option>
                                    <option value="manager">Gestor - Ver, moderar y gestionar</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Rol</label>
                                <input type="text" id="teamMemberRole" class="form-control" placeholder="Ej: Soporte, Moderador, Analista">
                            </div>
                        </div>
                        
                        <div class="form-group full-width" style="margin-top: 1rem;">
                            <label>Permisos Específicos</label>
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md);">
                                <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_view_users" checked>
                                    <span>Ver Usuarios</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_edit_users">
                                    <span>Editar Usuarios</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_view_rifas" checked>
                                    <span>Ver Rifas</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_moderate_rifas">
                                    <span>Moderar Rifas</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_view_transactions" checked>
                                    <span>Ver Transacciones</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" id="perm_view_reports" checked>
                                    <span>Ver Reportes</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions" style="margin-top: 1.5rem;">
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="proceedTo2FA()">
                                <i class="fas fa-shield-alt"></i> Continuar con Verificación 2FA
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    } else {
        // Show 2FA steps
        modal.innerHTML = get2FAStepContent();
    }
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function get2FAStepContent() {
    const steps = [
        { title: 'Verificación por SMS', icon: 'fa-sms', step: 1 },
        { title: 'Verificación por Email', icon: 'fa-envelope', step: 2 },
        { title: 'Escaneo Facial', icon: 'fa-user-circle', step: 3 },
        { title: 'Clave de Administrador', icon: 'fa-key', step: 4 }
    ];
    
    const currentStep = steps.find(s => s.step === teamMember2FAState.step) || steps[0];
    const progress = (teamMember2FAState.step / 4) * 100;
    
    let stepContent = '';
    
    switch(teamMember2FAState.step) {
        case 1: // SMS
            stepContent = `
                <div class="2fa-step-content">
                    <div class="2fa-icon">
                        <i class="fas fa-sms"></i>
                    </div>
                    <h3>Verificación por SMS</h3>
                    <p>Se enviará un código de verificación a tu teléfono</p>
                    <button class="btn btn-primary" onclick="send2FASMSCode()">
                        <i class="fas fa-paper-plane"></i> Enviar Código SMS
                    </button>
                    <div id="smsCodeInput" style="display: none; margin-top: 1rem;">
                        <input type="text" id="sms2FACode" class="form-control" placeholder="Ingresa el código de 6 dígitos" maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;">
                        <button class="btn btn-primary" onclick="verify2FASMSCode()" style="margin-top: 1rem; width: 100%;">
                            <i class="fas fa-check"></i> Verificar Código
                        </button>
                    </div>
                </div>
            `;
            break;
        case 2: // Email
            stepContent = `
                <div class="2fa-step-content">
                    <div class="2fa-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3>Verificación por Email</h3>
                    <p>Se enviará un código de verificación a tu correo electrónico</p>
                    <button class="btn btn-primary" onclick="send2FAEmailCode()">
                        <i class="fas fa-paper-plane"></i> Enviar Código por Email
                    </button>
                    <div id="emailCodeInput" style="display: none; margin-top: 1rem;">
                        <input type="text" id="email2FACode" class="form-control" placeholder="Ingresa el código de 6 dígitos" maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;">
                        <button class="btn btn-primary" onclick="verify2FAEmailCode()" style="margin-top: 1rem; width: 100%;">
                            <i class="fas fa-check"></i> Verificar Código
                        </button>
                    </div>
                </div>
            `;
            break;
        case 3: // Facial
            stepContent = `
                <div class="2fa-step-content">
                    <div class="2fa-icon">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h3>Verificación Facial</h3>
                    <p>Completa el escaneo facial para verificar tu identidad</p>
                    <button class="btn btn-primary" onclick="start2FAFacialScan()">
                        <i class="fas fa-video"></i> Iniciar Escaneo Facial
                    </button>
                    <div id="facial2FAStatus" style="margin-top: 1rem;"></div>
                </div>
            `;
            break;
        case 4: // Admin Key
            stepContent = `
                <div class="2fa-step-content">
                    <div class="2fa-icon">
                        <i class="fas fa-key"></i>
                    </div>
                    <h3>Clave de Administrador</h3>
                    <p>Ingresa tu clave de administrador para autorizar este acceso</p>
                    <input type="password" id="adminKeyInput" class="form-control" placeholder="Clave de Administrador" style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="verifyAdminKey()" style="margin-top: 1rem; width: 100%;">
                        <i class="fas fa-check"></i> Verificar Clave
                    </button>
                </div>
            `;
            break;
    }
    
    return `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-shield-alt"></i> Autenticación de Dos Factores</h2>
                <span class="close" onclick="close2FAModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="2fa-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p class="progress-text">Paso ${teamMember2FAState.step} de 4</p>
                </div>
                ${stepContent}
            </div>
        </div>
    `;
}

function proceedTo2FA() {
    // Validate form
    const firstName = document.getElementById('teamMemberFirstName').value;
    const lastName = document.getElementById('teamMemberLastName').value;
    const email = document.getElementById('teamMemberEmail').value;
    const phone = document.getElementById('teamMemberPhone').value;
    
    if (!firstName || !lastName || !email || !phone) {
        showToast('Completa todos los campos requeridos', 'error');
        return;
    }
    
    // Save member data temporarily
    teamMember2FAState.memberData = {
        firstName,
        lastName,
        email,
        phone,
        accessLevel: document.getElementById('teamMemberAccessLevel').value,
        role: document.getElementById('teamMemberRole').value,
        permissions: getSelectedPermissions()
    };
    
    // Start 2FA process
    teamMember2FAState.step = 1;
    update2FAModal();
}

function getSelectedPermissions() {
    const permissions = [];
    if (document.getElementById('perm_view_users')?.checked) permissions.push('view_users');
    if (document.getElementById('perm_edit_users')?.checked) permissions.push('edit_users');
    if (document.getElementById('perm_view_rifas')?.checked) permissions.push('view_rifas');
    if (document.getElementById('perm_moderate_rifas')?.checked) permissions.push('moderate_rifas');
    if (document.getElementById('perm_view_transactions')?.checked) permissions.push('view_transactions');
    if (document.getElementById('perm_view_reports')?.checked) permissions.push('view_reports');
    return permissions;
}

function update2FAModal() {
    const modal = document.getElementById('teamMember2FAModal');
    if (modal) {
        modal.innerHTML = get2FAStepContent();
    }
}

function send2FASMSCode() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const phone = user.phone || '+34 627 039 947';
    
    teamMember2FAState.smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send SMS via API
    showToast(`Código SMS enviado a ${phone}`, 'success');
    showToast(`Código de prueba: ${teamMember2FAState.smsCode}`, 'info');
    
    document.getElementById('smsCodeInput').style.display = 'block';
}

function verify2FASMSCode() {
    const code = document.getElementById('sms2FACode').value;
    
    if (code === teamMember2FAState.smsCode) {
        showToast('Código SMS verificado', 'success');
        teamMember2FAState.step = 2;
        update2FAModal();
    } else {
        showToast('Código SMS incorrecto', 'error');
    }
}

function send2FAEmailCode() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;
    
    teamMember2FAState.emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send email via API
    showToast(`Código enviado a ${email}`, 'success');
    showToast(`Código de prueba: ${teamMember2FAState.emailCode}`, 'info');
    
    document.getElementById('emailCodeInput').style.display = 'block';
}

function verify2FAEmailCode() {
    const code = document.getElementById('email2FACode').value;
    
    if (code === teamMember2FAState.emailCode) {
        showToast('Código Email verificado', 'success');
        teamMember2FAState.step = 3;
        update2FAModal();
    } else {
        showToast('Código Email incorrecto', 'error');
    }
}

function start2FAFacialScan() {
    // Use the facial scan from verificacion-identidad.js
    showToast('Iniciando escaneo facial...', 'info');
    
    // Simulate facial scan (in production, use actual facial recognition)
    setTimeout(() => {
        teamMember2FAState.facialVerified = true;
        document.getElementById('facial2FAStatus').innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #10b981;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <strong style="color: #10b981; margin-left: 0.5rem;">Escaneo facial verificado</strong>
            </div>
        `;
        showToast('Escaneo facial completado', 'success');
        
        setTimeout(() => {
            teamMember2FAState.step = 4;
            update2FAModal();
        }, 1500);
    }, 2000);
}

function verifyAdminKey() {
    const adminKey = document.getElementById('adminKeyInput').value;
    
    // In production, verify against stored admin key hash
    // For now, accept any non-empty key (you should set your own key)
    if (adminKey && adminKey.length >= 6) {
        teamMember2FAState.adminKey = adminKey;
        teamMember2FAState.step = 5;
        complete2FAAndAddMember();
    } else {
        showToast('Clave de administrador inválida', 'error');
    }
}

function complete2FAAndAddMember() {
    // All 2FA steps completed
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const memberData = teamMember2FAState.memberData;
    
    const newMember = {
        id: 'team-' + Date.now(),
        ...memberData,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: JSON.parse(localStorage.getItem('user') || '{}').id,
        lastAccess: null,
        password: Math.random().toString(36).substr(2, 12) // Generate temp password
    };
    
    teamMembers.push(newMember);
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    showToast('Miembro del equipo agregado exitosamente', 'success');
    close2FAModal();
    loadTeamMembers();
    
    // Send credentials to member (in production, send via email)
    console.log('Credenciales temporales para', memberData.email, ':', newMember.password);
}

function close2FAModal() {
    const modal = document.getElementById('teamMember2FAModal');
    if (modal) {
        modal.remove();
    }
    teamMember2FAState = {
        step: 0,
        smsCode: null,
        emailCode: null,
        facialVerified: false,
        adminKey: null
    };
}

function updatePermissionsByAccessLevel() {
    const level = document.getElementById('teamMemberAccessLevel').value;
    
    // Reset all
    document.getElementById('perm_view_users').checked = false;
    document.getElementById('perm_edit_users').checked = false;
    document.getElementById('perm_view_rifas').checked = false;
    document.getElementById('perm_moderate_rifas').checked = false;
    document.getElementById('perm_view_transactions').checked = false;
    document.getElementById('perm_view_reports').checked = false;
    
    // Set based on level
    if (level === 'viewer') {
        document.getElementById('perm_view_users').checked = true;
        document.getElementById('perm_view_rifas').checked = true;
        document.getElementById('perm_view_transactions').checked = true;
        document.getElementById('perm_view_reports').checked = true;
    } else if (level === 'moderator') {
        document.getElementById('perm_view_users').checked = true;
        document.getElementById('perm_view_rifas').checked = true;
        document.getElementById('perm_moderate_rifas').checked = true;
        document.getElementById('perm_view_transactions').checked = true;
        document.getElementById('perm_view_reports').checked = true;
    } else if (level === 'manager') {
        document.getElementById('perm_view_users').checked = true;
        document.getElementById('perm_edit_users').checked = true;
        document.getElementById('perm_view_rifas').checked = true;
        document.getElementById('perm_moderate_rifas').checked = true;
        document.getElementById('perm_view_transactions').checked = true;
        document.getElementById('perm_view_reports').checked = true;
    }
}

function filterTeamMembers() {
    const search = document.getElementById('teamSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('teamStatusFilter')?.value || 'all';
    const accessFilter = document.getElementById('teamAccessFilter')?.value || 'all';
    
    let members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    if (search) {
        members = members.filter(m => 
            m.firstName.toLowerCase().includes(search) ||
            m.lastName.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)
        );
    }
    
    if (statusFilter !== 'all') {
        members = members.filter(m => m.status === statusFilter);
    }
    
    if (accessFilter !== 'all') {
        members = members.filter(m => m.accessLevel === accessFilter);
    }
    
    loadTeamMembersTable(members);
}

function editTeamMember(memberId) {
    showToast('Función de edición en desarrollo', 'info');
}

function suspendTeamMember(memberId) {
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const member = teamMembers.find(m => m.id === memberId);
    
    if (member) {
        member.status = member.status === 'suspended' ? 'active' : 'suspended';
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
        loadTeamMembers();
        showToast(`Miembro ${member.status === 'suspended' ? 'suspendido' : 'activado'}`, 'success');
    }
}

function removeTeamMember(memberId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este miembro del equipo?')) {
        return;
    }
    
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const filtered = teamMembers.filter(m => m.id !== memberId);
    localStorage.setItem('teamMembers', JSON.stringify(filtered));
    loadTeamMembers();
    showToast('Miembro eliminado del equipo', 'success');
}

window.showAddTeamMemberModal = showAddTeamMemberModal;
window.proceedTo2FA = proceedTo2FA;
window.send2FASMSCode = send2FASMSCode;
window.verify2FASMSCode = verify2FASMSCode;
window.send2FAEmailCode = send2FAEmailCode;
window.verify2FAEmailCode = verify2FAEmailCode;
window.start2FAFacialScan = start2FAFacialScan;
window.verifyAdminKey = verifyAdminKey;
window.close2FAModal = close2FAModal;
window.updatePermissionsByAccessLevel = updatePermissionsByAccessLevel;
window.filterTeamMembers = filterTeamMembers;
window.editTeamMember = editTeamMember;
window.suspendTeamMember = suspendTeamMember;
window.removeTeamMember = removeTeamMember;
