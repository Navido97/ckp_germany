/**
 * Custom Cursor Follower
 * Follows mouse and enlarges on clickable elements
 */

(function() {
    'use strict';

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Create cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    
    cursor.appendChild(cursorDot);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
            opacity: 0;
        }

        .cursor-dot {
            width: 100%;
            height: 100%;
            border: 2px solid rgba(255, 107, 53, 0.6);
            border-radius: 50%;
            transition: transform 0.2s ease, border-color 0.3s ease, border-width 0.3s ease;
        }

        .custom-cursor.active .cursor-dot {
            transform: scale(0.6);
            border-color: rgba(255, 107, 53, 1);
            border-width: 3px;
        }

        .custom-cursor.hovering {
            width: 40px;
            height: 40px;
        }

        .custom-cursor.hovering .cursor-dot {
            border-color: rgba(255, 140, 66, 0.9);
            border-width: 2.5px;
            background: rgba(255, 107, 53, 0.08);
        }

        .custom-cursor.visible {
            opacity: 1;
        }

        /* Mobile: hide custom cursor */
        @media (max-width: 768px) {
            .custom-cursor {
                display: none;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(cursor);
    // Don't hide default cursor - just add follower

    // Track mouse position
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let isVisible = false;

    // Smooth cursor follow
    function updateCursor() {
        // Smooth lerp effect - faster for better centering
        const speed = 0.2;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        // Center the cursor by subtracting half its width/height
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(updateCursor);
    }

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isVisible) {
            isVisible = true;
            cursor.classList.add('visible');
        }
    });

    // Mouse leave handler
    document.addEventListener('mouseleave', () => {
        isVisible = false;
        cursor.classList.remove('visible');
    });

    // Mouse enter handler
    document.addEventListener('mouseenter', () => {
        if (!isVisible) {
            isVisible = true;
            cursor.classList.add('visible');
        }
    });

    // Click handler
    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });

    // Hover detection for clickable elements
    const clickableSelectors = 'a, button, [role="button"], input[type="submit"], input[type="button"], .btn, .card, .division-card, .service-card';
    
    function addHoverListeners() {
        const clickableElements = document.querySelectorAll(clickableSelectors);
        
        clickableElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
            });
        });
    }

    // Initialize
    setTimeout(() => {
        addHoverListeners();
        updateCursor();
    }, 100);

    // Re-add listeners after dynamic content loads
    const observer = new MutationObserver(() => {
        addHoverListeners();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();