/**
 * Interactive Map with Leaflet and OpenStreetMap
 * Handles map initialization, markers, popups, and interactions
 */

let map = null;
let locationsData = [];
let markers = [];

// Custom icon for markers
function createCustomIcon(color = '#E67E22') {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin" style="background-color: ${color};">
        <div class="marker-pulse"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

export async function initMap() {
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet library is not loaded. Please ensure Leaflet script is included before app.js');
    return;
  }
  
  // Load locations data
  try {
    const response = await fetch('./data/locations.json');
    locationsData = await response.json();
  } catch (error) {
    console.error('Failed to load locations data:', error);
    return;
  }
  
  // Initialize Leaflet map
  const mapContainer = document.getElementById('sicilyMap');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }
  
  // Center of Sicily
  const sicilyCenter = [37.5, 14.0];
  
  // Create map instance
  map = L.map('sicilyMap', {
    center: sicilyCenter,
    zoom: 8,
    minZoom: 7,
    maxZoom: 15,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    touchZoom: true
  });
  
  // Add OpenStreetMap tile layer
  const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 256,
    zoomOffset: 0
  });
  
  osmLayer.addTo(map);
  
  // Add markers for each location
  addMarkers();
  
  // Fit map to show all markers
  fitMapToMarkers();
  
  // Add scroll-triggered animation for map appearance
  animateMapAppearance();
  
  console.log(`Map initialized with ${locationsData.length} locations`);
}

function addMarkers() {
  if (!map || !locationsData.length) return;
  
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  
  locationsData.forEach(location => {
    if (!location.coords || !location.coords.lat || !location.coords.lng) {
      console.warn(`Missing coordinates for location: ${location.id}`);
      return;
    }
    
    const latlng = [location.coords.lat, location.coords.lng];
    
    // Create custom icon
    const icon = createCustomIcon('#E67E22');
    
    // Create marker
    const marker = L.marker(latlng, {
      icon: icon,
      title: location.name,
      alt: location.name,
      keyboard: true,
      riseOnHover: true
    });
    
    // Add popup with location name
    marker.bindPopup(
      `<div class="map-popup">
        <h3>${location.name}</h3>
        <p>${location.summary.substring(0, 100)}...</p>
        <button class="popup-button" data-location-id="${location.id}">Узнать больше</button>
      </div>`,
      {
        maxWidth: 300,
        className: 'custom-popup',
        closeButton: true,
        autoPan: true,
        autoPanPadding: [50, 50]
      }
    );
    
    // Click handler - open modal
    marker.on('click', () => {
      if (window.openModal) {
        window.openModal(location);
      }
    });
    
    // Keyboard handler
    marker.on('keypress', (e) => {
      if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
        e.originalEvent.preventDefault();
        if (window.openModal) {
          window.openModal(location);
        }
      }
    });
    
    // Add hover effect
    marker.on('mouseover', () => {
      marker.setZIndexOffset(1000);
    });
    
    marker.on('mouseout', () => {
      marker.setZIndexOffset(0);
    });
    
    // Add to map
    marker.addTo(map);
    markers.push(marker);
  });
  
  // Handle popup button clicks
  map.on('popupopen', (e) => {
    const popup = e.popup;
    const button = popup._contentNode?.querySelector('.popup-button');
    if (button) {
      button.addEventListener('click', () => {
        const locationId = button.dataset.locationId;
        const location = locationsData.find(loc => loc.id === locationId);
        if (location && window.openModal) {
          map.closePopup();
          window.openModal(location);
        }
      });
    }
  });
}

function fitMapToMarkers() {
  if (!map || markers.length === 0) return;
  
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.1), {
    maxZoom: 10,
    animate: true,
    duration: 1.0
  });
}

function animateMapAppearance() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }
  
  const mapSection = document.querySelector('.map-section');
  if (!mapSection) return;
  
  // Animate map container fade-in
  gsap.fromTo('#sicilyMap', 
    {
      opacity: 0,
      scale: 0.95
    },
    {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: mapSection,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse'
      }
    }
  );
  
  // Animate markers appearance with stagger
  markers.forEach((marker, index) => {
    const markerElement = marker.getElement();
    if (markerElement) {
      gsap.fromTo(markerElement,
        {
          opacity: 0,
          scale: 0
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: mapSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  });
}

// Export function to get map instance (for external use)
export function getMap() {
  return map;
}

// Export function to center map on location
export function centerMapOnLocation(locationId) {
  if (!map) return;
  
  const location = locationsData.find(loc => loc.id === locationId);
  if (!location || !location.coords) return;
  
  const latlng = [location.coords.lat, location.coords.lng];
  
  map.setView(latlng, 12, {
    animate: true,
    duration: 1.0
  });
  
  // Open popup for the marker
  const marker = markers.find(m => {
    const latlng = m.getLatLng();
    return Math.abs(latlng.lat - location.coords.lat) < 0.01 &&
           Math.abs(latlng.lng - location.coords.lng) < 0.01;
  });
  
  if (marker) {
    marker.openPopup();
  }
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  if (!map) return;
  
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    map.invalidateSize();
  }, 250);
});
