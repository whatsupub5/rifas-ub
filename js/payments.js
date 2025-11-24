// ========== PAYMENT SYSTEM ==========

/**
 * Sistema de Pagos Estructurado para RIFAS UBIA
 * 
 * Métodos soportados:
 * - Nequi
 * - Daviplata
 * - PayPal
 * 
 * Estados de pago:
 * - pending: Pendiente
 * - processing: Procesando
 * - confirmed: Confirmado
 * - failed: Fallido
 * - refunded: Reembolsado
 */

// Payment Configuration
const PAYMENT_CONFIG = {
    methods: {
        bizum: {
            name: 'Bizum',
            icon: 'fas fa-mobile-alt',
            minAmount: 1000,
            maxAmount: 10000000,
            processingTime: 'instant',
            fee: 0,
            enabled: true,
            accountInfo: '627039947',
            accountName: 'Unay Bayona'
        },
        paypal: {
            name: 'PayPal',
            icon: 'fab fa-paypal',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '2-5 minutes',
            fee: 0.035, // 3.5% fee
            enabled: true,
            accountInfo: 'whatsupub5@gmail.com / unay_3_3@hotmail.com',
            accountName: 'Unay Bayona'
        },
        revolut: {
            name: 'Revolut',
            icon: 'fas fa-university',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '1-2 business days',
            fee: 0,
            enabled: true,
            accountInfo: 'ES4515830001109023438724',
            accountName: 'Unay Bayona'
        },
        imagin: {
            name: 'IMAGIN (Caixa)',
            icon: 'fas fa-university',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '1-2 business days',
            fee: 0,
            enabled: true,
            accountInfo: 'ES5821003114052200224277',
            accountName: 'Unay Bayona'
        },
        sumup: {
            name: 'SumUp',
            icon: 'fas fa-university',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '1-2 business days',
            fee: 0,
            enabled: true,
            accountInfo: 'IE40SUMU99036510405775',
            accountName: 'Unay Bayona'
        },
        bbva1: {
            name: 'BBVA (Cuenta 1)',
            icon: 'fas fa-university',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '1-2 business days',
            fee: 0,
            enabled: true,
            accountInfo: 'ES28 0182 4039 9602 0162 0634',
            accountName: 'Randon Unay Bayona Prada'
        },
        bbva2: {
            name: 'BBVA (Cuenta 2)',
            icon: 'fas fa-university',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: '1-2 business days',
            fee: 0,
            enabled: true,
            accountInfo: 'ES64 0182 4039 9102 0161 9746',
            accountName: 'Randon Unay Bayona Prada'
        },
        zelle: {
            name: 'Zelle (EEUU)',
            icon: 'fas fa-dollar-sign',
            minAmount: 1000,
            maxAmount: 50000000,
            processingTime: 'instant',
            fee: 0,
            enabled: true,
            accountInfo: 'unaybayona323@gmail.com',
            accountName: 'Unay Bayona'
        },
        nequi: {
            name: 'Nequi',
            icon: 'fas fa-mobile-alt',
            minAmount: 1000,
            maxAmount: 10000000,
            processingTime: 'instant',
            fee: 0,
            enabled: false // Deshabilitado por defecto
        },
        daviplata: {
            name: 'Daviplata',
            icon: 'fas fa-wallet',
            minAmount: 1000,
            maxAmount: 10000000,
            processingTime: 'instant',
            fee: 0,
            enabled: false // Deshabilitado por defecto
        }
    },
    currency: 'EUR', // Cambiado a EUR (Euros) para España
    taxRate: 0.21 // 21% IVA en España
};

// Payment States
const PAYMENT_STATES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
};

// Organizer Fund States (Estados de fondos del organizador)
const FUND_STATES = {
    HELD: 'held',           // Retenido - Esperando entrega del premio
    RELEASED: 'released',   // Liberado - Premio entregado y confirmado
    PENDING_RELEASE: 'pending_release', // Pendiente de liberación
    DISPUTED: 'disputed'    // En disputa
};

// ========== PAYMENT PROCESSING ==========

/**
 * Process a payment transaction
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment result
 */
async function processPayment(paymentData) {
    const {
        rifaId,
        rifaTitle,
        number,
        amount,
        method,
        phone,
        email,
        userId
    } = paymentData;

    // Validate payment data
    const validation = validatePaymentData(paymentData);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            state: PAYMENT_STATES.FAILED
        };
    }

    // Create payment transaction
    const transaction = createPaymentTransaction(paymentData);
    
    // Save transaction
    saveTransaction(transaction);

    // Process based on method
    try {
        const result = await processPaymentByMethod(method, transaction);
        
        if (result.success) {
            // Update transaction status
            updateTransactionStatus(transaction.id, PAYMENT_STATES.CONFIRMED, result);
            
            // Create purchase record
            createPurchaseRecord(transaction, paymentData);
            
            // Update rifa numbers
            updateRifaNumberStatus(rifaId, number, 'sold', userId);
            
            // Send confirmation
            sendPaymentConfirmation(transaction);
            
            return {
                success: true,
                transaction: transaction,
                message: 'Pago procesado exitosamente'
            };
        } else {
            updateTransactionStatus(transaction.id, PAYMENT_STATES.FAILED, result);
            return {
                success: false,
                error: result.error || 'Error al procesar el pago',
                transaction: transaction
            };
        }
    } catch (error) {
        updateTransactionStatus(transaction.id, PAYMENT_STATES.FAILED, { error: error.message });
        return {
            success: false,
            error: error.message,
            transaction: transaction
        };
    }
}

/**
 * Process payment by specific method
 */
async function processPaymentByMethod(method, transaction) {
    switch (method) {
        case 'nequi':
            return await processNequiPayment(transaction);
        case 'daviplata':
            return await processDaviplataPayment(transaction);
        case 'paypal':
            return await processPayPalPayment(transaction);
        default:
            throw new Error('Método de pago no soportado');
    }
}

// ========== PAYMENT METHODS ==========

/**
 * Process Nequi payment
 */
async function processNequiPayment(transaction) {
    // Simulate API call (replace with real Nequi API)
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate success/failure (90% success rate)
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    transactionId: 'NEQ-' + Date.now(),
                    confirmationCode: generateConfirmationCode(),
                    processedAt: new Date().toISOString()
                });
            } else {
                resolve({
                    success: false,
                    error: 'Fondos insuficientes o número de teléfono inválido'
                });
            }
        }, 2000);
    });
}

/**
 * Process Daviplata payment
 */
async function processDaviplataPayment(transaction) {
    // Simulate API call (replace with real Daviplata API)
    return new Promise((resolve) => {
        setTimeout(() => {
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    transactionId: 'DAV-' + Date.now(),
                    confirmationCode: generateConfirmationCode(),
                    processedAt: new Date().toISOString()
                });
            } else {
                resolve({
                    success: false,
                    error: 'Error al procesar el pago con Daviplata'
                });
            }
        }, 2000);
    });
}

/**
 * Process PayPal payment
 */
async function processPayPalPayment(transaction) {
    // Simulate API call (replace with real PayPal API)
    return new Promise((resolve) => {
        setTimeout(() => {
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    transactionId: 'PAY-' + Date.now(),
                    confirmationCode: generateConfirmationCode(),
                    processedAt: new Date().toISOString(),
                    paypalOrderId: 'PAYPAL-' + Math.random().toString(36).substr(2, 9)
                });
            } else {
                resolve({
                    success: false,
                    error: 'Error al procesar el pago con PayPal'
                });
            }
        }, 3000);
    });
}

// ========== REAL API INTEGRATIONS ==========

/**
 * Real Nequi API Integration (uncomment when ready)
 */
/*
async function processNequiPaymentReal(transaction) {
    const API_KEY = 'YOUR_NEQUI_API_KEY';
    const API_URL = 'https://api.nequi.com/v1/payments';
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            amount: transaction.amount,
            phone: transaction.phone,
            reference: transaction.id,
            description: transaction.description
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
        return {
            success: true,
            transactionId: data.transactionId,
            confirmationCode: data.confirmationCode,
            processedAt: data.processedAt
        };
    } else {
        return {
            success: false,
            error: data.message || 'Error al procesar el pago'
        };
    }
}
*/

// ========== TRANSACTION MANAGEMENT ==========

/**
 * Create payment transaction
 */
function createPaymentTransaction(paymentData) {
    const methodConfig = PAYMENT_CONFIG.methods[paymentData.method];
    const fee = calculateFee(paymentData.amount, paymentData.method);
    const total = paymentData.amount + fee;
    
    return {
        id: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        rifaId: paymentData.rifaId,
        rifaTitle: paymentData.rifaTitle,
        number: paymentData.number,
        userId: paymentData.userId,
        amount: paymentData.amount,
        fee: fee,
        total: total,
        method: paymentData.method,
        phone: paymentData.phone,
        email: paymentData.email,
        status: PAYMENT_STATES.PROCESSING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Save transaction to storage
 */
function saveTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem('paymentTransactions', JSON.stringify(transactions));
}

/**
 * Get all transactions
 */
function getTransactions() {
    return JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
}

/**
 * Get transaction by ID
 */
function getTransactionById(transactionId) {
    const transactions = getTransactions();
    return transactions.find(t => t.id === transactionId);
}

/**
 * Get user transactions
 */
function getUserTransactions(userId) {
    const transactions = getTransactions();
    return transactions.filter(t => t.userId === userId);
}

/**
 * Update transaction status
 */
function updateTransactionStatus(transactionId, status, data = {}) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index !== -1) {
        transactions[index].status = status;
        transactions[index].updatedAt = new Date().toISOString();
        
        // Add additional data
        if (data.transactionId) transactions[index].paymentTransactionId = data.transactionId;
        if (data.confirmationCode) transactions[index].confirmationCode = data.confirmationCode;
        if (data.processedAt) transactions[index].processedAt = data.processedAt;
        if (data.error) transactions[index].error = data.error;
        
        localStorage.setItem('paymentTransactions', JSON.stringify(transactions));
    }
}

// ========== VALIDATION ==========

/**
 * Validate payment data
 */
function validatePaymentData(paymentData) {
    const { amount, method, phone, email } = paymentData;
    
    // Check method exists and is enabled
    if (!PAYMENT_CONFIG.methods[method] || !PAYMENT_CONFIG.methods[method].enabled) {
        return { valid: false, error: 'Método de pago no disponible' };
    }
    
    const methodConfig = PAYMENT_CONFIG.methods[method];
    
    // Validate amount
    if (amount < methodConfig.minAmount) {
        return { valid: false, error: `El monto mínimo es $${formatNumber(methodConfig.minAmount)}` };
    }
    
    if (amount > methodConfig.maxAmount) {
        return { valid: false, error: `El monto máximo es $${formatNumber(methodConfig.maxAmount)}` };
    }
    
    // Validate phone (for Nequi/Daviplata)
    if ((method === 'nequi' || method === 'daviplata') && !phone) {
        return { valid: false, error: 'Número de teléfono requerido' };
    }
    
    if (phone && !isValidPhone(phone)) {
        return { valid: false, error: 'Número de teléfono inválido' };
    }
    
    // Validate email (for PayPal)
    if (method === 'paypal' && !email) {
        return { valid: false, error: 'Email requerido para PayPal' };
    }
    
    if (email && !isValidEmail(email)) {
        return { valid: false, error: 'Email inválido' };
    }
    
    return { valid: true };
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Validate email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== CALCULATIONS ==========

/**
 * Calculate payment fee
 */
function calculateFee(amount, method) {
    const methodConfig = PAYMENT_CONFIG.methods[method];
    if (!methodConfig.fee) return 0;
    
    return Math.round(amount * methodConfig.fee);
}

/**
 * Calculate total with fee
 */
function calculateTotal(amount, method) {
    return amount + calculateFee(amount, method);
}

// ========== PURCHASE RECORDS ==========

/**
 * Create purchase record
 */
function createPurchaseRecord(transaction, paymentData) {
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    
    const purchase = {
        id: Date.now(),
        transactionId: transaction.id,
        rifaId: transaction.rifaId,
        rifaTitle: transaction.rifaTitle,
        rifaImage: paymentData.rifaImage || '',
        number: transaction.number,
        price: transaction.amount,
        total: transaction.total,
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: transaction.status,
        paymentMethod: transaction.method,
        rifaStatus: 'active',
        endDate: paymentData.endDate || '',
        confirmationCode: transaction.confirmationCode || '',
        phone: transaction.phone || '',
        email: transaction.email || ''
    };
    
    purchases.push(purchase);
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
    
    // Notify user about purchase
    if (window.notifyPaymentConfirmed && transaction.status === PAYMENT_STATES.CONFIRMED) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        window.notifyPaymentConfirmed(user.id || userId, {
            rifaId: rifaId,
            rifaTitle: rifaTitle,
            number: number,
            amount: amount,
            purchaseId: purchase.id
        });
    }
    
    // Hold funds for organizer (retener fondos hasta entrega del premio)
    holdOrganizerFunds(transaction, paymentData);
    
    // Save buyer as contact automatically
    if (window.saveBuyerAsContact) {
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const rifa = myRifas.find(r => r.id === transaction.rifaId);
        if (rifa) {
            window.saveBuyerAsContact(transaction, rifa);
        }
    }
    
    return purchase;
}

/**
 * Hold organizer funds until prize delivery is confirmed
 * IMPORTANT: El dinero se retiene hasta que se confirme la entrega del premio
 */
function holdOrganizerFunds(transaction, paymentData) {
    const organizerFunds = JSON.parse(localStorage.getItem('organizerFunds') || '[]');
    const rifaId = transaction.rifaId;
    
    // Find or create fund record for this rifa
    let fundRecord = organizerFunds.find(f => f.rifaId === rifaId);
    
    if (!fundRecord) {
        // Get rifa info
        const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
        const rifa = myRifas.find(r => r.id === rifaId);
        
        fundRecord = {
            rifaId: rifaId,
            rifaTitle: transaction.rifaTitle,
            organizerId: rifa?.organizerId || 'unknown',
            totalAmount: 0,
            heldAmount: 0,
            releasedAmount: 0,
            status: FUND_STATES.HELD,
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        organizerFunds.push(fundRecord);
    }
    
    // Add transaction to fund record
    fundRecord.transactions.push({
        transactionId: transaction.id,
        amount: transaction.amount,
        fee: transaction.fee,
        netAmount: transaction.amount - transaction.fee, // Monto neto para el organizador
        status: FUND_STATES.HELD,
        createdAt: new Date().toISOString()
    });
    
    // Update totals
    fundRecord.totalAmount += transaction.amount;
    fundRecord.heldAmount += (transaction.amount - transaction.fee);
    fundRecord.updatedAt = new Date().toISOString();
    
    localStorage.setItem('organizerFunds', JSON.stringify(organizerFunds));
    
    return fundRecord;
}

// ========== REFUNDS ==========

/**
 * Process refund
 */
async function processRefund(transactionId, reason) {
    const transaction = getTransactionById(transactionId);
    
    if (!transaction) {
        return { success: false, error: 'Transacción no encontrada' };
    }
    
    if (transaction.status !== PAYMENT_STATES.CONFIRMED) {
        return { success: false, error: 'Solo se pueden reembolsar transacciones confirmadas' };
    }
    
    // Update status
    updateTransactionStatus(transactionId, PAYMENT_STATES.REFUNDED, { reason });
    
    // Update purchase
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const purchaseIndex = purchases.findIndex(p => p.transactionId === transactionId);
    if (purchaseIndex !== -1) {
        purchases[purchaseIndex].paymentStatus = PAYMENT_STATES.REFUNDED;
        purchases[purchaseIndex].refundReason = reason;
        purchases[purchaseIndex].refundDate = new Date().toISOString();
        localStorage.setItem('userPurchases', JSON.stringify(purchases));
    }
    
    // Update rifa number status
    updateRifaNumberStatus(transaction.rifaId, transaction.number, 'available', null);
    
    return {
        success: true,
        message: 'Reembolso procesado exitosamente',
        transaction: transaction
    };
}

// ========== UTILITIES ==========

/**
 * Generate confirmation code
 */
function generateConfirmationCode() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * Format number
 */
function formatNumber(number) {
    return new Intl.NumberFormat('es-CO').format(number);
}

/**
 * Update rifa number status
 */
function updateRifaNumberStatus(rifaId, number, status, userId) {
    // Update in talonario
    const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifaId}_numbers`) || '{}');
    numbersState[number] = {
        status: status,
        buyer: userId || null,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`rifa_${rifaId}_numbers`, JSON.stringify(numbersState));
    
    // Update rifa sold count
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    const rifaIndex = myRifas.findIndex(r => r.id === rifaId);
    if (rifaIndex !== -1) {
        if (status === 'sold') {
            myRifas[rifaIndex].soldNumbers = (myRifas[rifaIndex].soldNumbers || 0) + 1;
        } else if (status === 'available') {
            myRifas[rifaIndex].soldNumbers = Math.max(0, (myRifas[rifaIndex].soldNumbers || 0) - 1);
        }
        localStorage.setItem('myRifas', JSON.stringify(myRifas));
    }
}

/**
 * Send payment confirmation
 */
function sendPaymentConfirmation(transaction) {
    // In production, send email/SMS notification
    console.log('Payment confirmation sent for transaction:', transaction.id);
}

// ========== PRIZE DELIVERY CONFIRMATION ==========

/**
 * Confirm prize delivery and release funds to organizer
 * IMPORTANT: Solo se libera el dinero cuando el ganador confirma la recepción del premio
 * @param {string} rifaId - ID de la rifa
 * @param {string} winnerId - ID del ganador
 * @param {Object} confirmationData - Datos de confirmación
 * @returns {Promise<Object>} Resultado de la liberación
 */
async function confirmPrizeDelivery(rifaId, winnerId, confirmationData = {}) {
    const organizerFunds = JSON.parse(localStorage.getItem('organizerFunds') || '[]');
    const fundRecord = organizerFunds.find(f => f.rifaId === rifaId);
    
    if (!fundRecord) {
        return {
            success: false,
            error: 'No se encontraron fondos para esta rifa'
        };
    }
    
    if (fundRecord.status === FUND_STATES.RELEASED) {
        return {
            success: false,
            error: 'Los fondos ya fueron liberados'
        };
    }
    
    // Update fund record
    fundRecord.status = FUND_STATES.RELEASED;
    fundRecord.releasedAmount = fundRecord.heldAmount;
    fundRecord.heldAmount = 0;
    fundRecord.releasedAt = new Date().toISOString();
    fundRecord.winnerId = winnerId;
    fundRecord.confirmationData = {
        confirmedBy: winnerId,
        confirmationDate: new Date().toISOString(),
        deliveryMethod: confirmationData.deliveryMethod || 'personal',
        notes: confirmationData.notes || '',
        rating: confirmationData.rating || null
    };
    fundRecord.updatedAt = new Date().toISOString();
    
    // Update all transactions
    fundRecord.transactions.forEach(trans => {
        trans.status = FUND_STATES.RELEASED;
        trans.releasedAt = new Date().toISOString();
    });
    
    localStorage.setItem('organizerFunds', JSON.stringify(organizerFunds));
    
    // Update purchase record
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    purchases.forEach(purchase => {
        if (purchase.rifaId === rifaId && purchase.paymentStatus === PAYMENT_STATES.CONFIRMED) {
            purchase.prizeDelivered = true;
            purchase.prizeDeliveryDate = new Date().toISOString();
        }
    });
    localStorage.setItem('userPurchases', JSON.stringify(purchases));
    
    return {
        success: true,
        message: 'Premio confirmado. Fondos liberados al organizador.',
        fundRecord: fundRecord,
        releasedAmount: fundRecord.releasedAmount
    };
}

/**
 * Get organizer funds status
 */
function getOrganizerFunds(rifaId) {
    const organizerFunds = JSON.parse(localStorage.getItem('organizerFunds') || '[]');
    return organizerFunds.find(f => f.rifaId === rifaId);
}

/**
 * Get all organizer funds
 */
function getAllOrganizerFunds(organizerId = null) {
    const organizerFunds = JSON.parse(localStorage.getItem('organizerFunds') || '[]');
    if (organizerId) {
        return organizerFunds.filter(f => f.organizerId === organizerId);
    }
    return organizerFunds;
}

/**
 * Dispute prize delivery
 */
function disputePrizeDelivery(rifaId, disputeData) {
    const organizerFunds = JSON.parse(localStorage.getItem('organizerFunds') || '[]');
    const fundRecord = organizerFunds.find(f => f.rifaId === rifaId);
    
    if (!fundRecord) {
        return { success: false, error: 'No se encontraron fondos para esta rifa' };
    }
    
    fundRecord.status = FUND_STATES.DISPUTED;
    fundRecord.disputeData = {
        ...disputeData,
        createdAt: new Date().toISOString()
    };
    fundRecord.updatedAt = new Date().toISOString();
    
    localStorage.setItem('organizerFunds', JSON.stringify(organizerFunds));
    
    return {
        success: true,
        message: 'Disputa registrada. El equipo revisará el caso.',
        fundRecord: fundRecord
    };
}

// ========== EXPORTS ==========

window.processPayment = processPayment;
window.getTransactions = getTransactions;
window.getTransactionById = getTransactionById;
window.getUserTransactions = getUserTransactions;
window.processRefund = processRefund;
window.calculateTotal = calculateTotal;
window.calculateFee = calculateFee;
window.confirmPrizeDelivery = confirmPrizeDelivery;
window.getOrganizerFunds = getOrganizerFunds;
window.getAllOrganizerFunds = getAllOrganizerFunds;
window.disputePrizeDelivery = disputePrizeDelivery;
window.PAYMENT_CONFIG = PAYMENT_CONFIG;
window.PAYMENT_STATES = PAYMENT_STATES;
window.FUND_STATES = FUND_STATES;
