// ========== PREGUNTAS FRECUENTES LOGIC ==========

const allFAQs = [
    // General
    {
        category: 'general',
        question: '¿Qué es RIFAS UBIA?',
        answer: 'RIFAS UBIA es una plataforma digital que conecta organizadores y participantes en rifas de forma segura, transparente y confiable. Facilitamos todo el proceso desde la creación de rifas hasta la entrega de premios.'
    },
    {
        category: 'general',
        question: '¿Es seguro usar RIFAS UBIA?',
        answer: 'Absolutamente. Utilizamos tecnología de encriptación de nivel bancario, sorteos verificables y transacciones seguras. Todos los pagos están protegidos y los sorteos son 100% transparentes.'
    },
    {
        category: 'general',
        question: '¿Cuánto cuesta usar la plataforma?',
        answer: 'Para participantes, usar RIFAS UBIA es completamente gratuito. Solo pagas el precio del número que compres. Para organizadores, la creación de rifas es gratuita, con una pequeña comisión sobre las ventas exitosas.'
    },
    {
        category: 'general',
        question: '¿Necesito registrarme para participar?',
        answer: 'Sí, necesitas crear una cuenta gratuita para participar en rifas. El registro es rápido y solo requiere información básica.'
    },
    
    // Compras
    {
        category: 'compras',
        question: '¿Cómo compro un número?',
        answer: '1. Explora las rifas activas\n2. Haz clic en "Ver Detalles"\n3. Selecciona el número que quieras\n4. Completa el pago\n5. Recibe tu boleto digital'
    },
    {
        category: 'compras',
        question: '¿Puedo comprar más de un número?',
        answer: 'Sí, puedes comprar tantos números como desees, siempre que estén disponibles. Algunas rifas ofrecen descuentos por compras múltiples.'
    },
    {
        category: 'compras',
        question: '¿Puedo cancelar mi compra?',
        answer: 'Las compras son finales una vez confirmado el pago. Sin embargo, si la rifa es cancelada por el organizador, recibirás un reembolso automático.'
    },
    {
        category: 'compras',
        question: '¿Cómo veo mis números comprados?',
        answer: 'Puedes ver todos tus números comprados en tu Dashboard de Comprador, en la sección "Mis Rifas Activas" y "Historial de Compras".'
    },
    
    // Organizadores
    {
        category: 'organizadores',
        question: '¿Cómo me registro como organizador?',
        answer: 'Durante el registro, puedes solicitar ser organizador. Tu solicitud será revisada y aprobada por nuestro equipo. Una vez aprobado, tendrás acceso al Dashboard de Organizador.'
    },
    {
        category: 'organizadores',
        question: '¿Cuánto cuesta crear una rifa?',
        answer: 'Crear una rifa es completamente gratuito. Solo se aplica una pequeña comisión sobre las ventas exitosas, que se deduce automáticamente.'
    },
    {
        category: 'organizadores',
        question: '¿Cómo gestiono los números vendidos?',
        answer: 'En tu dashboard, puedes acceder al talonario interactivo de cada rifa, donde verás el estado de cada número y podrás gestionarlos manualmente si es necesario.'
    },
    {
        category: 'organizadores',
        question: '¿Cuándo recibo el dinero de las ventas?',
        answer: 'Los fondos se liberan después de confirmar cada pago. Puedes retirar tus ganancias desde tu dashboard, menos la comisión de la plataforma.'
    },
    
    // Pagos
    {
        category: 'pagos',
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos Nequi, Daviplata y PayPal. Todos los pagos son procesados de forma segura y encriptada.'
    },
    {
        category: 'pagos',
        question: '¿Es seguro pagar en línea?',
        answer: 'Sí, utilizamos tecnología de encriptación SSL y todas las transacciones son procesadas por pasarelas de pago certificadas y seguras.'
    },
    {
        category: 'pagos',
        question: '¿Cuánto tarda en confirmarse mi pago?',
        answer: 'Los pagos con Nequi y Daviplata se confirman casi instantáneamente. Los pagos con PayPal pueden tardar unos minutos. Recibirás una notificación cuando se confirme.'
    },
    {
        category: 'pagos',
        question: '¿Puedo obtener un comprobante?',
        answer: 'Sí, después de cada compra puedes descargar tu comprobante digital desde tu dashboard en la sección "Historial de Compras".'
    },
    
    // Sorteos
    {
        category: 'sorteos',
        question: '¿Cómo se realizan los sorteos?',
        answer: 'Los sorteos se realizan automáticamente en la fecha programada usando sistemas de generación aleatoria verificables. Cuando es posible, integramos con loterías oficiales para mayor transparencia.'
    },
    {
        category: 'sorteos',
        question: '¿Cómo sé si gané?',
        answer: 'Si eres ganador, recibirás una notificación automática por email y en la plataforma. También puedes verificar los resultados en la página de la rifa.'
    },
    {
        category: 'sorteos',
        question: '¿Cuándo se entregan los premios?',
        answer: 'La entrega se coordina directamente con el organizador, generalmente dentro de las 48 horas posteriores al sorteo. El organizador se pondrá en contacto contigo.'
    },
    {
        category: 'sorteos',
        question: '¿Los sorteos son justos?',
        answer: 'Sí, todos los sorteos son 100% transparentes y verificables. Puedes ver el proceso completo y los resultados están disponibles públicamente.'
    }
];

let currentCategory = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderFAQs('all');
    initSearch();
});

// Render FAQs
function renderFAQs(category) {
    const container = document.getElementById('faqListContainer');
    if (!container) return;
    
    let filteredFAQs = category === 'all' 
        ? allFAQs 
        : allFAQs.filter(faq => faq.category === category);
    
    if (filteredFAQs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">No hay preguntas en esta categoría.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    filteredFAQs.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
            <div class="faq-question" onclick="toggleFAQ('faq-${index}')">
                <h3>${faq.question}</h3>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer" id="faq-${index}">
                <p>${faq.answer.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        container.appendChild(faqItem);
    });
}

// Toggle FAQ
function toggleFAQ(id) {
    const answer = document.getElementById(id);
    const question = event.currentTarget;
    const icon = question.querySelector('i');
    
    if (!answer) return;
    
    const isOpen = answer.classList.contains('open');
    
    // Close all FAQs
    document.querySelectorAll('.faq-answer').forEach(a => {
        a.classList.remove('open');
    });
    document.querySelectorAll('.faq-question i').forEach(i => {
        i.style.transform = 'rotate(0deg)';
    });
    
    // Toggle current FAQ
    if (!isOpen) {
        answer.classList.add('open');
        icon.style.transform = 'rotate(180deg)';
    }
}

// Show FAQ category
function showFAQCategory(category) {
    currentCategory = category;
    
    // Update tabs
    document.querySelectorAll('.faq-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Render FAQs
    renderFAQs(category);
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            renderFAQs(currentCategory);
            return;
        }
        
        // Filter FAQs
        let filtered = allFAQs.filter(faq => {
            if (currentCategory !== 'all' && faq.category !== currentCategory) {
                return false;
            }
            return faq.question.toLowerCase().includes(query) || 
                   faq.answer.toLowerCase().includes(query);
        });
        
        const container = document.getElementById('faqListContainer');
        if (!container) return;
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No se encontraron resultados para "${query}"</p>
                </div>
            `;
        } else {
            container.innerHTML = '';
            filtered.forEach((faq, index) => {
                const faqItem = document.createElement('div');
                faqItem.className = 'faq-item';
                faqItem.innerHTML = `
                    <div class="faq-question" onclick="toggleFAQ('search-${index}')">
                        <h3>${faq.question}</h3>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer" id="search-${index}">
                        <p>${faq.answer.replace(/\n/g, '<br>')}</p>
                    </div>
                `;
                container.appendChild(faqItem);
            });
        }
    });
}

// Export functions
window.toggleFAQ = toggleFAQ;
window.showFAQCategory = showFAQCategory;
