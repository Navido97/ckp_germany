// Header Component with HTML, CSS, and JavaScript
(function() {
    const headerHTML = `
        <style>
            .header {
                position: fixed;
                top: 0; left: 0; right: 0;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }

            .header.scrolled { background: rgba(255,255,255,0.98); box-shadow: 0 2px 30px rgba(0,0,0,0.1); }

            .header-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 80px;
            }

            .logo { display: flex; align-items: center; text-decoration: none; transition: transform 0.3s ease; }
            .logo:hover { transform: translateY(-2px); }
            .logo-image { width: 150px; height: auto; object-fit: contain; }

            .nav { display: flex; align-items: center; gap: 2.5rem; }
            .nav-links { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }

            .nav-link {
                text-decoration: none;
                color: #333;
                font-weight: 500;
                font-size: 0.95rem;
                position: relative;
                transition: color 0.3s ease;
                padding: 0.5rem 0;
            }

            .nav-link::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0;
                width: 0; height: 2px;
                background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
                transition: width 0.3s ease;
            }

            .nav-link:hover { color: #ff6b35; }
            .nav-link:hover::after { width: 100%; }
            .nav-link.active { color: #ff6b35; }
            .nav-link.active::after { width: 100%; }

            .lang-switcher { display: flex; gap: 0.5rem; align-items: center; }

            .lang-btn {
                padding: 0.4rem 0.8rem;
                border: none;
                background: transparent;
                color: #666;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 4px;
                text-decoration: none;
            }

            .lang-btn:hover { background: #f5f5f5; color: #ff6b35; }
            .lang-btn.active { background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; }

            .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: 0.5rem; color: #333; }
            .mobile-menu-btn svg { width: 28px; height: 28px; }

            @media (max-width: 768px) {
                .header-container { height: 70px; padding: 0 1.5rem; }
                .nav {
                    position: fixed;
                    top: 70px; left: 0; right: 0;
                    background: rgba(255,255,255,0.98);
                    backdrop-filter: blur(10px);
                    flex-direction: column;
                    gap: 0; padding: 2rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    transform: translateY(-100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                }
                .nav.active { transform: translateY(0); opacity: 1; pointer-events: all; }
                .nav-links { flex-direction: column; gap: 1.5rem; width: 100%; }
                .nav-link { font-size: 1.1rem; padding: 0.5rem 0; }
                .mobile-menu-btn { display: block; }
                .lang-switcher { margin-top: 1rem; }
            }
        </style>

        <header class="header">
            <div class="header-container">
                <a href="index.html" class="logo">
                    <img src="" data-logo="true" alt="CKP Germany Logo" class="logo-image">
                </a>

                <nav class="nav" id="nav">
                    <ul class="nav-links">
                        <li><a href="index.html" class="nav-link">HOME</a></li>
                        <li><a href="about.html" class="nav-link">ABOUT US</a></li>
                        <li><a href="contact.html" class="nav-link">CONTACT</a></li>
                    </ul>

                    <div class="lang-switcher">
                        <a href="../de/index.html" class="lang-btn">DE</a>
                        <a href="index.html" class="lang-btn active">EN</a>
                    </div>
                </nav>

                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    `;

    function insertHeader() {
        const container = document.getElementById('header-container');
        if (container) {
            container.innerHTML = headerHTML;

            // Dynamic logo path — works at any folder depth
            const _segs = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
            const _root = _segs.length > 1 ? '../'.repeat(_segs.length - 1) : './';
            document.querySelectorAll('[data-logo]').forEach(el => { el.src = _root + 'images/logos/logo.png'; });

            const header = document.querySelector('.header');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const nav = document.getElementById('nav');
            const navLinks = document.querySelectorAll('.nav-link');

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';

            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                link.classList.remove('active');
                if (linkHref === currentPage ||
                    (currentPage === 'index.html'   && linkHref === 'index.html') ||
                    (currentPage === 'about.html'   && linkHref === 'about.html') ||
                    (currentPage === 'contact.html' && linkHref === 'contact.html')) {
                    link.classList.add('active');
                }
            });

            window.addEventListener('scroll', function() {
                header.classList.toggle('scrolled', window.pageYOffset > 50);
            });

            if (mobileMenuBtn && nav) {
                mobileMenuBtn.addEventListener('click', function() { nav.classList.toggle('active'); });
            }

            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    nav.classList.remove('active');
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertHeader);
    } else {
        insertHeader();
    }
})();