document.addEventListener('DOMContentLoaded', function() {

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Function to set theme
    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Event listener for the toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // Check for saved theme in localStorage or user's OS preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    // Fade-up animation on scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const existingClasses = e.target.getAttribute('class') || '';
                e.target.setAttribute('class', `anim-fade-up ${existingClasses}`);
                observer.unobserve(e.target);
            }
        });
    }, {
        threshold: 0.15
    });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isVisible = primaryNav.getAttribute('data-visible') === 'true';
            primaryNav.setAttribute('data-visible', !isVisible);
            navToggle.setAttribute('aria-expanded', !isVisible);
        });
    }


    // Page-specific scripts
    // =================================================================

    // Contact Form (contact.html)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default submission

            // Clear previous errors
            const errorMessages = contactForm.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
            const invalidFields = contactForm.querySelectorAll('[aria-invalid]');
            invalidFields.forEach(field => field.removeAttribute('aria-invalid'));

            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const subject = formData.get('subject').trim();
            const message = formData.get('message').trim();
            const honeypot = formData.get('website');

            let firstInvalidField = null;

            // Validation logic
            if (!name) {
                showError(document.getElementById('name'), 'Please enter your name.');
                if (!firstInvalidField) firstInvalidField = document.getElementById('name');
            }
            if (!email) {
                showError(document.getElementById('email'), 'Please enter your email address.');
                if (!firstInvalidField) firstInvalidField = document.getElementById('email');
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                showError(document.getElementById('email'), 'Please enter a valid email address.');
                if (!firstInvalidField) firstInvalidField = document.getElementById('email');
            }
            if (!subject) {
                showError(document.getElementById('subject'), 'Please enter a subject.');
                if (!firstInvalidField) firstInvalidField = document.getElementById('subject');
            }
            if (!message) {
                showError(document.getElementById('message'), 'Please enter a message.');
                if (!firstInvalidField) firstInvalidField = document.getElementById('message');
            }

            if (firstInvalidField) {
                firstInvalidField.focus();
            } else {
                // If form is valid, send data to the serverless function
                submitForm({ name, email, subject, message, website: honeypot });
            }
        });

        async function submitForm(data) {
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formStatus.textContent = '';

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    formStatus.innerHTML = `<p style="color: var(--success);">${result.message}</p>`;
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Something went wrong.');
                }
            } catch (error) {
                formStatus.innerHTML = `<p style="color: var(--danger);">${error.message}</p>`;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message →';
            }
        }

        function showError(field, message) {
            field.setAttribute('aria-invalid', 'true');
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            field.parentElement.appendChild(error);
        }
    }

    // Smooth scroll for 'Scroll' button (index.html)
    const scrollBtn = document.getElementById('scroll-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                const topOffset = servicesSection.offsetTop - 40; // Adjust for sticky header
                window.scrollTo({ top: topOffset, behavior: 'smooth' });
            }
        });
    }
});