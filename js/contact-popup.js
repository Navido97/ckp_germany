/**
 * Contact Popup Modal
 * Creates and handles popup contact form
 * Supports pre-filling subject/product when triggered from a product card
 */

(function() {
    'use strict';

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        createPopupHTML();
        attachEventListeners();
        addAOSAnimations();
    }

    function createPopupHTML() {
        // Detect language
        const isGerman = !window.location.pathname.includes('/en/');
        
        const texts = isGerman ? {
            title: 'Kontakt aufnehmen',
            subtitle: 'Wir antworten innerhalb von 24 Stunden',
            productTitle: 'Produktanfrage',
            productSubtitle: 'Wir melden uns schnellstmöglich bei Ihnen',
            name: 'Name',
            email: 'E-Mail',
            subject: 'Betreff',
            message: 'Nachricht',
            send: 'Nachricht senden',
            sending: 'Wird gesendet...',
            success: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.',
            error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
            requiredFields: 'Bitte füllen Sie alle Pflichtfelder aus.',
            invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            messageLength: 'Ihre Nachricht muss mindestens 10 Zeichen lang sein.',
            productLabel: 'Produkt',
            messagePlaceholder: 'Ihre Nachricht...',
            productMessagePlaceholder: 'Ich interessiere mich für dieses Produkt und habe folgende Fragen:'
        } : {
            title: 'Get in touch',
            subtitle: 'We respond within 24 hours',
            productTitle: 'Product Inquiry',
            productSubtitle: 'We will get back to you as soon as possible',
            name: 'Name',
            email: 'Email',
            subject: 'Subject',
            message: 'Message',
            send: 'Send message',
            sending: 'Sending...',
            success: 'Thank you! Your message has been sent successfully.',
            error: 'An error occurred. Please try again.',
            requiredFields: 'Please fill in all required fields.',
            invalidEmail: 'Please enter a valid email address.',
            messageLength: 'Your message must be at least 10 characters long.',
            productLabel: 'Product',
            messagePlaceholder: 'Your message...',
            productMessagePlaceholder: 'I am interested in this product and have the following questions:'
        };

        const popupHTML = `
            <div id="contact-popup" class="contact-popup">
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <button class="popup-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    <div class="popup-header">
                        <h2 id="popup-title">${texts.title}</h2>
                        <p id="popup-subtitle">${texts.subtitle}</p>
                    </div>

                    <!-- Product badge — shown only for product inquiries -->
                    <div id="popup-product-badge" class="popup-product-badge hidden">
                        <span class="product-badge-icon">📦</span>
                        <span id="popup-product-name-display"></span>
                    </div>
                    
                    <form id="popup-contact-form" class="popup-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="popup-name">${texts.name} *</label>
                                <input type="text" id="popup-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="popup-email">${texts.email} *</label>
                                <input type="email" id="popup-email" name="email" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="popup-subject">${texts.subject} *</label>
                            <input type="text" id="popup-subject" name="subject" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="popup-message">${texts.message} *</label>
                            <textarea id="popup-message" name="message" rows="5" required placeholder="${texts.messagePlaceholder}"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary popup-submit">
                            <span class="btn-text">${texts.send}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                    
                    <div id="popup-success" class="popup-message success hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        ${texts.success}
                    </div>
                    
                    <div id="popup-error" class="popup-message error hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        ${texts.error}
                    </div>
                </div>
            </div>
            
            <style>
                .contact-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }

                .contact-popup.active {
                    display: flex;
                }

                .popup-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    animation: fadeIn 0.3s ease;
                }

                .popup-content {
                    position: relative;
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .popup-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: none;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #666;
                }

                .popup-close:hover {
                    background: #f5f5f5;
                    color: var(--primary-color);
                    transform: rotate(90deg);
                }

                .popup-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .popup-header h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-dark);
                }

                .popup-header p {
                    color: var(--text-light);
                    font-size: 1rem;
                }

                /* Product badge shown when triggered from a product card */
                .popup-product-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 0.875rem 1.25rem;
                    margin-bottom: 1.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: var(--text-dark);
                    transition: all 0.3s ease;
                }

                .popup-product-badge.hidden {
                    display: none;
                }

                .product-badge-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .popup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-dark);
                    font-size: 0.95rem;
                }

                .form-group input,
                .form-group textarea {
                    padding: 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.3s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .popup-submit {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    width: 100%;
                }

                .popup-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .popup-message {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    border-radius: 12px;
                    margin-top: 1.5rem;
                    font-weight: 500;
                    animation: slideDown 0.3s ease;
                }

                .popup-message.success {
                    background: #d4edda;
                    color: #155724;
                    border: 2px solid #c3e6cb;
                }

                .popup-message.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 2px solid #f5c6cb;
                }

                .popup-message.hidden {
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

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @media (max-width: 768px) {
                    .popup-content {
                        padding: 2rem 1.5rem;
                        border-radius: 16px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .popup-header h2 {
                        font-size: 1.75rem;
                    }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Store texts globally for use by other scripts
        window.contactPopupTexts = texts;
    }

    function attachEventListeners() {
        const popup      = document.getElementById('contact-popup');
        const closeButton = popup.querySelector('.popup-close');
        const overlay    = popup.querySelector('.popup-overlay');
        const form       = document.getElementById('popup-contact-form');

        // Generic open buttons (sidebar CTA etc.) — no product context
        document.querySelectorAll('.open-contact-popup').forEach(btn => {
            btn.addEventListener('click', () => openPopup());
        });

        // Product card "Anfragen" buttons — delegated on document so it works
        // for dynamically rendered cards (shop.js, workwear-shop.js, etc.)
        document.addEventListener('click', e => {
            const btn = e.target.closest('.open-inquiry');
            if (!btn) return;

            const productName = btn.dataset.productName || btn.dataset.productname || '';
            const productId   = btn.dataset.productId   || btn.dataset.productid   || '';
            openPopup({ productName, productId });
        });

        // Close handlers
        const closePopup = () => {
            popup.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                resetPopup();
            }, 300);
        };

        closeButton.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
        });

        // Form submission
        form.addEventListener('submit', handleSubmit);
    }

    /**
     * Open the popup.
     * @param {Object} [options]
     * @param {string} [options.productName]  - Pre-fills subject & shows product badge
     * @param {string} [options.productId]    - Stored on form as data attribute
     * @param {string} [options.subject]      - Generic subject override
     */
    function openPopup(options) {
        options = options || {};

        const popup        = document.getElementById('contact-popup');
        const titleEl      = document.getElementById('popup-title');
        const subtitleEl   = document.getElementById('popup-subtitle');
        const subjectInput = document.getElementById('popup-subject');
        const messageArea  = document.getElementById('popup-message');
        const badge        = document.getElementById('popup-product-badge');
        const badgeName    = document.getElementById('popup-product-name-display');
        const form         = document.getElementById('popup-contact-form');
        const texts        = window.contactPopupTexts;

        if (options.productName) {
            // Product inquiry mode
            titleEl.textContent    = texts.productTitle;
            subtitleEl.textContent = texts.productSubtitle;
            subjectInput.value     = `Anfrage: ${options.productName}`;
            messageArea.placeholder = texts.productMessagePlaceholder;
            badge.classList.remove('hidden');
            badgeName.textContent  = options.productName;
            if (options.productId) form.dataset.productId = options.productId;
        } else {
            // Generic contact mode
            titleEl.textContent    = texts.title;
            subtitleEl.textContent = texts.subtitle;
            subjectInput.value     = options.subject || '';
            messageArea.placeholder = texts.messagePlaceholder;
            badge.classList.add('hidden');
            delete form.dataset.productId;
        }

        popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus name field after animation
        setTimeout(() => {
            document.getElementById('popup-name').focus();
        }, 300);
    }

    function resetPopup() {
        const form      = document.getElementById('popup-contact-form');
        const titleEl   = document.getElementById('popup-title');
        const subtitleEl = document.getElementById('popup-subtitle');
        const badge     = document.getElementById('popup-product-badge');
        const texts     = window.contactPopupTexts;

        form.reset();
        titleEl.textContent    = texts.title;
        subtitleEl.textContent = texts.subtitle;
        badge.classList.add('hidden');
        delete form.dataset.productId;

        document.getElementById('popup-success').classList.add('hidden');
        document.getElementById('popup-error').classList.add('hidden');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const form      = e.target;
        const submitBtn = form.querySelector('.popup-submit');
        const btnText   = submitBtn.querySelector('.btn-text');
        const successMsg = document.getElementById('popup-success');
        const errorMsg  = document.getElementById('popup-error');
        const texts     = window.contactPopupTexts;

        const formData = {
            name:      form.name.value,
            email:     form.email.value,
            subject:   form.subject.value,
            message:   form.message.value,
            productId: form.dataset.productId || null
        };

        if (!validateForm(formData, texts)) return;

        // Disable button & show spinner
        submitBtn.disabled = true;
        btnText.textContent = texts.sending;
        submitBtn.querySelector('svg').classList.add('spinner');
        successMsg.classList.add('hidden');
        errorMsg.classList.add('hidden');

        try {
            // TODO: Replace with real API call, e.g. fetch('/api/contact', { method:'POST', body: JSON.stringify(formData) })
            await new Promise(resolve => setTimeout(resolve, 1500));

            successMsg.classList.remove('hidden');
            form.reset();
            console.log('[ContactPopup] Form submitted:', formData);

            // Auto-close after success
            setTimeout(() => {
                document.getElementById('contact-popup').classList.remove('active');
                document.body.style.overflow = '';
                setTimeout(() => successMsg.classList.add('hidden'), 300);
            }, 3000);

        } catch (error) {
            errorMsg.classList.remove('hidden');
            console.error('[ContactPopup] Submission error:', error);
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = texts.send;
            submitBtn.querySelector('svg').classList.remove('spinner');
        }
    }

    function validateForm(data, texts) {
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert(texts.requiredFields);
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            alert(texts.invalidEmail);
            return false;
        }
        if (data.message.length < 10) {
            alert(texts.messageLength);
            return false;
        }
        return true;
    }

    function addAOSAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('aos-animate');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
    }

    // Expose globally so other scripts (workwear-shop.js, shop.js etc.) can call it directly
    window.openContactPopup = openPopup;

})();