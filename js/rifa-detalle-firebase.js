// ========== RIFA DETALLE LOGIC - FIREBASE VERSION ==========
// Esta es la versión refactorizada que usa Firestore en lugar de localStorage

// Importar funciones de Firebase
import { 
    db, 
    doc, 
    getDoc, 
    updateDoc, 
    runTransaction,
    serverTimestamp,
    arrayUnion 
} from './firebase-config.js';

let currentRifa = null;
let selectedNumber = null;
let currentImageIndex = 0;
let currentImages = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rifaId = urlParams.get('id');
    
    if (rifaId) {
        loadRifaDetail(rifaId);
    } else {
        showError('No se especificó una rifa');
    }
});

// Load rifa detail from Firestore
async function loadRifaDetail(rifaId) {
    const content = document.getElementById('rifaDetailContent');
    
    // Validate rifaId
    if (!rifaId) {
        showError('No se especificó un ID de rifa válido');
        return;
    }
    
    // Show loading state
    if (content) {
        content.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando detalles de la rifa...</p>
            </div>
        `;
    }
    
    try {
        // Obtener rifa desde Firestore
        const rifaRef = doc(db, 'rifas', rifaId);
        const rifaSnap = await getDoc(rifaRef);
        
        if (!rifaSnap.exists()) {
            showError(`Rifa con ID "${rifaId}" no encontrada. Puede que haya sido eliminada o el ID sea incorrecto.`);
            return;
        }
        
        const rifaData = rifaSnap.data();
        
        // Convertir datos de Firestore a formato esperado
        const rifa = {
            id: rifaSnap.id,
            title: rifaData.titulo || rifaData.title,
            description: rifaData.descripcion || rifaData.description,
            image: rifaData.imagenUrl || rifaData.image,
            images: rifaData.imagenes || (rifaData.imagenUrl ? [rifaData.imagenUrl] : []),
            price: rifaData.precio || rifaData.price,
            totalNumbers: rifaData.numerosTotales || rifaData.totalNumbers,
            organizerId: rifaData.organizadorId || rifaData.organizerId,
            organizer: rifaData.organizador || rifaData.organizer,
            endDate: rifaData.fechaFin || rifaData.endDate,
            status: rifaData.estado || rifaData.status || 'active',
            prize: rifaData.premio || rifaData.prize,
            conditions: rifaData.condiciones || rifaData.conditions || [],
            createdAt: rifaData.createdAt?.toDate?.() || rifaData.createdAt,
            updatedAt: rifaData.updatedAt?.toDate?.() || rifaData.updatedAt,
            // Obtener números vendidos del array
            numerosVendidos: rifaData.numerosVendidos || []
        };
        
        // Validar campos requeridos
        if (!rifa.title || !rifa.price || !rifa.totalNumbers) {
            showError('La rifa tiene información incompleta. Por favor contacta al soporte.', {
                message: 'Campos requeridos faltantes en la rifa'
            });
            return;
        }
        
        currentRifa = rifa;
        renderRifaDetail(rifa);
    } catch (error) {
        console.error('Error loading rifa:', error);
        showError('Error al cargar los detalles de la rifa', error);
    }
}

// Render rifa detail (mantener función original pero adaptada)
function renderRifaDetail(rifa) {
    const content = document.getElementById('rifaDetailContent');
    if (!content) return;
    
    // Obtener números vendidos desde Firestore (ya cargados en loadRifaDetail)
    const numerosVendidos = rifa.numerosVendidos || [];
    const realSoldNumbers = numerosVendidos.filter(n => n.estado === 'pagado' || n.status === 'sold').length;
    const actualSoldNumbers = realSoldNumbers > 0 ? realSoldNumbers : 0;
    
    const progressPercentage = (actualSoldNumbers / rifa.totalNumbers) * 100;
    const remainingNumbers = rifa.totalNumbers - actualSoldNumbers;
    
    // Resto de la función renderRifaDetail se mantiene igual...
    // (copiar desde la versión original, solo cambiando cómo se obtienen los números vendidos)
    
    // Por ahora, mantener la estructura básica
    content.innerHTML = `
        <div class="rifa-detail-container">
            <h1>${rifa.title}</h1>
            <p>Números vendidos: ${actualSoldNumbers} / ${rifa.totalNumbers}</p>
            <p>Números disponibles: ${remainingNumbers}</p>
            <button onclick="openNumberSelector()">Seleccionar Número</button>
        </div>
    `;
}

// Generate number grid from Firestore data
async function generateNumberGrid() {
    const grid = document.getElementById('numberGrid');
    if (!grid || !currentRifa) return;
    
    // Show loading state
    grid.innerHTML = '<div class="loading-skeleton-numbers"></div>';
    
    try {
        // Recargar rifa para obtener números más recientes
        const rifaRef = doc(db, 'rifas', currentRifa.id);
        const rifaSnap = await getDoc(rifaRef);
        
        if (!rifaSnap.exists()) {
            showToast('La rifa ya no existe', 'error');
            return;
        }
        
        const rifaData = rifaSnap.data();
        const numerosVendidos = rifaData.numerosVendidos || [];
        
        // Crear mapa de números vendidos para búsqueda rápida
        const soldNumbersMap = {};
        numerosVendidos.forEach(num => {
            const numValue = num.numero || num.number;
            if (numValue) {
                soldNumbersMap[numValue] = num;
            }
        });
        
        grid.innerHTML = '';
        
        // Generar grid de números
        for (let i = 1; i <= currentRifa.totalNumbers; i++) {
            const numberBtn = document.createElement('button');
            numberBtn.className = 'number-btn';
            numberBtn.textContent = String(i).padStart(3, '0');
            numberBtn.dataset.number = i;
            numberBtn.onclick = () => selectNumber(i);
            
            // Verificar si el número está vendido
            const numberData = soldNumbersMap[i];
            if (numberData && (numberData.estado === 'pagado' || numberData.status === 'sold')) {
                numberBtn.classList.add('sold');
                numberBtn.disabled = true;
                const buyerName = numberData.comprador?.nombre || numberData.buyer?.name || '';
                numberBtn.title = `Vendido${buyerName ? ' a ' + buyerName : ''}`;
            }
            
            grid.appendChild(numberBtn);
        }
    } catch (error) {
        console.error('Error generating number grid:', error);
        showToast('Error al cargar los números disponibles', 'error');
        grid.innerHTML = '<p style="color: var(--danger-color);">Error al cargar números</p>';
    }
}

// Select number (mantener función original)
function selectNumber(number) {
    // Validación básica
    if (!number || isNaN(number)) {
        showToast('Número inválido', 'error');
        return;
    }
    
    if (number < 1 || number > currentRifa.totalNumbers) {
        showToast('Número fuera de rango', 'error');
        return;
    }
    
    // Verificar si está vendido (verificación rápida local)
    const numberBtn = document.querySelector(`[data-number="${number}"]`);
    if (numberBtn && numberBtn.classList.contains('sold')) {
        showToast(`El número ${String(number).padStart(3, '0')} ya está vendido`, 'warning');
        return;
    }
    
    // Deseleccionar número anterior
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Seleccionar nuevo número
    if (numberBtn) {
        numberBtn.classList.add('selected');
    }
    
    selectedNumber = number;
    showToast(`Número ${String(number).padStart(3, '0')} seleccionado`, 'success');
}

// Open number selector
function openNumberSelector() {
    if (!currentRifa) {
        showToast('Error al cargar la información de la rifa', 'error');
        return;
    }
    
    const rifaStatus = currentRifa.status || 'active';
    if (rifaStatus !== 'active') {
        const statusMessages = {
            'paused': 'Esta rifa está pausada temporalmente',
            'completed': 'Esta rifa ya fue completada',
            'cancelled': 'Esta rifa fue cancelada',
            'sorteada': 'Esta rifa ya fue sorteada'
        };
        showToast(statusMessages[rifaStatus] || 'Esta rifa no está disponible para compras', 'warning');
        return;
    }
    
    const selector = document.getElementById('numberSelector');
    if (selector) {
        selector.style.display = 'block';
        selector.scrollIntoView({ behavior: 'smooth' });
        generateNumberGrid();
    }
}

// Process payment with Firestore transaction
async function processRifaPayment() {
    const selectedMethod = document.querySelector('.payment-method.selected');
    if (!selectedMethod) {
        showToast('Por favor selecciona un método de pago', 'warning');
        return;
    }
    
    if (!selectedNumber) {
        showToast('Por favor selecciona un número', 'warning');
        return;
    }
    
    const method = selectedMethod.getAttribute('data-method');
    const user = checkAuth();
    const isLoggedIn = user && user.id;
    
    // Validate guest information if not logged in
    let guestName, guestEmail, guestPhone;
    if (!isLoggedIn) {
        guestName = document.getElementById('guestName')?.value?.trim();
        guestEmail = document.getElementById('guestEmail')?.value?.trim();
        guestPhone = document.getElementById('guestPhone')?.value?.trim();
        
        if (!guestName || guestName.length < 3) {
            showToast('Por favor ingresa tu nombre completo', 'warning');
            document.getElementById('guestName')?.focus();
            return;
        }
        
        if (!guestEmail || !/\S+@\S+\.\S+/.test(guestEmail)) {
            showToast('Por favor ingresa un email válido', 'warning');
            document.getElementById('guestEmail')?.focus();
            return;
        }
        
        if (!guestPhone || guestPhone.length < 10) {
            showToast('Por favor ingresa un número de teléfono válido', 'warning');
            document.getElementById('guestPhone')?.focus();
            return;
        }
    }
    
    const phone = document.getElementById('paymentPhone')?.value || guestPhone;
    const email = document.getElementById('paymentEmail')?.value || guestEmail || user?.email;
    
    // Validate based on method
    if ((method === 'nequi' || method === 'daviplata') && !phone) {
        showToast('Por favor ingresa tu número de teléfono', 'warning');
        return;
    }
    
    if (method === 'paypal' && !email) {
        showToast('Por favor ingresa tu email', 'warning');
        return;
    }
    
    // Mostrar spinner de carga
    const submitBtn = document.querySelector('#paymentForm button[onclick="processRifaPayment()"]');
    const originalBtnText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Procesando...';
    }
    
    showToast('Procesando compra...', 'info');
    
    try {
        // Usar transacción de Firestore para garantizar atomicidad
        const rifaRef = doc(db, 'rifas', currentRifa.id);
        
        await runTransaction(db, async (transaction) => {
            // Leer documento actual
            const rifaSnap = await transaction.get(rifaRef);
            
            if (!rifaSnap.exists()) {
                throw new Error('La rifa ya no existe');
            }
            
            const rifaData = rifaSnap.data();
            const numerosVendidos = rifaData.numerosVendidos || [];
            
            // Verificar si el número ya está vendido (concurrencia)
            const numeroYaVendido = numerosVendidos.find(
                num => (num.numero === selectedNumber || num.number === selectedNumber) &&
                       (num.estado === 'pagado' || num.status === 'sold')
            );
            
            if (numeroYaVendido) {
                throw new Error(`Lo sentimos, el número ${String(selectedNumber).padStart(3, '0')} acaba de ser vendido por otro usuario. Por favor selecciona otro número.`);
            }
            
            // Preparar datos del comprador
            const compradorData = isLoggedIn ? {
                nombre: user.firstName + ' ' + (user.lastName || ''),
                email: user.email,
                telefono: phone,
                userId: user.id
            } : {
                nombre: guestName,
                email: guestEmail,
                telefono: guestPhone,
                isGuest: true
            };
            
            // Crear objeto de número vendido
            const numeroVendido = {
                numero: selectedNumber,
                estado: 'pagado',
                comprador: compradorData,
                metodoPago: method,
                fechaCompra: serverTimestamp(),
                precio: currentRifa.price
            };
            
            // Agregar número al array de números vendidos
            transaction.update(rifaRef, {
                numerosVendidos: arrayUnion(numeroVendido),
                updatedAt: serverTimestamp()
            });
        });
        
        // Si llegamos aquí, la transacción fue exitosa
        showToast('¡Compra realizada exitosamente!', 'success');
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            closeModal(document.getElementById('paymentModal'));
            
            // Recargar la página para mostrar el número vendido
            if (isLoggedIn) {
                window.location.reload();
            } else {
                // Para invitados, mostrar mensaje y opción de registro
                if (confirm('¿Deseas crear una cuenta para ver tus compras y recibir notificaciones?')) {
                    window.location.href = 'index.html#register';
                } else {
                    window.location.reload();
                }
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error processing payment:', error);
        
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
        
        // Mensaje de error específico
        let errorMessage = 'Error al procesar la compra';
        
        if (error.message.includes('acaba de ser vendido')) {
            errorMessage = error.message;
            showToast(errorMessage, 'error');
            // Recargar grid de números
            generateNumberGrid();
        } else if (error.message.includes('no existe')) {
            errorMessage = 'La rifa ya no está disponible';
            showToast(errorMessage, 'error');
        } else {
            errorMessage = error.message || 'Error al procesar el pago. Por favor intenta nuevamente.';
            showToast(errorMessage, 'error');
        }
    }
}

// Exportar funciones para uso global
window.openNumberSelector = openNumberSelector;
window.selectNumber = selectNumber;
window.processRifaPayment = processRifaPayment;
window.generateNumberGrid = generateNumberGrid;

