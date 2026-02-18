/**
 * Product Inquiry Popup
 * Opens detailed inquiry form for specific products
 */

(function() {
    'use strict';

    let currentProduct = null;
    let currentLanguage = 'de';

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        createProductInquiryPopup();
        
        // Listen for product inquiry events
        window.addEventListener('openProductInquiry', function(e) {
            currentProduct = e.detail.product;
            currentLanguage = e.detail.language;
            openPopup();
        });
    }

    function createProductInquiryPopup() {
        const popupHTML = `
            <div id="product-inquiry-popup" class="product-inquiry-popup">
                <div class="inquiry-overlay"></div>
                <div class="inquiry-content">
                    <button class="inquiry-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="inquiry-grid">
                        <!-- Left: Product Info -->
                        <div class="inquiry-product">
                            <button class="back-to-catalog">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                                <span id="back-text">ZURÜCK ZUM KATALOG</span>
                            </button>

                            <div class="product-image-large">
                                <div class="inquiry-images-container">
                                    <img id="inquiry-product-image" src="" alt="" class="inquiry-image active" data-index="0">
                                </div>
                                <button class="inquiry-nav inquiry-nav-prev" style="display: none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <button class="inquiry-nav inquiry-nav-next" style="display: none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                                <div class="inquiry-dots" style="display: none;"></div>
                            </div>

                            <div class="product-details">
                                <h2 id="inquiry-product-name"></h2>
                                <div id="inquiry-product-sku" class="product-sku"></div>
                                
                                <div id="inquiry-product-description" class="product-description"></div>
                                
                                <div id="inquiry-product-features" class="product-features">
                                    <h4>KEY SPECIFICATIONS</h4>
                                    <ul id="features-list"></ul>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Inquiry Form -->
                        <div class="inquiry-form-wrapper">
                            <h2 id="form-title">Request Information</h2>
                            <p id="form-subtitle">Please provide your details and requirements. Our specialist team will contact you within 24 hours with a custom quote.</p>

                            <form id="inquiry-form" class="inquiry-form">
                                <div class="form-row-2">
                                    <div class="form-group">
                                        <label id="label-name">Full Name</label>
                                        <input type="text" id="inquiry-name" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label id="label-org">Organization / Agency</label>
                                        <input type="text" id="inquiry-org" name="organization" required>
                                    </div>
                                </div>

                                <div class="form-row-2">
                                    <div class="form-group">
                                        <label id="label-email">Email Address</label>
                                        <input type="email" id="inquiry-email" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label id="label-phone">Phone Number</label>
                                        <input type="tel" id="inquiry-phone" name="phone">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label id="label-quantity">Quantity Needed</label>
                                    <div class="quantity-input">
                                        <input type="number" id="inquiry-quantity" name="quantity" value="1" min="1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 7h-9a2 2 0 0 1-2-2V2"></path>
                                            <path d="M4 21V10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11"></path>
                                            <rect x="8" y="10" width="8" height="11"></rect>
                                        </svg>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label id="label-message">Special Requirements or Message</label>
                                    <textarea id="inquiry-message" name="message" rows="4"></textarea>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="btn-cancel" id="cancel-btn">Cancel and Return</button>
                                    <button type="submit" class="btn-submit">
                                        <span id="submit-text">Submit Inquiry</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </button>
                                </div>

                                <div class="form-security">
                                    <div class="security-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <span id="security-text1">SECURE DATA ENCRYPTION</span>
                                    </div>
                                    <div class="security-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span id="security-text2">VERIFIED SPECIALIST RESPONSE</span>
                                    </div>
                                </div>
                            </form>

                            <div id="inquiry-success" class="inquiry-message success hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span id="success-message">Thank you! Your inquiry has been submitted successfully.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .product-inquiry-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: none;
                    overflow-y: auto;
                }

                .product-inquiry-popup.active {
                    display: block;
                }

                .inquiry-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(10px);
                    animation: fadeIn 0.3s ease;
                }

                .inquiry-content {
                    position: relative;
                    max-width: 1200px;
                    margin: 2rem auto;
                    background: linear-gradient(135deg, #2a2520 0%, #1a1512 100%);
                    border-radius: 16px;
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                }

                .inquiry-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.5);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 10;
                }

                .inquiry-close:hover {
                    background: var(--primary-color);
                    transform: rotate(90deg);
                }

                .inquiry-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                /* Left: Product Info */
                .inquiry-product {
                    background: rgba(0, 0, 0, 0.4);
                    padding: 2.5rem;
                }

                .back-to-catalog {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--primary-color);
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    transition: all 0.3s ease;
                }

                .back-to-catalog:hover {
                    gap: 0.75rem;
                }

                .product-image-large {
                    width: 100%;
                    height: 350px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 2rem;
                    position: relative;
                }

                .inquiry-images-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .inquiry-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }

                .inquiry-image.active {
                    opacity: 1;
                }

                .inquiry-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    background: rgba(0, 0, 0, 0.6);
                    border: none;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .inquiry-nav:hover {
                    background: var(--primary-color);
                    transform: translateY(-50%) scale(1.1);
                }

                .inquiry-nav-prev {
                    left: 15px;
                }

                .inquiry-nav-next {
                    right: 15px;
                }

                .inquiry-dots {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                }

                .inquiry-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .inquiry-dot:hover {
                    background: rgba(255, 255, 255, 0.8);
                    transform: scale(1.2);
                }

                .inquiry-dot.active {
                    background: var(--primary-color);
                    width: 28px;
                    border-radius: 5px;
                }

                .product-details h2 {
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .product-sku {
                    font-size: 0.85rem;
                    color: #999;
                    letter-spacing: 1px;
                    margin-bottom: 1.5rem;
                }

                .product-description {
                    color: #ccc;
                    line-height: 1.7;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                }

                .product-features h4 {
                    font-size: 0.85rem;
                    color: var(--primary-color);
                    letter-spacing: 1.5px;
                    margin-bottom: 1rem;
                }

                .product-features ul {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .product-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #ccc;
                    font-size: 0.9rem;
                }

                .product-features li::before {
                    content: '';
                    width: 6px;
                    height: 6px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                /* Right: Form */
                .inquiry-form-wrapper {
                    padding: 2.5rem;
                }

                .inquiry-form-wrapper h2 {
                    font-size: 1.75rem;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .inquiry-form-wrapper > p {
                    color: #999;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                }

                .inquiry-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-row-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    color: #ccc;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid #444;
                    color: white;
                    padding: 0.875rem;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.3s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: rgba(0, 0, 0, 0.6);
                }

                .form-group textarea {
                    resize: vertical;
                }

                .quantity-input {
                    position: relative;
                }

                .quantity-input svg {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .btn-cancel {
                    flex: 1;
                    padding: 1rem;
                    background: transparent;
                    border: 1px solid #444;
                    color: #ccc;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .btn-cancel:hover {
                    border-color: #666;
                    color: white;
                }

                .btn-submit {
                    flex: 2;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
                    border: none;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s ease;
                }

                .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
                }

                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .form-security {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #333;
                }

                .security-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #666;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                }

                .security-item svg {
                    color: var(--primary-color);
                }

                .inquiry-message {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    border-radius: 8px;
                    margin-top: 1.5rem;
                }

                .inquiry-message.success {
                    background: rgba(76, 175, 80, 0.2);
                    border: 1px solid rgba(76, 175, 80, 0.4);
                    color: #4caf50;
                }

                .inquiry-message.hidden {
                    display: none;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (max-width: 1024px) {
                    .inquiry-grid {
                        grid-template-columns: 1fr;
                    }

                    .inquiry-content {
                        margin: 1rem;
                    }

                    .inquiry-product,
                    .inquiry-form-wrapper {
                        padding: 2rem 1.5rem;
                    }

                    .form-row-2 {
                        grid-template-columns: 1fr;
                    }

                    .form-security {
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
        attachEventListeners();
    }

    function openPopup() {
        if (!currentProduct) return;

        const popup = document.getElementById('product-inquiry-popup');
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Update product info
        updateProductInfo();
        updateFormLabels();
    }

    function closePopup() {
        const popup = document.getElementById('product-inquiry-popup');
        popup.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form
        setTimeout(() => {
            document.getElementById('inquiry-form').reset();
            document.getElementById('inquiry-success').classList.add('hidden');
        }, 300);
    }

    function updateProductInfo() {
        if (!currentProduct) return;

        // Get all images
        const images = currentProduct.images || [currentProduct.imageURL];
        const hasMultipleImages = images.length > 1;

        // Update image container
        const imageContainer = document.querySelector('.inquiry-images-container');
        const prevBtn = document.querySelector('.inquiry-nav-prev');
        const nextBtn = document.querySelector('.inquiry-nav-next');
        const dotsContainer = document.querySelector('.inquiry-dots');

        // Clear and add all images
        imageContainer.innerHTML = images.map((img, idx) => 
            `<img src="${img}" alt="${currentProduct.name[currentLanguage]}" class="inquiry-image ${idx === 0 ? 'active' : ''}" data-index="${idx}">`
        ).join('');

        // Show/hide navigation if multiple images
        if (hasMultipleImages) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            dotsContainer.style.display = 'flex';

            // Create dots
            dotsContainer.innerHTML = images.map((_, idx) => 
                `<span class="inquiry-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`
            ).join('');

            // Setup navigation
            let currentImageIndex = 0;
            const allImages = imageContainer.querySelectorAll('.inquiry-image');
            const dots = dotsContainer.querySelectorAll('.inquiry-dot');

            function updateImage(index) {
                currentImageIndex = index;
                allImages.forEach((img, idx) => {
                    img.classList.toggle('active', idx === currentImageIndex);
                });
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentImageIndex);
                });
            }

            // Previous button
            prevBtn.onclick = function(e) {
                e.stopPropagation();
                const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                updateImage(newIndex);
            };

            // Next button
            nextBtn.onclick = function(e) {
                e.stopPropagation();
                const newIndex = (currentImageIndex + 1) % images.length;
                updateImage(newIndex);
            };

            // Dot navigation
            dots.forEach((dot, index) => {
                dot.onclick = function(e) {
                    e.stopPropagation();
                    updateImage(index);
                };
            });

        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dotsContainer.style.display = 'none';
        }

        // Update product details
        document.getElementById('inquiry-product-name').textContent = currentProduct.name[currentLanguage];
        document.getElementById('inquiry-product-sku').textContent = `SKU: ${currentProduct.sku}`;
        document.getElementById('inquiry-product-description').textContent = currentProduct.description[currentLanguage];

        // Features
        const featuresList = document.getElementById('features-list');
        featuresList.innerHTML = currentProduct.features[currentLanguage]
            .map(feature => `<li>${feature}</li>`)
            .join('');
    }

    function updateFormLabels() {
        const texts = currentLanguage === 'de' ? {
            backToCatalog: 'ZURÜCK ZUM KATALOG',
            formTitle: 'Anfrage stellen',
            formSubtitle: 'Bitte geben Sie Ihre Daten und Anforderungen an. Unser Spezialisten-Team wird Sie innerhalb von 24 Stunden mit einem individuellen Angebot kontaktieren.',
            fullName: 'Vollständiger Name',
            organization: 'Organisation / Behörde',
            email: 'E-Mail-Adresse',
            phone: 'Telefonnummer',
            quantity: 'Benötigte Menge',
            message: 'Spezielle Anforderungen oder Nachricht',
            cancel: 'Abbrechen',
            submit: 'Anfrage absenden',
            security1: 'SICHERE DATENVERSCHLÜSSELUNG',
            security2: 'VERIFIZIERTE SPEZIALISTEN-ANTWORT',
            success: 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.'
        } : {
            backToCatalog: 'BACK TO CATALOG',
            formTitle: 'Request Information',
            formSubtitle: 'Please provide your details and requirements. Our specialist team will contact you within 24 hours with a custom quote.',
            fullName: 'Full Name',
            organization: 'Organization / Agency',
            email: 'Email Address',
            phone: 'Phone Number',
            quantity: 'Quantity Needed',
            message: 'Special Requirements or Message',
            cancel: 'Cancel and Return',
            submit: 'Submit Inquiry',
            security1: 'SECURE DATA ENCRYPTION',
            security2: 'VERIFIED SPECIALIST RESPONSE',
            success: 'Thank you! Your inquiry has been submitted successfully.'
        };

        document.getElementById('back-text').textContent = texts.backToCatalog;
        document.getElementById('form-title').textContent = texts.formTitle;
        document.getElementById('form-subtitle').textContent = texts.formSubtitle;
        document.getElementById('label-name').textContent = texts.fullName;
        document.getElementById('label-org').textContent = texts.organization;
        document.getElementById('label-email').textContent = texts.email;
        document.getElementById('label-phone').textContent = texts.phone;
        document.getElementById('label-quantity').textContent = texts.quantity;
        document.getElementById('label-message').textContent = texts.message;
        document.getElementById('cancel-btn').textContent = texts.cancel;
        document.getElementById('submit-text').textContent = texts.submit;
        document.getElementById('security-text1').textContent = texts.security1;
        document.getElementById('security-text2').textContent = texts.security2;
        document.getElementById('success-message').textContent = texts.success;
    }

    function attachEventListeners() {
        const popup = document.getElementById('product-inquiry-popup');
        const closeBtn = popup.querySelector('.inquiry-close');
        const overlay = popup.querySelector('.inquiry-overlay');
        const cancelBtn = popup.querySelector('.btn-cancel');
        const backBtn = popup.querySelector('.back-to-catalog');
        const form = document.getElementById('inquiry-form');

        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        backBtn.addEventListener('click', closePopup);

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                closePopup();
            }
        });

        // Form submission
        form.addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('.btn-submit');
        const successMsg = document.getElementById('inquiry-success');

        const formData = {
            product: currentProduct.name[currentLanguage],
            sku: currentProduct.sku,
            name: form.name.value,
            organization: form.organization.value,
            email: form.email.value,
            phone: form.phone.value,
            quantity: form.quantity.value,
            message: form.message.value
        };

        // Disable button
        submitBtn.disabled = true;
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = currentLanguage === 'de' ? 'Wird gesendet...' : 'Sending...';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success
            successMsg.classList.remove('hidden');
            form.reset();
            
            console.log('Product inquiry submitted:', formData);

            // Auto close after 3 seconds
            setTimeout(() => {
                closePopup();
            }, 3000);

        } catch (error) {
            console.error('Submission error:', error);
            alert(currentLanguage === 'de' 
                ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
                : 'An error occurred. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = originalText;
        }
    }

})();