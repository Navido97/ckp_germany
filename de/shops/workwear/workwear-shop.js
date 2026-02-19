/**
 * workwear-shop.js
 * Product rendering and filtering for CKP Workwear Shop
 */

(function() {
    'use strict';

    let productsData    = null;
    let currentLanguage = 'de';
    let currentCategory = 'all';
    const DIVISION      = 'workwear';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        console.log('[WorkwearShop] ✅ Script loaded');
        currentLanguage = window.location.pathname.includes('/en/') ? 'en' : 'de';
        await loadProducts();
        renderCategories();
        renderProducts();
        attachEventListeners();
    }

    async function loadProducts() {
        try {
            if (window.loadSheetProducts) {
                const sheetsProducts = await window.loadSheetProducts();
                if (sheetsProducts && sheetsProducts.length > 0) {
                    productsData = buildProductsData(sheetsProducts);
                    return;
                }
            }
            console.log('[WorkwearShop] Falling back to JSON...');
            const res = await fetch('../../data/products.json');
            productsData = await res.json();
        } catch (err) {
            console.error('[WorkwearShop] Failed to load products:', err);
            productsData = { divisions: {}, products: [] };
        }
    }

    function buildProductsData(products) {
        return {
            divisions: {
                workwear: {
                    name: { de: 'CKP Workwear', en: 'CKP Workwear' },
                    categories: [
                        { id: 'jackets',          name: { de: 'Jacken',           en: 'Jackets'        } },
                        { id: 'trousers',         name: { de: 'Hosen',            en: 'Trousers'       } },
                        { id: 'coveralls',        name: { de: 'Overalls',         en: 'Coveralls'      } },
                        { id: 'vests',            name: { de: 'Westen',           en: 'Vests'          } },
                        { id: 'shirts',           name: { de: 'Hemden & Shirts',  en: 'Shirts'         } },
                        { id: 'protection',       name: { de: 'Schutzkleidung',   en: 'Protection'     } },
                        { id: 'workwear-apparel', name: { de: 'Berufsbekleidung', en: 'Work Apparel'   } },
                        { id: 'accessories',      name: { de: 'Zubehör',          en: 'Accessories'    } }
                    ]
                }
            },
            products
        };
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────────

    function renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container || !productsData) return;

        const divisionData     = productsData.divisions[DIVISION];
        if (!divisionData) return;

        const divisionProducts = productsData.products.filter(p => p.division === DIVISION);

        const categories = [
            { id: 'all', name: { de: 'Alle Produkte', en: 'All Products' }, count: divisionProducts.length },
            ...divisionData.categories
                .map(cat => ({ ...cat, count: divisionProducts.filter(p => p.category === cat.id).length }))
                .filter(cat => cat.count > 0)
        ];

        container.innerHTML = categories.map(cat => `
            <button class="category-item ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
                <span>${cat.name[currentLanguage]}</span>
                <span class="category-count">${cat.count}</span>
            </button>
        `).join('');
    }

    function renderProducts() {
        const grid    = document.getElementById('products-grid');
        const countEl = document.getElementById('products-count');
        const titleEl = document.getElementById('category-title');
        if (!grid || !productsData) return;

        let products = productsData.products.filter(p => p.division === DIVISION);
        if (currentCategory !== 'all') {
            products = products.filter(p => p.category === currentCategory);
        }

        const divisionData = productsData.divisions[DIVISION];
        if (titleEl && divisionData) {
            if (currentCategory === 'all') {
                titleEl.textContent = divisionData.name[currentLanguage];
            } else {
                const cat = divisionData.categories.find(c => c.id === currentCategory);
                if (cat) titleEl.textContent = cat.name[currentLanguage];
            }
        }

        if (countEl) {
            const total = productsData.products.filter(p => p.division === DIVISION).length;
            countEl.textContent = currentLanguage === 'de'
                ? `${products.length} von ${total} Produkten`
                : `${products.length} of ${total} products`;
        }

        grid.innerHTML = products.map((product, idx) => renderProductCard(product, idx)).join('');
        bindCardEvents();
    }

    function renderProductCard(product) {
        const lang   = currentLanguage;
        const name   = product.name[lang];
        const tag    = product.tags[lang][0] || '';
        const specs  = product.specs[lang].join(' / ');
        const badge  = product.badge ? product.badge[lang] : null;
        const images = product.images || [product.imageURL];
        const multi  = images.length > 1;

        const imgHTML = images.map((src, i) => `
            <img
                src="${src}"
                alt="${name}"
                class="product-image ${i === 0 ? 'active' : ''}"
                data-index="${i}"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/400x400/2d4a2d/a3c47a?text=${encodeURIComponent(name)}';"
            >
        `).join('');

        const navHTML = multi ? `
            <button class="image-nav image-nav-prev">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="image-nav image-nav-next">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="image-dots">
                ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
            </div>
        ` : '';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-wrapper">
                    <div class="product-images-container">${imgHTML}</div>
                    ${navHTML}
                    ${badge ? `<div class="product-badge">${badge}</div>` : ''}
                </div>
                <div class="product-content">
                    <div class="product-category">${tag}</div>
                    <h3 class="product-name">${name}</h3>
                    <div class="product-specs">${specs}</div>
                    <button class="product-cta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        ${lang === 'de' ? 'ANFRAGE STELLEN' : 'REQUEST INFO'}
                    </button>
                </div>
            </div>
        `;
    }

    function bindCardEvents() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.querySelector('.product-content').addEventListener('click', () => {
                const product = productsData.products.find(p => p.id === card.dataset.productId);
                if (!product) return;
                window.dispatchEvent(new CustomEvent('openProductInquiry', {
                    detail: { product, language: currentLanguage }
                }));
            });

            const images = card.querySelectorAll('.product-image');
            const dots   = card.querySelectorAll('.dot');
            const prev   = card.querySelector('.image-nav-prev');
            const next   = card.querySelector('.image-nav-next');
            let idx = 0;

            const go = (newIdx) => {
                idx = (newIdx + images.length) % images.length;
                images.forEach((img, i) => img.classList.toggle('active', i === idx));
                dots.forEach((dot, i)   => dot.classList.toggle('active', i === idx));
            };

            if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(idx - 1); });
            if (next) next.addEventListener('click', e => { e.stopPropagation(); go(idx + 1); });
            dots.forEach((dot, i) => dot.addEventListener('click', e => { e.stopPropagation(); go(i); }));
        });
    }

    // ─── EVENTS ──────────────────────────────────────────────────────────────────

    function attachEventListeners() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.category-item');
            if (!btn) return;
            document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
            document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        document.getElementById('sort-select')?.addEventListener('change', function() {
            const grid  = document.getElementById('products-grid');
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            cards.sort((a, b) => {
                const na = a.querySelector('.product-name').textContent;
                const nb = b.querySelector('.product-name').textContent;
                if (this.value === 'name-asc')  return na.localeCompare(nb);
                if (this.value === 'name-desc') return nb.localeCompare(na);
                const ba = !!a.querySelector('.product-badge');
                const bb = !!b.querySelector('.product-badge');
                return (bb ? 1 : 0) - (ba ? 1 : 0);
            });
            grid.innerHTML = '';
            cards.forEach(c => grid.appendChild(c));
        });
    }

})();