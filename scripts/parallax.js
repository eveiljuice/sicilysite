/**
 * Parallax Effects for Hero Section
 * Creates smooth multi-layer parallax scrolling
 */

import { gsap, ScrollTrigger, shouldReduceMotion } from './gsap-setup.js';

let parallaxInstances = [];

export function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const layers = hero.querySelectorAll('.layer');
  if (!layers.length) return;
  
  // Clear existing instances
  killParallax();
  
  // Skip if user prefers reduced motion
  if (shouldReduceMotion()) {
    console.log('Parallax disabled: reduced motion preference');
    return;
  }
  
  // Create parallax effect for each layer
  layers.forEach(layer => {
    const speed = parseFloat(layer.dataset.speed) || 0.5;
    const depth = speed * 100;
    
    const tween = gsap.to(layer, {
      yPercent: depth,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      }
    });
    
    parallaxInstances.push(tween);
  });
  
  console.log(`Parallax initialized with ${layers.length} layers`);
}

export function killParallax() {
  parallaxInstances.forEach(instance => {
    if (instance && instance.scrollTrigger) {
      instance.scrollTrigger.kill();
    }
    if (instance && instance.kill) {
      instance.kill();
    }
  });
  parallaxInstances = [];
}

export function toggleParallax(enabled) {
  if (enabled) {
    initParallax();
  } else {
    killParallax();
    
    // Reset layer positions
    const layers = document.querySelectorAll('.layer');
    layers.forEach(layer => {
      gsap.set(layer, { yPercent: 0, clearProps: 'transform' });
    });
  }
}

// Re-initialize on resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (!shouldReduceMotion()) {
      ScrollTrigger.refresh();
    }
  }, 250);
});

