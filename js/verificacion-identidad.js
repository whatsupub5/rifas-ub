// ========== IDENTITY VERIFICATION SYSTEM ==========

/**
 * Sistema de Verificación de Identidad (KYC)
 * 
 * Pasos de verificación:
 * 1. Email
 * 2. Teléfono
 * 3. Documento de identidad
 * 4. Selfie con documento
 * 5. Reconocimiento facial
 * 6. Cuenta bancaria
 * 7. Tarjeta bancaria
 */

let currentStream = null;
let emailVerificationCode = null;
let phoneVerificationCode = null;

// Initialize verification page
document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    loadVerificationStatus(user.id);
    document.getElementById('userEmail').textContent = user.email || 'No registrado';
});

// ========== VERIFICATION STATUS ==========

function loadVerificationStatus(userId) {
    const verification = getVerificationData(userId);
    updateVerificationBanner(verification);
    updateProgress(verification);
    updateStepStatuses(verification);
}

function getVerificationData(userId) {
    const verifications = JSON.parse(localStorage.getItem('userVerifications') || '{}');
    return verifications[userId] || {
        email: { verified: false, date: null },
        phone: { verified: false, date: null, number: null },
        document: { verified: false, date: null, documentType: null, documentNumber: null },
        selfie: { verified: false, date: null },
        facial: { verified: false, date: null },
        bank: { verified: false, date: null, accountNumber: null },
        card: { verified: false, date: null, last4: null, cardType: null, brand: null },
        overallStatus: 'pending' // pending, in_progress, completed, rejected
    };
}

function saveVerificationData(userId, verification) {
    const verifications = JSON.parse(localStorage.getItem('userVerifications') || '{}');
    verifications[userId] = verification;
    localStorage.setItem('userVerifications', JSON.stringify(verifications));
}

function updateVerificationBanner(verification) {
    const banner = document.getElementById('verificationBanner');
    const completed = getCompletedSteps(verification);
    const total = 7;
    
    let status, icon, title, message;
    
    if (completed === total) {
        status = 'complete';
        icon = 'fa-check-circle';
        title = 'Verificación Completada';
        message = 'Tu identidad ha sido verificada exitosamente.';
    } else if (completed > 0) {
        status = 'in-progress';
        icon = 'fa-clock';
        title = 'Verificación en Progreso';
        message = `Has completado ${completed} de ${total} pasos.`;
    } else {
        status = 'pending';
        icon = 'fa-exclamation-circle';
        title = 'Verificación Pendiente';
        message = 'Completa la verificación de identidad para participar en rifas.';
    }
    
    banner.className = `verification-banner ${status}`;
    banner.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="verification-banner-content">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

function updateProgress(verification) {
    const completed = getCompletedSteps(verification);
    const total = 7;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${percentage}% Completado (${completed}/${total} pasos)`;
}

function getCompletedSteps(verification) {
    let count = 0;
    if (verification.email?.verified) count++;
    if (verification.phone?.verified) count++;
    if (verification.document?.verified) count++;
    if (verification.selfie?.verified) count++;
    if (verification.facial?.verified) count++;
    if (verification.bank?.verified) count++;
    if (verification.card?.verified) count++;
    return count;
}

function updateStepStatuses(verification) {
    updateStepStatus('Email', verification.email?.verified);
    updateStepStatus('Phone', verification.phone?.verified);
    updateStepStatus('Document', verification.document?.verified);
    updateStepStatus('Selfie', verification.selfie?.verified);
    updateStepStatus('Facial', verification.facial?.verified);
    updateStepStatus('Bank', verification.bank?.verified);
    updateStepStatus('Card', verification.card?.verified);
}

function updateStepStatus(stepName, verified) {
    const step = document.getElementById(`step${stepName}`);
    const status = document.getElementById(`status${stepName}`);
    
    if (verified) {
        step.classList.add('completed');
        step.classList.remove('pending', 'in-progress');
        status.className = 'step-status completed';
        status.innerHTML = '<i class="fas fa-check-circle"></i> Verificado';
    } else {
        step.classList.remove('completed');
        step.classList.add('pending');
        status.className = 'step-status pending';
        status.innerHTML = '<i class="fas fa-clock"></i> Pendiente';
    }
}

// ========== EMAIL VERIFICATION ==========

function sendEmailVerification() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;
    
    if (!email) {
        showToast('No hay email registrado', 'error');
        return;
    }
    
    // Generate 6-digit code
    emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send email via API
    console.log('Email verification code:', emailVerificationCode);
    
    // Show code input
    document.getElementById('emailCodeSection').style.display = 'block';
    
    showToast(`Código de verificación enviado a ${email}`, 'success');
    showToast(`Código de prueba: ${emailVerificationCode}`, 'info');
}

function verifyEmailCode() {
    const code = document.getElementById('emailCode').value;
    
    if (!code || code.length !== 6) {
        showToast('Ingresa un código válido de 6 dígitos', 'error');
        return;
    }
    
    if (code !== emailVerificationCode) {
        showToast('Código incorrecto', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    verification.email = {
        verified: true,
        date: new Date().toISOString()
    };
    
    saveVerificationData(user.id, verification);
    loadVerificationStatus(user.id);
    
    showToast('Email verificado exitosamente', 'success');
    checkVerificationComplete(verification);
}

// ========== PHONE VERIFICATION ==========

function sendPhoneVerification() {
    const phone = document.getElementById('phoneNumber').value;
    
    if (!phone || phone.length < 10) {
        showToast('Ingresa un número de teléfono válido', 'error');
        return;
    }
    
    // Generate 6-digit code
    phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send SMS via API
    console.log('Phone verification code:', phoneVerificationCode);
    
    // Show code input
    document.getElementById('phoneCodeSection').style.display = 'block';
    
    showToast(`Código SMS enviado a ${phone}`, 'success');
    showToast(`Código de prueba: ${phoneVerificationCode}`, 'info');
}

function verifyPhoneCode() {
    const code = document.getElementById('phoneCode').value;
    const phone = document.getElementById('phoneNumber').value;
    
    if (!code || code.length !== 6) {
        showToast('Ingresa un código válido de 6 dígitos', 'error');
        return;
    }
    
    if (code !== phoneVerificationCode) {
        showToast('Código incorrecto', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    verification.phone = {
        verified: true,
        date: new Date().toISOString(),
        number: phone
    };
    
    saveVerificationData(user.id, verification);
    loadVerificationStatus(user.id);
    
    showToast('Teléfono verificado exitosamente', 'success');
    checkVerificationComplete(verification);
}

// ========== DOCUMENT VERIFICATION ==========

let documentScanStream = null;
let extractedDocumentData = null;

function startDocumentScan() {
    // Validate form data first
    const documentType = document.getElementById('documentType').value;
    const documentNumber = document.getElementById('documentNumber').value;
    const firstName = document.getElementById('documentFirstName').value;
    const lastName = document.getElementById('documentLastName').value;
    const birthDate = document.getElementById('documentBirthDate').value;
    const nationality = document.getElementById('documentNationality').value;
    
    if (!documentType || !documentNumber || !firstName || !lastName || !birthDate || !nationality) {
        showToast('Completa todos los campos del formulario', 'error');
        return;
    }
    
    // Hide form, show scan area
    document.getElementById('documentDataForm').style.display = 'none';
    document.getElementById('documentScanArea').style.display = 'block';
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment', // Use back camera for documents
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    })
        .then(stream => {
            documentScanStream = stream;
            const video = document.getElementById('documentVideo');
            video.srcObject = stream;
            video.style.display = 'block';
            document.getElementById('documentPlaceholder').style.display = 'none';
            document.getElementById('documentOverlay').style.display = 'block';
            document.getElementById('documentCaptureControls').style.display = 'flex';
            
            // Start quality check
            checkDocumentQuality();
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            showToast('Error al acceder a la cámara. Asegúrate de otorgar los permisos.', 'error');
        });
}

function checkDocumentQuality() {
    const video = document.getElementById('documentVideo');
    const qualityIndicator = document.getElementById('documentQualityIndicator');
    
    // Simulate quality check (in production, use image processing)
    const checkInterval = setInterval(() => {
        if (!documentScanStream) {
            clearInterval(checkInterval);
            return;
        }
        
        // Simulate quality detection
        const quality = Math.random() > 0.3 ? 'good' : 'warning'; // 70% chance of good quality
        
        if (quality === 'good') {
            qualityIndicator.className = 'document-quality-indicator';
            qualityIndicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Documento bien encuadrado</span>';
        } else {
            qualityIndicator.className = 'document-quality-indicator warning';
            qualityIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Ajusta la posición del documento</span>';
        }
    }, 1000);
}

function captureDocument() {
    const video = document.getElementById('documentVideo');
    const canvas = document.getElementById('documentCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('documentPreviewImg').src = imageData;
    
    // Stop camera
    stopDocumentScan();
    
    // Hide scan area, show preview
    document.getElementById('documentScanArea').style.display = 'none';
    document.getElementById('documentPreview').style.display = 'block';
    
    // Extract data from document (simulate OCR)
    extractDocumentData(imageData);
}

function extractDocumentData(imageData) {
    // Simulate OCR processing
    showToast('Extrayendo datos del documento...', 'info');
    
    setTimeout(() => {
        // Simulate extracted data (in production, use OCR API like Tesseract, Google Vision, etc.)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const documentType = document.getElementById('documentType').value;
        const documentNumber = document.getElementById('documentNumber').value;
        const firstName = document.getElementById('documentFirstName').value;
        const lastName = document.getElementById('documentLastName').value;
        const birthDate = document.getElementById('documentBirthDate').value;
        const nationality = document.getElementById('documentNationality').value;
        
        // Simulate OCR extraction with slight variations to test matching
        extractedDocumentData = {
            documentType: documentType, // Match
            documentNumber: documentNumber, // Match
            firstName: firstName.toUpperCase(), // Normalize
            lastName: lastName.toUpperCase(), // Normalize
            birthDate: birthDate, // Match
            nationality: nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase() // Normalize
        };
        
        // Show verification results
        compareDocumentData();
    }, 2000);
}

function compareDocumentData() {
    const userData = {
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        firstName: document.getElementById('documentFirstName').value.toUpperCase(),
        lastName: document.getElementById('documentLastName').value.toUpperCase(),
        birthDate: document.getElementById('documentBirthDate').value,
        nationality: document.getElementById('documentNationality').value.charAt(0).toUpperCase() + 
                     document.getElementById('documentNationality').value.slice(1).toLowerCase()
    };
    
    const comparisons = [
        { field: 'Tipo de Documento', userValue: userData.documentType, extractedValue: extractedDocumentData.documentType },
        { field: 'Número de Documento', userValue: userData.documentNumber, extractedValue: extractedDocumentData.documentNumber },
        { field: 'Nombre', userValue: userData.firstName, extractedValue: extractedDocumentData.firstName },
        { field: 'Apellidos', userValue: userData.lastName, extractedValue: extractedDocumentData.lastName },
        { field: 'Fecha de Nacimiento', userValue: userData.birthDate, extractedValue: extractedDocumentData.birthDate },
        { field: 'Nacionalidad', userValue: userData.nationality, extractedValue: extractedDocumentData.nationality }
    ];
    
    let allMatch = true;
    const comparisonTable = document.getElementById('verificationComparisonTable');
    comparisonTable.innerHTML = '';
    
    comparisons.forEach(comp => {
        const match = comp.userValue === comp.extractedValue;
        if (!match) allMatch = false;
        
        const row = document.createElement('div');
        row.className = `verification-row ${match ? 'match' : 'mismatch'}`;
        row.innerHTML = `
            <div class="field-label">${comp.field}</div>
            <div class="field-value">${comp.userValue}</div>
            <div class="field-status ${match ? 'match' : 'mismatch'}">
                ${match 
                    ? '<i class="fas fa-check-circle"></i><span>Coincide</span>' 
                    : '<i class="fas fa-times-circle"></i><span>No coincide</span>'
                }
            </div>
        `;
        comparisonTable.appendChild(row);
    });
    
    // Show summary
    const summary = document.createElement('div');
    summary.className = `verification-summary ${allMatch ? 'success' : 'error'}`;
    summary.innerHTML = allMatch
        ? '<i class="fas fa-check-circle"></i><strong>Todos los datos coinciden correctamente</strong>'
        : '<i class="fas fa-exclamation-triangle"></i><strong>Algunos datos no coinciden. Por favor, verifica la información.</strong>';
    comparisonTable.appendChild(summary);
    
    // Show verification results
    document.getElementById('documentVerificationResults').style.display = 'block';
    
    // Enable/disable submit button
    const submitBtn = document.getElementById('submitDocumentBtn');
    if (allMatch) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-outline');
        submitBtn.classList.add('btn-primary');
        showToast('Todos los datos coinciden. Puedes confirmar el documento.', 'success');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-outline');
        showToast('Algunos datos no coinciden. Verifica la información ingresada.', 'warning');
    }
}

function verifyDocumentData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    
    // Get user entered data
    const documentData = {
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        firstName: document.getElementById('documentFirstName').value,
        lastName: document.getElementById('documentLastName').value,
        birthDate: document.getElementById('documentBirthDate').value,
        nationality: document.getElementById('documentNationality').value,
        image: document.getElementById('documentPreviewImg').src,
        extractedData: extractedDocumentData,
        userId: user.id,
        timestamp: new Date().toISOString()
    };
    
    updateStepStatus('Document', false);
    document.getElementById('statusDocument').className = 'step-status verifying';
    document.getElementById('statusDocument').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    // Simulate verification (in production, this would be an API call)
    setTimeout(() => {
        verification.document = {
            verified: true,
            date: new Date().toISOString(),
            documentType: documentData.documentType,
            documentNumber: documentData.documentNumber,
            firstName: documentData.firstName,
            lastName: documentData.lastName,
            birthDate: documentData.birthDate,
            nationality: documentData.nationality,
            dataMatch: true
        };
        
        saveVerificationData(user.id, verification);
        loadVerificationStatus(user.id);
        
        showToast('Documento verificado exitosamente', 'success');
        checkVerificationComplete(verification);
    }, 2000);
}

function stopDocumentScan() {
    if (documentScanStream) {
        documentScanStream.getTracks().forEach(track => track.stop());
        documentScanStream = null;
    }
    
    document.getElementById('documentVideo').style.display = 'none';
    document.getElementById('documentOverlay').style.display = 'none';
    document.getElementById('documentPlaceholder').style.display = 'flex';
}

function retakeDocument() {
    document.getElementById('documentPreview').style.display = 'none';
    document.getElementById('documentVerificationResults').style.display = 'none';
    document.getElementById('documentDataForm').style.display = 'block';
    extractedDocumentData = null;
    
    // Reset form
    document.getElementById('documentType').value = '';
    document.getElementById('documentNumber').value = '';
    document.getElementById('documentFirstName').value = '';
    document.getElementById('documentLastName').value = '';
    document.getElementById('documentBirthDate').value = '';
    document.getElementById('documentNationality').value = '';
}

window.startDocumentScan = startDocumentScan;
window.captureDocument = captureDocument;
window.stopDocumentScan = stopDocumentScan;
window.verifyDocumentData = verifyDocumentData;

// ========== SELFIE VERIFICATION ==========

function startSelfieCapture() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            currentStream = stream;
            const video = document.getElementById('selfieVideo');
            video.srcObject = stream;
            video.style.display = 'block';
            document.getElementById('cameraPlaceholder').style.display = 'none';
            
            // Add capture button
            const controls = document.createElement('div');
            controls.className = 'camera-controls';
            controls.innerHTML = `
                <button class="capture-button" onclick="captureSelfie()">
                    <i class="fas fa-camera"></i>
                </button>
                <button class="cancel-button" onclick="stopSelfieCapture()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            document.getElementById('selfieCaptureArea').appendChild(controls);
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            showToast('Error al acceder a la cámara', 'error');
        });
}

function captureSelfie() {
    const video = document.getElementById('selfieVideo');
    const canvas = document.getElementById('selfieCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    document.getElementById('selfiePreviewImg').src = imageData;
    
    stopSelfieCapture();
    document.getElementById('selfiePreview').style.display = 'block';
}

function stopSelfieCapture() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    document.getElementById('selfieVideo').style.display = 'none';
    document.getElementById('cameraPlaceholder').style.display = 'flex';
    document.querySelector('.camera-controls')?.remove();
}

function retakeSelfie() {
    document.getElementById('selfiePreview').style.display = 'none';
    startSelfieCapture();
}

function submitSelfie() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    
    // In production, send to verification API
    const selfieData = {
        image: document.getElementById('selfiePreviewImg').src,
        documentImage: document.getElementById('documentPreviewImg')?.src,
        userId: user.id,
        timestamp: new Date().toISOString()
    };
    
    // Simulate verification
    setTimeout(() => {
        verification.selfie = {
            verified: true,
            date: new Date().toISOString()
        };
        
        saveVerificationData(user.id, verification);
        loadVerificationStatus(user.id);
        
        showToast('Selfie verificado exitosamente', 'success');
        checkVerificationComplete(verification);
    }, 2000);
    
    updateStepStatus('Selfie', false);
    document.getElementById('statusSelfie').className = 'step-status verifying';
    document.getElementById('statusSelfie').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
}

// ========== FACIAL RECOGNITION ==========

let facialScanStep = 0;
let facialCaptures = [];
const facialScanSteps = [
    { name: 'Al frente', icon: 'fa-arrow-up', instruction: 'Mira directamente a la cámara', subtext: 'Mantén tu rostro centrado y estable' },
    { name: 'Izquierda', icon: 'fa-arrow-left', instruction: 'Voltea tu rostro hacia la izquierda', subtext: 'Gira aproximadamente 45 grados a la izquierda' },
    { name: 'Derecha', icon: 'fa-arrow-right', instruction: 'Voltea tu rostro hacia la derecha', subtext: 'Gira aproximadamente 45 grados a la derecha' },
    { name: 'Arriba', icon: 'fa-arrow-up', instruction: 'Mira hacia arriba', subtext: 'Levanta tu mentón ligeramente' },
    { name: 'Abajo', icon: 'fa-arrow-down', instruction: 'Mira hacia abajo', subtext: 'Baja tu mentón ligeramente' }
];

function startFacialScan() {
    facialScanStep = 0;
    facialCaptures = [];
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
        } 
    })
        .then(stream => {
            currentStream = stream;
            const video = document.getElementById('facialVideo');
            video.srcObject = stream;
            video.style.display = 'block';
            
            // Hide initial UI
            document.getElementById('scanPlaceholder').style.display = 'none';
            document.getElementById('facialInitialInstructions').style.display = 'none';
            
            // Show scan progress and active instructions
            document.getElementById('facialScanProgress').style.display = 'block';
            document.getElementById('facialActiveInstructions').style.display = 'block';
            document.getElementById('facialOverlay').style.display = 'block';
            document.getElementById('facialPreview').style.display = 'none';
            
            // Start first step
            startFacialScanStep();
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            showToast('Error al acceder a la cámara. Asegúrate de otorgar los permisos.', 'error');
        });
}

function startFacialScanStep() {
    if (facialScanStep >= facialScanSteps.length) {
        completeFacialScan();
        return;
    }
    
    const step = facialScanSteps[facialScanStep];
    
    // Update step indicator
    document.querySelectorAll('.scan-step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index < facialScanStep) {
            el.classList.add('completed');
        } else if (index === facialScanStep) {
            el.classList.add('active');
        }
    });
    
    // Update instructions
    const iconElement = document.getElementById('facialInstructionIcon');
    const textElement = document.getElementById('facialInstructionText');
    const subtextElement = document.getElementById('facialInstructionSubtext');
    
    iconElement.innerHTML = `<i class="fas ${step.icon}"></i>`;
    textElement.textContent = step.instruction;
    subtextElement.textContent = step.subtext;
    
    // Show countdown and capture
    setTimeout(() => {
        showCountdown(() => {
            captureFacialStep(step);
        });
    }, 2000); // Wait 2 seconds for user to position
}

function showCountdown(callback) {
    const countdownEl = document.getElementById('facialCountdown');
    const countdownNumber = document.getElementById('countdownNumber');
    countdownEl.style.display = 'flex';
    
    let count = 3;
    countdownNumber.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
        } else {
            countdownNumber.textContent = '✓';
            clearInterval(countdownInterval);
            setTimeout(() => {
                countdownEl.style.display = 'none';
                callback();
            }, 500);
        }
    }, 1000);
}

function captureFacialStep(step) {
    const video = document.getElementById('facialVideo');
    const canvas = document.getElementById('facialCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Save capture
    facialCaptures.push({
        step: facialScanStep,
        name: step.name,
        image: imageData,
        timestamp: new Date().toISOString()
    });
    
    // Mark step as completed
    const stepElements = document.querySelectorAll('.scan-step');
    if (stepElements[facialScanStep]) {
        stepElements[facialScanStep].classList.remove('active');
        stepElements[facialScanStep].classList.add('completed');
    }
    
    // Move to next step
    facialScanStep++;
    
    if (facialScanStep < facialScanSteps.length) {
        setTimeout(() => {
            startFacialScanStep();
        }, 1500); // Wait 1.5 seconds before next step
    } else {
        completeFacialScan();
    }
}

function completeFacialScan() {
    stopFacialScan();
    
    // Hide active scan UI
    document.getElementById('facialScanProgress').style.display = 'none';
    document.getElementById('facialActiveInstructions').style.display = 'none';
    document.getElementById('facialOverlay').style.display = 'none';
    
    // Show captures preview
    const capturesGrid = document.getElementById('facialCapturesGrid');
    capturesGrid.innerHTML = facialCaptures.map(capture => `
        <div class="facial-capture-item">
            <img src="${capture.image}" alt="${capture.name}">
            <div class="capture-label">${capture.name}</div>
        </div>
    `).join('');
    
    document.getElementById('facialPreview').style.display = 'block';
    
    showToast('Escaneo facial completado. Revisa las capturas y confirma.', 'success');
}

function stopFacialScan() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    document.getElementById('facialVideo').style.display = 'none';
    document.getElementById('facialOverlay').style.display = 'none';
}

function retakeFacial() {
    document.getElementById('facialPreview').style.display = 'none';
    document.getElementById('facialInitialInstructions').style.display = 'block';
    facialScanStep = 0;
    facialCaptures = [];
    startFacialScan();
}

function submitFacialScan() {
    if (facialCaptures.length < 5) {
        showToast('Debes completar todas las posiciones del escaneo', 'warning');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    
    // In production, send all captures to facial recognition API
    const facialData = {
        captures: facialCaptures,
        selfieImage: document.getElementById('selfiePreviewImg')?.src,
        userId: user.id,
        timestamp: new Date().toISOString()
    };
    
    // Simulate facial recognition verification
    updateStepStatus('Facial', false);
    document.getElementById('statusFacial').className = 'step-status verifying';
    document.getElementById('statusFacial').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    setTimeout(() => {
        verification.facial = {
            verified: true,
            date: new Date().toISOString(),
            matchScore: 0.95, // Would come from API
            capturesCount: facialCaptures.length,
            verificationMethod: 'active_scan' // Indicates active movement verification
        };
        
        saveVerificationData(user.id, verification);
        loadVerificationStatus(user.id);
        
        showToast('Reconocimiento facial activo completado exitosamente', 'success');
        checkVerificationComplete(verification);
    }, 3000);
}

// ========== BANK ACCOUNT VERIFICATION ==========

function verifyBankAccount() {
    const accountType = document.getElementById('accountType').value;
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const accountHolder = document.getElementById('accountHolder').value;
    const accountHolderDoc = document.getElementById('accountHolderDoc').value;
    
    if (!accountType || !bankName || !accountNumber || !accountHolder || !accountHolderDoc) {
        showToast('Completa todos los campos', 'error');
        return;
    }
    
    // Validate IBAN format (basic)
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/;
    const cleanIban = accountNumber.replace(/\s/g, '');
    
    if (!ibanRegex.test(cleanIban)) {
        showToast('Formato de IBAN inválido', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const verification = getVerificationData(user.id);
    
    // In production, verify with bank API or micro-deposit verification
    updateStepStatus('Bank', false);
    document.getElementById('statusBank').className = 'step-status verifying';
    document.getElementById('statusBank').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    // Simulate bank verification (in production, this would be an API call)
    setTimeout(() => {
        verification.bank = {
            verified: true,
            date: new Date().toISOString(),
            accountType: accountType,
            bankName: bankName,
            accountNumber: cleanIban.substring(0, 4) + '****' + cleanIban.substring(cleanIban.length - 4), // Masked
            accountHolder: accountHolder
        };
        
        saveVerificationData(user.id, verification);
        loadVerificationStatus(user.id);
        
        showToast('Cuenta bancaria verificada exitosamente', 'success');
        checkVerificationComplete(verification);
    }, 3000);
}

// ========== COMPLETE VERIFICATION ==========

function checkVerificationComplete(verification) {
    const completed = getCompletedSteps(verification);
    
    if (completed === 6) {
        verification.overallStatus = 'completed';
        saveVerificationData(JSON.parse(localStorage.getItem('user') || '{}').id, verification);
        
        setTimeout(() => {
            document.querySelector('.verification-steps-container').style.display = 'none';
            document.getElementById('verificationComplete').style.display = 'block';
        }, 1000);
    }
}

// ========== EXPORTS ==========

window.sendEmailVerification = sendEmailVerification;
window.verifyEmailCode = verifyEmailCode;
window.sendPhoneVerification = sendPhoneVerification;
window.verifyPhoneCode = verifyPhoneCode;
window.retakeDocument = retakeDocument;
window.startSelfieCapture = startSelfieCapture;
window.captureSelfie = captureSelfie;
window.stopSelfieCapture = stopSelfieCapture;
window.retakeSelfie = retakeSelfie;
window.submitSelfie = submitSelfie;
window.startFacialScan = startFacialScan;
window.captureFacial = captureFacial;
window.stopFacialScan = stopFacialScan;
window.retakeFacial = retakeFacial;
window.submitFacialScan = submitFacialScan;
window.verifyBankAccount = verifyBankAccount;

// ========== CREDIT CARD VERIFICATION ==========

// Algoritmo de Luhn para validar número de tarjeta
function luhnCheck(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    // Recorrer de derecha a izquierda
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Detectar tipo de tarjeta por BIN
function detectCardBrand(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^3[0689]/.test(cleaned)) return 'diners';
    if (/^35(?:2[89]|[3-8][0-9])/.test(cleaned)) return 'jcb';
    
    return 'unknown';
}

// Formatear número de tarjeta con espacios
function formatCardNumber(event) {
    let input = event.target;
    let value = input.value.replace(/\s/g, '');
    
    // Solo permitir números
    value = value.replace(/\D/g, '');
    
    // Agregar espacios cada 4 dígitos
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    
    // Limitar según tipo de tarjeta
    const brand = detectCardBrand(value);
    let maxLength = 19; // Default (4 grupos de 4)
    
    if (brand === 'amex') {
        maxLength = 17; // 4-6-5
        formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        if (value.length > 4) {
            formatted = value.slice(0, 4) + ' ' + (value.slice(4).match(/.{1,6}/g)?.join(' ') || value.slice(4));
        }
    }
    
    input.value = formatted.slice(0, maxLength);
    
    // Detectar y mostrar tipo de tarjeta
    detectCardType();
}

// Detectar y mostrar tipo de tarjeta
function detectCardType() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const iconContainer = document.getElementById('cardTypeIcon');
    
    if (cardNumber.length < 6) {
        iconContainer.innerHTML = '';
        return;
    }
    
    const brand = detectCardBrand(cardNumber);
    const icons = {
        visa: '<i class="fab fa-cc-visa" style="color: #1A1F71;"></i>',
        mastercard: '<i class="fab fa-cc-mastercard" style="color: #EB001B;"></i>',
        amex: '<i class="fab fa-cc-amex" style="color: #006FCF;"></i>',
        discover: '<i class="fab fa-cc-discover" style="color: #FF6000;"></i>',
        diners: '<i class="fab fa-cc-diners-club" style="color: #0079BE;"></i>',
        jcb: '<i class="fab fa-cc-jcb" style="color: #003A8F;"></i>',
        unknown: '<i class="fas fa-credit-card" style="color: var(--text-secondary);"></i>'
    };
    
    iconContainer.innerHTML = icons[brand] || icons.unknown;
}

// Validar número de tarjeta
function validateCardNumber() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const errorElement = document.getElementById('cardNumberError');
    
    if (!cardNumber) {
        errorElement.style.display = 'none';
        return false;
    }
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        errorElement.textContent = 'El número de tarjeta debe tener entre 13 y 19 dígitos';
        errorElement.style.display = 'block';
        return false;
    }
    
    if (!luhnCheck(cardNumber)) {
        errorElement.textContent = 'Número de tarjeta inválido';
        errorElement.style.display = 'block';
        return false;
    }
    
    errorElement.style.display = 'none';
    return true;
}

// Formatear fecha de expiración MM/AA
function formatExpiry(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    input.value = value;
}

// Validar fecha de expiración
function validateExpiry() {
    const expiry = document.getElementById('cardExpiry').value;
    const errorElement = document.getElementById('expiryError');
    
    if (!expiry) {
        errorElement.style.display = 'none';
        return false;
    }
    
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
        errorElement.textContent = 'Formato inválido. Usa MM/AA';
        errorElement.style.display = 'block';
        return false;
    }
    
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    
    if (month < 1 || month > 12) {
        errorElement.textContent = 'Mes inválido (01-12)';
        errorElement.style.display = 'block';
        return false;
    }
    
    const now = new Date();
    const expiryDate = new Date(year, month, 0); // Último día del mes
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (expiryDate < currentDate) {
        errorElement.textContent = 'La tarjeta ha expirado';
        errorElement.style.display = 'block';
        return false;
    }
    
    errorElement.style.display = 'none';
    return true;
}

// Validar CVV mientras se escribe
function validateCVV(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    input.value = value;
}

// Validar CVV al perder foco
function validateCVVInput() {
    const cvv = document.getElementById('cardCVV').value;
    const errorElement = document.getElementById('cvvError');
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const brand = detectCardBrand(cardNumber);
    
    if (!cvv) {
        errorElement.style.display = 'none';
        return false;
    }
    
    // Amex usa CVV de 4 dígitos, otros usan 3
    const requiredLength = brand === 'amex' ? 4 : 3;
    
    if (cvv.length !== requiredLength) {
        errorElement.textContent = brand === 'amex' 
            ? 'CVV debe tener 4 dígitos' 
            : 'CVV debe tener 3 dígitos';
        errorElement.style.display = 'block';
        return false;
    }
    
    if (!/^\d+$/.test(cvv)) {
        errorElement.textContent = 'CVV solo puede contener números';
        errorElement.style.display = 'block';
        return false;
    }
    
    errorElement.style.display = 'none';
    return true;
}

// Verificar tarjeta de crédito
function verifyCreditCard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        showToast('Usuario no identificado', 'error');
        return;
    }
    
    const cardType = document.getElementById('cardType').value;
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    const cardHolder = document.getElementById('cardHolder').value.trim();
    
    // Validaciones
    if (!cardType) {
        showToast('Selecciona el tipo de tarjeta', 'warning');
        return;
    }
    
    if (!validateCardNumber()) {
        showToast('Número de tarjeta inválido', 'error');
        return;
    }
    
    if (!validateExpiry()) {
        showToast('Fecha de expiración inválida', 'error');
        return;
    }
    
    if (!validateCVVInput()) {
        showToast('CVV inválido', 'error');
        return;
    }
    
    if (!cardHolder || cardHolder.length < 3) {
        showToast('Ingresa el nombre del titular de la tarjeta', 'warning');
        return;
    }
    
    // Obtener datos de verificación
    const verification = getVerificationData(user.id);
    
    // In production, verify with payment processor API (Stripe, etc.)
    updateStepStatus('Card', false);
    document.getElementById('statusCard').className = 'step-status verifying';
    document.getElementById('statusCard').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    const statusContainer = document.getElementById('cardVerificationStatus');
    statusContainer.innerHTML = '<div style="color: var(--text-secondary);"><i class="fas fa-info-circle"></i> Verificando tarjeta...</div>';
    
    // Simular verificación de tarjeta (en producción, esto sería una llamada API)
    setTimeout(() => {
        const last4 = cardNumber.slice(-4);
        const brand = detectCardBrand(cardNumber);
        
        verification.card = {
            verified: true,
            date: new Date().toISOString(),
            last4: last4,
            cardType: cardType,
            brand: brand,
            holderName: cardHolder.toUpperCase(),
            expiryMonth: cardExpiry.split('/')[0],
            expiryYear: '20' + cardExpiry.split('/')[1]
        };
        
        saveVerificationData(user.id, verification);
        updateStepStatus('Card', true);
        
        statusContainer.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #10b981;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <strong style="color: #10b981; margin-left: 0.5rem;">Tarjeta verificada exitosamente</strong>
                <p style="margin: 0.5rem 0 0; color: var(--text-secondary);">
                    Tarjeta terminada en ****${last4} verificada correctamente.
                </p>
            </div>
        `;
        
        // Actualizar progreso y verificar si está completo
        updateProgress(verification);
        updateVerificationBanner(verification);
        
        const completed = getCompletedSteps(verification);
        if (completed === 7) {
            verification.overallStatus = 'completed';
            saveVerificationData(user.id, verification);
            
            setTimeout(() => {
                document.getElementById('verificationComplete').style.display = 'block';
                document.querySelector('.verification-steps-container').style.display = 'none';
            }, 1000);
        }
        
        showToast('Tarjeta verificada exitosamente', 'success');
    }, 2000);
}

window.formatCardNumber = formatCardNumber;
window.validateCardNumber = validateCardNumber;
window.detectCardType = detectCardType;
window.formatExpiry = formatExpiry;
window.validateExpiry = validateExpiry;
window.validateCVV = validateCVV;
window.validateCVVInput = validateCVVInput;
window.verifyCreditCard = verifyCreditCard;

// Helper function to check if user is verified
window.isUserVerified = function(userId) {
    const verification = getVerificationData(userId);
    return verification.overallStatus === 'completed';
};

// Helper function to get verification status
window.getUserVerificationStatus = function(userId) {
    return getVerificationData(userId);
};

