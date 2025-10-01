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
        const confirmationPanel = document.getElementById('form-confirmation');

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

            if (firstInvalidField) {
                firstInvalidField.focus();
            } else {
                // If form is valid, show confirmation panel
                const mailtoLink = `mailto:support@aroonierepairs.test?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
                )}`;
                
                const sendEmailLink = document.getElementById('send-email-link');
                sendEmailLink.href = mailtoLink;

                contactForm.classList.add('form-hidden');
                confirmationPanel.classList.remove('d-none');

                // Optional: Add a button to go back to the form
                const backButton = document.getElementById('form-back-btn');
                if (backButton) {
                    backButton.addEventListener('click', () => {
                        contactForm.classList.remove('form-hidden');
                        confirmationPanel.classList.add('d-none');
                        contactForm.reset(); // Reset form fields
                    }, { once: true }); // Use 'once' to avoid multiple listeners
                }
            }
        });

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