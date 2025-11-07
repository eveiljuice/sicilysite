/**
 * GSAP Animations
 * Route animations and scroll-triggered content animations
 */

import { gsap, ScrollTrigger, shouldReduceMotion } from './gsap-setup.js';

let animationInstances = [];

export function initAnimations() {
  if (shouldReduceMotion()) {
    console.log('Animations disabled: reduced motion preference');
    return;
  }
  
  // Clear existing animations
  killAnimations();
  
  // Initialize different animation types
  animateRoutes();
  animateStoryCards();
  animateFoodSection();
  animateCultureSection();
  
  console.log('Scroll animations initialized');
}

function animateRoutes() {
  const routes = document.querySelectorAll('#routes .route');
  
  routes.forEach((route, index) => {
    const animation = gsap.fromTo(
      route,
      {
        strokeDashoffset: 1000
      },
      {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.map-section',
          start: 'top center',
          end: 'center center',
          scrub: 1,
          // Stagger routes slightly
          delay: index * 0.1
        }
      }
    );
    
    animationInstances.push(animation);
  });
}

function animateStoryCards() {
  const cards = document.querySelectorAll('.story-card[data-animate]');
  
  cards.forEach((card, index) => {
    const animation = gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          end: 'top center',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.15
      }
    );
    
    animationInstances.push(animation);
  });
}

function animateFoodSection() {
  const foodGrid = document.querySelector('.food-grid[data-animate]');
  if (!foodGrid) return;
  
  const cards = foodGrid.querySelectorAll('.food-card');
  
  const animation = gsap.fromTo(
    cards,
    {
      opacity: 0,
      scale: 0.9,
      y: 30
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.2)',
      stagger: 0.1,
      scrollTrigger: {
        trigger: foodGrid,
        start: 'top bottom-=100',
        end: 'top center',
        toggleActions: 'play none none reverse'
      }
    }
  );
  
  animationInstances.push(animation);
}

function animateCultureSection() {
  const cultureContent = document.querySelector('.culture-content[data-animate]');
  if (!cultureContent) return;
  
  const text = cultureContent.querySelector('.culture-text');
  const features = cultureContent.querySelectorAll('.culture-feature');
  
  // Animate text
  if (text) {
    const textAnimation = gsap.fromTo(
      text,
      {
        opacity: 0,
        x: -40
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cultureContent,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        }
      }
    );
    
    animationInstances.push(textAnimation);
  }
  
  // Animate features
  if (features.length > 0) {
    const featuresAnimation = gsap.fromTo(
      features,
      {
        opacity: 0,
        x: 40
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: cultureContent,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        }
      }
    );
    
    animationInstances.push(featuresAnimation);
  }
}

export function killAnimations() {
  animationInstances.forEach(instance => {
    if (instance && instance.scrollTrigger) {
      instance.scrollTrigger.kill();
    }
    if (instance && instance.kill) {
      instance.kill();
    }
  });
  animationInstances = [];
}

export function toggleAnimations(enabled) {
  if (enabled) {
    initAnimations();
  } else {
    killAnimations();
    
    // Reset all animated elements to final state
    gsap.set('.story-card[data-animate], .food-card, .culture-text, .culture-feature', {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      clearProps: 'all'
    });
    
    // Reset routes
    const routes = document.querySelectorAll('#routes .route');
    gsap.set(routes, {
      strokeDashoffset: 0
    });
  }
}

