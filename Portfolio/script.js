// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initTypingEffect();
    initSmoothScrolling();
    initActiveNavigation();
    initSkillsCompactView();
});

// FPS limiter for mobile performance
const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
const FRAME_INTERVAL = 1000 / (isMobile ? 15 : 30);

// Throttle utility for scroll handlers
function rafThrottle(fn) {
    let ticking = false;
    return function () {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                fn();
                ticking = false;
            });
        }
    };
}

// Page visibility state - pauses animations when tab is hidden
let isPageVisible = true;
document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
});

// Navigation Toggle
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Add animation class to elements
    const animateElements = document.querySelectorAll('.skill-category, .project-card, .certification-card, .about-content, .contact-content');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Navbar background on scroll
    const updateNavbar = rafThrottle(() => {
        const navbar = document.getElementById('navbar');
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

// Contact Form Handling with Web3Forms
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject_field');
        const message = formData.get('message');

        // Validate form
        if (!validateForm(name, email, subject, message)) {
            return;
        }

        // Check if access key is configured
        const accessKey = formData.get('access_key');
        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
            showNotification('Please configure your Web3Forms access key in the HTML file.', 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;

        try {
            // Submit to Web3Forms
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Failed to send message. Please try again or contact me directly.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateInput(this);
        });

        input.addEventListener('input', function () {
            clearError(this);
        });
    });
}

// Form Validation Functions
function validateForm(name, email, subject, message) {
    let isValid = true;
    const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea');

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearError(input);

    // Check if required field is empty
    if (input.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    // Email validation
    else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    // Name validation
    else if (input.name === 'name' && value) {
        if (value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long';
            isValid = false;
        }
    }
    // Subject validation
    else if (input.name === 'subject_field' && value) {
        if (value.length < 3) {
            errorMessage = 'Subject must be at least 3 characters long';
            isValid = false;
        }
    }
    // Message validation
    else if (input.name === 'message' && value) {
        if (value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long';
            isValid = false;
        }
    }

    if (!isValid) {
        showError(input, errorMessage);
    }

    return isValid;
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const existingError = formGroup.querySelector('.error-message');

    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    formGroup.appendChild(errorDiv);
    formGroup.classList.add('has-error');
}

function clearError(input) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');

    if (errorMessage) {
        errorMessage.remove();
    }

    formGroup.classList.remove('has-error');
}

// Form Interaction Features
function initFormInteractions() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const fields = form.querySelectorAll('input[required], textarea[required]');
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('char-count-current');
    const progressBar = document.getElementById('form-progress-bar');
    const progressText = document.getElementById('form-progress-text');
    const footerIcon = document.getElementById('form-footer-icon');
    const footerText = document.getElementById('form-footer-text');

    let typingTimer;

    function updateProgress() {
        let filled = 0;
        fields.forEach(f => {
            if (f.value.trim().length > 0) filled++;
        });
        const pct = Math.round((filled / fields.length) * 100);
        if (progressBar) progressBar.style.width = pct + '%';
        if (progressText) progressText.textContent = pct + '%';
    }

    function updateCharCount() {
        if (!messageField || !charCount) return;
        const len = messageField.value.length;
        charCount.textContent = len;
        charCount.classList.toggle('warning', len > 400);
        charCount.classList.toggle('danger', len > 480);
    }

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 100) + 'px';
    }

    function setFooter(state, iconChar, text) {
        if (footerIcon) {
            footerIcon.className = 'form-footer-icon';
            if (state) footerIcon.classList.add(state);
            footerIcon.textContent = iconChar;
        }
        if (footerText) footerText.textContent = text;
        const footer = form.querySelector('.form-footer');
        if (footer) footer.classList.toggle('active', state !== 'idle');
    }

    fields.forEach(f => {
        f.addEventListener('input', function () {
            updateProgress();
            if (this === messageField) {
                updateCharCount();
                autoResize(this);
            }
            clearTimeout(typingTimer);
            setFooter('typing', '●', 'receiving input...');
            typingTimer = setTimeout(() => {
                setFooter('idle', '◆', 'awaiting input...');
            }, 1500);
        });
    });

    // Init
    updateProgress();
    if (messageField) {
        updateCharCount();
        autoResize(messageField);
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const labels = { success: 'SUCCESS', error: 'ERROR', info: 'INFO' };
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
    const gradients = {
        success: 'linear-gradient(135deg, #22c55e, #16a34a)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #4facfe, #3b82f6)'
    };

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.innerHTML = `
        <div class="notif-glow"></div>
        <div class="notif-header">
            <span class="notif-bracket">[</span>
            <span class="notif-label">${labels[type]}</span>
            <span class="notif-bracket">]</span>
        </div>
        <div class="notif-body">
            <i class="${icons[type]}"></i>
            <span class="notif-msg">${message}</span>
        </div>
        <div class="notif-bar" style="background: ${gradients[type]}"></div>
    `;
    document.body.appendChild(notif);

    requestAnimationFrame(() => notif.classList.add('visible'));

    let remaining = 5000;
    const bar = notif.querySelector('.notif-bar');
    const start = Date.now();

    function shrink() {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 1 - elapsed / remaining);
        bar.style.transform = `scaleX(${pct})`;
        if (pct > 0) requestAnimationFrame(shrink);
    }
    requestAnimationFrame(shrink);

    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => {
            if (notif.parentElement) notif.remove();
        }, 400);
    }, remaining);
}

// Typing Effect for Hero Section
function initTypingEffect() {
    const titles = [
        'MERN Fullstack Developer',
        'Frontend Developer',
        'Backend Developer',
        'React Specialist',
        'Node.js Expert',
        'Data Entry Specialist',
        'AI Developer'
    ];

    const subtitle = document.querySelector('.hero-subtitle');
    let currentTitle = 0;
    let currentChar = 0;
    let isDeleting = false;

    function type() {
        const current = titles[currentTitle];

        if (isDeleting) {
            subtitle.textContent = current.substring(0, currentChar - 1);
            currentChar--;
        } else {
            subtitle.textContent = current.substring(0, currentChar + 1);
            currentChar++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && currentChar === current.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentChar === 0) {
            isDeleting = false;
            currentTitle = (currentTitle + 1) % titles.length;
            typeSpeed = 500; // Pause before next title
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing effect after a short delay
    setTimeout(type, 1000);
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active Navigation
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', rafThrottle(updateActiveNav));
    updateActiveNav(); // Initial call
}

// Compact Skills View
function initSkillsCompactView() {
    const skillCategories = document.querySelectorAll('.skill-category');

    if (!skillCategories.length) {
        return;
    }

    const updateCategoryState = category => {
        const list = category.querySelector('.skills-list');
        const skillItems = list ? list.querySelectorAll('.skill-item') : [];
        const toggle = category.querySelector('.skills-toggle');
        const toggleText = category.querySelector('.skills-toggle-text');
        const previewCount = parseInt(category.dataset.previewCount, 10) || 6;

        if (!list || !toggle || !toggleText || !skillItems.length) {
            return;
        }

        if (skillItems.length <= previewCount) {
            toggle.hidden = true;
            category.classList.remove('is-collapsible', 'is-collapsed', 'is-expanded');
            list.style.maxHeight = 'none';
            return;
        }

        toggle.hidden = false;
        category.classList.add('is-collapsible');

        const columns = getGridColumnCount(list);
        const rowsVisible = Math.ceil(previewCount / columns);
        const rowGap = parseFloat(window.getComputedStyle(list).rowGap) || 0;
        const itemHeight = skillItems[0].getBoundingClientRect().height;
        const collapsedHeight = (rowsVisible * itemHeight) + ((rowsVisible - 1) * rowGap);

        if (category.classList.contains('is-expanded')) {
            toggle.setAttribute('aria-expanded', 'true');
            toggleText.textContent = 'Show less';
            list.style.maxHeight = `${list.scrollHeight}px`;
            category.classList.remove('is-collapsed');
        } else {
            toggle.setAttribute('aria-expanded', 'false');
            toggleText.textContent = 'Show all';
            category.classList.add('is-collapsed');
            list.style.maxHeight = `${collapsedHeight}px`;
        }
    };

    skillCategories.forEach((category, index) => {
        const list = category.querySelector('.skills-list');
        const toggle = category.querySelector('.skills-toggle');

        if (!list || !toggle) {
            return;
        }

        if (!list.id) {
            list.id = `skills-list-${index + 1}`;
        }

        toggle.setAttribute('aria-controls', list.id);

        toggle.addEventListener('click', function () {
            category.classList.toggle('is-expanded');
            updateCategoryState(category);
        });

        updateCategoryState(category);
    });

    let resizeFrame;
    window.addEventListener('resize', function () {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            skillCategories.forEach(updateCategoryState);
        });
    });
}

function getGridColumnCount(element) {
    const gridColumns = window.getComputedStyle(element).gridTemplateColumns;

    if (!gridColumns) {
        return 1;
    }

    return Math.max(1, gridColumns.split(' ').filter(column => column.trim() !== '').length);
}

// Theme toggle functionality
function initThemeToggle() {
    const themeBtn = document.getElementById('nav-theme-btn');
    if (!themeBtn) return;

    const icon = themeBtn.querySelector('i');

    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
            icon.className = 'fas fa-sun nav-icon';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon nav-icon';
            localStorage.setItem('theme', 'light');
        }
    }

    themeBtn.addEventListener('click', function () {
        setTheme(!document.body.classList.contains('dark-theme'));
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark');
}

// Initialize theme toggle
document.addEventListener('DOMContentLoaded', initThemeToggle);

// ============ FUTURISTIC ADDITIONS ============

// Particle Network Canvas
function initParticleNetwork() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
        const hero = canvas.closest('.hero');
        if (hero) {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
    }

    function createParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    let lastFrameTime = 0;

    function draw(timestamp) {
        timestamp = timestamp || performance.now();
        if (!isPageVisible) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        if (timestamp - lastFrameTime < FRAME_INTERVAL) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        lastFrameTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDark = document.body.classList.contains('dark-theme');
        const particleColor = '79, 172, 254';
        const lineColor = '79, 172, 254';

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            if (mouse.x && mouse.y) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    p.vx -= (dx / dist) * force * 0.05;
                    p.vy -= (dy / dist) * force * 0.05;
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
            ctx.fill();
            ctx.shadowBlur = 5;
            ctx.shadowColor = `rgba(${particleColor}, 0.3)`;
        });

        ctx.shadowBlur = 0;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(draw);
    }

    function init() {
        resizeCanvas();
        const maxParticles = isMobile ? 20 : 40;
        const particleCount = Math.min(Math.floor(canvas.width * canvas.height / 12000), maxParticles);
        createParticles(particleCount);
        draw();
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        const maxParticles = isMobile ? 20 : 40;
        createParticles(Math.min(Math.floor(canvas.width * canvas.height / 12000), maxParticles));
    });

    const hero = canvas.closest('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        hero.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // Stop particles when hero is not visible (performance)
    const pauseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animationId) draw();
            } else {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        });
    }, { threshold: 0 });
    pauseObserver.observe(canvas);

    init();
}

// Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const updateProgress = rafThrottle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (scrollTop / docHeight) * 100 + '%';
    });

    window.addEventListener('scroll', updateProgress, { passive: true });
}

// 3D Tilt Effect (disabled on mobile for performance)
function initTiltEffect() {
    if (isMobile) return;
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.setProperty('--tilt-x', `${rotateX}deg`);
            card.style.setProperty('--tilt-y', `${rotateY}deg`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });
}

// Magnetic Button Effect (disabled on mobile for performance)
function initMagneticButtons() {
    if (isMobile) return;
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// Text Scramble Effect
function initTextScramble() {
    const titles = document.querySelectorAll('.section-title');

    const chars = '!<>-_\\/[]{}—=+*^?#________';

    function randomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function scramble(el, originalText) {
        let frame = 0;
        const totalFrames = 15;
        let output = '';

        return new Promise(resolve => {
            const interval = setInterval(() => {
                frame++;
                output = '';
                for (let i = 0; i < originalText.length; i++) {
                    if (i < Math.floor(originalText.length * frame / totalFrames)) {
                        output += originalText[i];
                    } else {
                        output += randomChar();
                    }
                }
                el.textContent = output;

                if (frame >= totalFrames) {
                    clearInterval(interval);
                    el.textContent = originalText;
                    resolve();
                }
            }, 40);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.scrambled) {
                entry.target.dataset.scrambled = 'true';
                const originalText = entry.target.textContent;
                scramble(entry.target, originalText);
            }
        });
    }, { threshold: 0.5 });

    titles.forEach(title => observer.observe(title));
}

// Tech Stack Interactive Graph
function initTechGraph() {
    const canvas = document.getElementById('tech-graph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let nodes = [];
    let edges = [];
    let animationId;
    let hoveredNode = null;
    let mouse = { x: 0, y: 0 };
    let time = 0;

    // Auto-pulse attraction system
    let frameCount = 0;
    let nextPulseAt = 120;
    let pulseOrigin = null;
    let pulseProgress = 0;
    const PULSE_DURATION = 70;

    const BASELINE_W = 900;
    const BASELINE_H = 500;

    function getScale() {
        const scaleX = canvas.width / BASELINE_W;
        const scaleY = canvas.height / BASELINE_H;
        return Math.max(0.45, Math.min(1, (scaleX + scaleY) / 2));
    }

    function getCategoryRadii(scale) {
        return {
            core: { color: '#4facfe', glow: 'rgba(79, 172, 254, 0.4)', radius: Math.round(28 * scale) },
            frontend: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', radius: Math.round(18 * scale) },
            backend: { color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.3)', radius: Math.round(18 * scale) },
            tools: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', radius: Math.round(16 * scale) }
        };
    }

    const nodeData = [
        { id: 'react', label: 'React', cat: 'core' },
        { id: 'node', label: 'Node.js', cat: 'core' },
        { id: 'express', label: 'Express', cat: 'core' },
        { id: 'mongo', label: 'MongoDB', cat: 'core' },
        { id: 'js', label: 'JavaScript', cat: 'frontend' },
        { id: 'html', label: 'HTML', cat: 'frontend' },
        { id: 'css', label: 'CSS', cat: 'frontend' },
        { id: 'redux', label: 'Redux Toolkit', cat: 'frontend' },
        { id: 'router', label: 'React Router', cat: 'frontend' },
        { id: 'tailwind', label: 'Tailwind CSS', cat: 'frontend' },
        { id: 'mui', label: 'Material UI', cat: 'frontend' },
        { id: 'bootstrap', label: 'Bootstrap', cat: 'frontend' },
        { id: 'vite', label: 'Vite', cat: 'frontend' },
        { id: 'axios', label: 'Axios', cat: 'frontend' },
        { id: 'context', label: 'Context API', cat: 'frontend' },
        { id: 'mongoose', label: 'Mongoose', cat: 'backend' },
        { id: 'jwt', label: 'JWT Auth', cat: 'backend' },
        { id: 'rest', label: 'RESTful APIs', cat: 'backend' },
        { id: 'bcrypt', label: 'Bcrypt', cat: 'backend' },
        { id: 'razorpay', label: 'Razorpay', cat: 'backend' },
        { id: 'cloudinary', label: 'Cloudinary', cat: 'backend' },
        { id: 'socket', label: 'Socket.io', cat: 'backend' },
        { id: 'multer', label: 'Multer', cat: 'backend' },
        { id: 'mvc', label: 'MVC', cat: 'backend' },
        { id: 'git', label: 'Git', cat: 'tools' },
        { id: 'vscode', label: 'VS Code', cat: 'tools' },
        { id: 'npm', label: 'NPM', cat: 'tools' },
        { id: 'postman', label: 'Postman', cat: 'tools' },
        { id: 'vercel', label: 'Vercel', cat: 'tools' },
        { id: 'devtools', label: 'Chrome DevTools', cat: 'tools' }
    ];

    const edgeData = [
        { s: 'react', t: 'express' },
        { s: 'express', t: 'mongo' },
        { s: 'mongo', t: 'node' },
        { s: 'node', t: 'react' },
        { s: 'react', t: 'js' },
        { s: 'react', t: 'html' },
        { s: 'react', t: 'css' },
        { s: 'react', t: 'redux' },
        { s: 'react', t: 'router' },
        { s: 'react', t: 'tailwind' },
        { s: 'react', t: 'mui' },
        { s: 'react', t: 'bootstrap' },
        { s: 'react', t: 'vite' },
        { s: 'react', t: 'axios' },
        { s: 'react', t: 'context' },
        { s: 'node', t: 'js' },
        { s: 'node', t: 'npm' },
        { s: 'node', t: 'socket' },
        { s: 'express', t: 'jwt' },
        { s: 'express', t: 'rest' },
        { s: 'express', t: 'bcrypt' },
        { s: 'express', t: 'razorpay' },
        { s: 'express', t: 'cloudinary' },
        { s: 'express', t: 'multer' },
        { s: 'express', t: 'mvc' },
        { s: 'express', t: 'socket' },
        { s: 'mongo', t: 'mongoose' },
        { s: 'git', t: 'react' },
        { s: 'git', t: 'node' },
        { s: 'git', t: 'express' },
        { s: 'git', t: 'mongo' },
        { s: 'vscode', t: 'react' },
        { s: 'vscode', t: 'js' },
        { s: 'vscode', t: 'html' },
        { s: 'vscode', t: 'css' },
        { s: 'postman', t: 'express' },
        { s: 'vercel', t: 'react' },
        { s: 'devtools', t: 'react' },
        { s: 'devtools', t: 'js' },
        { s: 'devtools', t: 'css' },
        { s: 'devtools', t: 'html' }
    ];

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    function initNodes() {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = getScale();
        const categories = getCategoryRadii(scale);

        nodes = nodeData.map((d, i) => {
            const angle = (i / nodeData.length) * Math.PI * 2;
            const radius = Math.min(w, h) * 0.32;
            return {
                ...d,
                ...categories[d.cat],
                x: cx + Math.cos(angle) * radius * (0.35 + scale * 0.2),
                y: cy + Math.sin(angle) * radius * (0.35 + scale * 0.2),
                vx: 0,
                vy: 0,
                phase: Math.random() * Math.PI * 2,
                baseRadius: categories[d.cat].radius,
                targetX: cx + Math.cos(angle) * radius * 0.4,
                targetY: cy + Math.sin(angle) * radius * 0.4
            };
        });

        edges = edgeData.map(e => ({
            source: nodes.find(n => n.id === e.s),
            target: nodes.find(n => n.id === e.t)
        })).filter(e => e.source && e.target);
    }

    function simulate() {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = getScale();
        const repulsionStrength = 1200 * scale;
        const attractionStrength = 0.008 * scale;
        const gravityStrength = 0.002 * scale;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = repulsionStrength / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
            }
        }

        edges.forEach(e => {
            const dx = e.target.x - e.source.x;
            const dy = e.target.y - e.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * attractionStrength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            e.source.vx += fx;
            e.source.vy += fy;
            e.target.vx -= fx;
            e.target.vy -= fy;
        });

        nodes.forEach(n => {
            const dx = cx - n.x;
            const dy = cy - n.y;
            n.vx += dx * gravityStrength;
            n.vy += dy * gravityStrength;
        });

        const damping = 0.82 + scale * 0.04;
        const margin = 30 + 20 * scale;

        nodes.forEach(n => {
            n.vx *= damping;
            n.vy *= damping;
            n.x += n.vx;
            n.y += n.vy;
            n.x = Math.max(margin, Math.min(w - margin, n.x));
            n.y = Math.max(margin, Math.min(h - margin, n.y));
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDark = document.body.classList.contains('dark-theme');
        const hc = hoveredNode ? hoveredNode.color : '#4facfe';
        const scale = getScale();
        const ambientDrift = 0.8 + scale * 0.8;
        const breatheAmp = 0.8 + scale * 0.8;

        nodes.forEach(n => {
            n.displayX = n.x + Math.sin(time * 0.3 + n.phase) * ambientDrift;
            n.displayY = n.y + Math.sin(time * 0.5 + n.phase * 1.3) * ambientDrift * 1.3;
            const breathe = Math.sin(time * 0.7 + n.phase) * breatheAmp;
            n.liveRadius = Math.max(4, n.baseRadius + breathe);
        });

        // Edges
        edges.forEach(e => {
            const highlighted = hoveredNode && (e.source.id === hoveredNode.id || e.target.id === hoveredNode.id);
            const sx = e.source.displayX || e.source.x;
            const sy = e.source.displayY || e.source.y;
            const tx = e.target.displayX || e.target.x;
            const ty = e.target.displayY || e.target.y;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = highlighted
                ? `${hc}${isDark ? '99' : '88'}`
                : `rgba(79, 172, 254, ${isDark ? 0.12 : 0.1})`;
            ctx.lineWidth = highlighted ? Math.max(1.2, 2.5 * scale) : Math.max(0.6, 1 * scale);
            if (highlighted) {
                ctx.shadowBlur = 10 * scale;
                ctx.shadowColor = `${hc}66`;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (highlighted && hoveredNode) {
                const progress = (time * 0.8) % 1;
                const dx = tx - sx;
                const dy = ty - sy;
                const px = sx + dx * progress;
                const py = sy + dy * progress;
                const dotR = Math.max(2, 3.5 * scale);
                ctx.beginPath();
                ctx.arc(px, py, dotR, 0, Math.PI * 2);
                ctx.fillStyle = hc;
                ctx.shadowBlur = 15 * scale;
                ctx.shadowColor = `${hc}99`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(px, py, dotR * 2, 0, Math.PI * 2);
                ctx.fillStyle = `${hc}22`;
                ctx.shadowBlur = 0;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Glow behind hovered node
        nodes.forEach(n => {
            if (hoveredNode && hoveredNode.id === n.id) {
                const dx = n.displayX || n.x;
                const dy = n.displayY || n.y;
                const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, n.liveRadius * 2.2);
                grad.addColorStop(0, `${hc}55`);
                grad.addColorStop(0.5, `${hc}22`);
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(dx, dy, n.liveRadius * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        });

        // Auto-pulse wave
        if (pulseOrigin) {
            const p = pulseProgress / PULSE_DURATION;
            const pulseRadius = p * (80 + 40 * scale);
            const pulseAlpha = Math.max(0, 1 - p);
            const pc = pulseOrigin.color;
            const lw = (2 + pulseAlpha * 3) * scale;

            ctx.beginPath();
            ctx.arc(pulseOrigin.displayX || pulseOrigin.x, pulseOrigin.displayY || pulseOrigin.y, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `${pc}${Math.floor(pulseAlpha * 160).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = lw;
            ctx.shadowBlur = 20 * pulseAlpha * scale;
            ctx.shadowColor = `${pc}88`;
            ctx.stroke();
            ctx.shadowBlur = 0;

            const pr2 = pulseRadius * 0.6;
            ctx.beginPath();
            ctx.arc(pulseOrigin.displayX || pulseOrigin.x, pulseOrigin.displayY || pulseOrigin.y, pr2, 0, Math.PI * 2);
            ctx.strokeStyle = `${pc}${Math.floor(pulseAlpha * 80).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();

            edges.filter(e => e.source.id === pulseOrigin.id || e.target.id === pulseOrigin.id).forEach(e => {
                const other = e.source.id === pulseOrigin.id ? e.target : e.source;
                const op = Math.max(0, 1 - Math.abs(p - 0.3) * 3);
                if (op > 0) {
                    const ox = other.displayX || other.x;
                    const oy = other.displayY || other.y;
                    const br = Math.max(4, (other.liveRadius + op * 8) * scale);
                    const grad2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, br);
                    grad2.addColorStop(0, `${pc}${Math.floor(op * 180).toString(16).padStart(2, '0')}`);
                    grad2.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.arc(ox, oy, br, 0, Math.PI * 2);
                    ctx.fillStyle = grad2;
                    ctx.fill();
                }
            });
        }

        // Ripple rings on hovered node
        if (hoveredNode) {
            const n = hoveredNode;
            const nx = n.displayX || n.x;
            const ny = n.displayY || n.y;
            for (let i = 0; i < Math.min(3, 2 + Math.round(scale * 2)); i++) {
                const phase = ((time * 1.8 + i * 1.6) % 3.5);
                const ringRadius = n.liveRadius * 1.2 + phase * (12 + 10 * scale);
                const alpha = Math.max(0, 0.5 - phase * 0.16);
                ctx.beginPath();
                ctx.arc(nx, ny, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `${hc}${Math.floor(alpha * 180).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = Math.max(0.8, 2 * scale);
                ctx.shadowBlur = 8 * scale;
                ctx.shadowColor = `${hc}55`;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // Orbiting particles
        if (hoveredNode) {
            const n = hoveredNode;
            const nx = n.displayX || n.x;
            const ny = n.displayY || n.y;
            const count = Math.max(4, Math.round(8 * scale));
            for (let i = 0; i < count; i++) {
                const angle = time * 1.4 + (i / count) * Math.PI * 2;
                const orbitR = n.liveRadius * 1.7 + Math.sin(time * 1.2 + i * 1.5) * (4 + 4 * scale);
                const ox = nx + Math.cos(angle) * orbitR;
                const oy = ny + Math.sin(angle) * orbitR;
                const pSize = Math.max(1, (2 + Math.sin(time * 2 + i) * 0.8) * scale);
                ctx.beginPath();
                ctx.arc(ox, oy, pSize, 0, Math.PI * 2);
                ctx.fillStyle = hc;
                ctx.shadowBlur = 12 * scale;
                ctx.shadowColor = `${hc}88`;
                ctx.fill();
                ctx.shadowBlur = 0;
                const tailR = orbitR - (4 * scale);
                const tx = nx + Math.cos(angle - 0.4) * tailR;
                const ty = ny + Math.sin(angle - 0.4) * tailR;
                ctx.beginPath();
                ctx.arc(tx, ty, pSize * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `${hc}44`;
                ctx.fill();
            }
        }

        // Glow on connected nodes
        if (hoveredNode) {
            edges.filter(e => e.source.id === hoveredNode.id || e.target.id === hoveredNode.id).forEach(e => {
                const other = e.source.id === hoveredNode.id ? e.target : e.source;
                const ox = other.displayX || other.x;
                const oy = other.displayY || other.y;
                const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, other.liveRadius * 1.8);
                grad.addColorStop(0, `${hc}33`);
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(ox, oy, other.liveRadius * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            });
        }

        // Draw nodes
        nodes.forEach(n => {
            const isHovered = hoveredNode && hoveredNode.id === n.id;
            const dx = n.displayX || n.x;
            const dy = n.displayY || n.y;
            const r = isHovered ? n.liveRadius * 1.25 : n.liveRadius;

            const grad = ctx.createRadialGradient(dx - r * 0.3, dy - r * 0.3, 0, dx, dy, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, n.color);
            grad.addColorStop(1, n.color);

            ctx.beginPath();
            ctx.arc(dx, dy, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.shadowBlur = isHovered ? 20 * scale : 8 * scale;
            ctx.shadowColor = n.glow;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isHovered ? Math.max(1, 2 * scale) : Math.max(0.5, 1 * scale);
            ctx.stroke();

            const maxLabelLen = scale < 0.6 ? 5 : scale < 0.8 ? 7 : 10;
            const fontSize = Math.max(6, Math.round((isHovered ? 11 : 10) * scale));
            ctx.font = `${fontSize}px 'Inter', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 3 * scale;
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            const displayLabel = n.label.length > maxLabelLen ? n.label.substring(0, maxLabelLen - 1) + '..' : n.label;
            ctx.fillText(displayLabel, dx, dy);
            ctx.shadowBlur = 0;
        });
    }

    let techLastFrame = 0;

    function animate(timestamp) {
        timestamp = timestamp || performance.now();
        if (!isPageVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        if (timestamp - techLastFrame < FRAME_INTERVAL) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        techLastFrame = timestamp;

        time += isMobile ? 0.008 : 0.02;
        frameCount++;
        simulate();

        if (frameCount >= nextPulseAt && !pulseOrigin) {
            frameCount = 0;
            nextPulseAt = 140 + Math.random() * 140;
            pulseOrigin = nodes[Math.floor(Math.random() * nodes.length)];
            pulseProgress = 0;
        }
        if (pulseOrigin) {
            pulseProgress++;
            if (pulseProgress > PULSE_DURATION) {
                pulseOrigin = null;
            }
        }

        draw();
        animationId = requestAnimationFrame(animate);
    }

    function getNodeAt(x, y) {
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i];
            const nx = n.displayX || n.x;
            const ny = n.displayY || n.y;
            const nr = n.liveRadius || n.radius;
            const dx = x - nx;
            const dy = y - ny;
            if (dx * dx + dy * dy <= nr * nr) {
                return n;
            }
        }
        return null;
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX;
        mouse.y = (e.clientY - rect.top) * scaleY;
        hoveredNode = getNodeAt(mouse.x, mouse.y);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
    });

    canvas.addEventListener('mouseleave', () => {
        hoveredNode = null;
        canvas.style.cursor = 'default';
    });

    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouse.x = (touch.clientX - rect.left) * scaleX;
        mouse.y = (touch.clientY - rect.top) * scaleY;
        const tapped = getNodeAt(mouse.x, mouse.y);
        if (tapped) {
            hoveredNode = hoveredNode?.id === tapped.id ? null : tapped;
        }
    }, { passive: true });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resize();
            initNodes();
        }, 200);
    });

    resize();
    initNodes();
    animate();
}

// ============ PROJECT CARD CODE RAIN (hover-only for performance) ============
function initProjectCodeRain() {
    const canvases = document.querySelectorAll('.project-canvas');
    if (!canvases.length) return;

    const chars = '10アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEF<>/{}[]|&^%$#@!';
    let activeAnimationId = null;
    let activeCanvas = null;

    function stopActive() {
        if (activeAnimationId) {
            cancelAnimationFrame(activeAnimationId);
            activeAnimationId = null;
        }
        if (activeCanvas) {
            const ctx = activeCanvas.getContext('2d');
            ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
            activeCanvas = null;
        }
    }

    canvases.forEach(canvas => {
        const container = canvas.parentElement;
        let columns, drops;

        function resize() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            columns = Math.floor(canvas.width / 14);
            drops = Array(columns).fill(1).map(() => Math.random() * canvas.height / 14);
        }

        let codeRainLastFrame = 0;

        function draw(timestamp) {
            if (!activeCanvas) return;
            timestamp = timestamp || performance.now();
            if (!isPageVisible) {
                activeAnimationId = requestAnimationFrame(draw);
                return;
            }
            if (timestamp - codeRainLastFrame < FRAME_INTERVAL) {
                activeAnimationId = requestAnimationFrame(draw);
                return;
            }
            codeRainLastFrame = timestamp;

            const ctx = canvas.getContext('2d');
            const isDark = document.body.classList.contains('dark-theme');

            ctx.fillStyle = isDark ? 'rgba(15, 15, 26, 0.05)' : 'rgba(15, 15, 26, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '12px monospace';
            ctx.textAlign = 'center';

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * 14 + 7;
                const y = drops[i] * 14;

                const brightness = Math.random();
                if (brightness > 0.98) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = 'rgba(79, 172, 254, 0.8)';
                } else if (brightness > 0.85) {
                    ctx.fillStyle = '#00f2fe';
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = 'rgba(0, 242, 254, 0.4)';
                } else {
                    ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
                    ctx.shadowBlur = 0;
                }

                ctx.fillText(char, x, y);
                ctx.shadowBlur = 0;

                if (y > canvas.height || Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            activeAnimationId = requestAnimationFrame(draw);
        }

        function start() {
            if (activeCanvas === canvas) return;
            stopActive();
            activeCanvas = canvas;
            resize();
            codeRainLastFrame = 0;
            draw();
        }

        // Start on hover, stop on mouse leave
        const card = canvas.closest('.project-card');
        if (card) {
            card.addEventListener('mouseenter', start);
            card.addEventListener('mouseleave', stopActive);
        }

        window.addEventListener('resize', () => {
            if (activeCanvas === canvas) resize();
        });
    });
}

// ============ NEW ENHANCED ANIMATIONS ============

// 1. Orbital Tech Rings around Profile Image
function initOrbitAnimation() {
    const canvas = document.getElementById('orbit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let angle = 0;
    let animationId;

    function resize() {
        const wrapper = canvas.closest('.image-wrapper');
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const pad = 40;
        canvas.width = rect.width + pad * 2;
        canvas.height = rect.height + pad * 2;
    }

    function createParticles() {
        particles = [];
        const ringMult = isMobile ? 0.5 : 1;
        const rings = [
            { radius: 120, count: Math.round(8 * ringMult), speed: 0.8, color: '#4facfe', size: 2.5 },
            { radius: 150, count: Math.round(12 * ringMult), speed: 1.2, color: '#00f2fe', size: 2 },
            { radius: 180, count: Math.round(16 * ringMult), speed: 1.6, color: '#a855f7', size: 1.5 }
        ];
        rings.forEach((ring, ri) => {
            for (let i = 0; i < ring.count; i++) {
                particles.push({
                    angleOffset: (i / ring.count) * Math.PI * 2,
                    radius: ring.radius,
                    speed: ring.speed,
                    size: ring.size,
                    color: ring.color,
                    alpha: 0.3 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        });
    }

    let orbitLastFrame = 0;

    function draw(timestamp) {
        timestamp = timestamp || performance.now();
        if (!isPageVisible) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        if (timestamp - orbitLastFrame < FRAME_INTERVAL) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        orbitLastFrame = timestamp;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        const isDark = document.body.classList.contains('dark-theme');

        // Orbital rings (dashed circles)
        [120, 150, 180].forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = isDark
                ? `rgba(79, 172, 254, ${0.06 + i * 0.03})`
                : `rgba(79, 172, 254, ${0.04 + i * 0.02})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Particles
        const time = Date.now() * 0.001;
        particles.forEach(p => {
            const a = time * p.speed * 0.5 + p.angleOffset;
            const breathe = Math.sin(time * 0.8 + p.phase) * 8;
            const r = p.radius + breathe;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;

            // Outer glow
            const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
            grad.addColorStop(0, p.color + '30');
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Core particle
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            // Trail dot
            const trailAngle = a - 0.3;
            const tx = cx + Math.cos(trailAngle) * r;
            const ty = cy + Math.sin(trailAngle) * r;
            ctx.beginPath();
            ctx.arc(tx, ty, p.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '40';
            ctx.fill();
        });

        // Center glow pulse
        const pulse = Math.sin(time * 1.5) * 0.3 + 0.7;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        cg.addColorStop(0, `rgba(79, 172, 254, ${pulse * 0.06})`);
        cg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();

        animationId = requestAnimationFrame(draw);
    }

    function init() {
        resize();
        createParticles();
        draw();
    }

    init();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });
}

// 2. Binary Rain Background
function initBinaryRain() {
    const canvas = document.getElementById('binary-rain');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let columns, drops, animationId, binaryLastFrame = 0;

    function resize() {
        const hero = canvas.closest('.hero');
        if (hero) {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
        columns = Math.floor(canvas.width / 20);
        drops = Array(columns).fill(1).map(() => Math.random() * canvas.height / 16);
    }

    function draw(timestamp) {
        timestamp = timestamp || performance.now();
        if (!isPageVisible) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        if (timestamp - binaryLastFrame < FRAME_INTERVAL) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        binaryLastFrame = timestamp;

        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark
            ? 'rgba(15, 15, 26, 0.02)'
            : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '12px monospace';
        ctx.textAlign = 'center';

        for (let i = 0; i < drops.length; i++) {
            const char = Math.random() > 0.5 ? '1' : '0';
            const x = i * 20;
            const y = drops[i] * 16;

            const bright = Math.random();
            if (bright > 0.97) {
                ctx.fillStyle = isDark ? 'rgba(79, 172, 254, 0.15)' : 'rgba(79, 172, 254, 0.1)';
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(79, 172, 254, 0.3)';
            } else {
                ctx.fillStyle = isDark ? 'rgba(79, 172, 254, 0.05)' : 'rgba(79, 172, 254, 0.03)';
                ctx.shadowBlur = 0;
            }

            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;

            if (y > canvas.height || Math.random() > 0.98) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        animationId = requestAnimationFrame(draw);
    }

    function init() {
        resize();
        draw();
    }

    init();

    window.addEventListener('resize', resize);
}

// 3. Terminal Code Typing in About Section
function initTerminalTyping() {
    const terminalBody = document.getElementById('terminal-body');
    if (!terminalBody) return;

    const lines = [
        { text: '', prompt: '$', cmd: 'cat about-me.js', cls: 'term-cmd', delay: 600 },
        { text: 'const developer = {', indent: 0, cls: 'term-kw-start', delay: 300 },
        { text: 'name: "Saurabh Hande",', indent: 1, cls: 'term-prop', delay: 200 },
        { text: 'role: "MERN Stack Developer",', indent: 1, cls: 'term-prop', delay: 200 },

        { text: 'stack: ["React", "Node.js", "MongoDB", "Express"],', indent: 1, cls: 'term-prop', delay: 250 },
        { text: 'status: "Open to work"', indent: 1, cls: 'term-prop', delay: 200 },
        { text: '};', indent: 0, cls: '', delay: 300 },
        { text: '', prompt: '$', cmd: 'console.log(developer.passion)', cls: 'term-cmd', delay: 400 },
        { text: '> "Building modern web apps"', indent: 0, cls: 'term-output', delay: 300 }
    ];

    let currentLine = 0;
    let currentChar = 0;
    let cursorEl = null;
    let isTyping = false;
    let typedCount = 0;

    function addCursor() {
        if (!cursorEl) {
            cursorEl = document.createElement('span');
            cursorEl.className = 'term-cursor-blink';
            cursorEl.textContent = '_';
            terminalBody.appendChild(cursorEl);
        }
    }

    function removeCursor() {
        if (cursorEl && cursorEl.parentElement) {
            cursorEl.remove();
            cursorEl = null;
        }
    }

    function typeNextChar() {
        if (currentLine >= lines.length) {
            removeCursor();
            // Final blinking cursor on a new prompt line
            const finalLine = document.createElement('div');
            finalLine.className = 'term-line';
            finalLine.style.animationDelay = '0s';
            finalLine.innerHTML = '<span class="term-prompt">$</span><span class="term-cursor-blink">_</span>';
            terminalBody.appendChild(finalLine);
            return;
        }

        const line = lines[currentLine];

        // Create line element on first char
        if (currentChar === 0) {
            removeCursor();

            const lineEl = document.createElement('div');
            lineEl.className = 'term-line';
            lineEl.style.animationDelay = '0s';

            if (line.prompt) {
                const promptSpan = document.createElement('span');
                promptSpan.className = 'term-prompt';
                promptSpan.textContent = line.prompt;
                lineEl.appendChild(promptSpan);

                if (line.cmd) {
                    const cmdSpan = document.createElement('span');
                    cmdSpan.className = line.cls || '';
                    lineEl.appendChild(cmdSpan);

                    // Type command character by character
                    const textSpan = cmdSpan;
                    const fullText = line.cmd;

                    function typeCmdChar(cmdCharIndex) {
                        if (cmdCharIndex <= fullText.length) {
                            textSpan.textContent = fullText.substring(0, cmdCharIndex);
                            addCursor();
                            cmdCharIndex++;
                            if (cmdCharIndex <= fullText.length) {
                                setTimeout(() => typeCmdChar(cmdCharIndex), 30 + Math.random() * 20);
                            } else {
                                // Done typing command, move to next line after delay
                                setTimeout(() => {
                                    currentLine++;
                                    currentChar = 0;
                                    typeNextChar();
                                }, line.delay || 400);
                            }
                        }
                    }
                    terminalBody.appendChild(lineEl);
                    typeCmdChar(0);
                    return;
                }
            }

            if (line.text) {
                const textSpan = document.createElement('span');
                lineEl.appendChild(textSpan);

                if (line.indent) {
                    lineEl.classList.add('indent-1');
                }

                terminalBody.appendChild(lineEl);

                // Type the text character by character
                const fullText = line.text;
                let ti = 0;

                function typeTextChar() {
                    if (ti <= fullText.length) {
                        textSpan.innerHTML = '';
                        // Apply syntax highlighting
                        let displayText = fullText.substring(0, ti);
                        if (line.cls === 'term-kw-start') {
                            textSpan.innerHTML = displayText.replace(
                                /(const|let|var|function|return|if|else|for|while)/g,
                                '<span class="term-kw">$1</span>'
                            ).replace(
                                /"(.*?)"/g,
                                '<span class="term-str">"$1"</span>'
                            );
                        } else if (line.cls === 'term-prop') {
                            textSpan.innerHTML = displayText
                                .replace(/^(\s*)(\w+)(:)/, '$1<span class="term-kw">$2</span>$3')
                                .replace(/"(.*?)"/g, '<span class="term-str">"$1"</span>')
                                .replace(/(\[.*?\])/g, '<span style="color:#ffb86c">$1</span>');
                        } else if (line.cls === 'term-output') {
                            textSpan.style.color = '#22c55e';
                            textSpan.textContent = displayText;
                        } else {
                            textSpan.innerHTML = displayText
                                .replace(/"(.*?)"/g, '<span class="term-str">"$1"</span>');
                        }
                        addCursor();
                        ti++;
                        if (ti <= fullText.length) {
                            setTimeout(typeTextChar, 20 + Math.random() * 15);
                        } else {
                            // Move to next line
                            setTimeout(() => {
                                currentLine++;
                                currentChar = 0;
                                typeNextChar();
                            }, line.delay || 300);
                        }
                    }
                }
                typeTextChar();
                return;
            }

            terminalBody.appendChild(lineEl);
        }
    }

    // Start typing when about section is in view
    let hasStarted = false;

    function startTyping() {
        if (hasStarted) return;
        hasStarted = true;

        // Clear and start fresh
        terminalBody.innerHTML = '';
        setTimeout(typeNextChar, 500);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTyping();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(terminalBody.closest('.about-terminal') || terminalBody);
}

// 4. Skill Progress Bars
function initSkillProgressBars() {
    const skillItems = document.querySelectorAll('.skill-item');

    const skillLevels = {
        'React.js': 90,
        'JavaScript': 88,
        'HTML': 95,
        'CSS': 90,
        'Bootstrap': 80,
        'Responsive Design': 85,
        'Tailwind CSS': 82,
        'React Router': 85,
        'Vite': 80,
        'Axios': 78,
        'Redux Toolkit': 82,
        'Material UI (MUI)': 78,
        'Context API': 85,
        'Node.js': 88,
        'Express.js': 85,
        'MongoDB': 82,
        'JWT Auth': 80,
        'RESTful APIs': 85,
        'Mongoose': 80,
        'Bcrypt': 75,
        'Razorpay': 72,
        'Cloudinary': 75,
        'Dotenv': 70,
        'Socket.io': 72,
        'Multer': 70,
        'MVC Architecture': 80,
        'Git & GitHub': 88,
        'NPM': 85,
        'Command Line': 80,
        'VS Code': 90,
        'Chrome DevTools': 82,
        'Postman': 78,
        'Render & Vercel': 80,
        'ESLint & Prettier': 75,
        'Debugging': 85,
        'CI/CD Pipeline': 72,
        'GPT-5': 88,
        'Opus-4.1': 85,
        'Sonnet 4.5': 82
    };

    skillItems.forEach(item => {
        const nameSpan = item.querySelector('span');
        if (!nameSpan) return;
        const name = nameSpan.textContent.trim();
        const level = skillLevels[name];
        if (level === undefined) return;

        const progress = document.createElement('div');
        progress.className = 'skill-progress';

        const bar = document.createElement('div');
        bar.className = 'skill-progress-bar';
        bar.dataset.level = level;
        progress.appendChild(bar);

        item.appendChild(progress);
    });

    // Animate on scroll
    const skillCategories = document.querySelectorAll('.skill-category');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.skill-progress-bar');
                bars.forEach((bar, i) => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.level + '%';
                    }, i * 30);
                });
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillCategories.forEach(cat => progressObserver.observe(cat));
}

// 5. Glitch Text Effect on Hero Title
function initGlitchEffect() {
    const heroTitle = document.querySelector('.hero-title .text-gradient');
    if (!heroTitle) return;

    heroTitle.classList.add('glitch-text');
    heroTitle.setAttribute('data-text', heroTitle.textContent);

    function triggerGlitch() {
        heroTitle.classList.add('glitching');
        setTimeout(() => {
            heroTitle.classList.remove('glitching');
        }, 900);

        // Random interval between glitches
        const nextDelay = 3000 + Math.random() * 8000;
        setTimeout(triggerGlitch, nextDelay);
    }

    // Start after first load
    setTimeout(triggerGlitch, 2000);
}

// 6. Cursor Glow Trail
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    let mouseX = -500;
    let mouseY = -500;
    let currentX = -500;
    let currentY = -500;
    let glowLastFrame = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow(timestamp) {
        timestamp = timestamp || performance.now();
        if (!isPageVisible) {
            requestAnimationFrame(animateGlow);
            return;
        }
        if (timestamp - glowLastFrame < FRAME_INTERVAL) {
            requestAnimationFrame(animateGlow);
            return;
        }
        glowLastFrame = timestamp;

        currentX += (mouseX - currentX) * (isMobile ? 0.15 : 0.08);
        currentY += (mouseY - currentY) * (isMobile ? 0.15 : 0.08);
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(animateGlow);
    }

    animateGlow();

    // Hide on touch devices
    if ('ontouchstart' in window) {
        glow.style.display = 'none';
    }
}

// 7. Floating Code Snippets in Hero
function initFloatingCode() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const snippets = [
        'function()', '=> {}', 'const', 'let', 'import',
        'export', 'class', 'extends', 'async', 'await',
        '<div>', '</>', '{ }', 'props', 'state',
        'useEffect', 'useState', 'return(', 'npm i', 'git push'
    ];

    function createParticle() {
        const el = document.createElement('div');
        el.className = 'code-particle';
        el.textContent = snippets[Math.floor(Math.random() * snippets.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.bottom = '0';
        el.style.fontSize = (10 + Math.random() * 8) + 'px';
        el.style.animationDuration = (12 + Math.random() * 16) + 's';
        el.style.opacity = '0.3';
        hero.appendChild(el);

        setTimeout(() => {
            if (el.parentElement) el.remove();
        }, 30000);
    }

    const particleCount = isMobile ? 2 : 6;
    const interval = isMobile ? 8000 : 5000;

    for (let i = 0; i < particleCount; i++) {
        setTimeout(createParticle, i * (isMobile ? 5000 : 3000));
    }

    setInterval(createParticle, interval);
}

// Initialize all new features (with performance optimizations)
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initParticleNetwork();
        initScrollProgress();
        initTiltEffect();
        initMagneticButtons();
        initTextScramble();
        initTechGraph();
        initProjectCodeRain();

        // Performance-optimized animations (lower CPU usage)
        initOrbitAnimation();
        if (!isMobile) {
            initBinaryRain();
        }
        initTerminalTyping();
        initSkillProgressBars();
    }, 100);
});

// Resume Preview Modal
function initResumeModal() {
    const openBtn = document.getElementById('preview-resume-btn');
    const overlay = document.getElementById('resume-modal-overlay');
    const closeBtn = document.getElementById('resume-modal-close');

    if (!openBtn || !overlay || !closeBtn) return;

    function openModal() {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
}

function initFooterClock() {
    const el = document.getElementById('footer-clock');
    if (!el) return;
    const timeSpan = el.querySelector('.clock-time');
    function tick() {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        timeSpan.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', initResumeModal);
document.addEventListener('DOMContentLoaded', initFooterClock);
document.addEventListener('DOMContentLoaded', initFormInteractions);
