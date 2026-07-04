// content.js

let isScrolling = false;
let startX = 0;
let startY = 0;
let scrollInterval = null;
let speedX = 0;
let speedY = 0;
let scrollIndicator = null;

// Configuration
const SPEED_MODIFIER = 0.15;
const DEADZONE = 10;

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

// Event Listeners
window.addEventListener('mousedown', (e) => {
  if (e.button !== 1) return; // Only care about middle-click

  if (isScrolling) {
    // If already scrolling, any middle-click stops it
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
    return;
  }

  // --- NEW FIX: Check if we are clicking a link ---
  // .closest('a') checks the clicked element and its parents, 
  // ensuring text/images inside a link don't bypass the check.
  const clickedLink = e.target.closest('a');
  
  // If a valid link with an href attribute is clicked, bail out 
  // and let the browser naturally open the link in a new tab.
  if (clickedLink && clickedLink.getAttribute('href')) {
    return;
  }
  // ------------------------------------------------

  // Initialize scrolling if it wasn't a link
  isScrolling = true;
  startX = e.clientX;
  startY = e.clientY;
  
  createIndicator(startX, startY);
  startScrollLoop();
  
  e.preventDefault();
});

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

window.addEventListener('click', (e) => {
  if (isScrolling && e.button !== 1) {
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
  }
});
