/**
 * Modal System with Gallery
 * Handles modal opening/closing, focus trap, and image gallery
 */

let currentLocation = null;
let currentImageIndex = 0;
let focusableElements = [];
let previouslyFocusedElement = null;
let touchStartX = 0;
let touchEndX = 0;

export function initModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');
  
  // Close on backdrop click
  backdrop?.addEventListener('click', closeModal);
  
  // Close on close button
  closeBtn?.addEventListener('click', closeModal);
  
  // Close on Escape key
  document.addEventListener('keydown', handleModalKeydown);
  
  // Touch events for swipe
  const gallery = modal.querySelector('.modal-gallery');
  if (gallery) {
    gallery.addEventListener('touchstart', handleTouchStart, { passive: true });
    gallery.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
  
  // Expose openModal globally
  window.openModal = openModal;
  
  console.log('Modal system initialized');
}

export function openModal(location) {
  const modal = document.getElementById('modal');
  if (!modal || !location) return;
  
  currentLocation = location;
  currentImageIndex = 0;
  
  // Store currently focused element
  previouslyFocusedElement = document.activeElement;
  
  // Set modal content
  const title = modal.querySelector('#modal-title');
  const description = modal.querySelector('#modalDescription');
  const gallery = modal.querySelector('#modalGallery');
  
  if (title) title.textContent = location.name;
  if (description) description.innerHTML = `<p>${location.summary}</p>`;
  
  // Render gallery
  if (gallery) {
    renderGallery(location.gallery || []);
  }
  
  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Setup focus trap
  setupFocusTrap(modal);
  
  // Focus first focusable element
  setTimeout(() => {
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, 100);
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Return focus to previously focused element
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
  
  // Clear data
  currentLocation = null;
  currentImageIndex = 0;
  focusableElements = [];
}

function renderGallery(images) {
  const gallery = document.querySelector('#modalGallery');
  if (!gallery) return;
  
  gallery.innerHTML = '';
  
  if (!images || images.length === 0) {
    gallery.innerHTML = `
      <div class="gallery-empty">
        <span>📷 Изображения скоро появятся</span>
      </div>
    `;
    return;
  }
  
  if (images.length === 1) {
    // Single image
    gallery.innerHTML = `
      <div class="gallery-single">
        <img src="${images[0]}" alt="${currentLocation?.name || ''}" loading="lazy" decoding="async">
      </div>
    `;
    return;
  }
  
  // Multiple images - full gallery
  gallery.innerHTML = `
    <div class="gallery-main">
      <img id="galleryMainImage" src="${images[0]}" alt="${currentLocation?.name || ''}" loading="lazy" decoding="async">
      <button class="gallery-nav prev" aria-label="Предыдущее изображение">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="gallery-nav next" aria-label="Следующее изображение">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <div class="gallery-indicator">
        <span id="galleryCounter">1 / ${images.length}</span>
      </div>
    </div>
    <div class="gallery-thumbs" role="list" aria-label="Миниатюры галереи">
      ${images.map((img, index) => `
        <button class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                data-index="${index}"
                role="listitem"
                aria-label="Перейти к изображению ${index + 1}">
          <img src="${img}" alt="" loading="lazy" decoding="async">
        </button>
      `).join('')}
    </div>
  `;
  
  // Setup gallery navigation
  setupGalleryNavigation(images);
}

function setupGalleryNavigation(images) {
  const prevBtn = document.querySelector('.gallery-nav.prev');
  const nextBtn = document.querySelector('.gallery-nav.next');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  
  prevBtn?.addEventListener('click', () => navigateGallery(-1, images));
  nextBtn?.addEventListener('click', () => navigateGallery(1, images));
  
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      currentImageIndex = index;
      updateGalleryImage(images);
    });
  });
}

function navigateGallery(direction, images) {
  currentImageIndex += direction;
  
  if (currentImageIndex < 0) {
    currentImageIndex = images.length - 1;
  } else if (currentImageIndex >= images.length) {
    currentImageIndex = 0;
  }
  
  updateGalleryImage(images);
}

function updateGalleryImage(images) {
  const mainImage = document.getElementById('galleryMainImage');
  const counter = document.getElementById('galleryCounter');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  
  if (mainImage) {
    mainImage.src = images[currentImageIndex];
  }
  
  if (counter) {
    counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
  }
  
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentImageIndex);
  });
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) < swipeThreshold) return;
  
  if (!currentLocation?.gallery || currentLocation.gallery.length <= 1) return;
  
  if (diff > 0) {
    // Swipe left - next image
    navigateGallery(1, currentLocation.gallery);
  } else {
    // Swipe right - previous image
    navigateGallery(-1, currentLocation.gallery);
  }
}

function setupFocusTrap(modal) {
  // Get all focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');
  
  focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Remove old listener if exists
  modal.removeEventListener('keydown', trapFocus);
  
  // Add focus trap
  modal.addEventListener('keydown', function trapFocus(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

function handleModalKeydown(e) {
  const modal = document.getElementById('modal');
  if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
  
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  }
  
  // Arrow keys for gallery navigation
  if (currentLocation?.gallery && currentLocation.gallery.length > 1) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateGallery(-1, currentLocation.gallery);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateGallery(1, currentLocation.gallery);
    }
  }
}

