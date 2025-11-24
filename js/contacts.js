// ========== CONTACTS SYSTEM ==========

/**
 * Sistema de Contactos y Agenda para RIFAS UBIA
 * 
 * Funcionalidades:
 * - Base de datos automática de compradores
 * - Agenda personalizada por organizador
 * - Base de datos global para admin
 * - Mensajería y correos
 * - Sugerencias con IA
 */

// ========== CONTACT MANAGEMENT ==========

/**
 * Save buyer as contact when they purchase
 */
function saveBuyerAsContact(transaction, rifaData) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const buyerId = transaction.userId;
    
    // Get buyer info
    const buyerInfo = {
        id: buyerId,
        firstName: user.firstName || 'Usuario',
        lastName: user.lastName || 'Demo',
        email: transaction.email || user.email,
        phone: transaction.phone || user.phone,
        rifaId: transaction.rifaId,
        rifaTitle: transaction.rifaTitle,
        number: transaction.number,
        purchaseDate: transaction.createdAt,
        purchaseAmount: transaction.amount,
        purchaseCount: 1,
        totalSpent: transaction.amount,
        lastContact: null,
        tags: [],
        notes: '',
        status: 'active'
    };
    
    // Save to organizer's contacts
    saveToOrganizerContacts(rifaData.organizerId, buyerInfo);
    
    // Save to global contacts (admin)
    saveToGlobalContacts(buyerInfo);
    
    return buyerInfo;
}

/**
 * Save contact to organizer's database
 */
function saveToOrganizerContacts(organizerId, contactInfo) {
    const organizerContacts = JSON.parse(localStorage.getItem(`organizer_${organizerId}_contacts`) || '[]');
    
    // Check if contact already exists
    const existingIndex = organizerContacts.findIndex(c => c.id === contactInfo.id);
    
    if (existingIndex !== -1) {
        // Update existing contact
        const existing = organizerContacts[existingIndex];
        existing.purchaseCount = (existing.purchaseCount || 0) + 1;
        existing.totalSpent = (existing.totalSpent || 0) + contactInfo.purchaseAmount;
        existing.lastPurchase = contactInfo.purchaseDate;
        existing.rifas = existing.rifas || [];
        existing.rifas.push({
            rifaId: contactInfo.rifaId,
            rifaTitle: contactInfo.rifaTitle,
            number: contactInfo.number,
            date: contactInfo.purchaseDate,
            amount: contactInfo.purchaseAmount
        });
        organizerContacts[existingIndex] = existing;
    } else {
        // Add new contact
        contactInfo.rifas = [{
            rifaId: contactInfo.rifaId,
            rifaTitle: contactInfo.rifaTitle,
            number: contactInfo.number,
            date: contactInfo.purchaseDate,
            amount: contactInfo.purchaseAmount
        }];
        organizerContacts.push(contactInfo);
    }
    
    localStorage.setItem(`organizer_${organizerId}_contacts`, JSON.stringify(organizerContacts));
    
    return organizerContacts;
}

/**
 * Save contact to global database (admin)
 */
function saveToGlobalContacts(contactInfo) {
    const globalContacts = JSON.parse(localStorage.getItem('global_contacts') || '[]');
    
    // Check if contact already exists
    const existingIndex = globalContacts.findIndex(c => c.id === contactInfo.id);
    
    if (existingIndex !== -1) {
        // Update existing contact
        const existing = globalContacts[existingIndex];
        existing.purchaseCount = (existing.purchaseCount || 0) + 1;
        existing.totalSpent = (existing.totalSpent || 0) + contactInfo.purchaseAmount;
        existing.lastPurchase = contactInfo.purchaseDate;
        existing.organizers = existing.organizers || [];
        
        // Add organizer if not exists
        if (!existing.organizers.find(o => o.id === contactInfo.rifaId)) {
            existing.organizers.push({
                organizerId: contactInfo.rifaId,
                rifaTitle: contactInfo.rifaTitle,
                date: contactInfo.purchaseDate
            });
        }
        
        globalContacts[existingIndex] = existing;
    } else {
        // Add new contact
        contactInfo.organizers = [{
            organizerId: contactInfo.rifaId,
            rifaTitle: contactInfo.rifaTitle,
            date: contactInfo.purchaseDate
        }];
        globalContacts.push(contactInfo);
    }
    
    localStorage.setItem('global_contacts', JSON.stringify(globalContacts));
    
    return globalContacts;
}

/**
 * Get organizer contacts
 */
function getOrganizerContacts(organizerId, filters = {}) {
    let contacts = JSON.parse(localStorage.getItem(`organizer_${organizerId}_contacts`) || '[]');
    
    // Apply filters
    if (filters.search) {
        const search = filters.search.toLowerCase();
        contacts = contacts.filter(c => 
            c.firstName?.toLowerCase().includes(search) ||
            c.lastName?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.phone?.includes(search)
        );
    }
    
    if (filters.tag) {
        contacts = contacts.filter(c => c.tags?.includes(filters.tag));
    }
    
    if (filters.minPurchases) {
        contacts = contacts.filter(c => (c.purchaseCount || 0) >= filters.minPurchases);
    }
    
    // Sort
    const sortBy = filters.sortBy || 'lastPurchase';
    contacts.sort((a, b) => {
        if (sortBy === 'lastPurchase') {
            return new Date(b.lastPurchase || 0) - new Date(a.lastPurchase || 0);
        } else if (sortBy === 'totalSpent') {
            return (b.totalSpent || 0) - (a.totalSpent || 0);
        } else if (sortBy === 'purchaseCount') {
            return (b.purchaseCount || 0) - (a.purchaseCount || 0);
        }
        return 0;
    });
    
    return contacts;
}

/**
 * Get global contacts (admin)
 */
function getGlobalContacts(filters = {}) {
    let contacts = JSON.parse(localStorage.getItem('global_contacts') || '[]');
    
    // Apply filters (same as organizer)
    if (filters.search) {
        const search = filters.search.toLowerCase();
        contacts = contacts.filter(c => 
            c.firstName?.toLowerCase().includes(search) ||
            c.lastName?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.phone?.includes(search)
        );
    }
    
    if (filters.minPurchases) {
        contacts = contacts.filter(c => (c.purchaseCount || 0) >= filters.minPurchases);
    }
    
    // Sort
    const sortBy = filters.sortBy || 'lastPurchase';
    contacts.sort((a, b) => {
        if (sortBy === 'lastPurchase') {
            return new Date(b.lastPurchase || 0) - new Date(a.lastPurchase || 0);
        } else if (sortBy === 'totalSpent') {
            return (b.totalSpent || 0) - (a.totalSpent || 0);
        }
        return 0;
    });
    
    return contacts;
}

/**
 * Update contact
 */
function updateContact(organizerId, contactId, updates) {
    const contacts = JSON.parse(localStorage.getItem(`organizer_${organizerId}_contacts`) || '[]');
    const index = contacts.findIndex(c => c.id === contactId);
    
    if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates };
        localStorage.setItem(`organizer_${organizerId}_contacts`, JSON.stringify(contacts));
        return contacts[index];
    }
    
    return null;
}

/**
 * Add tag to contact
 */
function addTagToContact(organizerId, contactId, tag) {
    const contact = updateContact(organizerId, contactId, {});
    if (contact) {
        contact.tags = contact.tags || [];
        if (!contact.tags.includes(tag)) {
            contact.tags.push(tag);
            updateContact(organizerId, contactId, { tags: contact.tags });
        }
    }
}

/**
 * Add note to contact
 */
function addNoteToContact(organizerId, contactId, note) {
    const contact = getOrganizerContacts(organizerId).find(c => c.id === contactId);
    if (contact) {
        const notes = contact.notes ? contact.notes + '\n' + note : note;
        updateContact(organizerId, contactId, { notes: notes });
    }
}

// ========== AI SUGGESTIONS ==========

/**
 * Generate AI message suggestion
 */
function generateAIMessageSuggestion(contact, rifaData = null) {
    const suggestions = [];
    
    // Personalized greeting
    const greeting = `Hola ${contact.firstName || 'Estimado/a'},`;
    
    // Based on purchase history
    if (contact.purchaseCount > 1) {
        suggestions.push({
            type: 'loyal_customer',
            subject: 'Nueva Rifa Especial para Ti',
            message: `${greeting}\n\nComo cliente frecuente, queremos ofrecerte acceso anticipado a nuestra nueva rifa: "${rifaData?.title || 'Premio Especial'}"\n\nHas participado en ${contact.purchaseCount} rifas anteriores y queremos agradecerte tu confianza.\n\n¡No te pierdas esta oportunidad!`,
            priority: 'high'
        });
    }
    
    // Based on spending
    if (contact.totalSpent > 100000) {
        suggestions.push({
            type: 'high_value',
            subject: 'Oferta Exclusiva - VIP',
            message: `${greeting}\n\nPor ser uno de nuestros mejores clientes (has invertido más de $${formatNumber(contact.totalSpent)}), tenemos una oferta especial para ti.\n\n${rifaData ? `Nueva rifa: "${rifaData.title}"` : 'Tenemos nuevas rifas disponibles'} con condiciones preferenciales.\n\n¡Contáctanos para más información!`,
            priority: 'high'
        });
    }
    
    // New customer
    if (contact.purchaseCount === 1) {
        suggestions.push({
            type: 'new_customer',
            subject: '¡Gracias por tu Primera Compra!',
            message: `${greeting}\n\nGracias por participar en "${contact.rifas?.[0]?.rifaTitle || 'nuestra rifa'}".\n\n${rifaData ? `Tenemos una nueva rifa que podría interesarte: "${rifaData.title}"` : 'Tenemos nuevas rifas disponibles'}.\n\n¡Esperamos verte de nuevo!`,
            priority: 'medium'
        });
    }
    
    // Default suggestion
    if (suggestions.length === 0) {
        suggestions.push({
            type: 'general',
            subject: rifaData ? `Nueva Rifa: ${rifaData.title}` : 'Nueva Rifa Disponible',
            message: `${greeting}\n\n${rifaData ? `Tenemos una nueva rifa que podría interesarte: "${rifaData.title}"` : 'Tenemos nuevas rifas disponibles'}.\n\n${rifaData?.description ? rifaData.description.substring(0, 100) + '...' : '¡No te la pierdas!'}\n\n¡Participa ahora!`,
            priority: 'medium'
        });
    }
    
    return suggestions[0]; // Return best suggestion
}

/**
 * Generate email template
 */
function generateEmailTemplate(contact, rifaData, templateType = 'new_rifa') {
    const templates = {
        new_rifa: {
            subject: `Nueva Rifa: ${rifaData?.title || 'Premio Especial'}`,
            body: `
Hola ${contact.firstName || 'Estimado/a'},

${rifaData ? `Tenemos una nueva rifa que podría interesarte: "${rifaData.title}"` : 'Tenemos nuevas rifas disponibles'}.

${rifaData?.description ? rifaData.description : ''}

${rifaData ? `Precio por número: $${formatNumber(rifaData.price)}` : ''}

¡No te la pierdas!

Saludos,
${rifaData?.organizer?.name || 'Equipo RIFAS UBIA'}
            `.trim()
        },
        reminder: {
            subject: `Recordatorio: Rifa "${rifaData?.title || ''}"`,
            body: `
Hola ${contact.firstName || 'Estimado/a'},

Te recordamos que la rifa "${rifaData?.title || ''}" está activa y aún hay números disponibles.

${rifaData ? `Precio por número: $${formatNumber(rifaData.price)}` : ''}

¡Participa antes de que se agoten!

Saludos,
${rifaData?.organizer?.name || 'Equipo RIFAS UBIA'}
            `.trim()
        },
        thank_you: {
            subject: '¡Gracias por tu Compra!',
            body: `
Hola ${contact.firstName || 'Estimado/a'},

Gracias por participar en "${rifaData?.title || 'nuestra rifa'}".

Tu número: ${contact.number || 'N/A'}
Fecha de compra: ${new Date(contact.purchaseDate).toLocaleDateString('es-ES')}

¡Mucha suerte en el sorteo!

Saludos,
${rifaData?.organizer?.name || 'Equipo RIFAS UBIA'}
            `.trim()
        }
    };
    
    return templates[templateType] || templates.new_rifa;
}

// ========== MESSAGING ==========

/**
 * Send message to contact
 */
async function sendMessageToContact(organizerId, contactId, messageData) {
    const contact = getOrganizerContacts(organizerId).find(c => c.id === contactId);
    if (!contact) {
        return { success: false, error: 'Contacto no encontrado' };
    }
    
    // Save message to history
    const message = {
        id: 'MSG-' + Date.now(),
        contactId: contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        type: messageData.type || 'email', // email, sms, whatsapp
        subject: messageData.subject || '',
        message: messageData.message || '',
        sentAt: new Date().toISOString(),
        status: 'sent',
        rifaId: messageData.rifaId || null
    };
    
    // Save to message history
    const messages = JSON.parse(localStorage.getItem(`organizer_${organizerId}_messages`) || '[]');
    messages.push(message);
    localStorage.setItem(`organizer_${organizerId}_messages`, JSON.stringify(messages));
    
    // Update contact last contact date
    updateContact(organizerId, contactId, { lastContact: new Date().toISOString() });
    
    // In production, this would send actual email/SMS
    console.log('Message sent:', message);
    
    return {
        success: true,
        message: message,
        note: 'En producción, esto enviaría el mensaje real por email/SMS'
    };
}

/**
 * Send bulk messages
 */
async function sendBulkMessages(organizerId, contactIds, messageData) {
    const results = [];
    
    for (const contactId of contactIds) {
        const result = await sendMessageToContact(organizerId, contactId, messageData);
        results.push(result);
    }
    
    return {
        success: true,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
    };
}

/**
 * Get message history
 */
function getMessageHistory(organizerId, filters = {}) {
    let messages = JSON.parse(localStorage.getItem(`organizer_${organizerId}_messages`) || '[]');
    
    if (filters.contactId) {
        messages = messages.filter(m => m.contactId === filters.contactId);
    }
    
    if (filters.type) {
        messages = messages.filter(m => m.type === filters.type);
    }
    
    // Sort by date
    messages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    
    return messages;
}

// ========== STATISTICS ==========

/**
 * Get contact statistics
 */
function getContactStatistics(organizerId) {
    const contacts = getOrganizerContacts(organizerId);
    
    return {
        total: contacts.length,
        active: contacts.filter(c => c.status === 'active').length,
        totalSpent: contacts.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        averageSpent: contacts.length > 0 ? contacts.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / contacts.length : 0,
        totalPurchases: contacts.reduce((sum, c) => sum + (c.purchaseCount || 0), 0),
        averagePurchases: contacts.length > 0 ? contacts.reduce((sum, c) => sum + (c.purchaseCount || 0), 0) / contacts.length : 0,
        topSpenders: contacts.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 5),
        recentContacts: contacts.sort((a, b) => new Date(b.lastPurchase || 0) - new Date(a.lastPurchase || 0)).slice(0, 5)
    };
}

// ========== EXPORTS ==========

window.saveBuyerAsContact = saveBuyerAsContact;
window.getOrganizerContacts = getOrganizerContacts;
window.getGlobalContacts = getGlobalContacts;
window.updateContact = updateContact;
window.addTagToContact = addTagToContact;
window.addNoteToContact = addNoteToContact;
window.generateAIMessageSuggestion = generateAIMessageSuggestion;
window.generateEmailTemplate = generateEmailTemplate;
window.sendMessageToContact = sendMessageToContact;
window.sendBulkMessages = sendBulkMessages;
window.getMessageHistory = getMessageHistory;
window.getContactStatistics = getContactStatistics;

// Helper function
function formatNumber(number) {
    return new Intl.NumberFormat('es-CO').format(number);
}

