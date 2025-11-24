// ========== AUTHENTICATION LOGIC ==========

// API Configuration
const API_URL = 'http://localhost:3000/api'; // Cambiar según tu backend

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Iniciando sesión...';
        submitBtn.disabled = true;

        try {
            // Simular llamada a API (reemplazar con tu API real)
            const response = await simulateLogin(email, password);
            
            if (response.success) {
                // Guardar datos del usuario
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                showToast('¡Inicio de sesión exitoso!', 'success');
                
                // Cerrar modal
                closeModal(document.getElementById('loginModal'));
                
                // Update admin panel link visibility
                if (window.checkAdminAccess) {
                    window.checkAdminAccess();
                }
                
                // Redirigir según el rol del usuario
                setTimeout(() => {
                    redirectByRole(response.user.role);
                }, 1000);
            } else {
                showToast(response.message || 'Email o contraseña incorrectos', 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            showToast('Error al iniciar sesión. Intenta de nuevo.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const phone = document.getElementById('registerPhone').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validaciones
        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        if (!acceptTerms) {
            showToast('Debes aceptar los términos y condiciones', 'error');
            return;
        }

        // Check if email is verified
        const emailVerified = document.getElementById('emailVerificationStatus').style.display !== 'none';
        if (!emailVerified) {
            showToast('Debes verificar tu correo electrónico antes de continuar', 'error');
            document.getElementById('emailVerificationRequired').style.display = 'block';
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Creando cuenta...';
        submitBtn.disabled = true;

        try {
            const userData = {
                firstName,
                lastName,
                email,
                password,
                phone,
                role: 'comprador', // Por defecto es comprador
                emailVerified: true
            };

            // Simular llamada a API
            const response = await simulateRegister(userData);
            
            if (response.success) {
                showToast('¡Cuenta creada exitosamente!', 'success');
                
                // Limpiar formulario
                registerForm.reset();
                resetEmailVerification();
                
                // Cerrar modal de registro y abrir login
                closeModal(document.getElementById('registerModal'));
                
                setTimeout(() => {
                    openModal(document.getElementById('loginModal'));
                    // Pre-llenar el email
                    document.getElementById('loginEmail').value = email;
                }, 500);
            } else {
                showToast(response.message || 'Error al crear la cuenta', 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showToast('Error al crear la cuenta. Intenta de nuevo.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== EMAIL VERIFICATION ==========

let emailVerificationCodes = {}; // Store verification codes temporarily

function checkEmailAvailability(email) {
    if (!email || !validateEmail(email)) {
        return;
    }
    
    const verifyBtn = document.getElementById('verifyEmailBtn');
    const verificationStatus = document.getElementById('emailVerificationStatus');
    const verificationPending = document.getElementById('emailVerificationPending');
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const emailExists = users.some(u => u.email === email);
    
    if (emailExists) {
        showToast('Este correo electrónico ya está registrado', 'error');
        verifyBtn.style.display = 'none';
        verificationStatus.style.display = 'none';
        verificationPending.style.display = 'none';
        return;
    }
    
    // Show verify button if email is valid and doesn't exist
    verifyBtn.style.display = 'inline-flex';
    verificationStatus.style.display = 'none';
    verificationPending.style.display = 'none';
}

function sendVerificationEmail() {
    const email = document.getElementById('registerEmail').value;
    
    if (!email || !validateEmail(email)) {
        showToast('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }
    
    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    emailVerificationCodes[email] = {
        code: verificationCode,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    
    // Show pending status
    document.getElementById('emailVerificationPending').style.display = 'flex';
    document.getElementById('emailVerificationStatus').style.display = 'none';
    document.getElementById('verifyEmailBtn').style.display = 'none';
    
    // In production, send email via API
    // For now, show code in console and prompt
    showToast(`Código de verificación enviado a ${email}`, 'success');
    
    // Show verification modal/prompt
    showEmailVerificationModal(email, verificationCode);
}

function showEmailVerificationModal(email, code) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'emailVerificationModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2><i class="fas fa-envelope"></i> Verificar Correo Electrónico</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <p>Se ha enviado un código de verificación a <strong>${email}</strong></p>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Ingresa el código de 6 dígitos que recibiste en tu correo.
                </p>
                
                <div class="form-group">
                    <label>Código de Verificación</label>
                    <input type="text" id="verificationCodeInput" class="form-control" 
                           placeholder="000000" maxlength="6" 
                           style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: 600;">
                    <small class="form-help" style="text-align: center; display: block; margin-top: 0.5rem;">
                        <strong>Código de prueba:</strong> ${code}
                    </small>
                </div>
                
                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="verifyEmailCode('${email}', '${code}')">
                        <i class="fas fa-check"></i> Verificar
                    </button>
                </div>
                
                <div style="margin-top: 1rem; text-align: center;">
                    <button type="button" class="btn-text" onclick="resendVerificationEmail('${email}')">
                        <i class="fas fa-redo"></i> Reenviar código
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('verificationCodeInput')?.focus();
    }, 100);
}

function verifyEmailCode(email, expectedCode) {
    const inputCode = document.getElementById('verificationCodeInput').value;
    
    if (!inputCode || inputCode.length !== 6) {
        showToast('Por favor, ingresa el código de 6 dígitos', 'error');
        return;
    }
    
    const storedCode = emailVerificationCodes[email];
    
    if (!storedCode || Date.now() > storedCode.expiresAt) {
        showToast('El código ha expirado. Solicita uno nuevo', 'error');
        delete emailVerificationCodes[email];
        resendVerificationEmail(email);
        return;
    }
    
    if (inputCode === storedCode.code || inputCode === expectedCode) {
        // Mark email as verified
        document.getElementById('emailVerificationStatus').style.display = 'flex';
        document.getElementById('emailVerificationPending').style.display = 'none';
        document.getElementById('emailVerificationRequired').style.display = 'none';
        document.getElementById('registerSubmitBtn').disabled = false;
        
        // Close modal
        document.getElementById('emailVerificationModal')?.remove();
        
        // Clean up
        delete emailVerificationCodes[email];
        
        showToast('Correo electrónico verificado correctamente', 'success');
    } else {
        showToast('Código de verificación incorrecto', 'error');
    }
}

function resendVerificationEmail(email) {
    sendVerificationEmail();
    document.getElementById('emailVerificationModal')?.remove();
}

function resetEmailVerification() {
    document.getElementById('emailVerificationStatus').style.display = 'none';
    document.getElementById('emailVerificationPending').style.display = 'none';
    document.getElementById('emailVerificationRequired').style.display = 'none';
    document.getElementById('verifyEmailBtn').style.display = 'none';
    document.getElementById('registerSubmitBtn').disabled = true;
}

// ========== OAUTH AUTHENTICATION ==========

async function handleOAuthLogin(provider) {
    try {
        showToast(`Iniciando sesión con ${provider}...`, 'info');
        
        // In production, integrate with OAuth provider
        // For now, simulate OAuth authentication
        const response = await simulateOAuth(provider, 'login');
        
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            
            showToast(`¡Inicio de sesión con ${provider} exitoso!`, 'success');
            
            closeModal(document.getElementById('loginModal'));
            
            setTimeout(() => {
                redirectByRole(response.user.role);
            }, 1000);
        } else {
            showToast(response.message || `Error al iniciar sesión con ${provider}`, 'error');
        }
    } catch (error) {
        console.error(`Error en ${provider} login:`, error);
        showToast(`Error al autenticar con ${provider}`, 'error');
    }
}

async function handleOAuthRegister(provider) {
    try {
        showToast(`Registrándote con ${provider}...`, 'info');
        
        // In production, integrate with OAuth provider
        // OAuth registration typically requires email verification from the provider
        const response = await simulateOAuth(provider, 'register');
        
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            
            showToast(`¡Registro con ${provider} exitoso!`, 'success');
            
            closeModal(document.getElementById('registerModal'));
            
            setTimeout(() => {
                redirectByRole(response.user.role);
            }, 1000);
        } else {
            showToast(response.message || `Error al registrarse con ${provider}`, 'error');
        }
    } catch (error) {
        console.error(`Error en ${provider} registration:`, error);
        showToast(`Error al registrarse con ${provider}`, 'error');
    }
}

async function simulateOAuth(provider, action) {
    // For Atlassian, use real OAuth if available
    if (provider === 'atlassian') {
        try {
            return await atlassianOAuth(action);
        } catch (error) {
            console.error('Atlassian OAuth error, falling back to simulation:', error);
            // Fall through to simulation
        }
    }
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const providerInfo = {
                google: { name: 'Google User', email: 'user@gmail.com' },
                microsoft: { name: 'Microsoft User', email: 'user@outlook.com' },
                apple: { name: 'Apple User', email: 'user@icloud.com' },
                atlassian: { name: 'Atlassian User', email: 'user@atlassian.com' }
            };
            
            const info = providerInfo[provider] || { name: 'User', email: 'user@example.com' };
            
            resolve({
                success: true,
                user: {
                    id: Math.random().toString(36).substr(2, 9),
                    firstName: info.name.split(' ')[0],
                    lastName: info.name.split(' ')[1] || '',
                    email: info.email,
                    role: 'comprador',
                    oauthProvider: provider,
                    emailVerified: true, // OAuth emails are pre-verified
                    avatar: `https://ui-avatars.com/api/?name=${info.name}`
                },
                token: `${provider}-token-${Math.random().toString(36).substr(2, 9)}`
            });
        }, 1500);
    });
}

// ========== ATLASSIAN OAUTH INTEGRATION ==========

/**
 * Atlassian OAuth 2.0 Integration
 * 
 * Para implementar la autenticación real con Atlassian:
 * 
 * 1. Crear una OAuth App en Atlassian:
 *    - Ve a: https://developer.atlassian.com/console/myapps/
 *    - Crea una nueva app OAuth 2.0
 *    - Configura los redirect URIs: https://tu-dominio.com/auth/atlassian/callback
 *    - Obtén el Client ID y Client Secret
 * 
 * 2. Configurar variables de entorno:
 *    - ATLASSIAN_CLIENT_ID
 *    - ATLASSIAN_CLIENT_SECRET
 *    - ATLASSIAN_REDIRECT_URI
 * 
 * 3. Implementar el flujo OAuth:
 *    - Redirect a: https://auth.atlassian.com/authorize
 *    - Obtener authorization code
 *    - Intercambiar code por access token
 *    - Obtener información del usuario desde: https://api.atlassian.com/me
 * 
 * Documentación: https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 */
async function atlassianOAuth(action) {
    // OAuth 2.0 Authorization URL
    const clientId = 'YOUR_ATLASSIAN_CLIENT_ID'; // Reemplazar con tu Client ID
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/atlassian/callback');
    const scope = 'read:me read:account read:jira-user';
    const state = Math.random().toString(36).substr(2, 9); // CSRF protection
    
    // Store state for verification
    sessionStorage.setItem('atlassian_oauth_state', state);
    
    // Redirect to Atlassian authorization
    const authUrl = `https://auth.atlassian.com/authorize?` +
        `audience=api.atlassian.com&` +
        `client_id=${clientId}&` +
        `scope=${scope}&` +
        `redirect_uri=${redirectUri}&` +
        `state=${state}&` +
        `response_type=code&` +
        `prompt=consent`;
    
    // In production, redirect to this URL
    // For now, simulate the OAuth flow
    return new Promise((resolve) => {
        // Simulate OAuth callback
        setTimeout(() => {
            // In production, this would come from the OAuth callback
            resolve({
                success: true,
                user: {
                    id: Math.random().toString(36).substr(2, 9),
                    firstName: 'Atlassian',
                    lastName: 'User',
                    email: 'user@atlassian.com',
                    role: 'comprador',
                    oauthProvider: 'atlassian',
                    emailVerified: true,
                    atlassianAccountId: 'atlassian-account-id',
                    avatar: 'https://ui-avatars.com/api/?name=Atlassian+User&background=0052CC&color=fff'
                },
                token: `atlassian-token-${Math.random().toString(36).substr(2, 9)}`
            });
        }, 1500);
    });
    
    // Uncomment for production:
    // window.location.href = authUrl;
}

/**
 * Handle Atlassian OAuth Callback
 * This function should be called from the callback page
 */
async function handleAtlassianCallback(code, state) {
    // Verify state
    const storedState = sessionStorage.getItem('atlassian_oauth_state');
    if (state !== storedState) {
        throw new Error('Invalid state parameter');
    }
    
    // Exchange code for token
    const response = await fetch(`${API_URL}/auth/atlassian/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, redirectUri: window.location.origin + '/auth/atlassian/callback' })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Get user info from Atlassian API
        const userResponse = await fetch('https://api.atlassian.com/me', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });
        
        const userInfo = await userResponse.json();
        
        return {
            success: true,
            user: {
                id: userInfo.account_id,
                firstName: userInfo.name?.split(' ')[0] || 'Atlassian',
                lastName: userInfo.name?.split(' ').slice(1).join(' ') || 'User',
                email: userInfo.email,
                role: 'comprador',
                oauthProvider: 'atlassian',
                emailVerified: true,
                atlassianAccountId: userInfo.account_id,
                avatar: userInfo.picture || `https://ui-avatars.com/api/?name=${userInfo.name}&background=0052CC&color=fff`
            },
            token: data.access_token
        };
    }
    
    throw new Error('Failed to authenticate with Atlassian');
}

window.handleAtlassianCallback = handleAtlassianCallback;

window.checkEmailAvailability = checkEmailAvailability;
window.sendVerificationEmail = sendVerificationEmail;
window.verifyEmailCode = verifyEmailCode;
window.resendVerificationEmail = resendVerificationEmail;
window.handleOAuthLogin = handleOAuthLogin;
window.handleOAuthRegister = handleOAuthRegister;

// Simulated API Calls (Reemplazar con llamadas reales)
async function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simular respuesta del servidor
            if (email && password) {
                resolve({
                    success: true,
                    user: {
                        id: '123456',
                        firstName: 'Usuario',
                        lastName: 'Demo',
                        email: email,
                        role: email.includes('admin') ? 'admin' : email.includes('org') ? 'organizador' : 'comprador',
                        phone: '+34 627 039 947',
                        avatar: 'https://ui-avatars.com/api/?name=' + email
                    },
                    token: 'demo-token-' + Math.random().toString(36).substr(2, 9)
                });
            } else {
                resolve({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
        }, 1000);
    });
}

async function simulateRegister(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simular respuesta del servidor
            resolve({
                success: true,
                message: 'Usuario registrado exitosamente',
                user: {
                    id: Math.random().toString(36).substr(2, 9),
                    ...userData
                }
            });
        }, 1000);
    });
}

// Real API Calls (Descomentar y configurar cuando tengas el backend)
/*
async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}

async function register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    return await response.json();
}

async function googleAuth() {
    // Implementar Google OAuth
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}
*/

// Redirect by user role
function redirectByRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'dashboard-admin.html';
            break;
        case 'organizador':
            window.location.href = 'dashboard-organizador.html';
            break;
        case 'comprador':
            window.location.href = 'dashboard-comprador.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        return null;
    }
    
    return JSON.parse(user);
}

// Require Auth (para páginas protegidas)
function requireAuth() {
    const user = checkAuth();
    if (!user) {
        showToast('Debes iniciar sesión para acceder a esta página', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return null;
    }
    return user;
}

// Password validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'La contraseña debe tener al menos una mayúscula' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'La contraseña debe tener al menos una minúscula' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'La contraseña debe tener al menos un número' };
    }

    return { valid: true, message: 'Contraseña válida' };
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation (Colombian format)
function validatePhone(phone) {
    const re = /^(\+57)?[3][0-9]{9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Export functions
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
