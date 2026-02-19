/**
 * workwear-inquiry.js
 * Product inquiry popup for CKP Workwear Shop
 */

(function() {
    'use strict';

    let currentProduct  = null;
    let currentLanguage = 'de';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        createPopup();
        window.addEventListener('openProductInquiry', function(e) {
            currentProduct  = e.detail.product;
            currentLanguage = e.detail.language;
            openPopup();
        });
    }

    function createPopup() {
        const popupHTML = `
            <div id="product-inquiry-popup" class="ww-inquiry-popup">
                <div class="ww-overlay"></div>
                <div class="ww-content">
                    <button class="ww-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="ww-grid">
                        <!-- Left: Product -->
                        <div class="ww-product-side">
                            <button class="ww-back">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                <span id="back-text">ZURÜCK ZUM KATALOG</span>
                            </button>

                            <div class="ww-image-area">
                                <div class="ww-images-container"></div>
                                <button class="ww-nav ww-nav-prev" style="display:none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button class="ww-nav ww-nav-next" style="display:none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                                <div class="ww-dots" style="display:none;"></div>
                            </div>

                            <div class="ww-product-info">
                                <h2 id="ww-product-name"></h2>
                                <div id="ww-product-sku" class="ww-sku"></div>
                                <div id="ww-product-description" class="ww-description"></div>
                                <div id="ww-product-features" class="ww-features">
                                    <h4>PRODUKTSPEZIFIKATIONEN</h4>
                                    <ul id="ww-features-list"></ul>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Form -->
                        <div class="ww-form-side">
                            <h2 id="ww-form-title">Anfrage stellen</h2>
                            <p id="ww-form-subtitle">Bitte geben Sie Ihre Daten und Anforderungen an. Unser Team antwortet innerhalb von 24 Stunden.</p>

                            <form id="ww-inquiry-form" class="ww-form">
                                <div class="ww-row-2">
                                    <div class="ww-group">
                                        <label id="lbl-name">Vollständiger Name</label>
                                        <input type="text" name="name" required>
                                    </div>
                                    <div class="ww-group">
                                        <label id="lbl-org">Unternehmen / Organisation</label>
                                        <input type="text" name="organization" required>
                                    </div>
                                </div>
                                <div class="ww-row-2">
                                    <div class="ww-group">
                                        <label id="lbl-email">E-Mail-Adresse</label>
                                        <input type="email" name="email" required>
                                    </div>
                                    <div class="ww-group">
                                        <label id="lbl-phone">Telefonnummer</label>
                                        <input type="tel" name="phone">
                                    </div>
                                </div>
                                <div class="ww-group">
                                    <label id="lbl-quantity">Benötigte Menge</label>
                                    <input type="number" name="quantity" value="1" min="1">
                                </div>
                                <div class="ww-group">
                                    <label id="lbl-message">Besondere Anforderungen oder Nachricht</label>
                                    <textarea name="message" rows="4"></textarea>
                                </div>
                                <div class="ww-actions">
                                    <button type="button" class="ww-btn-cancel" id="ww-cancel">Abbrechen</button>
                                    <button type="submit" class="ww-btn-submit">
                                        <span id="ww-submit-text">Anfrage absenden</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </div>
                                <div class="ww-security">
                                    <span>🔒 <span id="sec1">SICHERE ÜBERTRAGUNG</span></span>
                                    <span>✅ <span id="sec2">SCHNELLE ANTWORT</span></span>
                                </div>
                            </form>

                            <div id="ww-success" class="ww-success hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span id="ww-success-msg">Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .ww-inquiry-popup {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 10001; display: none; overflow-y: auto;
                }
                .ww-inquiry-popup.active { display: block; }

                .ww-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(8px);
                    animation: wwFadeIn 0.3s ease;
                }

                .ww-content {
                    position: relative;
                    max-width: 1100px;
                    margin: 2rem auto;
                    background: linear-gradient(135deg, #1e2a1e 0%, #243024 100%);
                    border-radius: 18px;
                    border: 1px solid rgba(107,142,35,0.3);
                    overflow: hidden;
                    animation: wwSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .ww-close {
                    position: absolute; top: 1.5rem; right: 1.5rem;
                    width: 40px; height: 40px;
                    background: rgba(0,0,0,0.4); border: none; border-radius: 50%;
                    color: white; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.3s ease; z-index: 10;
                }
                .ww-close:hover { background: #6b8e23; transform: rotate(90deg); }

                .ww-grid {
                    display: grid;
                    grid-template-columns: 55% 45%;
                }

                .ww-product-side {
                    background: rgba(0,0,0,0.35);
                    padding: 2.5rem;
                }

                .ww-back {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    background: none; border: none;
                    color: #6b8e23; font-size: 0.82rem; font-weight: 600; letter-spacing: 1px;
                    cursor: pointer; margin-bottom: 1.75rem; transition: gap 0.2s ease;
                }
                .ww-back:hover { gap: 0.75rem; }

                .ww-image-area {
                    width: 100%; height: 480px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px; overflow: hidden;
                    margin-bottom: 2rem; position: relative;
                }

                .ww-images-container { position: relative; width: 100%; height: 100%; }

                .ww-img {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    object-fit: cover; opacity: 0; transition: opacity 0.5s ease;
                }
                .ww-img.active { opacity: 1; }

                .ww-nav {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    z-index: 10; background: rgba(0,0,0,0.55); border: none;
                    color: white; width: 46px; height: 46px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.3s ease;
                }
                .ww-nav:hover { background: #6b8e23; transform: translateY(-50%) scale(1.1); }
                .ww-nav-prev { left: 14px; }
                .ww-nav-next { right: 14px; }

                .ww-dots {
                    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
                    display: flex; gap: 8px; z-index: 10;
                }
                .ww-dot {
                    width: 9px; height: 9px; border-radius: 50%;
                    background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s ease;
                }
                .ww-dot.active { background: #6b8e23; width: 26px; border-radius: 4px; }

                .ww-product-info h2 { font-size: 1.85rem; color: #e8f0e0; margin-bottom: 0.4rem; }
                .ww-sku { font-size: 0.82rem; color: #7a9a6a; letter-spacing: 1px; margin-bottom: 1.25rem; }
                .ww-description { color: #b8c8a8; line-height: 1.7; margin-bottom: 1.75rem; font-size: 0.92rem; }
                .ww-features h4 { font-size: 0.8rem; color: #6b8e23; letter-spacing: 1.5px; margin-bottom: 0.85rem; }
                .ww-features ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
                .ww-features li { display: flex; align-items: center; gap: 0.7rem; color: #b8c8a8; font-size: 0.88rem; }
                .ww-features li::before { content: ''; width: 6px; height: 6px; background: #6b8e23; border-radius: 50%; flex-shrink: 0; }

                .ww-form-side { padding: 2.5rem; }
                .ww-form-side h2 { font-size: 1.65rem; color: #e8f0e0; margin-bottom: 0.4rem; }
                .ww-form-side > p { color: #7a9a6a; line-height: 1.6; margin-bottom: 2rem; font-size: 0.88rem; }

                .ww-form { display: flex; flex-direction: column; gap: 1.15rem; }
                .ww-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
                .ww-group label { display: block; font-size: 0.82rem; color: #b8c8a8; margin-bottom: 0.45rem; font-weight: 500; }
                .ww-group input,
                .ww-group textarea {
                    width: 100%;
                    background: rgba(0,0,0,0.35); border: 1px solid rgba(107,142,35,0.3);
                    color: #e8f0e0; padding: 0.8rem; border-radius: 8px;
                    font-size: 0.92rem; font-family: 'Inter', sans-serif; transition: all 0.3s ease;
                    box-sizing: border-box;
                }
                .ww-group input:focus,
                .ww-group textarea:focus { outline: none; border-color: #6b8e23; background: rgba(0,0,0,0.5); }
                .ww-group textarea { resize: vertical; }

                .ww-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
                .ww-btn-cancel {
                    flex: 1; padding: 0.9rem;
                    background: transparent; border: 1px solid rgba(107,142,35,0.3); color: #9ab087;
                    border-radius: 8px; cursor: pointer; font-size: 0.92rem; font-weight: 600; transition: all 0.3s ease;
                }
                .ww-btn-cancel:hover { border-color: #6b8e23; color: #e8f0e0; }
                .ww-btn-submit {
                    flex: 2; padding: 0.9rem 1.5rem;
                    background: linear-gradient(135deg, #6b8e23 0%, #8aad3a 100%);
                    border: none; color: white; border-radius: 8px; cursor: pointer;
                    font-size: 0.92rem; font-weight: 700;
                    display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.3s ease;
                }
                .ww-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(107,142,35,0.35); }
                .ww-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                .ww-security {
                    display: flex; gap: 1.5rem; margin-top: 1.25rem; padding-top: 1.25rem;
                    border-top: 1px solid rgba(107,142,35,0.2);
                    color: #5a7a4a; font-size: 0.75rem; letter-spacing: 0.5px;
                }

                .ww-success {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1.15rem; border-radius: 8px; margin-top: 1.5rem;
                    background: rgba(107,142,35,0.15); border: 1px solid rgba(107,142,35,0.4); color: #8aad3a;
                }
                .ww-success.hidden { display: none; }

                @keyframes wwFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes wwSlideUp {
                    from { opacity: 0; transform: translateY(50px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                @media (max-width: 900px) {
                    .ww-grid { grid-template-columns: 1fr; }
                    .ww-content { margin: 1rem; }
                    .ww-product-side, .ww-form-side { padding: 1.75rem 1.25rem; }
                    .ww-row-2 { grid-template-columns: 1fr; }
                    .ww-security { flex-direction: column; gap: 0.5rem; }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
        attachListeners();
    }

    function openPopup() {
        if (!currentProduct) return;
        document.getElementById('product-inquiry-popup').classList.add('active');
        document.body.style.overflow = 'hidden';
        fillProduct();
        updateLabels();
    }

    function closePopup() {
        document.getElementById('product-inquiry-popup').classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            document.getElementById('ww-inquiry-form').reset();
            document.getElementById('ww-success').classList.add('hidden');
        }, 300);
    }

    function fillProduct() {
        if (!currentProduct) return;
        const lang    = currentLanguage;
        const images  = currentProduct.images || [currentProduct.imageURL];
        const imgCont = document.querySelector('.ww-images-container');
        const prevBtn = document.querySelector('.ww-nav-prev');
        const nextBtn = document.querySelector('.ww-nav-next');
        const dotsCont = document.querySelector('.ww-dots');

        imgCont.innerHTML = images.map((src, i) =>
            `<img src="${src}" alt="${currentProduct.name[lang]}" class="ww-img ${i === 0 ? 'active' : ''}" data-index="${i}">`
        ).join('');

        if (images.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            dotsCont.style.display = 'flex';
            dotsCont.innerHTML = images.map((_, i) =>
                `<span class="ww-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
            ).join('');

            let cur = 0;
            const allImgs = imgCont.querySelectorAll('.ww-img');
            const dots    = dotsCont.querySelectorAll('.ww-dot');
            const go = (i) => {
                cur = i;
                allImgs.forEach((img, idx) => img.classList.toggle('active', idx === cur));
                dots.forEach((dot, idx)    => dot.classList.toggle('active', idx === cur));
            };
            prevBtn.onclick = e => { e.stopPropagation(); go((cur - 1 + images.length) % images.length); };
            nextBtn.onclick = e => { e.stopPropagation(); go((cur + 1) % images.length); };
            dots.forEach((dot, i) => { dot.onclick = e => { e.stopPropagation(); go(i); }; });
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dotsCont.style.display = 'none';
        }

        document.getElementById('ww-product-name').textContent = currentProduct.name[lang];
        document.getElementById('ww-product-sku').textContent  = `Art.-Nr.: ${currentProduct.sku}`;
        document.getElementById('ww-product-description').textContent = currentProduct.description[lang];

        const features = currentProduct.features[lang];
        const featEl   = document.getElementById('ww-product-features');
        if (features && features.length > 0) {
            document.getElementById('ww-features-list').innerHTML = features.map(f => `<li>${f}</li>`).join('');
            featEl.style.display = 'block';
        } else {
            featEl.style.display = 'none';
        }
    }

    function updateLabels() {
        const de = currentLanguage === 'de';
        document.getElementById('back-text').textContent      = de ? 'ZURÜCK ZUM KATALOG'                   : 'BACK TO CATALOG';
        document.getElementById('ww-form-title').textContent  = de ? 'Anfrage stellen'                       : 'Request Information';
        document.getElementById('ww-form-subtitle').textContent = de ? 'Bitte geben Sie Ihre Daten und Anforderungen an. Unser Team antwortet innerhalb von 24 Stunden.' : 'Please provide your details. Our team will respond within 24 hours.';
        document.getElementById('lbl-name').textContent       = de ? 'Vollständiger Name'                    : 'Full Name';
        document.getElementById('lbl-org').textContent        = de ? 'Unternehmen / Organisation'            : 'Company / Organization';
        document.getElementById('lbl-email').textContent      = de ? 'E-Mail-Adresse'                        : 'Email Address';
        document.getElementById('lbl-phone').textContent      = de ? 'Telefonnummer'                         : 'Phone Number';
        document.getElementById('lbl-quantity').textContent   = de ? 'Benötigte Menge'                       : 'Quantity Needed';
        document.getElementById('lbl-message').textContent    = de ? 'Besondere Anforderungen oder Nachricht' : 'Special Requirements or Message';
        document.getElementById('ww-cancel').textContent      = de ? 'Abbrechen'                             : 'Cancel';
        document.getElementById('ww-submit-text').textContent = de ? 'Anfrage absenden'                      : 'Submit Inquiry';
        document.getElementById('sec1').textContent           = de ? 'SICHERE ÜBERTRAGUNG'                   : 'SECURE TRANSFER';
        document.getElementById('sec2').textContent           = de ? 'SCHNELLE ANTWORT'                      : 'FAST RESPONSE';
        document.getElementById('ww-success-msg').textContent = de ? 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.' : 'Thank you! Your inquiry has been submitted.';
        document.querySelector('.ww-features h4').textContent = de ? 'PRODUKTSPEZIFIKATIONEN' : 'PRODUCT SPECIFICATIONS';
    }

    function attachListeners() {
        const popup   = document.getElementById('product-inquiry-popup');
        const overlay = popup.querySelector('.ww-overlay');
        const closeBtn = popup.querySelector('.ww-close');
        const backBtn  = popup.querySelector('.ww-back');
        const cancelBtn = document.getElementById('ww-cancel');
        const form     = document.getElementById('ww-inquiry-form');

        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        backBtn.addEventListener('click', closePopup);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
        });
        form.addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form      = e.target;
        const submitBtn = form.querySelector('.ww-btn-submit');
        const successEl = document.getElementById('ww-success');
        const origText  = document.getElementById('ww-submit-text').textContent;

        const formData = {
            product:      currentProduct.name[currentLanguage],
            sku:          currentProduct.sku,
            name:         form.name.value,
            organization: form.organization.value,
            email:        form.email.value,
            phone:        form.phone.value,
            quantity:     form.quantity.value,
            message:      form.message.value
        };

        submitBtn.disabled = true;
        document.getElementById('ww-submit-text').textContent = currentLanguage === 'de' ? 'Wird gesendet...' : 'Sending...';

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            successEl.classList.remove('hidden');
            form.reset();
            console.log('[WorkwearInquiry] Submitted:', formData);
            setTimeout(closePopup, 3000);
        } catch (err) {
            console.error('[WorkwearInquiry] Error:', err);
        } finally {
            submitBtn.disabled = false;
            document.getElementById('ww-submit-text').textContent = origText;
        }
    }

})();