// ========== FONDO COMÚN LOGIC ==========

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFondoData();
    initDonacionForm();
    initFilters();
});

// Load fondo data
function loadFondoData() {
    const donaciones = JSON.parse(localStorage.getItem('fondoComunDonaciones') || '[]');
    const platformContributions = JSON.parse(localStorage.getItem('fondoComunPlataforma') || '[]');
    
    // Calculate totals
    const totalDonaciones = donaciones.reduce((sum, d) => sum + d.amount, 0);
    const totalPlataforma = platformContributions.reduce((sum, c) => sum + c.amount, 0);
    const total = totalDonaciones + totalPlataforma;
    
    // Update total amount
    updateTotalAmount(total);
    
    // Update statistics
    updateStatistics(donaciones, platformContributions);
    
    // Load donantes list
    loadDonantes(donaciones);
}

// Update total amount
function updateTotalAmount(total) {
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

// Update statistics
function updateStatistics(donaciones, platformContributions) {
    // Total donantes
    const totalDonantes = donaciones.length;
    const donantesElement = document.getElementById('totalDonantes');
    if (donantesElement) {
        donantesElement.textContent = totalDonantes;
    }
    
    // Donación promedio
    const promedio = totalDonantes > 0 ? donaciones.reduce((sum, d) => sum + d.amount, 0) / totalDonantes : 0;
    const promedioElement = document.getElementById('donacionPromedio');
    if (promedioElement) {
        promedioElement.textContent = formatCurrency(Math.round(promedio));
    }
    
    // Contribución plataforma
    const totalPlataforma = platformContributions.reduce((sum, c) => sum + c.amount, 0);
    const plataformaElement = document.getElementById('contribucionPlataforma');
    if (plataformaElement) {
        plataformaElement.textContent = formatCurrency(totalPlataforma);
    }
    
    // Mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const donacionesMes = donaciones.filter(d => {
        const fecha = new Date(d.date);
        return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });
    
    const totalMes = donacionesMes.reduce((sum, d) => sum + d.amount, 0);
    const mesElement = document.getElementById('mesActual');
    if (mesElement) {
        mesElement.textContent = formatCurrency(totalMes);
    }
}

// Load donantes
function loadDonantes(donaciones, filter = 'all') {
    const container = document.getElementById('donantesList');
    const emptyElement = document.getElementById('donantesEmpty');
    
    if (!container) return;
    
    let filteredDonaciones = [...donaciones];
    
    // Apply filter
    if (filter === 'recent') {
        filteredDonaciones = filteredDonaciones
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20);
    } else if (filter === 'top') {
        filteredDonaciones = filteredDonaciones
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 20);
    } else {
        filteredDonaciones = filteredDonaciones
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Filter only visible donations
    filteredDonaciones = filteredDonaciones.filter(d => d.showName !== false);
    
    if (filteredDonaciones.length === 0) {
        container.innerHTML = '';
        if (emptyElement) {
            emptyElement.style.display = 'block';
        }
        return;
    }
    
    if (emptyElement) {
        emptyElement.style.display = 'none';
    }
    
    container.innerHTML = filteredDonaciones.map(donacion => `
        <div class="donante-card">
            <div class="donante-header">
                <div class="donante-avatar">
                    ${donacion.userName ? donacion.userName[0].toUpperCase() : 'A'}
                </div>
                <div class="donante-info">
                    <h4>${donacion.userName || 'Donante Anónimo'}</h4>
                    <p>${formatDate(donacion.date)}</p>
                </div>
            </div>
            <div class="donante-amount">${formatCurrency(donacion.amount)}</div>
            ${donacion.message ? `<div class="donante-mensaje">"${donacion.message}"</div>` : ''}
        </div>
    `).join('');
}

// Initialize donation form
function initDonacionForm() {
    const form = document.getElementById('donacionForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || !user.id) {
            showToast('Debes iniciar sesión para hacer una donación', 'warning');
            openModal(document.getElementById('loginModal'));
            return;
        }
        
        const amount = parseInt(document.getElementById('donacionAmount').value);
        const message = document.getElementById('donacionMensaje').value.trim();
        const showName = document.getElementById('mostrarNombre').checked;
        
        if (amount < 1000) {
            showToast('La donación mínima es de $1,000 COP', 'error');
            return;
        }
        
        // Create donation
        const donacion = {
            id: 'DON-' + Date.now(),
            userId: user.id,
            userName: showName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null,
            amount: amount,
            message: message || null,
            showName: showName,
            date: new Date().toISOString()
        };
        
        // Save donation
        const donaciones = JSON.parse(localStorage.getItem('fondoComunDonaciones') || '[]');
        donaciones.push(donacion);
        localStorage.setItem('fondoComunDonaciones', JSON.stringify(donaciones));
        
        showToast('¡Gracias por tu donación!', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('mostrarNombre').checked = true;
        
        // Reload data
        loadFondoData();
    });
}

// Initialize filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Apply filter
            const filter = btn.dataset.filter;
            const donaciones = JSON.parse(localStorage.getItem('fondoComunDonaciones') || '[]');
            loadDonantes(donaciones, filter);
        });
    });
}

// Calculate platform contribution (1% of platform earnings)
function calculatePlatformContribution(rifaId = null) {
    // Get all completed rifas
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    const allRifas = [...myRifas, ...sampleRifas];
    
    let completedRifas = allRifas.filter(r => r.status === 'completed');
    
    // If specific rifaId provided, only calculate for that rifa
    if (rifaId) {
        completedRifas = completedRifas.filter(r => r.id === rifaId);
    }
    
    let totalEarnings = 0;
    
    completedRifas.forEach(rifa => {
        const totalSold = rifa.soldNumbers || 0;
        const price = rifa.price || 0;
        const earnings = totalSold * price;
        totalEarnings += earnings;
    });
    
    // Calculate 1% of total earnings
    const contribution = Math.round(totalEarnings * 0.01);
    
    return contribution;
}

// Add platform contribution to fondo común
function addPlatformContribution(rifaId = null) {
    const contribution = calculatePlatformContribution(rifaId);
    
    if (contribution <= 0) {
        return { success: false, message: 'No hay ganancias para contribuir' };
    }
    
    // Check if we already contributed this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const platformContributions = JSON.parse(localStorage.getItem('fondoComunPlataforma') || '[]');
    const existingContribution = platformContributions.find(c => {
        const fecha = new Date(c.date);
        return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear && c.rifaId === rifaId;
    });
    
    if (!existingContribution) {
        // Add platform contribution
        const platformDonation = {
            id: 'PLAT-' + Date.now(),
            rifaId: rifaId,
            amount: contribution,
            date: new Date().toISOString(),
            source: 'platform',
            description: rifaId ? `1% de ganancias de la rifa ${rifaId}` : '1% de ganancias de la plataforma'
        };
        
        platformContributions.push(platformDonation);
        localStorage.setItem('fondoComunPlataforma', JSON.stringify(platformContributions));
        
        return {
            success: true,
            contribution: contribution,
            message: `Se agregaron $${formatCurrency(contribution)} al fondo común`
        };
    }
    
    return { success: false, message: 'Ya se contribuyó este mes para esta rifa' };
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Auto-calculate platform contribution when rifa is completed
function onRifaCompleted(rifaId) {
    const result = addPlatformContribution(rifaId);
    if (result.success) {
        console.log('Contribución de plataforma agregada:', result);
        loadFondoData();
    }
    return result;
}

// Export functions
window.calculatePlatformContribution = calculatePlatformContribution;
window.addPlatformContribution = addPlatformContribution;
window.onRifaCompleted = onRifaCompleted;

