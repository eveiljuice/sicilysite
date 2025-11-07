/**
 * Main Application Entry Point
 * Initializes all modules and handles global functionality
 */

import { initParallax, toggleParallax } from './parallax.js';
import { initMap } from './map.js';
import { initModal } from './modal.js';
import { initAnimations, toggleAnimations } from './animations.js';
import { initHistory, toggleHistoryAnimations } from './history.js';
import { shouldReduceMotion, refreshScrollTrigger } from './gsap-setup.js';

// State
let motionEnabled = true;

/**
 * Initialize the application
 */
function init() {
  console.log('🏝️ Initializing Sicily Live Map...');
  
  // Check motion preferences
  checkMotionPreference();
  
  // Initialize all modules
  initParallax();
  initMap();
  initModal();
  initAnimations();
  initHistory();
  
  // Setup motion toggle
  setupMotionToggle();
  
  // Setup contact form
  setupContactForm();
  
  // Setup smooth scrolling for anchor links
  setupSmoothScroll();
  
  // Listen for system motion preference changes
  watchMotionPreference();
  
  console.log('✅ Application initialized successfully');
}

/**
 * Check and apply motion preferences
 */
function checkMotionPreference() {
  // Check localStorage
  const savedPreference = localStorage.getItem('motionEnabled');
  
  // Check system preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (savedPreference !== null) {
    motionEnabled = savedPreference === 'true';
  } else if (prefersReduced) {
    motionEnabled = false;
  }
  
  applyMotionPreference(motionEnabled);
}

/**
 * Apply motion preference to the page
 */
function applyMotionPreference(enabled) {
  motionEnabled = enabled;
  
  if (enabled) {
    document.documentElement.classList.remove('reduce-motion');
  } else {
    document.documentElement.classList.add('reduce-motion');
  }
  
  // Update toggle button
  updateMotionToggleButton();
  
  // Save preference
  localStorage.setItem('motionEnabled', enabled.toString());
}

/**
 * Setup motion toggle button
 */
function setupMotionToggle() {
  const toggle = document.getElementById('motionToggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', () => {
    motionEnabled = !motionEnabled;
    applyMotionPreference(motionEnabled);
    
    // Reinitialize or kill animations
    if (motionEnabled) {
      initParallax();
      initAnimations();
    } else {
      toggleParallax(false);
      toggleAnimations(false);
      toggleHistoryAnimations(false);
    }
    
    // Refresh ScrollTrigger
    setTimeout(() => {
      refreshScrollTrigger();
    }, 100);
  });
  
  updateMotionToggleButton();
}

/**
 * Update motion toggle button state
 */
function updateMotionToggleButton() {
  const toggle = document.getElementById('motionToggle');
  if (!toggle) return;
  
  const stateSpan = toggle.querySelector('.toggle-state');
  
  if (motionEnabled) {
    toggle.setAttribute('aria-pressed', 'false');
    if (stateSpan) stateSpan.textContent = 'Вкл';
  } else {
    toggle.setAttribute('aria-pressed', 'true');
    if (stateSpan) stateSpan.textContent = 'Выкл';
  }
}

/**
 * Watch for system motion preference changes
 */
function watchMotionPreference() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  mediaQuery.addEventListener('change', (e) => {
    // Only apply if user hasn't set manual preference
    if (localStorage.getItem('motionEnabled') === null) {
      const shouldReduce = e.matches;
      applyMotionPreference(!shouldReduce);
      
      if (!shouldReduce) {
        initParallax();
        initAnimations();
      } else {
        toggleParallax(false);
        toggleAnimations(false);
        toggleHistoryAnimations(false);
      }
    }
  });
}

/**
 * Setup contact form validation and submission
 */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const messageInput = form.querySelector('#message');
  
  // Real-time validation
  nameInput?.addEventListener('blur', () => validateField(nameInput, 'name'));
  emailInput?.addEventListener('blur', () => validateField(emailInput, 'email'));
  messageInput?.addEventListener('blur', () => validateField(messageInput, 'message'));
  
  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(input => {
    input?.addEventListener('input', () => {
      const errorId = `${input.id}-error`;
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.textContent = '';
      }
      input.classList.remove('error');
    });
  });
  
  // Form submission
  form.addEventListener('submit', handleFormSubmit);
}

/**
 * Validate individual form field
 */
function validateField(input, type) {
  const errorId = `${input.id}-error`;
  const errorElement = document.getElementById(errorId);
  if (!errorElement) return true;
  
  let error = '';
  
  if (!input.value.trim()) {
    error = 'Это поле обязательно для заполнения';
  } else if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      error = 'Введите корректный email адрес';
    }
  } else if (type === 'name' && input.value.trim().length < 2) {
    error = 'Имя должно содержать минимум 2 символа';
  } else if (type === 'message' && input.value.trim().length < 10) {
    error = 'Сообщение должно содержать минимум 10 символов';
  }
  
  errorElement.textContent = error;
  
  if (error) {
    input.classList.add('error');
    return false;
  } else {
    input.classList.remove('error');
    return true;
  }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const messageInput = form.querySelector('#message');
  
  // Validate all fields
  const nameValid = validateField(nameInput, 'name');
  const emailValid = validateField(emailInput, 'email');
  const messageValid = validateField(messageInput, 'message');
  
  if (!nameValid || !emailValid || !messageValid) {
    // Focus first invalid field
    if (!nameValid) nameInput.focus();
    else if (!emailValid) emailInput.focus();
    else if (!messageValid) messageInput.focus();
    return;
  }
  
  // Show success message
  const successElement = document.getElementById('form-success');
  if (successElement) {
    successElement.textContent = '✅ Спасибо! Ваше сообщение успешно отправлено.';
    successElement.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
      successElement.classList.remove('show');
    }, 5000);
  }
  
  // Reset form
  form.reset();
  
  // In production, you would send data to a server here
  console.log('Form submitted:', {
    name: nameInput.value,
    email: emailInput.value,
    message: messageInput.value
  });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      
      // Calculate offset for fixed header
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: motionEnabled ? 'smooth' : 'auto'
      });
      
      // Update focus for accessibility
      target.focus({ preventScroll: true });
    });
  });
}

/**
 * Handle lazy loading images
 */
function setupLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback for older browsers
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lazysizes@5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}

/**
 * Handle page visibility changes
 */
function handleVisibilityChange() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, pause animations if needed
      console.log('Page hidden');
    } else {
      // Page is visible again
      console.log('Page visible');
      refreshScrollTrigger();
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Setup additional features
setupLazyLoading();
handleVisibilityChange();

// Handle window resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    refreshScrollTrigger();
  }, 250);
});

// Expose for debugging
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.sicilyApp = {
    motionEnabled,
    toggleMotion: (enabled) => {
      applyMotionPreference(enabled);
      if (enabled) {
        initParallax();
        initAnimations();
      } else {
        toggleParallax(false);
        toggleAnimations(false);
        toggleHistoryAnimations(false);
      }
    },
    refreshScrollTrigger
  };
}

