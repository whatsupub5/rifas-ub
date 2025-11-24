// ========== MAIN APPLICATION LOGIC ==========

// Toast Notification Function (define globally first)
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// Modal Functions (define globally so they're available everywhere)
window.openModal = function(modal) {
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
};

// Handle admin panel access
window.handleAdminAccess = function(event) {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        if (event) event.preventDefault();
        window.showToast('Debes iniciar sesión como administrador para acceder', 'warning');
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl && window.openModal) {
            window.openModal(loginModalEl);
        }
        return false;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' && !user.isTeamMember) {
            return true;
        } else if (user.isTeamMember) {
            if (event) event.preventDefault();
            window.showToast('Solo el administrador principal puede acceder a este panel', 'error');
            return false;
        } else {
            if (event) event.preventDefault();
            window.showToast('No tienes permisos de administrador principal', 'error');
            return false;
        }
    } catch (e) {
        if (event) event.preventDefault();
        window.showToast('Error al verificar permisos', 'error');
        return false;
    }
};

// Toggle collapsible sections
window.toggleCollapsible = function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const wrapper = btn.closest('.collapsible-header-wrapper')?.nextElementSibling || 
                    btn.closest('.collapsible-section')?.querySelector('.collapsible-content-wrapper');
    const content = wrapper?.querySelector('.collapsible-content') || 
                    btn.nextElementSibling?.querySelector('.collapsible-content') ||
                    btn.nextElementSibling;
    const icon = btn.querySelector('.collapsible-header-icon') || btn.querySelector('.collapsible-icon');
    
    if (!content) return;
    
    const isHidden = content.style.display === 'none' || !content.style.display || content.style.maxHeight === '0px';
    
    if (isHidden) {
        // Expand
        content.style.display = 'block';
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
            if (icon.classList.contains('collapsible-header-icon')) {
                icon.style.background = 'var(--primary-color)';
                icon.style.color = 'var(--text-white)';
            }
        }
        
        setTimeout(() => {
            if (content) {
                content.style.maxHeight = 'none';
            }
        }, 400);
    } else {
        // Collapse
        content.style.maxHeight = content.scrollHeight + 'px';
        void content.offsetHeight;
        content.style.maxHeight = '0px';
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
            if (icon.classList.contains('collapsible-header-icon')) {
                icon.style.background = 'rgba(37, 99, 235, 0.1)';
                icon.style.color = 'var(--primary-color)';
            }
        }
        
        setTimeout(() => {
            if (content && content.style.maxHeight === '0px') {
                content.style.display = 'none';
            }
        }, 400);
    }
};

// Toggle dropdown menu
window.toggleDropdown = function(event, dropdownId) {
    event.preventDefault();
    event.stopPropagation();
    const dropdown = document.getElementById(dropdownId);
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    
    allDropdowns.forEach(d => {
        if (d.id !== dropdownId) {
            d.classList.remove('show');
        }
    });
    
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

// Scroll to section
window.scrollToSection = function(sectionId) {
    document.querySelectorAll('.dropdown-menu').forEach(d => {
        d.classList.remove('show');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
        const collapsible = section.closest('.collapsible-section');
        if (collapsible) {
            const btn = collapsible.querySelector('.collapsible-header-btn') || collapsible.querySelector('.collapsible-btn');
            const content = collapsible.querySelector('.collapsible-content');
            
            if (content && (content.style.display === 'none' || !content.style.display)) {
                if (btn) {
                    const event = new Event('click');
                    btn.dispatchEvent(event);
                }
            }
        }
        
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }
};

// Logout function
window.logout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (window.showToast) {
        window.showToast('Sesión cerrada exitosamente', 'success');
    }
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <div class="user-menu">
                <span class="user-name">Hola, ${user.firstName}</span>
                <button class="btn btn-outline" onclick="logout()">Cerrar Sesión</button>
            </div>
        `;
    }
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = el.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = el.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        });
        
        el.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) tooltip.remove();
        });
    });
}

// Initialize social collapsible
function initSocialCollapsible() {
    const toggleBtn = document.getElementById('socialToggleBtn');
    const content = document.getElementById('socialCollapsibleContent');
    const icon = document.getElementById('socialToggleIcon');
    
    if (toggleBtn && content && icon) {
        toggleBtn.addEventListener('click', () => {
            const isActive = content.classList.contains('active');
            
            if (isActive) {
                content.classList.remove('active');
                toggleBtn.classList.remove('active');
            } else {
                content.classList.add('active');
                toggleBtn.classList.add('active');
            }
        });
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // DOM Elements
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const contactForm = document.getElementById('contactForm');

    console.log('Initializing app...');
    console.log('Login button:', loginBtn);
    console.log('Register button:', registerBtn);
    console.log('Login modal:', loginModal);
    console.log('Register modal:', registerModal);

    // Login Modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login button clicked');
            window.openModal(loginModal);
        });
    } else {
        console.error('Login button or modal not found!', { loginBtn, loginModal });
    }

    if (closeLogin && loginModal) {
        closeLogin.addEventListener('click', () => {
            window.closeModal(loginModal);
        });
    }

    // Register Modal
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Register button clicked');
            window.openModal(registerModal);
        });
    } else {
        console.error('Register button or modal not found!', { registerBtn, registerModal });
    }

    if (closeRegister && registerModal) {
        closeRegister.addEventListener('click', () => {
            window.closeModal(registerModal);
        });
    }

    // Switch between modals
    if (showRegister && loginModal && registerModal) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeModal(loginModal);
            window.openModal(registerModal);
        });
    }

    if (showLogin && registerModal && loginModal) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeModal(registerModal);
            window.openModal(loginModal);
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            window.closeModal(loginModal);
        }
        if (e.target === registerModal) {
            window.closeModal(registerModal);
        }
    });

    // Mobile Menu Toggle
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            const bars = mobileMenu.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.toggle('active'));
        });
    }

    // Close mobile menu when clicking nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Scroll Effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Contact Form
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
            submitBtn.disabled = true;

            setTimeout(() => {
                console.log('Contact form submitted:', formData);
                window.showToast('¡Mensaje enviado exitosamente!', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.stat-item, .step-item, .rifa-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Button Actions
    const exploreRifasBtn = document.getElementById('exploreRifas');
    const createRifaBtn = document.getElementById('createRifa');

    if (exploreRifasBtn) {
        exploreRifasBtn.addEventListener('click', () => {
            const rifasSection = document.getElementById('rifas');
            if (rifasSection) {
                rifasSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (createRifaBtn) {
        createRifaBtn.addEventListener('click', () => {
            const isLoggedIn = localStorage.getItem('user');
            if (!isLoggedIn) {
                window.showToast('Debes iniciar sesión para crear una rifa', 'warning');
                window.openModal(loginModal);
            } else {
                window.location.href = 'dashboard-organizador.html';
            }
        });
    }

    // Active Nav Link on Scroll
    const sections = document.querySelectorAll('section[id]');

    function navHighlighter() {
        let scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', navHighlighter);

    // Initialize tooltips and social collapsible
    initTooltips();
    initSocialCollapsible();

    // Check if user is logged in and update UI
    const user = localStorage.getItem('user');
    if (user) {
        try {
            updateUIForLoggedInUser(JSON.parse(user));
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    console.log('App initialized successfully');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(d => {
            d.classList.remove('show');
        });
    }
});
