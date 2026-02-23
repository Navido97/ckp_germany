/**
 * testimonials.js
 * Rotierende Kundenreferenzen für CKP Germany Index-Seite
 * Zeigt bis zu 5 Referenzen, geladen aus Google Sheets via testimonials-sheets.js
 */

(function() {
    'use strict';

    const CONTAINER_ID    = 'testimonials-section';
    const AUTO_PLAY_MS    = 5000;
    const MAX_TESTIMONIALS = 5;

    let testimonials  = [];
    let currentIndex  = 0;
    let autoPlayTimer = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        renderSkeleton(container);

        // Wait for sheets loader to be available
        let attempts = 0;
        while (!window.loadTestimonials && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (window.loadTestimonials) {
            const data = await window.loadTestimonials();
            testimonials = data.slice(0, MAX_TESTIMONIALS);
        }

        if (!testimonials.length) return container.remove();

        renderSection(container);
        startAutoPlay();
    }

    // ─── SKELETON ────────────────────────────────────────────────────────────────

    function renderSkeleton(container) {
        container.innerHTML = `
            <div class="testimonials-inner">
                <div class="t-header">
                    <div class="t-label">KUNDENREFERENZEN</div>
                    <h2 class="t-title">Was unsere Kunden sagen</h2>
                </div>
                <div class="t-skeleton">
                    <div class="t-skeleton-avatar"></div>
                    <div class="t-skeleton-line t-skeleton-line--wide"></div>
                    <div class="t-skeleton-line"></div>
                    <div class="t-skeleton-line t-skeleton-line--short"></div>
                </div>
            </div>
        `;
    }

    // ─── MAIN RENDER ─────────────────────────────────────────────────────────────

    function renderSection(container) {
        const dotsHTML = testimonials.map((_, i) => `
            <button class="t-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Referenz ${i + 1}"></button>
        `).join('');

        container.innerHTML = `
            <div class="testimonials-inner">
                <div class="t-header">
                    <div class="t-label">KUNDENREFERENZEN</div>
                    <h2 class="t-title">Was unsere Kunden sagen</h2>
                </div>

                <div class="t-stage" role="region" aria-label="Kundenreferenzen">
                    <div class="t-track" id="t-track">
                        ${testimonials.map((t, i) => renderCard(t, i)).join('')}
                    </div>

                    <button class="t-arrow t-arrow--prev" id="t-prev" aria-label="Vorherige Referenz">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="t-arrow t-arrow--next" id="t-next" aria-label="Nächste Referenz">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div class="t-dots" role="tablist">${dotsHTML}</div>

                <div class="t-progress-bar">
                    <div class="t-progress-fill" id="t-progress"></div>
                </div>
            </div>

            <style>
                /* ── Testimonials Section ── */
                #testimonials-section {
                    background: #0f0f0f;
                    padding: 5rem 0;
                    position: relative;
                    overflow: hidden;
                }

                #testimonials-section::before {
                    content: '';
                    position: absolute;
                    top: -200px; left: 50%;
                    transform: translateX(-50%);
                    width: 600px; height: 400px;
                    background: radial-gradient(ellipse, rgba(255,107,53,0.08) 0%, transparent 70%);
                    pointer-events: none;
                }

                .testimonials-inner {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    position: relative;
                }

                /* ── Header ── */
                .t-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .t-label {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    position: relative;
                    padding: 0 1.5rem;
                }

                .t-label::before,
                .t-label::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 30px;
                    height: 1px;
                    background: var(--primary-color);
                    opacity: 0.5;
                }
                .t-label::before { right: 100%; margin-right: -1rem; }
                .t-label::after  { left: 100%;  margin-left: -1rem; }

                .t-title {
                    font-size: clamp(1.75rem, 3vw, 2.5rem);
                    color: white;
                    font-weight: 700;
                    margin: 0;
                }

                /* ── Stage ── */
                .t-stage {
                    position: relative;
                    overflow: hidden;
                    border-radius: 20px;
                }

                .t-track {
                    display: flex;
                    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform;
                }

                /* ── Card ── */
                .t-card {
                    flex: 0 0 100%;
                    background: linear-gradient(135deg, #1c1c1c 0%, #161616 100%);
                    border: 1px solid rgba(255,107,53,0.12);
                    border-radius: 20px;
                    padding: 3rem 3.5rem;
                    position: relative;
                    overflow: hidden;
                }

                .t-card::before {
                    content: '\u201C';
                    position: absolute;
                    top: -0.5rem; left: 2rem;
                    font-size: 8rem;
                    color: var(--primary-color);
                    opacity: 0.08;
                    font-family: Georgia, serif;
                    line-height: 1;
                    pointer-events: none;
                }

                .t-stars {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 1.5rem;
                }

                .t-star {
                    color: var(--primary-color);
                    font-size: 1.1rem;
                }

                .t-star--empty { opacity: 0.25; }

                .t-quote {
                    font-size: clamp(1rem, 2vw, 1.2rem);
                    color: #d4d4d4;
                    line-height: 1.75;
                    margin-bottom: 2.5rem;
                    font-style: italic;
                    position: relative;
                    z-index: 1;
                }

                .t-author {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                /* ── Avatar ── */
                .t-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    overflow: hidden;
                    border: 2px solid rgba(255,107,53,0.3);
                    position: relative;
                }

                .t-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .t-avatar-initials {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .t-author-info {}

                .t-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.2rem;
                }

                .t-meta {
                    font-size: 0.82rem;
                    color: #888;
                }

                .t-company {
                    color: var(--primary-color);
                    font-weight: 600;
                }

                /* ── Arrows ── */
                .t-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 44px; height: 44px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 10;
                }

                .t-arrow:hover {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    transform: translateY(-50%) scale(1.1);
                }

                .t-arrow--prev { left: 12px; }
                .t-arrow--next { right: 12px; }

                /* ── Dots ── */
                .t-dots {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 2rem;
                }

                .t-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    cursor: pointer;
                    transition: all 0.35s ease;
                    padding: 0;
                }

                .t-dot.active {
                    background: var(--primary-color);
                    width: 28px;
                    border-radius: 4px;
                }

                /* ── Progress Bar ── */
                .t-progress-bar {
                    height: 2px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 2px;
                    margin-top: 1.5rem;
                    overflow: hidden;
                }

                .t-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
                    border-radius: 2px;
                    width: 0%;
                    transition: width linear;
                }

                /* ── Skeleton ── */
                .t-skeleton {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 3rem;
                    background: #1c1c1c;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.06);
                }

                .t-skeleton-avatar {
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
                    background-size: 200% 100%;
                    animation: tShimmer 1.5s infinite;
                }

                .t-skeleton-line {
                    height: 14px;
                    width: 80%;
                    background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
                    background-size: 200% 100%;
                    border-radius: 7px;
                    animation: tShimmer 1.5s infinite;
                }

                .t-skeleton-line--wide { width: 95%; height: 18px; }
                .t-skeleton-line--short { width: 50%; }

                @keyframes tShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    #testimonials-section { padding: 3.5rem 0; }
                    .t-card { padding: 2rem 1.75rem; }
                    .t-arrow { display: none; }
                    .t-card::before { font-size: 6rem; }
                }
            </style>
        `;

        // Bind interactions
        document.getElementById('t-prev')?.addEventListener('click', () => navigate(-1));
        document.getElementById('t-next')?.addEventListener('click', () => navigate(1));

        container.querySelectorAll('.t-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goTo(parseInt(dot.dataset.index));
                resetAutoPlay();
            });
        });

        // Pause on hover
        container.querySelector('.t-stage')?.addEventListener('mouseenter', stopAutoPlay);
        container.querySelector('.t-stage')?.addEventListener('mouseleave', startAutoPlay);

        // Touch swipe
        let touchStartX = 0;
        const stage = container.querySelector('.t-stage');
        stage?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        stage?.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        });

        updateView(false);
    }

    // ─── CARD HTML ───────────────────────────────────────────────────────────────

    function renderCard(t, i) {
        const stars = Array.from({ length: 5 }, (_, idx) => `
            <span class="t-star ${idx < t.rating ? '' : 't-star--empty'}">★</span>
        `).join('');

        const avatarHTML = t.imageURL
            ? `<img src="${t.imageURL}" alt="${t.name}" onerror="this.parentElement.innerHTML='<div class=\\'t-avatar-initials\\'>${t.initials}</div>'">`
            : `<div class="t-avatar-initials">${t.initials}</div>`;

        const metaHTML = [t.position, t.company ? `<span class="t-company">${t.company}</span>` : '']
            .filter(Boolean).join(' · ');

        return `
            <div class="t-card" role="tabpanel" aria-label="Referenz von ${t.name}">
                <div class="t-stars">${stars}</div>
                <p class="t-quote">${t.quote}</p>
                <div class="t-author">
                    <div class="t-avatar">${avatarHTML}</div>
                    <div class="t-author-info">
                        <div class="t-name">${t.name}</div>
                        <div class="t-meta">${metaHTML}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ─── NAVIGATION ──────────────────────────────────────────────────────────────

    function navigate(dir) {
        goTo((currentIndex + dir + testimonials.length) % testimonials.length);
        resetAutoPlay();
    }

    function goTo(index) {
        currentIndex = index;
        updateView(true);
    }

    function updateView(animate) {
        const track = document.getElementById('t-track');
        if (!track) return;

        if (!animate) track.style.transition = 'none';
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });

        // Dots
        document.querySelectorAll('.t-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // Progress bar reset
        const fill = document.getElementById('t-progress');
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            requestAnimationFrame(() => {
                fill.style.transition = `width ${AUTO_PLAY_MS}ms linear`;
                fill.style.width = '100%';
            });
        }
    }

    // ─── AUTO PLAY ───────────────────────────────────────────────────────────────

    function startAutoPlay() {
        if (testimonials.length <= 1) return;
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            updateView(true);
        }, AUTO_PLAY_MS);

        // Start progress bar
        const fill = document.getElementById('t-progress');
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            requestAnimationFrame(() => {
                fill.style.transition = `width ${AUTO_PLAY_MS}ms linear`;
                fill.style.width = '100%';
            });
        }
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
        const fill = document.getElementById('t-progress');
        if (fill) {
            const computed = getComputedStyle(fill).width;
            fill.style.transition = 'none';
            fill.style.width = computed;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

})();