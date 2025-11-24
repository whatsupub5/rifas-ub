// ========== SISTEMA DE SORTEOS ==========

/**
 * Sistema de Sorteos para RIFAS UBIA
 * 
 * Funcionalidades:
 * - Realizar sorteo automático
 * - Integración con lotería oficial (referencia verificable)
 * - Anunciar ganador automáticamente
 * - Historial de sorteos
 */

// Draw States
const DRAW_STATES = {
    PENDING: 'pending',      // Pendiente de realizar
    SCHEDULED: 'scheduled',  // Programado
    IN_PROGRESS: 'in_progress', // En proceso
    COMPLETED: 'completed',  // Completado
    CANCELLED: 'cancelled'   // Cancelado
};

// ========== DRAW FUNCTIONS ==========

/**
 * Perform a raffle draw
 * @param {string} rifaId - ID of the raffle
 * @param {Object} options - Draw options (lotteryReference, method)
 * @returns {Promise<Object>} Draw result
 */
async function performDraw(rifaId, options = {}) {
    try {
        // Get raffle data
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
        const allRifas = [...myRifas, ...sampleRifas];
        const rifa = allRifas.find(r => r.id === rifaId);

        if (!rifa) {
            return {
                success: false,
                error: 'Rifa no encontrada'
            };
        }

        // Validate raffle can be drawn
        const validation = validateDrawEligibility(rifa);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }

        // Get all purchased numbers
        const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        const rifaPurchases = purchases.filter(p => 
            p.rifaId === rifaId && 
            p.paymentStatus === 'confirmed'
        );

        if (rifaPurchases.length === 0) {
            return {
                success: false,
                error: 'No hay números vendidos para realizar el sorteo'
            };
        }

        // Get lottery reference if provided
        const lotteryReference = options.lotteryReference || generateLotteryReference();
        
        // Perform the draw
        const winner = selectWinner(rifaPurchases, lotteryReference);
        
        // Create draw record
        const drawRecord = {
            id: 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            rifaId: rifaId,
            rifaTitle: rifa.title,
            drawDate: new Date().toISOString(),
            lotteryReference: lotteryReference,
            method: options.method || 'automatic',
            totalParticipants: rifaPurchases.length,
            totalNumbers: rifaPurchases.map(p => p.number),
            winner: {
                userId: winner.userId,
                userName: winner.userName,
                userEmail: winner.userEmail,
                number: winner.number,
                purchaseId: winner.purchaseId
            },
            state: DRAW_STATES.COMPLETED,
            createdAt: new Date().toISOString()
        };

        // Save draw record
        const draws = JSON.parse(localStorage.getItem('draws') || '[]');
        draws.push(drawRecord);
        localStorage.setItem('draws', JSON.stringify(draws));

        // Update raffle status
        updateRaffleAfterDraw(rifaId, drawRecord);

        // Mark winner in purchase
        markWinner(winner.purchaseId, drawRecord.id);

        // Announce winner (notifications)
        await announceWinner(drawRecord);

        return {
            success: true,
            draw: drawRecord,
            message: 'Sorteo realizado exitosamente'
        };

    } catch (error) {
        console.error('Error performing draw:', error);
        return {
            success: false,
            error: 'Error al realizar el sorteo: ' + error.message
        };
    }
}

/**
 * Validate if a raffle is eligible for draw
 * @param {Object} rifa - Raffle object
 * @returns {Object} Validation result
 */
function validateDrawEligibility(rifa) {
    // Check if raffle exists
    if (!rifa) {
        return { valid: false, error: 'Rifa no encontrada' };
    }

    // Check if raffle is active
    if (rifa.status !== 'active') {
        return { valid: false, error: 'La rifa no está activa' };
    }

    // Check if draw date has arrived
    const drawDate = new Date(rifa.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    drawDate.setHours(0, 0, 0, 0);

    if (drawDate > today) {
        return { valid: false, error: 'La fecha del sorteo aún no ha llegado' };
    }

    // Check if draw already exists
    const draws = JSON.parse(localStorage.getItem('draws') || '[]');
    const existingDraw = draws.find(d => d.rifaId === rifa.id && d.state === DRAW_STATES.COMPLETED);
    if (existingDraw) {
        return { valid: false, error: 'El sorteo ya fue realizado' };
    }

    return { valid: true };
}

/**
 * Select winner using lottery reference
 * @param {Array} purchases - Array of purchases
 * @param {string} lotteryReference - Lottery reference number
 * @returns {Object} Winner information
 */
function selectWinner(purchases, lotteryReference) {
    // Extract numbers from purchases
    const numbers = purchases.map(p => ({
        number: p.number,
        userId: p.userId,
        userName: p.userName,
        userEmail: p.userEmail,
        purchaseId: p.id
    }));

    // Use lottery reference to select winner
    // Method: Use last digits of lottery reference to select index
    const lotteryDigits = lotteryReference.replace(/\D/g, ''); // Extract only digits
    const seed = parseInt(lotteryDigits.slice(-6)) || Date.now(); // Use last 6 digits
    
    // Select winner using modulo
    const winnerIndex = seed % numbers.length;
    const winner = numbers[winnerIndex];

    return winner;
}

/**
 * Generate lottery reference (simulated)
 * In production, this would integrate with official lottery
 * @returns {string} Lottery reference
 */
function generateLotteryReference() {
    // Simulate lottery reference format
    // Format: LOT-YYYYMMDD-HHMMSS-XXXXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `LOT-${dateStr}-${timeStr}-${random}`;
}

/**
 * Update raffle after draw
 * @param {string} rifaId - Raffle ID
 * @param {Object} drawRecord - Draw record
 */
function updateRaffleAfterDraw(rifaId, drawRecord) {
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const sampleRifas = JSON.parse(localStorage.getItem('sampleRifas') || '[]');
    
    // Update in myRifas
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    if (rifaIndex !== -1) {
        myRifas[rifaIndex].status = 'completed';
        myRifas[rifaIndex].drawId = drawRecord.id;
        myRifas[rifaIndex].winner = drawRecord.winner;
        myRifas[rifaIndex].drawDate = drawRecord.drawDate;
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    }

    // Update in sampleRifas
    const sampleIndex = sampleRifas.findIndex(r => r.id === rifaId);
    if (sampleIndex !== -1) {
        sampleRifas[sampleIndex].status = 'completed';
        sampleRifas[sampleIndex].drawId = drawRecord.id;
        sampleRifas[sampleIndex].winner = drawRecord.winner;
        sampleRifas[sampleIndex].drawDate = drawRecord.drawDate;
        localStorage.setItem('sampleRifas', JSON.stringify(sampleRifas));
    }
}

/**
 * Mark winner in purchase
 * @param {string} purchaseId - Purchase ID
 * @param {string} drawId - Draw ID
 */
function markWinner(purchaseId, drawId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    
    if (purchaseIndex !== -1) {
        purchases[purchaseIndex].isWinner = true;
        purchases[purchaseIndex].drawId = drawId;
        purchases[purchaseIndex].wonAt = new Date().toISOString();
        localStorage.setItem('userPurchases', JSON.stringify(purchases));
    }
}

/**
 * Announce winner
 * @param {Object} drawRecord - Draw record
 */
async function announceWinner(drawRecord) {
    // Notify winner
    if (window.notifyWinner) {
        window.notifyWinner(drawRecord.winner.userId, drawRecord);
    }
    
    // Notify all participants about draw completion
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const rifaPurchases = purchases.filter(p => 
        p.rifaId === drawRecord.rifaId && 
        p.paymentStatus === 'confirmed'
    );
    
    rifaPurchases.forEach(purchase => {
        if (purchase.userId !== drawRecord.winner.userId && window.notifyDrawCompleted) {
            window.notifyDrawCompleted(purchase.userId, drawRecord);
        }
    });
    
    console.log('Winner announced:', drawRecord);
    
    // Show toast notification if available
    if (typeof showToast === 'function') {
        showToast(`¡Ganador anunciado! Número ${drawRecord.winner.number}`, 'success');
    }
}

/**
 * Get draw history for a raffle
 * @param {string} rifaId - Raffle ID
 * @returns {Array} Array of draws
 */
function getDrawHistory(rifaId) {
    const draws = JSON.parse(localStorage.getItem('draws') || '[]');
    return draws.filter(d => d.rifaId === rifaId);
}

/**
 * Get all draws
 * @param {Object} filters - Filter options
 * @returns {Array} Array of draws
 */
function getAllDraws(filters = {}) {
    let draws = JSON.parse(localStorage.getItem('draws') || '[]');
    
    // Apply filters
    if (filters.state) {
        draws = draws.filter(d => d.state === filters.state);
    }
    
    if (filters.organizerId) {
        // Get organizer's rifas
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const organizerRifaIds = myRifas
            .filter(r => r.organizerId === filters.organizerId)
            .map(r => r.id);
        draws = draws.filter(d => organizerRifaIds.includes(d.rifaId));
    }
    
    // Sort by date (newest first)
    draws.sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate));
    
    return draws;
}

/**
 * Get draw by ID
 * @param {string} drawId - Draw ID
 * @returns {Object|null} Draw record
 */
function getDrawById(drawId) {
    const draws = JSON.parse(localStorage.getItem('draws') || '[]');
    return draws.find(d => d.id === drawId) || null;
}

/**
 * Check if user is winner of a raffle
 * @param {string} userId - User ID
 * @param {string} rifaId - Raffle ID
 * @returns {Object|null} Winner information or null
 */
function checkUserWinner(userId, rifaId) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const userPurchase = purchases.find(p => 
        p.userId === userId && 
        p.rifaId === rifaId && 
        p.isWinner === true
    );
    
    if (!userPurchase) return null;
    
    const draw = getDrawById(userPurchase.drawId);
    return {
        purchase: userPurchase,
        draw: draw
    };
}

// ========== EXPORTS ==========
window.performDraw = performDraw;
window.validateDrawEligibility = validateDrawEligibility;
window.getDrawHistory = getDrawHistory;
window.getAllDraws = getAllDraws;
window.getDrawById = getDrawById;
window.checkUserWinner = checkUserWinner;
window.DRAW_STATES = DRAW_STATES;

