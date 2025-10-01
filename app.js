/**
 * Initializes site-wide scripts like theme toggling, mobile navigation,
 * and scroll animations.
 */
function initGlobalScripts() {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  // Fade-up animation on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('anim-fade-up');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isVisible = primaryNav.getAttribute('data-visible') === 'true';
      primaryNav.setAttribute('data-visible', String(!isVisible));
      navToggle.setAttribute('aria-expanded', String(!isVisible));
    });
  }
}

/**
 * Initializes scripts specific to the contact page form.
 */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const formStatus = document.getElementById('form-status');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const errorMessages = contactForm.querySelectorAll('.error-message');
    errorMessages.forEach((msg) => msg.remove());
    const invalidFields = contactForm.querySelectorAll('[aria-invalid]');
    invalidFields.forEach((field) => field.removeAttribute('aria-invalid'));

    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const subject = formData.get('subject').trim();
    const message = formData.get('message').trim();
    const honeypot = formData.get('website');

    let firstInvalidField = null;

    const showError = (field, message) => {
      field.setAttribute('aria-invalid', 'true');
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      field.parentElement.appendChild(error);
      if (!firstInvalidField) firstInvalidField = field;
    };

    if (!name) showError(document.getElementById('name'), 'Please enter your name.');
    if (!email) {
      showError(document.getElementById('email'), 'Please enter your email address.');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      showError(document.getElementById('email'), 'Please enter a valid email address.');
    }
    if (!subject) showError(document.getElementById('subject'), 'Please enter a subject.');
    if (!message) showError(document.getElementById('message'), 'Please enter a message.');

    if (firstInvalidField) {
      firstInvalidField.focus();
    } else {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        formStatus.textContent = result.message;
        formStatus.style.color = 'var(--success)';
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.style.color = 'var(--danger)';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message →';
    }
  }
}

/**
 * Initializes scripts specific to the index page.
 */
function initIndexPage() {
  const scrollBtn = document.getElementById('scroll-btn');
  if (!scrollBtn) return;

  scrollBtn.addEventListener('click', () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      const topOffset = servicesSection.offsetTop - 40; // Adjust for sticky header
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  });
}

// Main execution block
document.addEventListener('DOMContentLoaded', () => {
  initGlobalScripts();
  initContactForm();
  initIndexPage();
});