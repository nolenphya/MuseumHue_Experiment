// Add Keyboard Accessibility Controller
function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ignore key presses if the user is typing in an input or textarea
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

// Call inside your existing initSidebarController function
function initSidebarController() {
  const params = new URLSearchParams(window.location.search);
  const initialFocusId = params.get('focusid');

  if (initialFocusId) {
    renderDetailView(initialFocusId);
  } else {
    renderListView();
  }

  // Initialize Mapbox click & Keyboard Controls
  if (window.map) {
    window.map.on('click', () => {
      if (appState.selectedId) {
        renderListView();
      }
    });
  }

  initKeyboardNavigation(); // Attach WASD & +/- listeners

  window.addEventListener('popstate', () => {
    const currentParams = new URLSearchParams(window.location.search);
    const focusId = currentParams.get('focusid');
    focusId ? renderDetailView(focusId) : renderListView();
  });
}