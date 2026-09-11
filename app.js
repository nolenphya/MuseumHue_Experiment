// State Management
const appState = {
  selectedId: null,
  activeCategory: 'all'
};

const sidebarEl = document.getElementById('sidebar');

// Extract unique categories from data dynamically
const categories = ['all', ...new Set(locationsData.map(item => item.category))];

function setCategoryFilter(category) {
  appState.activeCategory = category;
  renderListView();
}

function renderListView() {
  appState.selectedId = null;
  updateURL(null);

  const filteredData = appState.activeCategory === 'all' 
    ? locationsData 
    : locationsData.filter(item => item.category === appState.activeCategory);

  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <h2>Explore Locations</h2>
      <p>${filteredData.length} places found</p>
      
      <!-- Horizontal Filter Pills -->
      <div class="filter-bar">
        ${categories.map(cat => `
          <button 
            class="filter-pill ${appState.activeCategory === cat ? 'active' : ''}" 
            data-category="${cat}"
            onclick="setCategoryFilter(this.dataset.category)">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        `).join('')}
      </div>
    </div>

    <div class="card-list">
      ${filteredData.map(item => `
        <div class="card" onclick="selectLocation('${item.id}')">
          <h3>${item.title}</h3>
          <span class="badge">${item.category}</span>
          <p>${item.address}</p>
        </div>
      `).join('')}
    </div>
  `;

  // Update map pins to match filtered dataset
  renderMapMarkers(filteredData);
}

// Render Detail View
function renderDetailView(id) {
  const item = locationsData.find(loc => loc.id === id);
  if (!item) return renderListView();

  appState.selectedId = id;
  updateURL(id);

  sidebarEl.innerHTML = `
    <div class="detail-view">
      <button class="back-btn" onclick="renderListView()">← Back to List</button>
      <img src="${item.image}" alt="${item.title}" class="detail-img" />
      <h2>${item.title}</h2>
      <span class="badge">${item.category}</span>
      <p class="address">${item.address}</p>
      <p class="description">${item.description}</p>
    </div>
  `;

  // Update markers so active marker styling applies
  renderMapMarkers(locationsData);

  // Center map on selected pin with offset for the sidebar
  if (window.map) {
    window.map.flyTo({
      center: item.coordinates,
      zoom: 15,
      padding: { left: window.innerWidth > 768 ? 350 : 0, top: window.innerWidth <= 768 ? 200 : 0 },
      essential: true
    });
  }
}

// Handle Location Selection (from Sidebar Card or Map Pin)
function selectLocation(id) {
  renderDetailView(id);
}

// Sync State with URL Query Parameters (?focusid=3033)
function updateURL(id) {
  const url = new URL(window.location);
  if (id) {
    url.searchParams.set('focusid', id);
  } else {
    url.searchParams.delete('focusid');
  }
  window.history.pushState({}, '', url);
}

// Store active markers so we can clear/update them on filter
let currentMarkers = [];

function renderMapMarkers(data) {
  if (!window.map) return;

  // Clear existing markers
  currentMarkers.forEach(marker => marker.remove());
  currentMarkers = [];

  data.forEach(item => {
    // Create custom marker DOM element
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.dataset.id = item.id;

    // Highlight marker if currently selected
    if (appState.selectedId === item.id) {
      el.classList.add('active-marker');
    }

    // Bind click event to state controller
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectLocation(item.id);
    });

    // Create and add Mapbox marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat(item.coordinates)
      .addTo(window.map);

    currentMarkers.push(marker);
  });
}

// Add Keyboard Accessibility Controller
function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ignore key presses if typing in an input or textarea
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if (!window.map) return;

    const panDistance = 100; // Pixels to pan per keypress

    switch (e.key) {
      // WASD Panning
      case 'w':
      case 'W':
        window.map.panBy([0, -panDistance]); // Pan North
        break;
      case 's':
      case 'S':
        window.map.panBy([0, panDistance]);  // Pan South
        break;
      case 'a':
      case 'A':
        window.map.panBy([-panDistance, 0]); // Pan West
        break;
      case 'd':
      case 'D':
        window.map.panBy([panDistance, 0]);  // Pan East
        break;

      // Zoom Controls
      case '+':
      case '=': // Handles '+' key press without holding Shift
        window.map.zoomIn();
        break;
      case '-':
      case '_':
        window.map.zoomOut();
        break;
    }
  });
}

// Initialize Controller and Check URL on Load
function initSidebarController() {
  const params = new URLSearchParams(window.location.search);
  const initialFocusId = params.get('focusid');

  if (initialFocusId) {
    renderDetailView(initialFocusId);
  } else {
    renderListView();
  }

  // Bind map events once Mapbox instance is ready
  if (window.map) {
    window.map.on('click', () => {
      if (appState.selectedId) {
        renderListView();
      }
    });
  }

  initKeyboardNavigation();

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const currentParams = new URLSearchParams(window.location.search);
    const focusId = currentParams.get('focusid');
    focusId ? renderDetailView(focusId) : renderListView();
  });
}

document.addEventListener('DOMContentLoaded', initSidebarController);