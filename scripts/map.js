/**
 * Interactive Map Functionality
 * Handles SVG map interactions, pins, tooltips, and region clicks
 */

let locationsData = [];
let svgDocument = null;
let currentFocusedRegion = null;

export async function initMap() {
  // Load locations data
  try {
    const response = await fetch('./data/locations.json');
    locationsData = await response.json();
  } catch (error) {
    console.error('Failed to load locations data:', error);
    return;
  }
  
  // Get SVG map
  const mapObject = document.getElementById('sicilyMap');
  if (!mapObject) {
    console.error('Map object not found');
    return;
  }
  
  // Wait for SVG to load
  if (mapObject.contentDocument) {
    setupMap(mapObject);
  } else {
    mapObject.addEventListener('load', () => setupMap(mapObject));
  }
}

function setupMap(mapObject) {
  svgDocument = mapObject.contentDocument;
  if (!svgDocument) {
    console.error('Cannot access SVG document');
    return;
  }
  
  // Setup regions
  const regions = svgDocument.querySelectorAll('.region');
  regions.forEach(region => {
    setupRegion(region);
  });
  
  // Render pins
  renderPins();
  
  console.log(`Map initialized with ${regions.length} regions and ${locationsData.length} pins`);
}

function setupRegion(region) {
  const regionId = region.id;
  
  // Mouse events
  region.addEventListener('mouseenter', (e) => handleRegionHover(e, regionId, true));
  region.addEventListener('mouseleave', (e) => handleRegionHover(e, regionId, false));
  region.addEventListener('click', () => handleRegionClick(regionId));
  
  // Keyboard events
  region.addEventListener('focus', (e) => {
    handleRegionHover(e, regionId, true);
    currentFocusedRegion = region;
  });
  
  region.addEventListener('blur', (e) => {
    handleRegionHover(e, regionId, false);
    currentFocusedRegion = null;
  });
  
  region.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRegionClick(regionId);
    }
  });
}

function handleRegionHover(event, regionId, isEntering) {
  const location = locationsData.find(loc => loc.id === regionId);
  if (!location) return;
  
  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip) return;
  
  if (isEntering) {
    tooltip.textContent = location.name;
    tooltip.classList.add('show');
    updateTooltipPosition(event);
  } else {
    tooltip.classList.remove('show');
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip) return;
  
  const mapWrap = document.querySelector('.map-wrap');
  const rect = mapWrap.getBoundingClientRect();
  
  let x, y;
  
  if (event.type === 'focus') {
    // For keyboard focus, position near the focused element
    const target = event.target;
    const bbox = target.getBBox();
    const mapObject = document.getElementById('sicilyMap');
    const mapRect = mapObject.getBoundingClientRect();
    
    x = (bbox.x + bbox.width / 2) * (mapRect.width / 1000);
    y = (bbox.y) * (mapRect.height / 600);
  } else {
    // For mouse, use cursor position
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function handleRegionClick(regionId) {
  const location = locationsData.find(loc => loc.id === regionId);
  if (!location) {
    console.warn(`No data found for region: ${regionId}`);
    return;
  }
  
  // Import and open modal (modal.js will be loaded)
  if (window.openModal) {
    window.openModal(location);
  }
}

function renderPins() {
  const pinsContainer = document.getElementById('mapPins');
  if (!pinsContainer) return;
  
  pinsContainer.innerHTML = '';
  
  locationsData.forEach(location => {
    if (!location.coords) return;
    
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.setProperty('--x', location.coords.x);
    pin.style.setProperty('--y', location.coords.y);
    pin.setAttribute('role', 'button');
    pin.setAttribute('tabindex', '0');
    pin.setAttribute('aria-label', `Открыть информацию о ${location.name}`);
    
    // Click handler
    pin.addEventListener('click', () => {
      if (window.openModal) {
        window.openModal(location);
      }
    });
    
    // Keyboard handler
    pin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (window.openModal) {
          window.openModal(location);
        }
      }
    });
    
    // Hover handlers
    pin.addEventListener('mouseenter', (e) => {
      const tooltip = document.getElementById('mapTooltip');
      if (tooltip) {
        tooltip.textContent = location.name;
        tooltip.classList.add('show');
        
        const mapWrap = document.querySelector('.map-wrap');
        const rect = mapWrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      }
    });
    
    pin.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('mapTooltip');
      if (tooltip) {
        tooltip.classList.remove('show');
      }
    });
    
    pin.addEventListener('focus', (e) => {
      const tooltip = document.getElementById('mapTooltip');
      if (tooltip) {
        tooltip.textContent = location.name;
        tooltip.classList.add('show');
        
        const rect = pin.getBoundingClientRect();
        const mapWrap = document.querySelector('.map-wrap');
        const mapRect = mapWrap.getBoundingClientRect();
        
        const x = rect.left + rect.width / 2 - mapRect.left;
        const y = rect.top - mapRect.top;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      }
    });
    
    pin.addEventListener('blur', () => {
      const tooltip = document.getElementById('mapTooltip');
      if (tooltip) {
        tooltip.classList.remove('show');
      }
    });
    
    pinsContainer.appendChild(pin);
  });
}

// Track mouse movement for smooth tooltip following
document.addEventListener('mousemove', (e) => {
  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip || !tooltip.classList.contains('show')) return;
  
  const mapWrap = document.querySelector('.map-wrap');
  if (!mapWrap) return;
  
  const rect = mapWrap.getBoundingClientRect();
  
  // Check if mouse is over map area
  if (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
});

