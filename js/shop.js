/**
 * Shop Page - Dynamic Product Loading
 * Loads products from JSON and handles filtering/sorting
 */

(function() {
    'use strict';

    let productsData = null;
    let currentLanguage = 'de';
    let currentCategory = 'all';
    let currentDivision = 'tactical'; // Default to tactical

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Detect language
        currentLanguage = window.location.pathname.includes('/de/') ? 'de' : 'en';
        
        // Detect division from window variable or URL
        if (window.shopDivision) {
            currentDivision = window.shopDivision;
        } else if (window.location.pathname.includes('tactical')) {
            currentDivision = 'tactical';
        } else if (window.location.pathname.includes('care')) {
            currentDivision = 'care';
        }
        
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
            // First, try to load from Google Sheets
            if (window.loadSheetProducts) {
                const sheetsProducts = await window.loadSheetProducts();
                if (sheetsProducts && sheetsProducts.length > 0) {
                    console.log('Using Google Sheets products');
                    productsData = {
                        divisions: {
                            tactical: {
                                name: { de: 'CKP Tactical', en: 'CKP Tactical' },
                                categories: [
                                    { id: 'body-armor', name: { de: 'Körperschutz', en: 'Body Armor' } },
                                    { id: 'tactical-apparel', name: { de: 'Taktische Bekleidung', en: 'Tactical Apparel' } },
                                    { id: 'helmets', name: { de: 'Helme', en: 'Helmets' } },
                                    { id: 'plate-carriers', name: { de: 'Plattenträger', en: 'Plate Carriers' } },
                                    { id: 'gear', name: { de: 'Ausrüstung', en: 'Gear' } }
                                ]
                            },
                            care: {
                                name: { de: 'CKP Care', en: 'CKP Care' },
                                categories: [
                                    { id: 'protective-clothing', name: { de: 'Schutzkleidung', en: 'Protective Clothing' } },
                                    { id: 'medical-equipment', name: { de: 'Medizinische Ausrüstung', en: 'Medical Equipment' } }
                                ]
                            }
                        },
                        products: sheetsProducts
                    };
                    return;
                }
            }
            
            // Fallback to JSON file
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

        const divisionData = productsData.divisions[currentDivision];
        if (!divisionData) return;

        // Filter products by division
        const divisionProducts = productsData.products.filter(p => p.division === currentDivision);

        const allProducts = {
            id: 'all',
            name: { de: 'Alle Produkte', en: 'All Products' },
            count: divisionProducts.length
        };

        const categories = [allProducts];
        
        // Add categories with product counts
        divisionData.categories.forEach(cat => {
            const count = divisionProducts.filter(p => p.category === cat.id).length;
            if (count > 0) {
                categories.push({
                    ...cat,
                    count: count
                });
            }
        });

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

        // Filter products by division first
        let filteredProducts = productsData.products.filter(p => p.division === currentDivision);
        
        // Then filter by category
        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
        }

        // Update header
        const divisionData = productsData.divisions[currentDivision];
        if (categoryTitle && divisionData) {
            if (currentCategory === 'all') {
                categoryTitle.textContent = divisionData.name[currentLanguage];
            } else {
                const categoryObj = divisionData.categories.find(c => c.id === currentCategory);
                if (categoryObj) {
                    categoryTitle.textContent = categoryObj.name[currentLanguage];
                }
            }
        }

        if (productsCount) {
            const totalDivisionProducts = productsData.products.filter(p => p.division === currentDivision).length;
            const countText = currentLanguage === 'de' 
                ? `${filteredProducts.length} von ${totalDivisionProducts} Produkten`
                : `Showing ${filteredProducts.length} of ${totalDivisionProducts} products`;
            productsCount.textContent = countText;
        }

        // Render products
        productsGrid.innerHTML = filteredProducts.map(product => {
            const hasBadge = product.badge && product.badge[currentLanguage];
            const badgeText = hasBadge ? product.badge[currentLanguage] : '';
            const tagText = product.tags[currentLanguage][0] || '';
            const specs = product.specs[currentLanguage].join(' / ');
            
            // Get images array (fallback to single imageURL if no images array)
            const images = product.images || [product.imageURL];
            const hasMultipleImages = images.length > 1;
            
            // Generate image gallery HTML
            const imageGalleryHTML = images.map((img, idx) => 
                `<img src="${img}" alt="${product.name[currentLanguage]}" class="product-image ${idx === 0 ? 'active' : ''}" data-index="${idx}">`
            ).join('');
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image-wrapper">
                        <div class="product-images-container">
                            ${imageGalleryHTML}
                        </div>
                        ${hasMultipleImages ? `
                            <button class="image-nav image-nav-prev" data-direction="prev">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button class="image-nav image-nav-next" data-direction="next">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                            <div class="image-dots">
                                ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
                            </div>
                        ` : ''}
                        ${hasBadge ? `<div class="product-badge">${badgeText}</div>` : ''}
                    </div>
                    <div class="product-content">
                        <div class="product-category">${tagText}</div>
                        <h3 class="product-name">${product.name[currentLanguage]}</h3>
                        <div class="product-colors">${specs}</div>
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

        // Add click handlers to product cards and image navigation
        document.querySelectorAll('.product-card').forEach(card => {
            // Product click (open inquiry)
            const productContent = card.querySelector('.product-content');
            const imageWrapper = card.querySelector('.product-image-wrapper');
            
            productContent.addEventListener('click', function() {
                const productId = card.getAttribute('data-product-id');
                openProductInquiry(productId);
            });
            
            // Image navigation
            const prevBtn = card.querySelector('.image-nav-prev');
            const nextBtn = card.querySelector('.image-nav-next');
            const images = card.querySelectorAll('.product-image');
            const dots = card.querySelectorAll('.dot');
            let currentImageIndex = 0;
            
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                    updateImage();
                });
                
                nextBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    updateImage();
                });
                
                // Dot navigation
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', function(e) {
                        e.stopPropagation();
                        currentImageIndex = index;
                        updateImage();
                    });
                });
            }
            
            function updateImage() {
                images.forEach((img, idx) => {
                    img.classList.toggle('active', idx === currentImageIndex);
                });
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentImageIndex);
                });
            }
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