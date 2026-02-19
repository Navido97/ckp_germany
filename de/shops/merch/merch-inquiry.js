/**
 * merch-inquiry.js
 * Product inquiry/order popup for CKP Merch Shop
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
            <div id="product-inquiry-popup" class="merch-popup">
                <div class="merch-overlay"></div>
                <div class="merch-content">
                    <button class="merch-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="merch-grid">
                        <div class="merch-product-side">
                            <button class="merch-back">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                <span id="back-text">ZURÜCK ZUM SHOP</span>
                            </button>
                            <div class="merch-image-area">
                                <div class="merch-images-container"></div>
                                <button class="merch-nav merch-nav-prev" style="display:none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                                <button class="merch-nav merch-nav-next" style="display:none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                                <div class="merch-dots" style="display:none;"></div>
                            </div>
                            <div class="merch-product-info">
                                <h2 id="merch-product-name"></h2>
                                <div id="merch-product-price" class="merch-price"></div>
                                <div id="merch-product-sku" class="merch-sku"></div>
                                <div id="merch-product-description" class="merch-description"></div>
                                <div id="merch-product-features" class="merch-features">
                                    <h4 id="merch-features-title">PRODUKTDETAILS</h4>
                                    <ul id="merch-features-list"></ul>
                                </div>
                            </div>
                        </div>
                        <div class="merch-form-side">
                            <h2 id="merch-form-title">Bestellung aufgeben</h2>
                            <p id="merch-form-subtitle">Füllen Sie das Formular aus und wir melden uns bei Ihnen.</p>
                            <form id="merch-inquiry-form" class="merch-form">
                                <div class="merch-row-2">
                                    <div class="merch-group"><label id="lbl-name">Vollständiger Name</label><input type="text" name="name" required></div>
                                    <div class="merch-group"><label id="lbl-email">E-Mail-Adresse</label><input type="email" name="email" required></div>
                                </div>
                                <div class="merch-row-2">
                                    <div class="merch-group"><label id="lbl-phone">Telefonnummer</label><input type="tel" name="phone"></div>
                                    <div class="merch-group"><label id="lbl-quantity">Menge</label><input type="number" name="quantity" value="1" min="1"></div>
                                </div>
                                <div class="merch-group"><label id="lbl-variant">Variante / Größe / Farbe</label><input type="text" name="variant" placeholder="z.B. XL, Schwarz, 500ml..."></div>
                                <div class="merch-group"><label id="lbl-message">Anmerkungen oder Sonderwünsche</label><textarea name="message" rows="3"></textarea></div>
                                <div class="merch-actions">
                                    <button type="button" class="merch-btn-cancel" id="merch-cancel">Abbrechen</button>
                                    <button type="submit" class="merch-btn-submit">
                                        <span id="merch-submit-text">Bestellung absenden</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </div>
                                <div class="merch-security">
                                    <span>🔒 <span id="sec1">SICHERE ÜBERTRAGUNG</span></span>
                                    <span>📦 <span id="sec2">SCHNELLER VERSAND</span></span>
                                </div>
                            </form>
                            <div id="merch-success" class="merch-success hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span id="merch-success-msg">Vielen Dank! Ihre Bestellung wurde erfolgreich übermittelt.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .merch-popup { position:fixed; top:0; left:0; right:0; bottom:0; z-index:10001; display:none; overflow-y:auto; }
                .merch-popup.active { display:block; }
                .merch-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); animation:merchFadeIn 0.3s ease; }
                .merch-content { position:relative; max-width:1050px; margin:2rem auto; background:#fff; border-radius:20px; border:1px solid #e0e0e0; box-shadow:0 30px 80px rgba(255,107,53,0.15); overflow:hidden; animation:merchSlideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
                .merch-close { position:absolute; top:1.25rem; right:1.25rem; width:38px; height:38px; background:#f5f5f5; border:1px solid #e0e0e0; border-radius:50%; color:#555; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s ease; z-index:10; }
                .merch-close:hover { background:#ff6b35; color:white; border-color:#ff6b35; transform:rotate(90deg); }
                .merch-grid { display:grid; grid-template-columns:52% 48%; }
                .merch-product-side { background:#f5f5f5; padding:2.5rem; border-right:1px solid #e0e0e0; }
                .merch-back { display:inline-flex; align-items:center; gap:0.5rem; background:none; border:none; color:#ff6b35; font-size:0.8rem; font-weight:600; letter-spacing:1px; cursor:pointer; margin-bottom:1.75rem; transition:gap 0.2s; }
                .merch-back:hover { gap:0.75rem; }
                .merch-image-area { width:100%; height:420px; background:#e8e8e8; border-radius:14px; overflow:hidden; margin-bottom:1.75rem; position:relative; border:1px solid #ddd; }
                .merch-images-container { position:relative; width:100%; height:100%; }
                .merch-img { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.5s ease; }
                .merch-img.active { opacity:1; }
                .merch-nav { position:absolute; top:50%; transform:translateY(-50%); z-index:10; background:rgba(255,255,255,0.9); border:1px solid #ddd; color:#ff6b35; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.3s ease; }
                .merch-nav:hover { background:#ff6b35; color:white; border-color:#ff6b35; transform:translateY(-50%) scale(1.1); }
                .merch-nav-prev { left:12px; }
                .merch-nav-next { right:12px; }
                .merch-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:7px; z-index:10; }
                .merch-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,107,53,0.3); cursor:pointer; transition:all 0.3s ease; }
                .merch-dot.active { background:#ff6b35; width:24px; border-radius:4px; }
                .merch-product-info h2 { font-size:1.7rem; color:#1a1a1a; margin-bottom:0.3rem; }
                .merch-price { font-size:1.4rem; font-weight:800; color:#ff6b35; margin-bottom:0.3rem; }
                .merch-sku { font-size:0.78rem; color:#999; letter-spacing:1px; margin-bottom:1rem; }
                .merch-description { color:#555; line-height:1.7; margin-bottom:1.5rem; font-size:0.9rem; }
                .merch-features h4 { font-size:0.78rem; color:#ff6b35; letter-spacing:1.5px; margin-bottom:0.85rem; }
                .merch-features ul { list-style:none; padding:0; display:flex; flex-direction:column; gap:0.55rem; }
                .merch-features li { display:flex; align-items:center; gap:0.7rem; color:#555; font-size:0.87rem; }
                .merch-features li::before { content:''; width:6px; height:6px; background:#ff6b35; border-radius:50%; flex-shrink:0; }
                .merch-form-side { padding:2.5rem; background:white; }
                .merch-form-side h2 { font-size:1.55rem; color:#1a1a1a; margin-bottom:0.4rem; }
                .merch-form-side > p { color:#888; line-height:1.6; margin-bottom:2rem; font-size:0.87rem; }
                .merch-form { display:flex; flex-direction:column; gap:1.1rem; }
                .merch-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1.1rem; }
                .merch-group label { display:block; font-size:0.8rem; color:#555; margin-bottom:0.4rem; font-weight:500; }
                .merch-group input, .merch-group textarea { width:100%; background:#f8f8f8; border:1.5px solid #e0e0e0; color:#1a1a1a; padding:0.8rem; border-radius:9px; font-size:0.9rem; font-family:'Inter',sans-serif; transition:all 0.3s ease; box-sizing:border-box; }
                .merch-group input:focus, .merch-group textarea:focus { outline:none; border-color:#ff6b35; background:#fff8f5; }
                .merch-group textarea { resize:vertical; }
                .merch-actions { display:flex; gap:1rem; margin-top:0.5rem; }
                .merch-btn-cancel { flex:1; padding:0.85rem; background:transparent; border:1.5px solid #e0e0e0; color:#888; border-radius:9px; cursor:pointer; font-size:0.9rem; font-weight:600; transition:all 0.3s ease; }
                .merch-btn-cancel:hover { border-color:#ff6b35; color:#ff6b35; }
                .merch-btn-submit { flex:2; padding:0.85rem 1.5rem; background:linear-gradient(135deg,#ff6b35 0%,#ff8c42 100%); border:none; color:white; border-radius:9px; cursor:pointer; font-size:0.9rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:0.6rem; transition:all 0.3s ease; }
                .merch-btn-submit:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(255,107,53,0.35); }
                .merch-btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
                .merch-security { display:flex; gap:1.5rem; margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #f0f0f0; color:#bbb; font-size:0.73rem; letter-spacing:0.5px; }
                .merch-success { display:flex; align-items:center; gap:1rem; padding:1.1rem; border-radius:9px; margin-top:1.5rem; background:#fff8f0; border:1px solid #ffd4b8; color:#e85520; }
                .merch-success.hidden { display:none; }
                @keyframes merchFadeIn { from{opacity:0} to{opacity:1} }
                @keyframes merchSlideUp { from{opacity:0;transform:translateY(50px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
                @media (max-width:900px) {
                    .merch-grid { grid-template-columns:1fr; }
                    .merch-content { margin:1rem; }
                    .merch-product-side, .merch-form-side { padding:1.75rem 1.25rem; }
                    .merch-row-2 { grid-template-columns:1fr; }
                    .merch-security { flex-direction:column; gap:0.5rem; }
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
            document.getElementById('merch-inquiry-form').reset();
            document.getElementById('merch-success').classList.add('hidden');
        }, 300);
    }

    function fillProduct() {
        const lang    = currentLanguage;
        const images  = currentProduct.images || [currentProduct.imageURL];
        const imgCont = document.querySelector('.merch-images-container');
        const prev    = document.querySelector('.merch-nav-prev');
        const next    = document.querySelector('.merch-nav-next');
        const dots    = document.querySelector('.merch-dots');

        imgCont.innerHTML = images.map((src, i) =>
            `<img src="${src}" alt="${currentProduct.name[lang]}" class="merch-img ${i===0?'active':''}">`
        ).join('');

        if (images.length > 1) {
            prev.style.display = next.style.display = dots.style.display = 'flex';
            dots.innerHTML = images.map((_, i) =>
                `<span class="merch-dot ${i===0?'active':''}" data-index="${i}"></span>`
            ).join('');
            let cur = 0;
            const allImgs = imgCont.querySelectorAll('.merch-img');
            const allDots = dots.querySelectorAll('.merch-dot');
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

        document.getElementById('merch-product-name').textContent  = currentProduct.name[lang];
        document.getElementById('merch-product-price').textContent = currentProduct.price !== 'Auf Anfrage' ? currentProduct.price : '';
        document.getElementById('merch-product-sku').textContent   = `Art.-Nr.: ${currentProduct.sku}`;
        document.getElementById('merch-product-description').textContent = currentProduct.description[lang];

        const features = currentProduct.features[lang];
        const featEl   = document.getElementById('merch-product-features');
        if (features && features.length > 0) {
            document.getElementById('merch-features-list').innerHTML = features.map(f => `<li>${f}</li>`).join('');
            featEl.style.display = 'block';
        } else {
            featEl.style.display = 'none';
        }
    }

    function updateLabels() {
        const de = currentLanguage === 'de';
        document.getElementById('back-text').textContent           = de ? 'ZURÜCK ZUM SHOP'                       : 'BACK TO SHOP';
        document.getElementById('merch-form-title').textContent    = de ? 'Bestellung aufgeben'                   : 'Place an Order';
        document.getElementById('merch-form-subtitle').textContent = de ? 'Füllen Sie das Formular aus und wir melden uns bei Ihnen.' : 'Fill in the form and we will get back to you.';
        document.getElementById('lbl-name').textContent            = de ? 'Vollständiger Name'                    : 'Full Name';
        document.getElementById('lbl-email').textContent           = de ? 'E-Mail-Adresse'                        : 'Email Address';
        document.getElementById('lbl-phone').textContent           = de ? 'Telefonnummer'                         : 'Phone Number';
        document.getElementById('lbl-quantity').textContent        = de ? 'Menge'                                 : 'Quantity';
        document.getElementById('lbl-variant').textContent         = de ? 'Variante / Größe / Farbe'              : 'Variant / Size / Color';
        document.getElementById('lbl-message').textContent         = de ? 'Anmerkungen oder Sonderwünsche'        : 'Notes or Special Requests';
        document.getElementById('merch-cancel').textContent        = de ? 'Abbrechen'                             : 'Cancel';
        document.getElementById('merch-submit-text').textContent   = de ? 'Bestellung absenden'                   : 'Submit Order';
        document.getElementById('sec1').textContent                = de ? 'SICHERE ÜBERTRAGUNG'                   : 'SECURE TRANSFER';
        document.getElementById('sec2').textContent                = de ? 'SCHNELLER VERSAND'                     : 'FAST SHIPPING';
        document.getElementById('merch-features-title').textContent = de ? 'PRODUKTDETAILS'                      : 'PRODUCT DETAILS';
        document.getElementById('merch-success-msg').textContent   = de ? 'Vielen Dank! Ihre Bestellung wurde erfolgreich übermittelt.' : 'Thank you! Your order has been submitted.';
    }

    function attachListeners() {
        const popup = document.getElementById('product-inquiry-popup');
        popup.querySelector('.merch-overlay').addEventListener('click', closePopup);
        popup.querySelector('.merch-close').addEventListener('click', closePopup);
        popup.querySelector('.merch-back').addEventListener('click', closePopup);
        document.getElementById('merch-cancel').addEventListener('click', closePopup);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && popup.classList.contains('active')) closePopup(); });
        document.getElementById('merch-inquiry-form').addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form      = e.target;
        const submitBtn = form.querySelector('.merch-btn-submit');
        const origText  = document.getElementById('merch-submit-text').textContent;

        submitBtn.disabled = true;
        document.getElementById('merch-submit-text').textContent = currentLanguage === 'de' ? 'Wird gesendet...' : 'Sending...';

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            document.getElementById('merch-success').classList.remove('hidden');
            form.reset();
            setTimeout(closePopup, 3000);
        } catch (err) {
            console.error('[MerchInquiry] Error:', err);
        } finally {
            submitBtn.disabled = false;
            document.getElementById('merch-submit-text').textContent = origText;
        }
    }

})();