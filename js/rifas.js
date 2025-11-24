// ========== RIFAS MANAGEMENT ==========

// Importar Firebase
import { db, collection, getDocs } from './firebase-config.js';

// Sample rifas data (esto se reemplazará con datos de la API)
const sampleRifas = [
    {
        id: 1,
        title: 'iPhone 15 Pro Max 256GB',
        description: 'Nuevo sellado, color titanio natural',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        price: 5000,
        totalNumbers: 500,
        soldNumbers: 253,
        organizer: {
            name: 'Juan Pérez',
            avatar: 'https://ui-avatars.com/api/?name=Juan+Perez'
        },
        endDate: '2024-12-31',
        status: 'active',
        featured: true
    },
    {
        id: 2,
        title: 'PlayStation 5 + 2 Controles',
        description: 'Consola nueva con 2 controles DualSense',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
        price: 3000,
        totalNumbers: 300,
        soldNumbers: 187,
        organizer: {
            name: 'María González',
            avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez'
        },
        endDate: '2024-12-25',
        status: 'active',
        featured: true
    },
    {
        id: 3,
        title: 'MacBook Air M2 13"',
        description: 'Nueva sellada, 8GB RAM, 256GB SSD',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        price: 8000,
        totalNumbers: 600,
        soldNumbers: 421,
        organizer: {
            name: 'Carlos Rodríguez',
            avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez'
        },
        endDate: '2024-12-28',
        status: 'active',
        featured: false
    },
    {
        id: 4,
        title: 'Smart TV Samsung 55" 4K',
        description: 'Smart TV QLED con OneRemote',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
        price: 2500,
        totalNumbers: 400,
        soldNumbers: 156,
        organizer: {
            name: 'Ana Martínez',
            avatar: 'https://ui-avatars.com/api/?name=Ana+Martinez'
        },
        endDate: '2024-12-30',
        status: 'active',
        featured: false
    },
    {
        id: 5,
        title: 'Moto Pulsar NS 200',
        description: 'Moto deportiva nueva, modelo 2024',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500',
        price: 10000,
        totalNumbers: 1000,
        soldNumbers: 678,
        organizer: {
            name: 'Pedro Sánchez',
            avatar: 'https://ui-avatars.com/api/?name=Pedro+Sanchez'
        },
        endDate: '2025-01-15',
        status: 'active',
        featured: true
    },
    {
        id: 6,
        title: 'iPad Pro 11" M2',
        description: 'Nueva sellada con Apple Pencil',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
        price: 6000,
        totalNumbers: 500,
        soldNumbers: 234,
        organizer: {
            name: 'Laura Torres',
            avatar: 'https://ui-avatars.com/api/?name=Laura+Torres'
        },
        endDate: '2025-01-05',
        status: 'active',
        featured: false
    }
];

// Initialize rifas grid
function initRifasGrid() {
    const rifasGrid = document.getElementById('rifasGrid');
    if (!rifasGrid) return;

    // Clear existing content
    rifasGrid.innerHTML = '';

    // Get all rifas (sample + myRifas)
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const allRifas = [...sampleRifas, ...myRifas];

    // Render rifas
    allRifas.forEach(rifa => {
        // Add organizerId if not present
        if (!rifa.organizerId && rifa.organizer) {
            // Try to find organizer by name or create a default ID
            rifa.organizerId = rifa.organizer.id || `org-${rifa.organizer.name.toLowerCase().replace(/\s+/g, '-')}`;
        }
        
        const rifaCard = createRifaCard(rifa);
        rifasGrid.appendChild(rifaCard);
    });
}

// Create rifa card element
function createRifaCard(rifa) {
    const card = document.createElement('div');
    card.className = 'rifa-card';
    
    const progressPercentage = (rifa.soldNumbers / rifa.totalNumbers) * 100;
    const remainingNumbers = rifa.totalNumbers - rifa.soldNumbers;
    
    card.innerHTML = `
        <img src="${rifa.image}" alt="${rifa.title}" class="rifa-image" onerror="this.src='https://assets/logo-ub.png/400x200?text=Sin+Imagen'">
        
        <div class="rifa-content">
            <h3 class="rifa-title">${rifa.title}</h3>
            
            <div class="rifa-organizer">
                <img src="${rifa.organizer.avatar}" alt="${rifa.organizer.name}" class="organizer-avatar">
                <div class="organizer-info">
                    <a href="perfil-organizador.html?id=${rifa.organizerId || 'org-' + rifa.organizer.name.toLowerCase().replace(/\s+/g, '-')}" 
                       class="organizer-name" 
                       style="text-decoration: none; color: inherit;"
                       onclick="event.stopPropagation();">
                        Por ${rifa.organizer.name}
                    </a>
                    ${getOrganizerRatingDisplay(rifa.organizerId || 'org-' + rifa.organizer.name.toLowerCase().replace(/\s+/g, '-'))}
                </div>
            </div>
            
            <p class="rifa-description">${rifa.description}</p>
            
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
                    <strong>${rifa.soldNumbers}/${rifa.totalNumbers}</strong> números vendidos
                    <span style="color: var(--success-color);">(${remainingNumbers} disponibles)</span>
                </p>
            </div>
            
            <div class="rifa-footer">
                <div class="rifa-price-tag">$${formatNumber(rifa.price)}</div>
                <button class="btn btn-primary btn-small" onclick="viewRifaDetails(${rifa.id})">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Format number with thousands separator
function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Get organizer rating display
function getOrganizerRatingDisplay(organizerId) {
    if (!window.getOrganizerRatingStats) {
        return '';
    }
    
    const stats = window.getOrganizerRatingStats(organizerId);
    
    if (stats.totalReviews === 0) {
        return '<span class="organizer-rating" style="font-size: 0.75rem; color: var(--text-secondary);"><i class="far fa-star"></i> Sin calificaciones</span>';
    }
    
    const stars = generateRatingStars(stats.averageRating);
    return `
        <div class="organizer-rating" style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem;">
            ${stars}
            <span style="color: var(--text-secondary);">${stats.averageRating.toFixed(1)} (${stats.totalReviews})</span>
        </div>
    `;
}

// Generate rating stars
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star" style="color: #fbbf24; font-size: 0.75rem;"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt" style="color: #fbbf24; font-size: 0.75rem;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #d1d5db; font-size: 0.75rem;"></i>';
        }
    }
    
    return stars;
}

// View rifa details
function viewRifaDetails(rifaId) {
    // Check if user is logged in
    const user = checkAuth();
    if (!user) {
        showToast('Debes iniciar sesión para ver los detalles', 'warning');
        openModal(document.getElementById('loginModal'));
        return;
    }
    
    // Redirect to rifa detail page
    window.location.href = `rifa-detalle.html?id=${rifaId}`;
}

// Load more rifas
const loadMoreBtn = document.getElementById('loadMoreRifas');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerHTML = '<span class="loading"></span> Cargando...';
        loadMoreBtn.disabled = true;
        
        // Simulate loading more rifas
        setTimeout(() => {
            showToast('No hay más rifas disponibles por ahora', 'info');
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Cargar Más Rifas';
            loadMoreBtn.disabled = false;
        }, 1000);
    });
}

// Filter rifas
function filterRifas(criteria) {
    let filtered = [...sampleRifas];
    
    if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        filtered = filtered.filter(rifa => 
            rifa.title.toLowerCase().includes(searchTerm) ||
            rifa.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (criteria.minPrice) {
        filtered = filtered.filter(rifa => rifa.price >= criteria.minPrice);
    }
    
    if (criteria.maxPrice) {
        filtered = filtered.filter(rifa => rifa.price <= criteria.maxPrice);
    }
    
    if (criteria.status) {
        filtered = filtered.filter(rifa => rifa.status === criteria.status);
    }
    
    if (criteria.featured) {
        filtered = filtered.filter(rifa => rifa.featured);
    }
    
    return filtered;
}

// Sort rifas
function sortRifas(rifas, sortBy) {
    const sorted = [...rifas];
    
    switch (sortBy) {
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
            break;
        case 'popular':
            sorted.sort((a, b) => b.soldNumbers - a.soldNumbers);
            break;
        default:
            break;
    }
    
    return sorted;
}

// Get rifa by ID
function getRifaById(id) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const allRifas = [...sampleRifas, ...myRifas];
    return allRifas.find(rifa => rifa.id === parseInt(id) || rifa.id === id);
}

// Check if number is available
function isNumberAvailable(rifaId, number) {
    // En producción, esto consultaría a la API
    return Math.random() > 0.3; // Simula 70% disponibilidad
}

// Reserve number
async function reserveNumber(rifaId, number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (isNumberAvailable(rifaId, number)) {
                resolve({
                    success: true,
                    message: 'Número reservado exitosamente',
                    reservation: {
                        id: Math.random().toString(36).substr(2, 9),
                        rifaId,
                        number,
                        expiresAt: new Date(Date.now() + 15 * 60000) // 15 minutos
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'El número ya no está disponible'
                });
            }
        }, 500);
    });
}

// Buy number
async function buyNumber(rifaId, number, paymentMethod) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Compra realizada exitosamente',
                purchase: {
                    id: Math.random().toString(36).substr(2, 9),
                    rifaId,
                    number,
                    paymentMethod,
                    status: 'completed',
                    purchaseDate: new Date()
                }
            });
        }, 1500);
    });
}

// Cargar rifa destacada para hero card desde Firebase
async function loadFeaturedRifaForHero() {
    try {
        const rifasRef = collection(db, 'rifas');
        const rifasSnap = await getDocs(rifasRef);
        
        if (rifasSnap.empty) {
            console.log('No hay rifas en Firebase, usando datos estáticos');
            return;
        }
        
        // Obtener la primera rifa activa
        let featuredRifa = null;
        rifasSnap.forEach((doc) => {
            const data = doc.data();
            if (!featuredRifa && (data.estado === 'active' || data.status === 'active')) {
                featuredRifa = {
                    id: doc.id,
                    title: data.titulo || data.title || 'Sin título',
                    price: data.precio || data.price || 0,
                    moneda: data.moneda || data.currency || 'COP',
                    totalNumbers: data.numerosTotales || data.totalNumbers || 0,
                    numerosVendidos: data.numerosVendidos || [],
                    image: data.imagenUrl || data.image || 'assets/logo-ub.png'
                };
            }
        });
        
        if (featuredRifa) {
            updateHeroCard(featuredRifa);
        }
    } catch (error) {
        console.error('Error cargando rifa destacada:', error);
    }
}

// Actualizar hero card con datos de Firebase
function updateHeroCard(rifa) {
    const titleEl = document.getElementById('heroRifaTitle');
    const priceEl = document.getElementById('heroRifaPrice');
    const numbersEl = document.getElementById('heroRifaNumbers');
    const buttonEl = document.getElementById('heroRifaButton');
    const imageEl = document.querySelector('.prize-image');
    
    if (titleEl) {
        titleEl.textContent = rifa.title;
    }
    
    if (priceEl) {
        priceEl.textContent = `$${formatNumber(rifa.price)} ${rifa.moneda || 'COP'} por número`;
    }
    
    if (numbersEl) {
        const numerosVendidos = rifa.numerosVendidos || [];
        const soldCount = numerosVendidos.filter(n => n.estado === 'pagado' || n.estado === 'pendiente_validacion').length;
        const available = rifa.totalNumbers - soldCount;
        numbersEl.textContent = `Números disponibles: ${available}/${rifa.totalNumbers}`;
    }
    
    if (buttonEl) {
        buttonEl.style.display = 'block';
        buttonEl.onclick = () => {
            window.location.href = `rifa-detalle.html?id=${rifa.id}`;
        };
    }
    
    if (imageEl && rifa.image) {
        imageEl.src = rifa.image;
    }
    
    console.log('✅ Hero card actualizado con datos de Firebase:', rifa);
}

// Función para ver rifa desde hero card
window.viewHeroRifa = function() {
    const titleEl = document.getElementById('heroRifaTitle');
    if (titleEl && titleEl.textContent !== 'Cargando...') {
        // El botón ya tiene el onclick configurado en updateHeroCard
        const buttonEl = document.getElementById('heroRifaButton');
        if (buttonEl && buttonEl.onclick) {
            buttonEl.onclick();
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initRifasGrid();
    // Cargar rifa destacada para hero card
    loadFeaturedRifaForHero();
});

// Export functions
window.viewRifaDetails = viewRifaDetails;
window.filterRifas = filterRifas;
window.sortRifas = sortRifas;
window.getRifaById = getRifaById;
window.reserveNumber = reserveNumber;
window.buyNumber = buyNumber;
window.sampleRifas = sampleRifas;

