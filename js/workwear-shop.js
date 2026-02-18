/**
 * CKP Workwear Shop — Frontend Logic
 * Renders products loaded by workwear-sheets.js
 * Falls back to hardcoded data if JSON/Sheets fails
 */

(function() {
    'use strict';

    console.log('[WorkwearShop] Script loaded ✅');

    const PRODUCTS_PER_PAGE = 12;

    let allProducts      = [];
    let filteredProducts = [];
    let currentPage      = 1;
    let activeCategory   = 'all';
    let currentSort      = 'popularity';
    let currentLanguage  = 'de';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Run on any page that has a products-grid element
        if (!document.getElementById('products-grid')) return;

        currentLanguage = window.location.pathname.includes('/en/') ? 'en' : 'de';
        showLoading(true);

        // 1. Try Google Sheets
        let products = null;
        if (window.WorkwearSheets) {
            products = await window.WorkwearSheets.loadProducts();
        }

        // 2. Try local JSON (multiple paths)
        if (!products || products.length === 0) {
            products = await loadLocalFallback();
        }

        // 3. Hardcoded last-resort — page is NEVER blank
        if (!products || products.length === 0) {
            console.warn('[WorkwearShop] Using hardcoded fallback.');
            products = getHardcodedFallback();
        }

        allProducts      = products;
        filteredProducts = [...allProducts];

        showLoading(false);
        renderCategories();
        renderProducts();
        bindEvents();
    }

    // ─── DATA LOADING ────────────────────────────────────────────────────────────

    async function loadLocalFallback() {
        const paths = [
            '../data/workwear-products.json',
            './data/workwear-products.json',
            'workwear-products.json',
            '../js/workwear-products.json'
        ];
        for (const path of paths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    const data = await res.json();
                    console.log('[WorkwearShop] Loaded JSON from:', path);
                    return data.products || [];
                }
            } catch (e) { /* try next */ }
        }
        return null;
    }

    function getHardcodedFallback() {
        return [
            {
                id: 'workwear-001', sku: 'WW-HOSE-001', division: 'workwear',
                name: { de: 'Arbeitshose X-Pro Stretch', en: 'Work Trousers X-Pro Stretch' },
                category: 'arbeitshosen', categoryLabel: 'Arbeitshosen',
                tags: { de: ['Arbeitshosen'], en: ['Work Trousers'] },
                badge: { de: 'BESTSELLER', en: 'BESTSELLER' },
                description: { de: 'Robuste Stretchhose mit optimaler Bewegungsfreiheit. Ideal für handwerkliche Berufe und Outdoor-Einsätze.', en: 'Robust stretch trousers with optimal freedom of movement.' },
                specs: { de: ['Stretch', 'Kniepads', 'Wasserdicht'], en: ['Stretch', 'Knee Pads', 'Water-Resistant'] },
                features: { de: ['4-Wege-Stretch-Gewebe', 'Kniepolstertaschen', 'Wasserabweisend'], en: ['4-Way Stretch', 'Knee Pad Pockets', 'Water-Repellent'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/2e7d32/ffffff?text=Arbeitshose+X-Pro',
                images: ['https://via.placeholder.com/400x400/2e7d32/ffffff?text=Arbeitshose+X-Pro'], bestseller: true
            },
            {
                id: 'workwear-002', sku: 'WW-JACK-001', division: 'workwear',
                name: { de: 'Softshell-Jacke WorkGuard', en: 'WorkGuard Softshell Jacket' },
                category: 'jacken', categoryLabel: 'Jacken & Mäntel',
                tags: { de: ['Jacken & Mäntel'], en: ['Jackets'] },
                badge: { de: 'NEU', en: 'NEW' },
                description: { de: 'Atmungsaktive Softshell-Jacke für Außeneinsätze. Wind- und wasserabweisend.', en: 'Breathable softshell jacket for outdoor use.' },
                specs: { de: ['Softshell', 'Windschutz', 'Atmungsaktiv'], en: ['Softshell', 'Windproof', 'Breathable'] },
                features: { de: ['3-Lagen-Softshell', 'Winddicht', 'Fleece-Innenfutter'], en: ['3-Layer Softshell', 'Windproof', 'Fleece Lining'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/388e3c/ffffff?text=Softshell+WorkGuard',
                images: ['https://via.placeholder.com/400x400/388e3c/ffffff?text=Softshell+WorkGuard'], bestseller: false
            },
            {
                id: 'workwear-003', sku: 'WW-WARN-001', division: 'workwear',
                name: { de: 'Warnschutzjacke EN ISO 20471', en: 'Hi-Vis Jacket EN ISO 20471' },
                category: 'warnschutz', categoryLabel: 'Warnschutz',
                tags: { de: ['Warnschutz'], en: ['Hi-Vis'] },
                badge: null,
                description: { de: 'Zertifizierte Warnschutzjacke nach EN ISO 20471 Klasse 3.', en: 'Certified hi-vis jacket to EN ISO 20471 Class 3.' },
                specs: { de: ['EN ISO 20471', 'Klasse 3', 'Reflexstreifen'], en: ['EN ISO 20471', 'Class 3', 'Reflective'] },
                features: { de: ['EN ISO 20471 Klasse 3', 'Hochreflektierend', 'Reißfest'], en: ['EN ISO 20471 Class 3', 'High-Reflective', 'Tear-Resistant'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/f57f17/ffffff?text=Warnschutz',
                images: ['https://via.placeholder.com/400x400/f57f17/ffffff?text=Warnschutz'], bestseller: false
            },
            {
                id: 'workwear-004', sku: 'WW-FLAMM-001', division: 'workwear',
                name: { de: 'Flammschutz-Overall Arc-Shield', en: 'Arc-Shield Flame Resistant Overall' },
                category: 'flammschutz', categoryLabel: 'Flammschutz',
                tags: { de: ['Flammschutz'], en: ['Flame Protection'] },
                badge: { de: 'PROFESSIONAL', en: 'PROFESSIONAL' },
                description: { de: 'Flammhemmender Overall nach EN 11612 für Schweißer und Elektriker.', en: 'Flame-resistant overall to EN 11612 for welders and electricians.' },
                specs: { de: ['EN 11612', 'Arc-Flash', 'Antistatisch'], en: ['EN 11612', 'Arc Flash', 'Antistatic'] },
                features: { de: ['EN 11612 zertifiziert', 'Lichtbogenschutz', 'Antistatisch'], en: ['EN 11612 Certified', 'Arc Flash Protection', 'Antistatic'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/b71c1c/ffffff?text=Flammschutz',
                images: ['https://via.placeholder.com/400x400/b71c1c/ffffff?text=Flammschutz'], bestseller: false
            },
            {
                id: 'workwear-005', sku: 'WW-POLO-001', division: 'workwear',
                name: { de: 'Polo-Shirt WorkPro', en: 'WorkPro Polo Shirt' },
                category: 'shirts', categoryLabel: 'Shirts & Polos',
                tags: { de: ['Shirts & Polos'], en: ['Shirts & Polos'] },
                badge: null,
                description: { de: 'Strapazierfähiges Poloshirt für den täglichen Arbeitseinsatz.', en: 'Durable polo shirt for daily work use.' },
                specs: { de: ['Atmungsaktiv', 'Formstabil', 'Piqué'], en: ['Breathable', 'Shape-Retaining', 'Piqué'] },
                features: { de: ['65% Polyester / 35% Baumwolle', 'Feuchtigkeitstransport', 'Waschbar 60°C'], en: ['65% Polyester / 35% Cotton', 'Moisture Transport', 'Washable 60°C'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/1565c0/ffffff?text=Polo+WorkPro',
                images: ['https://via.placeholder.com/400x400/1565c0/ffffff?text=Polo+WorkPro'], bestseller: false
            },
            {
                id: 'workwear-006', sku: 'WW-OVER-001', division: 'workwear',
                name: { de: 'Overall Comfort Fit 360°', en: 'Overall Comfort Fit 360°' },
                category: 'overalls', categoryLabel: 'Overalls',
                tags: { de: ['Overalls'], en: ['Overalls'] },
                badge: null,
                description: { de: 'Einteiliger Overall mit 360°-Bewegungsfreiheit für Industrie und Handwerk.', en: 'One-piece overall with 360° freedom of movement.' },
                specs: { de: ['360° Bewegung', 'Reißfest', 'Vielseitig'], en: ['360° Movement', 'Tear-Resistant', 'Versatile'] },
                features: { de: ['Elastischer Rückeneinsatz', 'Reißfestes Gewebe', 'Verstellbarer Bund'], en: ['Elastic Back Panel', 'Tear-Resistant Fabric', 'Adjustable Waist'] },
                price: 'Auf Anfrage', imageURL: 'https://via.placeholder.com/400x400/37474f/ffffff?text=Overall+360',
                images: ['https://via.placeholder.com/400x400/37474f/ffffff?text=Overall+360'], bestseller: false
            }
        ];
    }

    // ─── RENDERING ──────────────────────────────────────────────────────────────

    function renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        const categoryMap = {};
        allProducts.forEach(p => {
            const id    = p.category || 'arbeitskleidung';
            const label = p.categoryLabel || id;
            if (!categoryMap[id]) categoryMap[id] = { id, label, count: 0 };
            categoryMap[id].count++;
        });

        const allLabel = currentLanguage === 'de' ? 'Alle Produkte' : 'All Products';
        let html = `
            <div class="category-item ${activeCategory === 'all' ? 'active' : ''}" data-category="all">
                <span>${allLabel}</span>
                <span class="category-count">${allProducts.length}</span>
            </div>
        `;
        Object.values(categoryMap).forEach(cat => {
            html += `
                <div class="category-item ${activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                    <span>${cat.label}</span>
                    <span class="category-count">${cat.count}</span>
                </div>
            `;
        });

        container.innerHTML = html;
        container.querySelectorAll('.category-item').forEach(el => {
            el.addEventListener('click', () => {
                activeCategory = el.dataset.category;
                currentPage = 1;
                applyFiltersAndSort();
                renderCategories();
                renderProducts();
            });
        });
    }

    function renderProducts() {
        const grid  = document.getElementById('products-grid');
        const count = document.getElementById('products-count');
        const empty = document.getElementById('empty-state');
        if (!grid) return;

        if (filteredProducts.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            if (count) count.textContent = '0 Produkte';
            updatePagination(0);
            return;
        }

        if (empty) empty.style.display = 'none';

        const total      = filteredProducts.length;
        const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
        const start      = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const pageItems  = filteredProducts.slice(start, Math.min(start + PRODUCTS_PER_PAGE, total));

        if (count) {
            count.textContent = currentLanguage === 'de'
                ? `${total} Produkt${total !== 1 ? 'e' : ''}`
                : `${total} product${total !== 1 ? 's' : ''}`;
        }

        grid.innerHTML = pageItems.map(renderProductCard).join('');
        updatePagination(totalPages);

        requestAnimationFrame(() => {
            grid.querySelectorAll('.product-card').forEach((card, i) => {
                card.style.animationDelay = `${i * 50}ms`;
                card.classList.add('fade-in-up');
            });
        });
    }

    function renderProductCard(product) {
        const lang  = currentLanguage;
        const name  = typeof product.name === 'object' ? (product.name[lang] || product.name.de) : product.name;
        const desc  = typeof product.description === 'object' ? (product.description[lang] || product.description.de) : (product.description || '');
        const specs = typeof product.specs === 'object' && !Array.isArray(product.specs)
            ? (product.specs[lang] || product.specs.de || [])
            : (product.specs || []);
        const badge = product.badge
            ? (typeof product.badge === 'object' ? product.badge[lang] || product.badge.de : product.badge)
            : null;

        const imageURL     = product.imageURL || product.images?.[0] || '';
        const price        = product.price || 'Auf Anfrage';
        const inquiryLabel = lang === 'de' ? 'Anfragen' : 'Inquire';
        const detailsLabel = lang === 'de' ? 'Details' : 'Details';
        const safeName     = name.replace(/"/g, '&quot;');

        const badgeHTML = badge ? `<div class="product-badge badge-workwear">${badge}</div>` : '';
        const specsHTML = specs.slice(0, 3).map(s => `<span class="product-spec">${s}</span>`).join('');

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-wrapper">
                    ${badgeHTML}
                    <img
                        src="${imageURL}"
                        alt="${safeName}"
                        class="product-image"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x400/2e7d32/ffffff?text=${encodeURIComponent(name)}'"
                    >
                    <div class="product-overlay">
                        <button class="btn btn-primary btn-sm open-inquiry" data-product-id="${product.id}" data-product-name="${safeName}">
                            ${inquiryLabel}
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-specs">${specsHTML}</div>
                    <h3 class="product-name">${name}</h3>
                    <p class="product-description">${desc}</p>
                    <div class="product-footer">
                        <span class="product-price">${price}</span>
                        <button class="btn btn-secondary btn-sm view-details" data-product-id="${product.id}">
                            ${detailsLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function updatePagination(totalPages) {
        const pagination = document.getElementById('pagination');
        const prevBtn    = document.getElementById('prev-page');
        const nextBtn    = document.getElementById('next-page');
        const numbersEl  = document.getElementById('page-numbers');
        if (!pagination) return;

        if (totalPages <= 1) { pagination.style.display = 'none'; return; }
        pagination.style.display = 'flex';
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

        if (numbersEl) {
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            numbersEl.innerHTML = html;
            numbersEl.querySelectorAll('[data-page]').forEach(btn => {
                btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); renderProducts(); scrollToShop(); });
            });
        }
    }

    // ─── FILTERING & SORTING ────────────────────────────────────────────────────

    function applyFiltersAndSort() {
        filteredProducts = activeCategory === 'all'
            ? [...allProducts]
            : allProducts.filter(p => p.category === activeCategory);

        const checkedFilters = Array.from(
            document.querySelectorAll('.protection-filters input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        if (checkedFilters.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                const combined = JSON.stringify(p.specs || {}).toLowerCase() + JSON.stringify(p.tags || {}).toLowerCase();
                return checkedFilters.some(f => combined.includes(f));
            });
        }

        sortProducts(filteredProducts, currentSort);
    }

    function sortProducts(arr, mode) {
        const lang = currentLanguage;
        switch (mode) {
            case 'name-asc':  arr.sort((a, b) => getName(a, lang).localeCompare(getName(b, lang))); break;
            case 'name-desc': arr.sort((a, b) => getName(b, lang).localeCompare(getName(a, lang))); break;
            case 'newest':    arr.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0)); break;
            default:          arr.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)); break;
        }
    }

    function getName(product, lang) {
        if (typeof product.name === 'object') return product.name[lang] || product.name.de || '';
        return product.name || '';
    }

    // ─── EVENTS ─────────────────────────────────────────────────────────────────

    function bindEvents() {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentSort = sortSelect.value; currentPage = 1;
                applyFiltersAndSort(); renderProducts();
            });
        }

        document.querySelectorAll('.protection-filters input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => { currentPage = 1; applyFiltersAndSort(); renderProducts(); });
        });

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderProducts(); scrollToShop(); } });
        if (nextBtn) nextBtn.addEventListener('click', () => { currentPage++; renderProducts(); scrollToShop(); });

        // Delegated — works on dynamically rendered cards
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.addEventListener('click', e => {
                const inquiryBtn = e.target.closest('.open-inquiry');
                const detailBtn  = e.target.closest('.view-details');
                if (inquiryBtn) openInquiry(inquiryBtn.dataset.productId);
                if (detailBtn)  openProductDetails(detailBtn.dataset.productId);
            });
        }
    }

    function openInquiry(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        // Fire the same custom event that tactical shop.js fires
        // so product-inquiry.js handles it identically on all shop pages
        window.dispatchEvent(new CustomEvent('openProductInquiry', {
            detail: { product, language: currentLanguage }
        }));
    }

    function openProductDetails(productId) {
        // "Details" and "Anfragen" both open the product inquiry popup
        openInquiry(productId);
    }

    // ─── UTILITIES ──────────────────────────────────────────────────────────────

    function showLoading(show) {
        const loadingEl = document.getElementById('loading-state');
        const gridEl    = document.getElementById('products-grid');
        if (loadingEl) loadingEl.style.display = show ? 'flex' : 'none';
        if (gridEl)    gridEl.style.display     = show ? 'none' : 'grid';
    }

    function scrollToShop() {
        const section = document.querySelector('.shop-section');
        if (section) window.scrollTo({ top: section.offsetTop - 100, behavior: 'smooth' });
    }

})();