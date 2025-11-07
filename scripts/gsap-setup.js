/**
 * GSAP Setup and Configuration
 * Initializes GSAP with ScrollTrigger plugin
 */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Set GSAP defaults
gsap.defaults({
  ease: 'power2.out',
  duration: 0.8
});

// ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  markers: false // Set to true for debugging
});

// Check for reduced motion preference
export function shouldReduceMotion() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}

// Create animation only if motion is allowed
export function createAnimation(target, vars, scrollTrigger = null) {
  if (shouldReduceMotion()) {
    // Apply end state immediately without animation
    gsap.set(target, {
      ...vars,
      scrollTrigger: null
    });
    return null;
  }
  
  return gsap.to(target, {
    ...vars,
    scrollTrigger
  });
}

// Create timeline only if motion is allowed
export function createTimeline(vars = {}) {
  if (shouldReduceMotion()) {
    return {
      to: () => {},
      from: () => {},
      fromTo: () => {},
      add: () => {},
      play: () => {},
      kill: () => {}
    };
  }
  
  return gsap.timeline(vars);
}

// Refresh ScrollTrigger (useful after DOM changes)
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

// Kill all ScrollTrigger instances
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}

export { gsap, ScrollTrigger };

