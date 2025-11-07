/**
 * History Timeline & Slider
 * Interactive timeline with period selection and event slider
 */

import { shouldReduceMotion } from './gsap-setup.js';

let historyData = [];
let currentPeriodIndex = 0;
let currentEventIndex = 0;

const timelinePointsContainer = document.getElementById('timelinePoints');
const sliderTrack = document.getElementById('sliderTrack');
const sliderPrevBtn = document.getElementById('sliderPrev');
const sliderNextBtn = document.getElementById('sliderNext');
const sliderCounter = document.getElementById('sliderCounter');

/**
 * Load history data from JSON
 */
async function loadHistoryData() {
  try {
    const response = await fetch('./data/history.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    historyData = await response.json();
    console.log(`✅ Loaded ${historyData.length} historical periods`);
    return true;
  } catch (error) {
    console.error('❌ Failed to load history data:', error);
    return false;
  }
}

/**
 * Create timeline points from history data
 */
function createTimeline() {
  if (!timelinePointsContainer || !historyData.length) return;
  
  timelinePointsContainer.innerHTML = '';
  
  historyData.forEach((period, index) => {
    const point = document.createElement('div');
    point.className = 'timeline-point';
    point.setAttribute('role', 'listitem');
    point.setAttribute('tabindex', '0');
    point.setAttribute('aria-label', `Период: ${period.period}, ${period.years}`);
    point.dataset.periodIndex = index;
    
    if (index === 0) {
      point.classList.add('active');
    }
    
    point.innerHTML = `
      <div class="timeline-point-content">
        <div class="timeline-period">${period.period}</div>
        <div class="timeline-years">${period.years}</div>
        <div class="timeline-description">${period.description}</div>
      </div>
    `;
    
    // Click handler
    point.addEventListener('click', () => selectPeriod(index));
    
    // Keyboard handler
    point.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectPeriod(index);
      }
    });
    
    timelinePointsContainer.appendChild(point);
  });
  
  // Animate timeline points on scroll
  animateTimeline();
}

/**
 * Select a period and update slider
 */
function selectPeriod(index) {
  if (index < 0 || index >= historyData.length) return;
  
  currentPeriodIndex = index;
  currentEventIndex = 0;
  
  // Update timeline active state
  const points = timelinePointsContainer.querySelectorAll('.timeline-point');
  points.forEach((point, i) => {
    if (i === index) {
      point.classList.add('active');
      point.focus();
    } else {
      point.classList.remove('active');
    }
  });
  
  // Update slider
  updateSlider();
  
  // Scroll to slider if needed
  const sliderWrapper = document.querySelector('.history-slider-wrapper');
  if (sliderWrapper) {
    sliderWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Create slider slides for current period
 */
function createSlider() {
  if (!sliderTrack || !historyData.length) return;
  
  sliderTrack.innerHTML = '';
  
  const period = historyData[currentPeriodIndex];
  if (!period || !period.events || !period.events.length) return;
  
  period.events.forEach((event, index) => {
    const slide = document.createElement('div');
    slide.className = 'slider-slide';
    slide.setAttribute('role', 'listitem');
    slide.setAttribute('aria-label', `Событие: ${event.title}, ${event.year}`);
    
    if (index === 0) {
      slide.classList.add('active');
    }
    
    slide.innerHTML = `
      <div class="slider-slide-content">
        <div class="slider-slide-year">${event.year}</div>
        <h3 class="slider-slide-title">${event.title}</h3>
        <p class="slider-slide-description">${event.description}</p>
      </div>
    `;
    
    sliderTrack.appendChild(slide);
  });
  
  updateSliderCounter();
  updateSliderButtons();
}

/**
 * Update slider position and active slide
 */
function updateSlider() {
  createSlider();
  
  if (!sliderTrack) return;
  
  const slides = sliderTrack.querySelectorAll('.slider-slide');
  const translateX = -currentEventIndex * 100;
  
  if (shouldReduceMotion()) {
    sliderTrack.style.transform = `translateX(${translateX}%)`;
  } else {
    // Use GSAP for smooth animation if available
    if (typeof gsap !== 'undefined') {
      gsap.to(sliderTrack, {
        x: `${translateX}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    } else {
      sliderTrack.style.transform = `translateX(${translateX}%)`;
    }
  }
  
  // Update active slide
  slides.forEach((slide, index) => {
    if (index === currentEventIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
  
  updateSliderCounter();
  updateSliderButtons();
}

/**
 * Navigate to next event
 */
function nextEvent() {
  const period = historyData[currentPeriodIndex];
  if (!period || !period.events) return;
  
  if (currentEventIndex < period.events.length - 1) {
    currentEventIndex++;
    updateSlider();
  } else if (currentPeriodIndex < historyData.length - 1) {
    // Move to next period
    selectPeriod(currentPeriodIndex + 1);
  }
}

/**
 * Navigate to previous event
 */
function prevEvent() {
  if (currentEventIndex > 0) {
    currentEventIndex--;
    updateSlider();
  } else if (currentPeriodIndex > 0) {
    // Move to previous period
    const prevPeriod = historyData[currentPeriodIndex - 1];
    selectPeriod(currentPeriodIndex - 1);
    currentEventIndex = prevPeriod.events.length - 1;
    updateSlider();
  }
}

/**
 * Update slider counter
 */
function updateSliderCounter() {
  if (!sliderCounter) return;
  
  const period = historyData[currentPeriodIndex];
  if (!period || !period.events) return;
  
  sliderCounter.textContent = `${currentEventIndex + 1} / ${period.events.length}`;
  sliderCounter.setAttribute('aria-label', `Событие ${currentEventIndex + 1} из ${period.events.length}`);
}

/**
 * Update slider button states
 */
function updateSliderButtons() {
  if (!sliderPrevBtn || !sliderNextBtn) return;
  
  const period = historyData[currentPeriodIndex];
  if (!period || !period.events) return;
  
  // Previous button
  sliderPrevBtn.disabled = currentEventIndex === 0 && currentPeriodIndex === 0;
  
  // Next button
  const isLastEvent = currentEventIndex === period.events.length - 1;
  const isLastPeriod = currentPeriodIndex === historyData.length - 1;
  sliderNextBtn.disabled = isLastEvent && isLastPeriod;
}

/**
 * Animate timeline points on scroll
 */
function animateTimeline() {
  if (shouldReduceMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }
  
  const points = timelinePointsContainer.querySelectorAll('.timeline-point');
  
  points.forEach((point, index) => {
    gsap.fromTo(point,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: point,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

/**
 * Initialize history section
 */
export async function initHistory() {
  console.log('📜 Initializing history timeline...');
  
  const loaded = await loadHistoryData();
  if (!loaded) {
    return;
  }
  
  createTimeline();
  createSlider();
  
  // Setup slider controls
  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', prevEvent);
  }
  
  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', nextEvent);
  }
  
  // Keyboard navigation for slider
  document.addEventListener('keydown', (e) => {
    const historySection = document.getElementById('history');
    if (!historySection || !document.activeElement.closest('#history')) {
      return;
    }
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevEvent();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextEvent();
    }
  });
  
  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (sliderTrack) {
    sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sliderTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        nextEvent();
      } else {
        // Swipe right - previous
        prevEvent();
      }
    }
  }
  
  console.log('✅ History timeline initialized');
}

/**
 * Toggle animations (for motion toggle)
 */
export function toggleHistoryAnimations(enabled) {
  const points = timelinePointsContainer?.querySelectorAll('.timeline-point');
  if (!points) return;
  
  points.forEach(point => {
    if (enabled) {
      point.style.animation = '';
    } else {
      point.style.animation = 'none';
    }
  });
}

