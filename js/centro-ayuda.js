// ========== CENTRO DE AYUDA LOGIC ==========

const faqData = {
    comprar: [
        {
            question: '¿Cómo compro un número en una rifa?',
            answer: 'Para comprar un número:\n\n1. Navega por las rifas activas en la página principal\n2. Haz clic en "Ver Detalles" de la rifa que te interese\n3. Selecciona el número disponible que quieras comprar\n4. Completa el proceso de pago con tu método preferido (Nequi, Daviplata o PayPal)\n5. Recibirás confirmación inmediata y tu boleto digital'
        },
        {
            question: '¿Puedo comprar múltiples números?',
            answer: 'Sí, puedes comprar tantos números como desees, siempre que estén disponibles. Algunas rifas ofrecen descuentos por compras múltiples.'
        },
        {
            question: '¿Cómo sé si un número está disponible?',
            answer: 'En la página de detalles de cada rifa, verás un talonario interactivo que muestra claramente qué números están disponibles (verde), reservados (amarillo) o vendidos (gris).'
        },
        {
            question: '¿Puedo elegir mi número de la suerte?',
            answer: 'Sí, puedes seleccionar cualquier número disponible del talonario. Si el número que quieres ya está vendido, puedes elegir otro disponible.'
        }
    ],
    organizar: [
        {
            question: '¿Cómo creo una rifa?',
            answer: 'Para crear una rifa:\n\n1. Inicia sesión como organizador\n2. Ve a tu Dashboard de Organizador\n3. Haz clic en "Crear Nueva Rifa"\n4. Completa el formulario con:\n   - Nombre y descripción del premio\n   - Precio por número\n   - Cantidad total de números\n   - Fecha del sorteo\n   - Imagen del premio\n   - Reglas y términos\n5. Publica tu rifa y comienza a vender'
        },
        {
            question: '¿Cuánto cuesta crear una rifa?',
            answer: 'Crear una rifa en RIFAS UBIA es completamente gratuito. Solo se aplica una pequeña comisión sobre las ventas exitosas.'
        },
        {
            question: '¿Cómo gestiono los números vendidos?',
            answer: 'En tu dashboard de organizador, puedes acceder al talonario interactivo de cada rifa, donde puedes ver el estado de cada número (disponible, reservado, vendido) y gestionarlos manualmente si es necesario.'
        },
        {
            question: '¿Cómo realizo el sorteo?',
            answer: 'El sorteo se realiza automáticamente en la fecha programada. Puedes configurar la integración con una lotería oficial para mayor transparencia. Los resultados se publican automáticamente en la plataforma.'
        }
    ],
    pagos: [
        {
            question: '¿Qué métodos de pago aceptan?',
            answer: 'Aceptamos los siguientes métodos de pago:\n\n• Nequi\n• Daviplata\n• PayPal\n\nTodos los pagos son procesados de forma segura y encriptada.'
        },
        {
            question: '¿Es seguro pagar en RIFAS UBIA?',
            answer: 'Absolutamente. Utilizamos tecnología de encriptación de nivel bancario y todas las transacciones están protegidas. Nunca almacenamos información completa de tarjetas de crédito.'
        },
        {
            question: '¿Cuándo se confirma mi pago?',
            answer: 'Los pagos con Nequi y Daviplata se confirman casi instantáneamente. Los pagos con PayPal pueden tardar unos minutos. Recibirás una notificación cuando tu pago sea confirmado.'
        },
        {
            question: '¿Puedo obtener un comprobante?',
            answer: 'Sí, después de cada compra exitosa puedes descargar tu comprobante digital desde tu dashboard de comprador en la sección "Historial de Compras".'
        },
        {
            question: '¿Qué pasa si mi pago es rechazado?',
            answer: 'Si tu pago es rechazado, el número quedará disponible nuevamente. Te notificaremos el motivo del rechazo y podrás intentar con otro método de pago.'
        }
    ],
    cuenta: [
        {
            question: '¿Cómo me registro en RIFAS UBIA?',
            answer: 'Haz clic en "Registrarse" en la parte superior de la página, completa el formulario con tus datos personales, verifica tu email y ¡listo! Ya puedes empezar a participar.'
        },
        {
            question: '¿Puedo cambiar mi información personal?',
            answer: 'Sí, puedes editar tu información personal en cualquier momento desde tu dashboard, sección "Mi Perfil".'
        },
        {
            question: '¿Cómo recupero mi contraseña?',
            answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Te enviaremos un enlace a tu email para restablecer tu contraseña.'
        },
        {
            question: '¿Puedo tener múltiples cuentas?',
            answer: 'Cada persona debe tener una sola cuenta. Las cuentas múltiples pueden resultar en la suspensión de todas tus cuentas.'
        }
    ],
    sorteos: [
        {
            question: '¿Cómo se realizan los sorteos?',
            answer: 'Los sorteos se realizan de forma automática en la fecha programada. Utilizamos sistemas de generación aleatoria verificables y, cuando es posible, integramos con loterías oficiales para mayor transparencia.'
        },
        {
            question: '¿Cómo sé si gané?',
            answer: 'Si eres ganador, recibirás una notificación automática por email y en la plataforma. También puedes verificar los resultados en la página de la rifa.'
        },
        {
            question: '¿Cuándo se entregan los premios?',
            answer: 'La entrega del premio se coordina directamente con el organizador de la rifa. Generalmente, el contacto se realiza dentro de las 48 horas posteriores al sorteo.'
        },
        {
            question: '¿Los sorteos son transparentes?',
            answer: 'Sí, todos los sorteos son 100% transparentes. Puedes verificar el proceso completo y los resultados están disponibles públicamente en la plataforma.'
        }
    ],
    tecnico: [
        {
            question: 'La página no carga correctamente',
            answer: 'Intenta:\n\n1. Refrescar la página (Ctrl+F5 o Cmd+Shift+R)\n2. Limpiar la caché de tu navegador\n3. Verificar tu conexión a internet\n4. Probar en otro navegador\n\nSi el problema persiste, contáctanos.'
        },
        {
            question: 'No puedo iniciar sesión',
            answer: 'Verifica que:\n\n1. Tu email y contraseña sean correctos\n2. Tu cuenta esté verificada\n3. No tengas bloqueadores de cookies activos\n\nSi olvidaste tu contraseña, usa la opción de recuperación.'
        },
        {
            question: 'No recibo los emails de confirmación',
            answer: 'Revisa tu carpeta de spam. Si no encuentras el email, verifica que la dirección esté correcta en tu perfil. También puedes solicitar un nuevo email de verificación.'
        },
        {
            question: 'El pago no se procesa',
            answer: 'Verifica que:\n\n1. Tu método de pago tenga fondos suficientes\n2. Los datos ingresados sean correctos\n3. Tu conexión a internet sea estable\n\nSi el problema persiste, contáctanos con el número de transacción.'
        }
    ]
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAllFAQs();
    initSearch();
});

// Load all FAQs
function loadAllFAQs() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    
    let allFAQs = [];
    Object.keys(faqData).forEach(category => {
        faqData[category].forEach((faq, index) => {
            allFAQs.push({ ...faq, category, id: `${category}-${index}` });
        });
    });
    
    renderFAQs(allFAQs);
}

// Render FAQs
function renderFAQs(faqs) {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    
    faqList.innerHTML = '';
    
    faqs.forEach(faq => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
            <div class="faq-question" onclick="toggleFAQ('${faq.id}')">
                <h3>${faq.question}</h3>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer" id="answer-${faq.id}">
                <p>${faq.answer.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        faqList.appendChild(faqItem);
    });
}

// Toggle FAQ
function toggleFAQ(id) {
    const answer = document.getElementById(`answer-${id}`);
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

// Show category
function showCategory(category) {
    const categoryFAQs = faqData[category] || [];
    const faqList = document.getElementById('faqList');
    
    if (!faqList) return;
    
    faqList.innerHTML = '';
    
    if (categoryFAQs.length === 0) {
        faqList.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No hay preguntas en esta categoría aún.</p>';
        return;
    }
    
    categoryFAQs.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
            <div class="faq-question" onclick="toggleFAQ('${category}-${index}')">
                <h3>${faq.question}</h3>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer" id="answer-${category}-${index}">
                <p>${faq.answer.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        faqList.appendChild(faqItem);
    });
    
    // Scroll to FAQs
    faqList.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('helpSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            loadAllFAQs();
            return;
        }
        
        // Search in all FAQs
        let results = [];
        Object.keys(faqData).forEach(category => {
            faqData[category].forEach((faq, index) => {
                if (faq.question.toLowerCase().includes(query) || 
                    faq.answer.toLowerCase().includes(query)) {
                    results.push({ ...faq, category, id: `${category}-${index}` });
                }
            });
        });
        
        if (results.length === 0) {
            const faqList = document.getElementById('faqList');
            if (faqList) {
                faqList.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">No se encontraron resultados para "${query}"</p>
                        <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.5rem;">Intenta con otras palabras clave</p>
                    </div>
                `;
            }
        } else {
            renderFAQs(results);
        }
    });
}

// Export functions
window.toggleFAQ = toggleFAQ;
window.showCategory = showCategory;
