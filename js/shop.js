/**
 * Shop Page - Dynamic Product Loading
 * Loads products from JSON and handles filtering/sorting
 */

(function() {
    'use strict';

    let productsData = null;
    let currentLanguage = 'de';
    let currentCategory = 'all';

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Detect language
        currentLanguage = window.location.pathname.includes('/de/') ? 'de' : 'en';
        
        // Load products data
        await loadProducts();
        
        // Render UI
        renderCategories();
        renderProducts();
        
        // Attach event listeners
        attachEventListeners();
    }

    async function loadProducts() {
        try {
            const response = await fetch('../data/products.json');
            productsData = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            productsData = { categories: [], products: [] };
        }
    }

    function renderCategories() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList || !productsData) return;

        const allProducts = {
            id: 'all',
            name: { de: 'Alle Produkte', en: 'All Equipment' },
            count: productsData.products.length
        };

        const categories = [allProducts, ...productsData.categories];

        categoriesList.innerHTML = categories.map(cat => `
            <button class="category-item ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
                <span>${cat.name[currentLanguage]}</span>
                <span class="category-count">${cat.count}</span>
            </button>
        `).join('');
    }

    function renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const productsCount = document.getElementById('products-count');
        const categoryTitle = document.getElementById('category-title');
        
        if (!productsGrid || !productsData) return;

        // Filter products
        let filteredProducts = productsData.products;
        if (currentCategory !== 'all') {
            filteredProducts = productsData.products.filter(p => p.category === currentCategory);
        }

        // Update header
        const categoryObj = productsData.categories.find(c => c.id === currentCategory);
        if (categoryTitle) {
            if (currentCategory === 'all') {
                categoryTitle.textContent = currentLanguage === 'de' ? 'Alle Produkte' : 'All Equipment';
            } else if (categoryObj) {
                categoryTitle.textContent = categoryObj.name[currentLanguage];
            }
        }

        if (productsCount) {
            const countText = currentLanguage === 'de' 
                ? `${filteredProducts.length} von ${productsData.products.length} Produkten`
                : `Showing ${filteredProducts.length} of ${productsData.products.length} products`;
            productsCount.textContent = countText;
        }

        // Render products
        productsGrid.innerHTML = filteredProducts.map(product => {
            const isBestseller = product.bestseller;
            const tagText = product.tags[currentLanguage][0] || '';
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image-wrapper">
                        <img src="../images/products/${product.image}" alt="${product.name[currentLanguage]}" class="product-image" onerror="this.src='../images/products/placeholder.jpg'">
                        ${isBestseller ? '<div class="product-badge">BESTSELLER</div>' : ''}
                    </div>
                    <div class="product-content">
                        <div class="product-category">${tagText}</div>
                        <h3 class="product-name">${product.name[currentLanguage]}</h3>
                        <div class="product-colors">${product.colors.join(' / ')}</div>
                        <button class="product-cta">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            ${currentLanguage === 'de' ? 'ANFRAGE STELLEN' : 'INQUIRY FORM'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                openProductInquiry(productId);
            });
        });
    }

    function openProductInquiry(productId) {
        const product = productsData.products.find(p => p.id === productId);
        if (!product) return;

        // Dispatch event for product inquiry popup
        const event = new CustomEvent('openProductInquiry', {
            detail: { product, language: currentLanguage }
        });
        window.dispatchEvent(event);
    }

    function attachEventListeners() {
        // Category filters
        document.addEventListener('click', function(e) {
            if (e.target.closest('.category-item')) {
                const button = e.target.closest('.category-item');
                const category = button.getAttribute('data-category');
                
                // Update active state
                document.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                
                // Update current category and re-render
                currentCategory = category;
                renderProducts();
                
                // Smooth scroll to products
                document.querySelector('.products-grid').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                sortProducts(this.value);
            });
        }
    }

    function sortProducts(sortType) {
        const productsGrid = document.getElementById('products-grid');
        const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));

        productCards.sort((a, b) => {
            const nameA = a.querySelector('.product-name').textContent;
            const nameB = b.querySelector('.product-name').textContent;

            switch(sortType) {
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                case 'newest':
                    return 0; // Keep original order
                case 'popularity':
                default:
                    // Bestsellers first
                    const hasBadgeA = a.querySelector('.product-badge') !== null;
                    const hasBadgeB = b.querySelector('.product-badge') !== null;
                    if (hasBadgeA && !hasBadgeB) return -1;
                    if (!hasBadgeA && hasBadgeB) return 1;
                    return 0;
            }
        });

        // Re-append sorted cards
        productsGrid.innerHTML = '';
        productCards.forEach(card => productsGrid.appendChild(card));
    }

})();