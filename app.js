// State Management
const appState = {
  selectedId: null,
  activeCategory: 'all'
};

const sidebarEl = document.getElementById('sidebar');

// Render List View
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

// Initialize Controller and Check URL on Load
function initSidebarController() {
  const params = new URLSearchParams(window.location.search);
  const initialFocusId = params.get('focusid');

  if (initialFocusId) {
    renderDetailView(initialFocusId);
  } else {
    renderListView();
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const currentParams = new URLSearchParams(window.location.search);
    const focusId = currentParams.get('focusid');
    focusId ? renderDetailView(focusId) : renderListView();
  });
}

document.addEventListener('DOMContentLoaded', initSidebarController);