/**
 * Easter Eggs for About Page
 * Fun interactive elements and surprises
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initEasterEggWords();
        initSecretValueCard();
        initKonamiCode();
        initScrollSurprise();
        addAOSAnimations();
    }

    // 1. Easter Egg Words (Bremen, Türkei)
    function initEasterEggWords() {
        const easterEggs = document.querySelectorAll('.easter-egg');
        
        easterEggs.forEach(egg => {
            const eggType = egg.getAttribute('data-easter');
            
            egg.addEventListener('click', function() {
                showEasterEggMessage(eggType, this);
            });
        });
    }

    function showEasterEggMessage(type, element) {
        const messages = {
            'bremen': '🏙️ Bremen - Die Hansestadt an der Weser! Heimat der Bremer Stadtmusikanten und natürlich von CKP Germany! 🎵',
            'turkey': '🇹🇷 Türkei - Brücke zwischen Europa und Asien! Hier produzieren wir unsere hochwertigen Produkte unter strengster Qualitätskontrolle! ☕'
        };

        const message = messages[type] || '✨ Du hast ein Easter Egg gefunden!';
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'easter-egg-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(255, 107, 53, 0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 4s forwards;
            font-size: 0.95rem;
            line-height: 1.6;
        `;
        
        document.body.appendChild(toast);
        
        // Add confetti effect
        createConfetti(element);
        
        // Remove after animation
        setTimeout(() => {
            toast.remove();
        }, 4500);
    }

    // 2. Secret Value Card
    function initSecretValueCard() {
        const secretCard = document.querySelector('.clickable-secret');
        if (!secretCard) return;

        let clickCount = 0;
        
        secretCard.addEventListener('click', function() {
            clickCount++;
            
            if (clickCount === 1) {
                this.classList.add('revealed');
                this.querySelector('h3').textContent = 'Gratulation!';
                this.querySelector('p').textContent = 'Du hast unser Geheimnis gefunden! 🎉';
                
                // Show special message
                setTimeout(() => {
                    showSpecialModal();
                }, 500);
            }
        });
    }

    function showSpecialModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 3rem;
            border-radius: 24px;
            text-align: center;
            max-width: 500px;
            color: white;
            box-shadow: 0 20px 60px rgba(255, 107, 53, 0.3);
            animation: zoomIn 0.5s ease;
        `;
        
        content.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎊</div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #ff6b35;">Herzlichen Glückwunsch!</h2>
            <p style="font-size: 1.1rem; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
                Du bist neugierig und aufmerksam - genau die Eigenschaften, die wir schätzen! 
                Bei CKP Germany legen wir Wert auf Details und Qualität. Genau wie du! 🌟
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 1rem 2.5rem;
                background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s ease;
            ">Großartig!</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 3. Konami Code Easter Egg
    function initKonamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', function(e) {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                
                if (konamiIndex === konamiCode.length) {
                    activateKonamiCode();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    function activateKonamiCode() {
        // Rainbow effect on page
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
            body {
                animation: rainbow 3s linear infinite;
            }
        `;
        document.head.appendChild(style);
        
        // Show message
        alert('🎮 KONAMI CODE AKTIVIERT! 🌈\n\nDu bist ein echter Gamer! Die Seite ist jetzt im Rainbow-Mode! 🦄');
        
        // Remove after 10 seconds
        setTimeout(() => {
            style.remove();
        }, 10000);
    }

    // 4. Scroll Surprise
    function initScrollSurprise() {
        let hasTriggered = false;
        
        window.addEventListener('scroll', function() {
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            if (scrollPercentage > 80 && !hasTriggered) {
                hasTriggered = true;
                showScrollSurprise();
            }
        });
    }

    function showScrollSurprise() {
        const surprise = document.createElement('div');
        surprise.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: white;
            padding: 1.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 300px;
            animation: slideInLeft 0.5s ease;
        `;
        
        surprise.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2.5rem;">📜</div>
                <div>
                    <strong style="color: #ff6b35;">Fast geschafft!</strong>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                        Du hast fast alles über uns gelesen! 🎉
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(surprise);
        
        setTimeout(() => {
            surprise.style.animation = 'slideOutLeft 0.5s ease';
            setTimeout(() => surprise.remove(), 500);
        }, 5000);
    }

    // 5. Add AOS (Animate On Scroll) functionality
    function addAOSAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('[data-aos]').forEach(element => {
            observer.observe(element);
        });
    }

    // Helper: Create Confetti
    function createConfetti(element) {
        const colors = ['#ff6b35', '#ff8c42', '#ffd700', '#ff69b4'];
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: confettiFall ${1 + Math.random()}s ease-out forwards;
            `;
            
            // Random direction
            const angle = Math.random() * 360;
            const velocity = 100 + Math.random() * 100;
            const dx = Math.cos(angle * Math.PI / 180) * velocity;
            const dy = Math.sin(angle * Math.PI / 180) * velocity - 100;
            
            confetti.style.setProperty('--dx', dx + 'px');
            confetti.style.setProperty('--dy', dy + 'px');
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }
    }

    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes slideInLeft {
            from {
                transform: translateX(-400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutLeft {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-400px);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes zoomIn {
            from {
                transform: scale(0.5);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes confettiFall {
            to {
                transform: translate(var(--dx), var(--dy)) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

})();