/**
 * Contact Form Handler
 * Handles form validation and submission
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
        const form = document.getElementById('contact-form');
        if (!form) return;

        const successMessage = document.getElementById('form-success');
        const errorMessage = document.getElementById('form-error');

        form.addEventListener('submit', handleSubmit);

        // Add AOS animations to form elements
        addFormAnimations();
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('.btn-submit');
        const successMessage = document.getElementById('form-success');
        const errorMessage = document.getElementById('form-error');

        // Get form data
        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };

        // Validate
        if (!validateForm(formData)) {
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>Wird gesendet...</span>
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
        `;

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .spinner {
                animation: spin 1s linear infinite;
            }
        `;
        document.head.appendChild(style);

        // Hide previous messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');

        // Simulate API call (replace with actual endpoint)
        try {
            // Simulated delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Here you would normally send to your backend:
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            // Success
            successMessage.classList.remove('hidden');
            form.reset();
            
            // Log to console (for demo)
            console.log('Form submitted:', formData);

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            // Error
            errorMessage.classList.remove('hidden');
            console.error('Form submission error:', error);

            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Nachricht senden
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            `;
        }
    }

    function validateForm(data) {
        // Check if all fields are filled
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            return false;
        }

        // Check message length
        if (data.message.length < 10) {
            alert('Ihre Nachricht muss mindestens 10 Zeichen lang sein.');
            return false;
        }

        return true;
    }

    function addFormAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
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

    // Add input animations
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

})();