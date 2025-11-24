// ========== TALONARIO INTERACTIVO ==========

let currentRifa = null;
let currentFilter = 'all';
let selectedNumbers = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rifaId = urlParams.get('id');
    
    if (rifaId) {
        loadRifaTalonario(rifaId);
    } else {
        showError('No se especificó una rifa');
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchNumber');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchNumber(e.target.value);
        });
    }
});

// Load rifa talonario
function loadRifaTalonario(rifaId) {
    // Try to get from localStorage first
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    let rifa = myRifas.find(r => r.id === parseInt(rifaId));
    
    // If not found, try sample rifas
    if (!rifa && typeof sampleRifas !== 'undefined') {
        rifa = sampleRifas.find(r => r.id === parseInt(rifaId));
    }
    
    if (!rifa) {
        showError('Rifa no encontrada');
        return;
    }
    
    currentRifa = rifa;
    renderTalonario(rifa);
}

// Render talonario
function renderTalonario(rifa) {
    // Update header
    const title = document.getElementById('rifaTitle');
    const subtitle = document.getElementById('rifaSubtitle');
    
    if (title) title.textContent = `Talonario: ${rifa.title}`;
    if (subtitle) subtitle.textContent = `Precio: $${formatNumber(rifa.price)} | Total: ${rifa.totalNumbers} números`;
    
    // Load numbers state from localStorage
    const numbersState = loadNumbersState(rifa.id);
    
    // Calculate stats
    const stats = calculateStats(rifa.totalNumbers, numbersState);
    
    // Render stats
    renderStats(stats);
    
    // Render grid
    renderGrid(rifa.totalNumbers, numbersState);
}

// Load numbers state from localStorage
function loadNumbersState(rifaId) {
    const key = `rifa_${rifaId}_numbers`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
        return JSON.parse(saved);
    }
    
    // Initialize empty state
    const state = {};
    for (let i = 1; i <= (currentRifa?.totalNumbers || 0); i++) {
        state[i] = {
            status: 'available',
            buyer: null,
            purchaseDate: null
        };
    }
    
    // Mark some as sold for demo (simulate existing sales)
    if (currentRifa?.soldNumbers) {
        const soldCount = Math.min(currentRifa.soldNumbers, currentRifa.totalNumbers);
        for (let i = 1; i <= soldCount; i++) {
            state[i] = {
                status: 'sold',
                buyer: `Comprador ${i}`,
                purchaseDate: new Date().toISOString()
            };
        }
    }
    
    return state;
}

// Save numbers state to localStorage
function saveNumbersState(rifaId, state) {
    const key = `rifa_${rifaId}_numbers`;
    localStorage.setItem(key, JSON.stringify(state));
}

// Calculate statistics
function calculateStats(totalNumbers, numbersState) {
    let available = 0;
    let reserved = 0;
    let sold = 0;
    
    Object.values(numbersState).forEach(num => {
        if (num.status === 'available') available++;
        else if (num.status === 'reserved') reserved++;
        else if (num.status === 'sold') sold++;
    });
    
    return {
        total: totalNumbers,
        available,
        reserved,
        sold
    };
}

// Render statistics
function renderStats(stats) {
    const statsContainer = document.getElementById('talonarioStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-box total">
            <div class="stat-box-number">${stats.total}</div>
            <div class="stat-box-label">Total Números</div>
        </div>
        <div class="stat-box available">
            <div class="stat-box-number">${stats.available}</div>
            <div class="stat-box-label">Disponibles</div>
        </div>
        <div class="stat-box reserved">
            <div class="stat-box-number">${stats.reserved}</div>
            <div class="stat-box-label">Reservados</div>
        </div>
        <div class="stat-box sold">
            <div class="stat-box-number">${stats.sold}</div>
            <div class="stat-box-label">Vendidos</div>
        </div>
    `;
}

// Render grid
function renderGrid(totalNumbers, numbersState) {
    const grid = document.getElementById('talonarioGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 1; i <= totalNumbers; i++) {
        const num = numbersState[i] || { status: 'available' };
        const cell = createNumberCell(i, num);
        grid.appendChild(cell);
    }
}

// Create number cell
function createNumberCell(number, state) {
    const cell = document.createElement('div');
    cell.className = `number-cell ${state.status}`;
    cell.textContent = String(number).padStart(3, '0');
    cell.dataset.number = number;
    cell.dataset.status = state.status;
    
    // Add info tooltip
    if (state.status === 'sold' && state.buyer) {
        const info = document.createElement('div');
        info.className = 'number-info';
        info.textContent = `Vendido a: ${state.buyer}`;
        cell.appendChild(info);
    }
    
    // Add click handler for available numbers
    if (state.status === 'available') {
        cell.addEventListener('click', () => toggleNumberStatus(number));
    }
    
    return cell;
}

// Toggle number status
function toggleNumberStatus(number) {
    if (!currentRifa) return;
    
    const numbersState = loadNumbersState(currentRifa.id);
    const currentState = numbersState[number] || { status: 'available' };
    
    // Cycle through: available -> reserved -> sold -> available
    let newStatus;
    if (currentState.status === 'available') {
        newStatus = 'reserved';
    } else if (currentState.status === 'reserved') {
        newStatus = 'sold';
        currentState.buyer = 'Manual';
        currentState.purchaseDate = new Date().toISOString();
    } else {
        newStatus = 'available';
        currentState.buyer = null;
        currentState.purchaseDate = null;
    }
    
    currentState.status = newStatus;
    numbersState[number] = currentState;
    
    // Save state
    saveNumbersState(currentRifa.id, numbersState);
    
    // Update sold count
    const stats = calculateStats(currentRifa.totalNumbers, numbersState);
    currentRifa.soldNumbers = stats.sold;
    
    // Update localStorage
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === currentRifa.id);
    if (rifaIndex !== -1) {
        myRifas[rifaIndex] = currentRifa;
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    }
    
    // Re-render
    renderTalonario(currentRifa);
    
    showToast(`Número ${String(number).padStart(3, '0')} marcado como ${newStatus === 'sold' ? 'vendido' : newStatus === 'reserved' ? 'reservado' : 'disponible'}`, 'success');
}

// Filter numbers
function filterNumbers(filter) {
    currentFilter = filter;
    const cells = document.querySelectorAll('.number-cell');
    
    cells.forEach(cell => {
        const status = cell.dataset.status;
        if (filter === 'all') {
            cell.style.display = 'block';
        } else {
            cell.style.display = status === filter ? 'block' : 'none';
        }
    });
    
    // Update button states
    document.querySelectorAll('.talonario-filters .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    });
    
    event.target.classList.remove('btn-outline');
    event.target.classList.add('btn-primary');
}

// Search number
function searchNumber(query) {
    const cells = document.querySelectorAll('.number-cell');
    const searchNum = parseInt(query);
    
    cells.forEach(cell => {
        const num = parseInt(cell.dataset.number);
        if (isNaN(searchNum)) {
            cell.style.display = 'block';
        } else {
            cell.style.display = num === searchNum ? 'block' : 'none';
            if (num === searchNum) {
                cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cell.style.border = '3px solid var(--primary-color)';
                setTimeout(() => {
                    cell.style.border = '';
                }, 2000);
            }
        }
    });
}

// Show error
function showError(message) {
    const grid = document.getElementById('talonarioGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h2>${message}</h2>
                <button class="btn btn-primary" onclick="window.history.back()" style="margin-top: 1rem;">
                    Volver
                </button>
            </div>
        `;
    }
}

// Format number helper
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Export functions
window.filterNumbers = filterNumbers;
