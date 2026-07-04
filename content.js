// content.js

let isScrolling = false;
let startX = 0;
let startY = 0;
let scrollInterval = null;
let speedX = 0;
let speedY = 0;
let scrollIndicator = null;

// Settings state
let holdToScrollMode = false;

// Configuration
const SPEED_MODIFIER = 0.15; 
const DEADZONE = 10;          

// Fetch user configuration from storage
chrome.storage.local.get({ holdToScroll: false }, (items) => {
  holdToScrollMode = items.holdToScroll;
});

// Listen for settings changes dynamically without requiring a page refresh
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.holdToScroll) {
    holdToScrollMode = changes.holdToScroll.newValue;
  }
});

function createIndicator(x, y) {
  scrollIndicator = document.createElement('div');
  scrollIndicator.style.position = 'fixed';
  scrollIndicator.style.left = `${x - 10}px`;
  scrollIndicator.style.top = `${y - 10}px`;
  scrollIndicator.style.width = '20px';
  scrollIndicator.style.height = '20px';
  scrollIndicator.style.borderRadius = '50%';
  scrollIndicator.style.border = '2px solid #333';
  scrollIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  scrollIndicator.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
  scrollIndicator.style.zIndex = '999999';
  scrollIndicator.style.pointerEvents = 'none';
  document.body.appendChild(scrollIndicator);
}

function removeIndicator() {
  if (scrollIndicator) {
    scrollIndicator.remove();
    scrollIndicator = null;
  }
}

function startScrollLoop() {
  if (scrollInterval) return;
  
  scrollInterval = setInterval(() => {
    if (!isScrolling) return;
    
    window.scrollBy({
      left: speedX,
      top: speedY,
      behavior: 'auto'
    });
  }, 16); 
}

function stopScrollLoop() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
  speedX = 0;
  speedY = 0;
}

// 1. MOUSE DOWN LISTENER
window.addEventListener('mousedown', (e) => {
  if (e.button !== 1) return; 

  if (isScrolling) {
    // Standard Mode behavior: Second click toggles it off
    if (!holdToScrollMode) {
      isScrolling = false;
      stopScrollLoop();
      removeIndicator();
    }
    return;
  }

  // Hyperlink Check
  let isLink = e.target.closest('a');
  if (!isLink) {
    let currentElement = e.target;
    while (currentElement && currentElement !== document.body) {
      if (
        currentElement.tagName === 'A' || 
        currentElement.hasAttribute('href') ||
        currentElement.classList.contains('fileThumb') ||
        currentElement.getAttribute('role') === 'link'
      ) {
        isLink = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  if (isLink) return;

  // Initialize scrolling
  isScrolling = true;
  startX = e.clientX;
  startY = e.clientY;
  
  createIndicator(startX, startY);
  startScrollLoop();
  
  e.preventDefault();
}, true);

// --- NEW LISTENER: MOUSE UP (For Hold-and-Release functionality) ---
window.addEventListener('mouseup', (e) => {
  if (e.button !== 1) return; // Only care about middle mouse button releases
  
  if (isScrolling && holdToScrollMode) {
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
  }
}, true);

// 2. MOUSE MOVE LISTENER
window.addEventListener('mousemove', (e) => {
  if (!isScrolling) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  if (Math.abs(deltaX) > DEADZONE) {
    speedX = (deltaX - Math.sign(deltaX) * DEADZONE) * SPEED_MODIFIER;
  } else {
    speedX = 0;
  }

  if (Math.abs(deltaY) > DEADZONE) {
    speedY = (deltaY - Math.sign(deltaY) * DEADZONE) * SPEED_MODIFIER;
  } else {
    speedY = 0;
  }
});

// 3. GLOBAL CLICK LISTENER
window.addEventListener('click', (e) => {
  if (isScrolling && e.button !== 1) {
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
  }
});
