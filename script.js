// ========================================
// AK INTERNATIONAL - ADVANCED INTERACTIONS
// ========================================

(function () {
    'use strict';

    const INSTAGRAM_URL = 'https://www.instagram.com/ak_int_office/?hl=en';
    document.querySelectorAll('a[aria-label="Instagram"], a[href*="instagram.com/ak_int_office"], .social-links a').forEach(link => {
        const hasInstagramIcon = link.querySelector('.fa-instagram');
        const isInstagramText = link.textContent.trim().toLowerCase() === 'instagram';
        if (hasInstagramIcon || isInstagramText || link.getAttribute('aria-label') === 'Instagram') {
            link.href = INSTAGRAM_URL;
            link.target = '_blank';
            link.rel = 'noopener';
        }
    });

    // Config loader: optional /config.json can set { "API_BASE": "https://your-railway-url" }
    let API_BASE = '';
    let _configLoaded = false;
    async function ensureConfigLoaded() {
        if (_configLoaded) return;
        try {
            const res = await fetch('/config.json', { cache: 'no-store' });
            if (res.ok) {
                const cfg = await res.json();
                API_BASE = (cfg.API_BASE || '').replace(/\/$/, '');
            }
        } catch (e) {
            // ignore
        }
        _configLoaded = true;
    }
    // Expose for other scripts or event handlers that may run in different scopes
    try { window.ensureConfigLoaded = ensureConfigLoaded; window.API_BASE = API_BASE; } catch (e) {}

    // ===== FIXED BACKGROUND VIDEO LOOP =====
    const siteBgVideo = document.getElementById('siteBgVideo');
    if (siteBgVideo) {
        let videoFadeFrame = null;
        siteBgVideo.style.opacity = '0';

        const updateVideoFade = () => {
            if (!siteBgVideo.paused && siteBgVideo.duration) {
                const cur = siteBgVideo.currentTime;
                const dur = siteBgVideo.duration;
                const fadeDuration = 0.5;
                let opacity = 1;

                if (cur < fadeDuration) {
                    opacity = cur / fadeDuration;
                } else if (cur > dur - fadeDuration) {
                    opacity = Math.max(0, (dur - cur) / fadeDuration);
                }

                siteBgVideo.style.opacity = String(opacity);
            }

            videoFadeFrame = requestAnimationFrame(updateVideoFade);
        };

        const restartVideo = () => {
            siteBgVideo.style.opacity = '0';
            setTimeout(() => {
                siteBgVideo.currentTime = 0;
                siteBgVideo.play().catch(() => {});
            }, 100);
        };

        siteBgVideo.addEventListener('ended', restartVideo);
        siteBgVideo.addEventListener('loadeddata', () => {
            siteBgVideo.play().catch(() => {});
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                siteBgVideo.pause();
            } else {
                siteBgVideo.play().catch(() => {});
            }
        });

        updateVideoFade();
    }

    // ===== PARTICLE BACKGROUND =====
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        const particleColors = [
            [99, 102, 241],
            [15, 211, 197],
            [168, 85, 247]
        ];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Mouse interaction
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        this.x -= (dx / dist) * force * 0.8;
                        this.y -= (dy / dist) * force * 0.8;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const opacity = (1 - dist / 150) * 0.15;
                        const mix = (particles[i].color[0] + particles[j].color[0]) / 2;
                        ctx.beginPath();
                        ctx.strokeStyle = mix > 160
                            ? `rgba(99, 102, 241, ${opacity})`
                            : `rgba(15, 211, 197, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // ===== CUSTOM CURSOR =====
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let cursorX = 0, cursorY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        function animateRing() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effects
        const hoverTargets = document.querySelectorAll('a, button, .btn, .feature-card, .service-card, .tech-card, .gallery-card, .contact-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        });
    }

    // ===== NAVIGATION =====
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // Scroll effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile menu
    if (hamburger && navMenu) {
        const mobileBreakpoint = 1024;

        function setMobileMenuState(isOpen) {
            hamburger.classList.toggle('active', isOpen);
            navMenu.classList.toggle('active', isOpen);
            navbar?.classList.toggle('menu-open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (!isOpen) {
                navMenu.querySelectorAll('.nav-item--dropdown.open').forEach(item => {
                    item.classList.remove('open');
                });
            }
        }

        function closeMobileMenu() {
            setMobileMenuState(false);
        }

        hamburger.addEventListener('click', () => {
            setMobileMenuState(!navMenu.classList.contains('active'));
        });

        // Remove 'Get a Quote' on mobile
        function updateMobileNavItems() {
            const getQuote = navMenu.querySelector('.nav-link--cta');
            if (window.innerWidth <= mobileBreakpoint) {
                if (getQuote) getQuote.style.display = 'none';
            } else {
                if (getQuote) getQuote.style.display = '';
            }
        }
        updateMobileNavItems();
        window.addEventListener('resize', updateMobileNavItems);

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                // dropdown triggers are handled by the dropdown handler below
                if (link.parentElement.classList.contains('nav-item--dropdown')) return;
                closeMobileMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth > mobileBreakpoint || !navMenu.classList.contains('active')) {
                return;
            }

            if (!navbar?.contains(e.target)) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > mobileBreakpoint) {
                closeMobileMenu();
            }
        });
    }

    // Dropdowns (all pages): click/tap the trigger to pin it open; click elsewhere to close.
    // Hover also opens it on desktop (CSS), so it stays open while the cursor moves to an item.
    const dropdownItems = document.querySelectorAll('.nav-item--dropdown');
    dropdownItems.forEach(item => {
        const trigger = item.querySelector(':scope > a');
        if (!trigger) return;
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const willOpen = !item.classList.contains('open');
            dropdownItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
            });
            item.classList.toggle('open', willOpen);
            trigger.setAttribute('aria-expanded', String(willOpen));
        });
    });
    document.addEventListener('click', (e) => {
        dropdownItems.forEach(item => {
            if (!item.contains(e.target)) {
                item.classList.remove('open');
                item.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
            }
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdownItems.forEach(item => item.classList.remove('open'));
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = navbar ? navbar.offsetHeight : 0;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    // ===== SCROLL REVEAL =====
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animation for sibling elements
                    const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                    let delay = 0;
                    siblings.forEach((sibling, i) => {
                        if (sibling === entry.target) delay = i * 100;
                    });
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, Math.min(delay, 400));
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ===== HERO COUNTER ANIMATION =====
    const heroStatObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.count, 10);
                        animateCount(counter, target);
                    });
                    heroStatObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroStatObserver.observe(heroStats);

    function animateCount(el, target) {
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * target);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    // ===== CARD GLOW FOLLOW =====
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // ===== TILT EFFECT (SUBTLE) =====
    if (window.innerWidth > 768) {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const tiltX = (y - 0.5) * 6;
                const tiltY = (x - 0.5) * -6;
                card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ===== MAGNETIC BUTTONS =====
    if (window.innerWidth > 768) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ===== PARALLAX GLOW ON SCROLL =====
    const heroGlows = document.querySelectorAll('.hero-glow');
    if (heroGlows.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            heroGlows.forEach((glow, i) => {
                const speed = (i + 1) * 0.1;
                glow.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
    }

    // ===== HERO MEDIA PARALLAX =====
    const hero = document.getElementById('hero');
    const heroBanner = document.querySelector('.hero-media__banner');
    const heroSymbol = document.querySelector('.hero-media__symbol');
    if (hero && heroBanner && heroSymbol && window.innerWidth > 768) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5);
            const y = ((e.clientY - rect.top) / rect.height - 0.5);

            heroBanner.style.transform = `translate3d(calc(-50% + ${x * 22}px), calc(-50% + ${y * 18}px), 0) scale(1.06)`;
            heroSymbol.style.transform = `translate3d(calc(-50% + ${x * -14}px), calc(-50% + ${y * -10}px), 0) scale(0.98)`;
        });

        hero.addEventListener('mouseleave', () => {
            heroBanner.style.transform = '';
            heroSymbol.style.transform = '';
        });
    }

    // ===== TEXT TYPING EFFECT FOR HERO =====
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(20px)';
        line.style.transition = `opacity 0.6s ease ${i * 0.2}s, transform 0.6s ease ${i * 0.2}s`;
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 100);
    });

})();

// ===== BACK TO TOP BUTTON =====
// Create back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.classList.add('back-to-top');
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== LOADING ANIMATION =====
// No-op: removed body opacity flash that causes blank screen in Safari

// ===== ACTIVE LINK HIGHLIGHT =====
const currentLocation = location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
        link.classList.add('active');
    }
});

// ===== SERVICE CARD HOVER EFFECT =====
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== FLOATING CHAT ICON =====
(function () {
    // 1. Create and inject dynamic styles
    const styles = `
        /* Back to Top Button */
        .back-to-top {
            position: fixed;
            bottom: 105px;
            right: 35px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
        }

        .back-to-top.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .back-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.6);
        }

        .back-to-top:active {
            transform: translateY(0) scale(0.95);
        }

        /* Floating Chat Container */
        .floating-chat-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            pointer-events: none; /* Let clicks pass through except on child interactive elements */
        }

        /* Chat Trigger Button */
        .floating-chat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            outline: none;
            padding: 0;
            animation: chatFloat 3.5s ease-in-out infinite;
            pointer-events: auto; /* Re-enable pointer events */
        }

        .floating-chat-icon:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3);
            background: linear-gradient(135deg, #0891b2 0%, #4f46e5 100%);
        }

        .floating-chat-icon:active {
            transform: scale(0.95);
        }

        .floating-chat-icon svg {
            width: 28px;
            height: 28px;
            transition: transform 0.3s ease;
        }

        .floating-chat-icon:hover svg {
            transform: rotate(8deg) scale(1.05);
        }

        /* Dynamic Float Animation */
        @keyframes chatFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        /* Online/Notification Badge */
        .chat-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background-color: #10b981;
            border: 2.5px solid #0a0a0f;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
        }

        /* Online Badge Pulse */
        .chat-badge::after {
            content: '';
            position: absolute;
            top: -2.5px;
            left: -2.5px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid #10b981;
            animation: badgePulse 2s infinite ease-in-out;
            opacity: 0;
        }

        @keyframes badgePulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }

        /* Tooltip Speech Bubble */
        .chat-tooltip {
            position: absolute;
            bottom: 75px;
            right: 5px;
            width: 290px;
            background: rgba(18, 18, 26, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 14px 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(99, 102, 241, 0.2);
            color: #f1f5f9;
            opacity: 0;
            transform: translateY(10px) scale(0.95);
            transform-origin: bottom right;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 10000;
            pointer-events: auto; /* Re-enable pointer events */
        }

        .chat-tooltip.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            visibility: visible;
        }

        .chat-tooltip-content {
            font-size: 13px;
            line-height: 1.5;
            font-weight: 500;
            padding-right: 15px;
        }

        .chat-tooltip-title {
            font-size: 11px;
            font-weight: 700;
            color: #818cf8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }

        .chat-tooltip-close {
            position: absolute;
            top: 10px;
            right: 12px;
            border: none;
            background: transparent;
            color: #64748b;
            cursor: pointer;
            font-size: 14px;
            padding: 2px;
            line-height: 1;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chat-tooltip-close:hover {
            color: #f1f5f9;
        }

        /* Tooltip Little Triangle Pointer */
        .chat-tooltip::after {
            content: '';
            position: absolute;
            bottom: -6px;
            right: 24px;
            width: 12px;
            height: 12px;
            background: rgba(18, 18, 26, 0.85);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transform: rotate(45deg);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            .back-to-top {
                bottom: 87px;
                right: 23px;
                width: 46px;
                height: 46px;
                font-size: 1rem;
            }

            .floating-chat-container {
                bottom: 20px;
                right: 20px;
            }
            
            .floating-chat-icon {
                width: 52px;
                height: 52px;
            }
            
            .floating-chat-icon svg {
                width: 24px;
                height: 24px;
            }
            
            .chat-tooltip {
                bottom: 67px;
                right: 0;
                width: min(290px, calc(100vw - 40px));
                padding: 12px 14px;
            }
        }
        /* Simple chat UI elements */
        .chat-message { margin-bottom: 8px; font-size: 14px; }
        .chat-message.system { font-weight: 600; color: #e6eefc; }
        .chat-message.small { font-size: 12px; color: #cbd5e1; }
        .chat-options { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .chat-option { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 10px; cursor: pointer; font-size: 13px; color: #e6eefc; text-align: left; }
        .chat-option:hover { background: rgba(255,255,255,0.06); }
        .chat-input textarea { width: 100%; resize: vertical; margin-top: 8px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #fff; }
        .chat-input .btn { margin-top: 8px; background: #6366f1; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Create the DOM elements
    const chatContainer = document.createElement('div');
    chatContainer.className = 'floating-chat-container';
    chatContainer.id = 'floatingChatContainer';

    // Tooltip Speech Bubble
    const tooltip = document.createElement('div');
    tooltip.className = 'chat-tooltip';
    tooltip.id = 'chatTooltip';
    tooltip.innerHTML = "";

    // Chat Trigger Button
    const chatButton = document.createElement('button');
    chatButton.className = 'floating-chat-icon';
    chatButton.id = 'floatingChatIcon';
    chatButton.setAttribute('aria-label', 'Request a Call Back or Send a Query');
    chatButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chat-badge"></span>
    `;

    // Assemble components
    chatContainer.appendChild(tooltip);
    chatContainer.appendChild(chatButton);
    document.body.appendChild(chatContainer);

    // 3. Register Custom Cursor interaction if available
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    
    function registerCursorHover(el) {
        if (cursorDot && cursorRing) {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        }
    }
    
    registerCursorHover(chatButton);

    // 4. Behaviors & Animations
    // Show tooltip after 3 seconds
    let tooltipTimeout = setTimeout(() => {
        showMenu();
        tooltip.classList.add('show');
    }, 3000);

    // Call back / query request logic (submissions are emailed via Web3Forms)
    // The access key is public by design; get one at https://web3forms.com using noreply@akint.co.in
    const WEB3FORMS_ACCESS_KEY = '98b31045-1b2f-420c-9370-3f17ab4d1ccd';
    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

    // ===== "Get a Quote" — full professional request modal =====
    const QUOTE_PRODUCTS = [
        'Integrated Business Management (IBM)',
        'Web Development',
        'Advance Vehicle & Heavy Equipment Management',
        'Business Management Light',
        'Invoice Creation',
        'Inventory Management',
        'Odoo Solutions',
        'Not Sure / Other'
    ];
    const QUOTE_COMPANY_SIZES = [
        '1–10 Employees',
        '11–50 Employees',
        '51–200 Employees',
        '201–500 Employees',
        '500+ Employees'
    ];

    let quoteModalRefs = null;

    function ensureQuoteModal() {
        if (quoteModalRefs) return quoteModalRefs;

        const quoteStyles = `
            .quote-modal-overlay {
                position: fixed; inset: 0; z-index: 10050;
                background: rgba(5, 5, 10, 0.72);
                backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                display: flex; align-items: center; justify-content: center;
                padding: 24px; opacity: 0; visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .quote-modal-overlay.show { opacity: 1; visibility: visible; }
            .quote-modal {
                width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
                background: linear-gradient(180deg, rgba(20,20,28,0.98), rgba(14,14,20,0.98));
                border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
                padding: 34px 36px; box-shadow: 0 30px 80px rgba(0,0,0,0.55);
                position: relative;
                transform: translateY(16px) scale(0.97);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .quote-modal-overlay.show .quote-modal { transform: translateY(0) scale(1); }
            .quote-modal__close {
                position: absolute; top: 18px; right: 18px; width: 34px; height: 34px;
                border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04); color: #cbd5e1; font-size: 18px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: background 0.2s, color 0.2s;
            }
            .quote-modal__close:hover { background: rgba(255,255,255,0.12); color: #fff; }
            .quote-modal__eyebrow {
                font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                color: #818cf8; margin-bottom: 8px;
            }
            .quote-modal__title { font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 800; color: #fff; margin: 0 0 8px; }
            .quote-modal__subtitle { font-size: 14px; color: #9aa5b8; line-height: 1.6; margin: 0 0 26px; max-width: 480px; }
            .quote-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; }
            .quote-form__field { display: flex; flex-direction: column; gap: 6px; }
            .quote-form__field--full { grid-column: 1 / -1; }
            .quote-form__field label { font-size: 12.5px; font-weight: 600; color: #c7d0e0; }
            .quote-form__field label .req { color: #f87171; margin-left: 2px; }
            .quote-form__field input, .quote-form__field select, .quote-form__field textarea {
                width: 100%; padding: 11px 13px; border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
                color: #fff; font-size: 14px; font-family: inherit;
                transition: border-color 0.2s, background 0.2s;
            }
            .quote-form__field input::placeholder, .quote-form__field textarea::placeholder { color: #5b6476; }
            .quote-form__field input:focus, .quote-form__field select:focus, .quote-form__field textarea:focus {
                outline: none; border-color: #6366f1; background: rgba(99,102,241,0.07);
            }
            .quote-form__field select { cursor: pointer; }
            .quote-form__field select option { background: #15151d; color: #fff; }
            .quote-form__field textarea { resize: vertical; min-height: 80px; }
            .quote-form__error {
                margin-top: 14px; padding: 10px 12px; border-radius: 10px;
                background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
                color: #fca5a5; font-size: 13px; display: none;
            }
            .quote-form__footer {
                margin-top: 24px; display: flex; align-items: center; justify-content: space-between;
                gap: 16px; flex-wrap: wrap;
            }
            .quote-form__note { font-size: 11.5px; color: #6b7686; }
            .quote-form__submit {
                background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none;
                padding: 13px 28px; border-radius: 12px; font-size: 14px; font-weight: 700;
                cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                box-shadow: 0 10px 30px rgba(99,102,241,0.3);
            }
            .quote-form__submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(99,102,241,0.4); }
            .quote-form__submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            .quote-modal__success { text-align: center; padding: 22px 0 4px; }
            .quote-modal__success-icon {
                width: 62px; height: 62px; border-radius: 50%; margin: 0 auto 18px;
                background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
                color: #4ade80; display: flex; align-items: center; justify-content: center; font-size: 26px;
            }
            .quote-modal__success h3 { color: #fff; font-size: 1.3rem; margin: 0 0 10px; }
            .quote-modal__success p { color: #9aa5b8; font-size: 14px; line-height: 1.65; margin: 0 auto 24px; max-width: 420px; }
            @media (max-width: 640px) {
                .quote-modal { padding: 26px 20px; border-radius: 16px; max-height: 92vh; }
                .quote-form__grid { grid-template-columns: 1fr; }
                .quote-form__footer { flex-direction: column-reverse; align-items: stretch; }
                .quote-form__submit { justify-content: center; }
            }
        `;
        const quoteStyleEl = document.createElement('style');
        quoteStyleEl.textContent = quoteStyles;
        document.head.appendChild(quoteStyleEl);

        const overlay = document.createElement('div');
        overlay.className = 'quote-modal-overlay';
        overlay.id = 'quoteModalOverlay';
        const modal = document.createElement('div');
        modal.className = 'quote-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Request a Quote');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function close() {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('show')) close();
        });

        quoteModalRefs = { overlay, modal, close };
        return quoteModalRefs;
    }

    function optionsHtml(items) {
        return items.map(item => `<option>${item}</option>`).join('');
    }

    function renderQuoteForm(modal, close) {
        modal.innerHTML = `
            <button type="button" class="quote-modal__close" id="quoteModalClose" aria-label="Close">&times;</button>
            <div class="quote-modal__eyebrow">Request a Quote</div>
            <h2 class="quote-modal__title">Tell us about your business</h2>
            <p class="quote-modal__subtitle">Share a few details and our team will get back to you with a tailored quote within 24 hours.</p>
            <form class="quote-form" id="quoteForm" novalidate>
                <input type="text" id="quoteBotcheck" tabindex="-1" autocomplete="off" style="display:none">
                <div class="quote-form__grid">
                    <div class="quote-form__field">
                        <label for="quoteName">Full Name<span class="req">*</span></label>
                        <input type="text" id="quoteName" placeholder="Your full name" autocomplete="name">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteEmail">Work Email<span class="req">*</span></label>
                        <input type="email" id="quoteEmail" placeholder="you@company.com" autocomplete="email">
                    </div>
                    <div class="quote-form__field">
                        <label for="quotePhone">Phone Number<span class="req">*</span></label>
                        <input type="tel" id="quotePhone" placeholder="+91 00000 00000" autocomplete="tel">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteCompany">Company Name<span class="req">*</span></label>
                        <input type="text" id="quoteCompany" placeholder="Your company name" autocomplete="organization">
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteEmployees">Company Size<span class="req">*</span></label>
                        <select id="quoteEmployees">
                            <option value="" selected>Select total employees</option>
                            ${optionsHtml(QUOTE_COMPANY_SIZES)}
                        </select>
                    </div>
                    <div class="quote-form__field">
                        <label for="quoteProduct">Product Interested In<span class="req">*</span></label>
                        <select id="quoteProduct">
                            <option value="" selected>Select a product</option>
                            ${optionsHtml(QUOTE_PRODUCTS)}
                        </select>
                    </div>
                    <div class="quote-form__field quote-form__field--full">
                        <label for="quoteMessage">Requirements <span style="color:#6b7686;font-weight:500;">(optional)</span></label>
                        <textarea id="quoteMessage" rows="3" placeholder="Tell us briefly about what you need..."></textarea>
                    </div>
                </div>
                <div class="quote-form__error" id="quoteFormError"></div>
                <div class="quote-form__footer">
                    <span class="quote-form__note"><i class="fas fa-lock" style="margin-right:5px;"></i>Your information stays private.</span>
                    <button type="submit" class="quote-form__submit" id="quoteSubmitBtn">
                        <span id="quoteSubmitText">Request Quote</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </form>
        `;

        const closeBtn = modal.querySelector('#quoteModalClose');
        closeBtn.addEventListener('click', close);
        registerCursorHover(closeBtn);

        const form = modal.querySelector('#quoteForm');
        const errorEl = modal.querySelector('#quoteFormError');
        const submitBtn = modal.querySelector('#quoteSubmitBtn');
        const submitText = modal.querySelector('#quoteSubmitText');
        registerCursorHover(submitBtn);
        const val = (id) => ((modal.querySelector(id) || {}).value || '');
        const showError = (msg) => { errorEl.textContent = msg; errorEl.style.display = 'block'; };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const name = val('#quoteName').trim();
            const email = val('#quoteEmail').trim();
            const phone = val('#quotePhone').trim();
            const company = val('#quoteCompany').trim();
            const employees = val('#quoteEmployees');
            const product = val('#quoteProduct');
            const message = val('#quoteMessage').trim();

            if (!name) return showError('Please enter your full name.');
            if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid work email.');
            if (!phone) return showError('Please enter your phone number.');
            if (!company) return showError('Please enter your company name.');
            if (!employees) return showError('Please select your company size.');
            if (!product) return showError('Please select a product you are interested in.');
            if (val('#quoteBotcheck')) return; // honeypot: bots fill hidden fields

            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';

            const payload = {
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: `Quote Request from ${name} (${company}) - akint.co.in`,
                from_name: 'AK International Website',
                replyto: email,
                request_type: 'Get a Quote',
                name, email, phone, company,
                company_size: employees,
                product_interested: product,
                message: message || 'Not specified',
                page: location.href
            };

            try {
                const resp = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || !data.success) throw new Error(data.message || `Server error ${resp.status}`);

                modal.innerHTML = `
                    <button type="button" class="quote-modal__close" id="quoteModalCloseSuccess" aria-label="Close">&times;</button>
                    <div class="quote-modal__success">
                        <div class="quote-modal__success-icon"><i class="fas fa-check"></i></div>
                        <h3>Thank you, ${name}!</h3>
                        <p>We've received your request for <strong>${product}</strong>. Our team will reach out to you at ${email} within 24 hours with a tailored quote.</p>
                        <button type="button" class="quote-form__submit" id="quoteCloseBtn" style="margin:0 auto;">Close</button>
                    </div>
                `;
                const successClose = modal.querySelector('#quoteModalCloseSuccess');
                const closeBtn2 = modal.querySelector('#quoteCloseBtn');
                successClose.addEventListener('click', close);
                closeBtn2.addEventListener('click', close);
                registerCursorHover(successClose);
                registerCursorHover(closeBtn2);
            } catch (err) {
                submitBtn.disabled = false;
                submitText.textContent = 'Request Quote';
                showError('Unable to send right now. Please try again or email info@akint.co.in.');
                console.error('quote submit error', err);
            }
        });
    }

    function openQuoteModal() {
        const qm = ensureQuoteModal();
        renderQuoteForm(qm.modal, qm.close);
        qm.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    window.openQuoteModal = openQuoteModal;

    const REQUEST_TYPES = [
        { key: 'callback', label: 'Request a Call Back' },
        { key: 'query', label: 'Send a Query' }
    ];

    const fieldStyle = 'width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;';
    const labelStyle = 'font-size:12px;margin-top:8px;display:block;color:#9fb4ff';

    function populateOptions() {
        const container = tooltip.querySelector('#chatOptions');
        if (!container) return;
        container.innerHTML = '';
        REQUEST_TYPES.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option';
            btn.type = 'button';
            btn.textContent = opt.label;
            btn.dataset.key = opt.key;
            btn.addEventListener('click', () => handleOptionSelect(opt));
            container.appendChild(btn);
        });
    }

    function showMenu() {
        tooltip.innerHTML = `
            <button class="chat-tooltip-close" id="chatTooltipClose" aria-label="Close message">×</button>
            <div class="chat-tooltip-title">AK Support</div>
            <div class="chat-tooltip-body">
                <div class="chat-message system">How can we help you?</div>
                <div class="chat-message system small" id="chatPrompt">Please choose an option below:</div>
                <div class="chat-options" id="chatOptions"></div>
            </div>
        `;
        const close = tooltip.querySelector('#chatTooltipClose');
        registerCursorHover(close);
        close.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.remove('show');
            clearTimeout(tooltipTimeout);
        });
        populateOptions();
    }

    const COUNTRY_CODES = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');

    function getCountryList() {
        let names;
        try {
            const dn = new Intl.DisplayNames(['en'], { type: 'region' });
            names = COUNTRY_CODES.map(code => ({ code, name: dn.of(code) }));
        } catch (e) {
            names = [];
        }
        return names.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Detect the visitor's actual country from their IP (not browser language)
    async function detectVisitorCountryCode() {
        const sources = [
            ['https://api.country.is/', d => d.country],
            ['https://ipapi.co/json/', d => d.country_code]
        ];
        for (const [url, pick] of sources) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;
                const code = String(pick(await res.json()) || '').toUpperCase();
                if (COUNTRY_CODES.includes(code)) return code;
            } catch (e) { /* try next source */ }
        }
        return '';
    }

    function handleOptionSelect(opt) {
        const body = tooltip.querySelector('.chat-tooltip-body');
        if (!body) return;
        const isCallback = opt.key === 'callback';
        const submitLabel = isCallback ? 'Request Call Back' : 'Send Query';

        body.innerHTML = `
            <div class="chat-message system">${isCallback ? 'We will call you back soon.' : 'Tell us how we can help.'}</div>
            <div class="chat-message system small">Please share a few details.</div>
            <form class="chat-form" id="chatForm" novalidate>
                <input type="text" id="chatBotcheck" tabindex="-1" autocomplete="off" style="display:none">
                <label style="${labelStyle}">Name</label>
                <input id="chatName" type="text" placeholder="Your name" style="${fieldStyle}">
                <label style="${labelStyle}">Mobile</label>
                <input id="chatMobile" type="tel" placeholder="Mobile number" style="${fieldStyle}">
                <label style="${labelStyle}">Email</label>
                <input id="chatEmail" type="email" placeholder="you@example.com" style="${fieldStyle}">
                <label style="${labelStyle}">Country</label>
                <input id="chatCountry" type="text" autocomplete="off" placeholder="Type to search country..." style="${fieldStyle}">
                <ul id="chatCountryList" style="display:none;list-style:none;margin:4px 0 0;padding:4px;max-height:150px;overflow-y:auto;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,10,14,0.95);"></ul>
                ${isCallback
                    ? `<label style="${labelStyle}">Preferred time (optional)</label>
                       <input id="chatTime" type="text" placeholder="e.g. Today 5-7 PM IST" style="${fieldStyle}">`
                    : `<label style="${labelStyle}">Your query</label>
                       <textarea id="chatMessage" rows="3" placeholder="Describe your query..." style="${fieldStyle}resize:vertical;"></textarea>`}
                <div id="chatFormError" class="chat-message small" style="color:#fca5a5;margin-top:6px;display:none;"></div>
                <div style="display:flex;justify-content:flex-end;margin-top:8px;"><button id="chatStartBtn" type="submit" class="btn">${submitLabel}</button></div>
            </form>
        `;

        const countryInput = tooltip.querySelector('#chatCountry');
        const countryList = tooltip.querySelector('#chatCountryList');
        const countries = getCountryList();
        let countryTouched = false;

        function renderCountryList() {
            const q = countryInput.value.trim().toLowerCase();
            // Never show the full list: nothing until the visitor types, then at most 5 matches
            const matches = q ? countries.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5) : [];
            countryList.innerHTML = '';
            matches.forEach(c => {
                const li = document.createElement('li');
                li.textContent = c.name;
                li.style.cssText = 'padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;color:#e6eefc;';
                li.addEventListener('mouseenter', () => { li.style.background = 'rgba(255,255,255,0.08)'; });
                li.addEventListener('mouseleave', () => { li.style.background = ''; });
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // keep focus so blur doesn't hide the list first
                    countryInput.value = c.name;
                    countryTouched = true;
                    countryList.style.display = 'none';
                });
                countryList.appendChild(li);
            });
            countryList.style.display = matches.length ? 'block' : 'none';
        }
        countryInput.addEventListener('focus', () => countryInput.select());
        countryInput.addEventListener('input', () => { countryTouched = true; renderCountryList(); });
        countryInput.addEventListener('blur', () => { countryList.style.display = 'none'; });

        detectVisitorCountryCode().then(code => {
            const match = countries.find(c => c.code === code);
            if (match && !countryTouched) countryInput.value = match.name;
        });

        const form = tooltip.querySelector('#chatForm');
        const startBtn = tooltip.querySelector('#chatStartBtn');
        const errorEl = tooltip.querySelector('#chatFormError');
        const val = (id) => ((tooltip.querySelector(id) || {}).value || '').trim();
        const showError = (msg) => { errorEl.textContent = msg; errorEl.style.display = 'block'; };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const name = val('#chatName');
            const mobile = val('#chatMobile');
            const email = val('#chatEmail');
            const country = val('#chatCountry');
            const preferredTime = val('#chatTime');
            const message = val('#chatMessage');

            if (!name) return showError('Please enter your name.');
            if (!mobile) return showError('Please enter your mobile number.');
            if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid email.');
            if (country && !countries.some(c => c.name.toLowerCase() === country.toLowerCase())) return showError('Please pick your country from the list.');
            if (!isCallback && !message) return showError('Please enter your query.');
            if (val('#chatBotcheck')) return; // honeypot: bots fill hidden fields

            startBtn.disabled = true;
            startBtn.textContent = 'Sending...';

            const payload = {
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: `${opt.label} from ${name} (akint.co.in)`,
                from_name: 'AK International Website',
                replyto: email,
                request_type: opt.label,
                name, mobile, email, country,
                page: location.href
            };
            if (isCallback) payload.preferred_time = preferredTime || 'Not specified';
            else payload.message = message;

            try {
                const resp = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || !data.success) throw new Error(data.message || `Server error ${resp.status}`);

                body.innerHTML = '';
                const thanks = document.createElement('div');
                thanks.className = 'chat-message system';
                thanks.textContent = `Thanks ${name}! ` + (isCallback
                    ? 'We have received your request and will call you back shortly.'
                    : 'We have received your query and will get back to you soon.');
                body.appendChild(thanks);
            } catch (err) {
                startBtn.disabled = false;
                startBtn.textContent = submitLabel;
                showError('Unable to send right now. Please try again or email info@akint.co.in.');
                console.error('request submit error', err);
            }
        });
    }

    function openRequestWidget(typeKey) {
        clearTimeout(tooltipTimeout);
        showMenu();
        tooltip.classList.add('show');
        const opt = REQUEST_TYPES.find(t => t.key === typeKey);
        if (opt) handleOptionSelect(opt);
    }
    window.openRequestWidget = openRequestWidget;

    chatButton.addEventListener('click', () => {
        if (tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
        } else {
            showMenu();
            tooltip.classList.add('show');
        }
    });

    // Send "Contact", "Get a Quote", etc. links to the call back / query request instead of the contact section
    document.addEventListener('click', (e) => {
        const link = e.target.closest && e.target.closest('a[href$="#contact"]');
        if (!link) return;
        e.preventDefault();
        const linkText = (link.textContent || '').trim().toLowerCase();
        if (linkText === 'get a quote') {
            openQuoteModal();
        } else {
            openRequestWidget();
        }
    });
})();

// ===== CONSOLE MESSAGE =====
console.log('%c🚀 Welcome to AK International! ', 'background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
