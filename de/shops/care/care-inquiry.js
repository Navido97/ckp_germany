/**
 * care-inquiry.js
 * Product inquiry popup for CKP Care Shop
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
        document.body.insertAdjacentHTML('beforeend', `
            <div id="product-inquiry-popup" class="care-popup">
                <div class="care-overlay"></div>
                <div class="care-content">
                    <button class="care-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="care-grid">
                        <div class="care-product-side">
                            <button class="care-back">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                <span id="back-text">ZURÜCK ZUM KATALOG</span>
                            </button>
                            <div class="care-image-area">
                                <div class="care-images-container"></div>
                                <button class="care-nav care-nav-prev" style="display:none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                                <button class="care-nav care-nav-next" style="display:none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                                <div class="care-dots" style="display:none;"></div>
                            </div>
                            <div class="care-product-info">
                                <h2 id="care-product-name"></h2>
                                <div id="care-product-sku" class="care-sku"></div>
                                <div id="care-product-description" class="care-description"></div>
                                <div id="care-product-features" class="care-features">
                                    <h4 id="care-features-title">PRODUKTSPEZIFIKATIONEN</h4>
                                    <ul id="care-features-list"></ul>
                                </div>
                            </div>
                        </div>
                        <div class="care-form-side">
                            <h2 id="care-form-title">Anfrage stellen</h2>
                            <p id="care-form-subtitle">Bitte geben Sie Ihre Daten und Anforderungen an.</p>
                            <form id="care-inquiry-form" class="care-form">
                                <div class="care-row-2">
                                    <div class="care-group"><label id="lbl-name">Vollständiger Name</label><input type="text" name="name" required></div>
                                    <div class="care-group"><label id="lbl-org">Einrichtung / Organisation</label><input type="text" name="organization" required></div>
                                </div>
                                <div class="care-row-2">
                                    <div class="care-group"><label id="lbl-email">E-Mail-Adresse</label><input type="email" name="email" required></div>
                                    <div class="care-group"><label id="lbl-phone">Telefonnummer</label><input type="tel" name="phone"></div>
                                </div>
                                <div class="care-group"><label id="lbl-quantity">Benötigte Menge</label><input type="number" name="quantity" value="1" min="1"></div>
                                <div class="care-group"><label id="lbl-message">Besondere Anforderungen oder Nachricht</label><textarea name="message" rows="4"></textarea></div>
                                <div class="care-actions">
                                    <button type="button" class="care-btn-cancel" id="care-cancel">Abbrechen</button>
                                    <button type="submit" class="care-btn-submit"><span id="care-submit-text">Anfrage absenden</span><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
                                </div>
                                <div class="care-security">
                                    <span>🔒 <span id="sec1">SICHERE ÜBERTRAGUNG</span></span>
                                    <span>⚕️ <span id="sec2">MEDIZINISCH GEPRÜFT</span></span>
                                </div>
                            </form>
                            <div id="care-success" class="care-success hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span id="care-success-msg">Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .care-popup { position:fixed; top:0; left:0; right:0; bottom:0; z-index:10001; display:none; overflow-y:auto; }
                .care-popup.active { display:block; }
                .care-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(10,40,65,0.85); backdrop-filter:blur(8px); animation:careFadeIn 0.3s ease; }
                .care-content {
                    position:relative; max-width:1100px; margin:2rem auto;
                    background:#ffffff; border-radius:20px;
                    border:1px solid #c8e0f4;
                    box-shadow:0 30px 80px rgba(26,122,191,0.2);
                    overflow:hidden; animation:careSlideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
                }
                .care-close { position:absolute; top:1.25rem; right:1.25rem; width:38px; height:38px; background:#f0f7fd; border:1px solid #c8e0f4; border-radius:50%; color:#1a7abf; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s ease; z-index:10; }
                .care-close:hover { background:#1a7abf; color:white; border-color:#1a7abf; transform:rotate(90deg); }
                .care-grid { display:grid; grid-template-columns:55% 45%; }
                .care-product-side { background:#f0f7fd; padding:2.5rem; border-right:1px solid #c8e0f4; }
                .care-back { display:inline-flex; align-items:center; gap:0.5rem; background:none; border:none; color:#1a7abf; font-size:0.8rem; font-weight:600; letter-spacing:1px; cursor:pointer; margin-bottom:1.75rem; transition:gap 0.2s; }
                .care-back:hover { gap:0.75rem; }
                .care-image-area { width:100%; height:460px; background:#e0f0fc; border-radius:14px; overflow:hidden; margin-bottom:2rem; position:relative; border:1px solid #c8e0f4; }
                .care-images-container { position:relative; width:100%; height:100%; }
                .care-img { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.5s ease; }
                .care-img.active { opacity:1; }
                .care-nav { position:absolute; top:50%; transform:translateY(-50%); z-index:10; background:rgba(255,255,255,0.9); border:1px solid #c8e0f4; color:#1a7abf; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.3s ease; }
                .care-nav:hover { background:#1a7abf; color:white; border-color:#1a7abf; transform:translateY(-50%) scale(1.1); }
                .care-nav-prev { left:12px; }
                .care-nav-next { right:12px; }
                .care-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:7px; z-index:10; }
                .care-dot { width:8px; height:8px; border-radius:50%; background:rgba(26,122,191,0.25); cursor:pointer; transition:all 0.3s ease; }
                .care-dot.active { background:#1a7abf; width:24px; border-radius:4px; }
                .care-product-info h2 { font-size:1.75rem; color:#1a2d3d; margin-bottom:0.4rem; }
                .care-sku { font-size:0.8rem; color:#6a8fa8; letter-spacing:1px; margin-bottom:1.2rem; }
                .care-description { color:#3a5a70; line-height:1.7; margin-bottom:1.75rem; font-size:0.9rem; }
                .care-features h4 { font-size:0.78rem; color:#1a7abf; letter-spacing:1.5px; margin-bottom:0.85rem; }
                .care-features ul { list-style:none; padding:0; display:flex; flex-direction:column; gap:0.6rem; }
                .care-features li { display:flex; align-items:center; gap:0.7rem; color:#3a5a70; font-size:0.87rem; }
                .care-features li::before { content:''; width:6px; height:6px; background:#1a7abf; border-radius:50%; flex-shrink:0; }
                .care-form-side { padding:2.5rem; background:white; }
                .care-form-side h2 { font-size:1.6rem; color:#1a2d3d; margin-bottom:0.4rem; }
                .care-form-side > p { color:#6a8fa8; line-height:1.6; margin-bottom:2rem; font-size:0.87rem; }
                .care-form { display:flex; flex-direction:column; gap:1.1rem; }
                .care-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1.1rem; }
                .care-group label { display:block; font-size:0.8rem; color:#4a6a80; margin-bottom:0.4rem; font-weight:500; }
                .care-group input, .care-group textarea { width:100%; background:#f8fbfe; border:1.5px solid #c8e0f4; color:#1a2d3d; padding:0.8rem; border-radius:9px; font-size:0.9rem; font-family:'Inter',sans-serif; transition:all 0.3s ease; box-sizing:border-box; }
                .care-group input:focus, .care-group textarea:focus { outline:none; border-color:#1a7abf; background:#f0f7fd; }
                .care-group textarea { resize:vertical; }
                .care-actions { display:flex; gap:1rem; margin-top:0.5rem; }
                .care-btn-cancel { flex:1; padding:0.85rem; background:transparent; border:1.5px solid #c8e0f4; color:#6a8fa8; border-radius:9px; cursor:pointer; font-size:0.9rem; font-weight:600; transition:all 0.3s ease; }
                .care-btn-cancel:hover { border-color:#1a7abf; color:#1a7abf; }
                .care-btn-submit { flex:2; padding:0.85rem 1.5rem; background:linear-gradient(135deg,#1a7abf 0%,#2e9de0 100%); border:none; color:white; border-radius:9px; cursor:pointer; font-size:0.9rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:0.6rem; transition:all 0.3s ease; }
                .care-btn-submit:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(26,122,191,0.35); }
                .care-btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
                .care-security { display:flex; gap:1.5rem; margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #e0eef8; color:#8aaecc; font-size:0.73rem; letter-spacing:0.5px; }
                .care-success { display:flex; align-items:center; gap:1rem; padding:1.1rem; border-radius:9px; margin-top:1.5rem; background:#e8f7ee; border:1px solid #a8dbb8; color:#2a8a4a; }
                .care-success.hidden { display:none; }
                @keyframes careFadeIn { from{opacity:0} to{opacity:1} }
                @keyframes careSlideUp { from{opacity:0;transform:translateY(50px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
                @media (max-width:900px) {
                    .care-grid { grid-template-columns:1fr; }
                    .care-content { margin:1rem; }
                    .care-product-side, .care-form-side { padding:1.75rem 1.25rem; }
                    .care-row-2 { grid-template-columns:1fr; }
                    .care-security { flex-direction:column; gap:0.5rem; }
                }
            </style>
        `);
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
            document.getElementById('care-inquiry-form').reset();
            document.getElementById('care-success').classList.add('hidden');
        }, 300);
    }

    function fillProduct() {
        const lang    = currentLanguage;
        const images  = currentProduct.images || [currentProduct.imageURL];
        const imgCont = document.querySelector('.care-images-container');
        const prev    = document.querySelector('.care-nav-prev');
        const next    = document.querySelector('.care-nav-next');
        const dots    = document.querySelector('.care-dots');

        imgCont.innerHTML = images.map((src, i) =>
            `<img src="${src}" alt="${currentProduct.name[lang]}" class="care-img ${i===0?'active':''}">`
        ).join('');

        if (images.length > 1) {
            prev.style.display = next.style.display = dots.style.display = 'flex';
            dots.innerHTML = images.map((_, i) =>
                `<span class="care-dot ${i===0?'active':''}" data-index="${i}"></span>`
            ).join('');
            let cur = 0;
            const allImgs = imgCont.querySelectorAll('.care-img');
            const allDots = dots.querySelectorAll('.care-dot');
            const go = i => {
                cur = i;
                allImgs.forEach((img, idx) => img.classList.toggle('active', idx===cur));
                allDots.forEach((dot, idx) => dot.classList.toggle('active', idx===cur));
            };
            prev.onclick = e => { e.stopPropagation(); go((cur-1+images.length)%images.length); };
            next.onclick = e => { e.stopPropagation(); go((cur+1)%images.length); };
            allDots.forEach((dot, i) => { dot.onclick = e => { e.stopPropagation(); go(i); }; });
        } else {
            prev.style.display = next.style.display = dots.style.display = 'none';
        }

        document.getElementById('care-product-name').textContent = currentProduct.name[lang];
        document.getElementById('care-product-sku').textContent  = `Art.-Nr.: ${currentProduct.sku}`;
        document.getElementById('care-product-description').textContent = currentProduct.description[lang];

        const features = currentProduct.features[lang];
        const featEl   = document.getElementById('care-product-features');
        if (features && features.length > 0) {
            document.getElementById('care-features-list').innerHTML = features.map(f => `<li>${f}</li>`).join('');
            featEl.style.display = 'block';
        } else {
            featEl.style.display = 'none';
        }
    }

    function updateLabels() {
        const de = currentLanguage === 'de';
        document.getElementById('back-text').textContent         = de ? 'ZURÜCK ZUM KATALOG'                     : 'BACK TO CATALOG';
        document.getElementById('care-form-title').textContent   = de ? 'Anfrage stellen'                         : 'Request Information';
        document.getElementById('care-form-subtitle').textContent= de ? 'Bitte geben Sie Ihre Daten an. Unser Team antwortet innerhalb von 24 Stunden.' : 'Please provide your details. Our team will respond within 24 hours.';
        document.getElementById('lbl-name').textContent          = de ? 'Vollständiger Name'                      : 'Full Name';
        document.getElementById('lbl-org').textContent           = de ? 'Einrichtung / Organisation'              : 'Institution / Organization';
        document.getElementById('lbl-email').textContent         = de ? 'E-Mail-Adresse'                          : 'Email Address';
        document.getElementById('lbl-phone').textContent         = de ? 'Telefonnummer'                           : 'Phone Number';
        document.getElementById('lbl-quantity').textContent      = de ? 'Benötigte Menge'                         : 'Quantity Needed';
        document.getElementById('lbl-message').textContent       = de ? 'Besondere Anforderungen oder Nachricht'  : 'Special Requirements or Message';
        document.getElementById('care-cancel').textContent       = de ? 'Abbrechen'                               : 'Cancel';
        document.getElementById('care-submit-text').textContent  = de ? 'Anfrage absenden'                        : 'Submit Inquiry';
        document.getElementById('sec1').textContent              = de ? 'SICHERE ÜBERTRAGUNG'                     : 'SECURE TRANSFER';
        document.getElementById('sec2').textContent              = de ? 'MEDIZINISCH GEPRÜFT'                     : 'MEDICALLY VERIFIED';
        document.getElementById('care-features-title').textContent = de ? 'PRODUKTSPEZIFIKATIONEN'               : 'PRODUCT SPECIFICATIONS';
        document.getElementById('care-success-msg').textContent  = de ? 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.' : 'Thank you! Your inquiry has been submitted.';
    }

    function attachListeners() {
        const popup  = document.getElementById('product-inquiry-popup');
        popup.querySelector('.care-overlay').addEventListener('click', closePopup);
        popup.querySelector('.care-close').addEventListener('click', closePopup);
        popup.querySelector('.care-back').addEventListener('click', closePopup);
        document.getElementById('care-cancel').addEventListener('click', closePopup);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && popup.classList.contains('active')) closePopup(); });
        document.getElementById('care-inquiry-form').addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form      = e.target;
        const submitBtn = form.querySelector('.care-btn-submit');
        const origText  = document.getElementById('care-submit-text').textContent;

        submitBtn.disabled = true;
        document.getElementById('care-submit-text').textContent = currentLanguage === 'de' ? 'Wird gesendet...' : 'Sending...';

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            document.getElementById('care-success').classList.remove('hidden');
            form.reset();
            setTimeout(closePopup, 3000);
        } catch (err) {
            console.error('[CareInquiry] Error:', err);
        } finally {
            submitBtn.disabled = false;
            document.getElementById('care-submit-text').textContent = origText;
        }
    }

})();