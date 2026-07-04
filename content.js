// content.js

let isScrolling = false;
let startX = 0;
let startY = 0;
let scrollInterval = null;
let speedX = 0;
let speedY = 0;
let scrollIndicator = null;

// Configuration
const SPEED_MODIFIER = 0.15; // Tweak this to make scrolling faster or slower
const DEADZONE = 10;          // Pixels of movement required before scrolling kicks in

// Create the visual anchor indicator (the circle at the click origin)
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

// Start the continuous scroll loop
function startScrollLoop() {
  if (scrollInterval) return;
  
  scrollInterval = setInterval(() => {
    if (!isScrolling) return;
    
    // Perform the multi-directional scroll
    window.scrollBy({
      left: speedX,
      top: speedY,
      behavior: 'auto' // 'auto' offers tighter loop responsiveness than 'smooth'
    });
  }, 16); // ~60 frames per second
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
  // button 1 is the middle mouse button (scroll wheel click)
  if (e.button !== 1) return; 

  if (isScrolling) {
    // Second middle-click: Stop scrolling
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
  } else {
    // First middle-click: Initialize scrolling origin
    isScrolling = true;
    startX = e.clientX;
    startY = e.clientY;
    
    createIndicator(startX, startY);
    startScrollLoop();
    
    // Prevent default browser behavior (like the native autoscroll if on Windows)
    e.preventDefault();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isScrolling) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  // Apply horizontal deadzone and speed calculation
  if (Math.abs(deltaX) > DEADZONE) {
    speedX = (deltaX - Math.sign(deltaX) * DEADZONE) * SPEED_MODIFIER;
  } else {
    speedX = 0;
  }

  // Apply vertical deadzone and speed calculation
  if (Math.abs(deltaY) > DEADZONE) {
    speedY = (deltaY - Math.sign(deltaY) * DEADZONE) * SPEED_MODIFIER;
  } else {
    speedY = 0;
  }
});

// Optional: Stop scrolling if the user clicks any other mouse button
window.addEventListener('click', (e) => {
  if (isScrolling && e.button !== 1) {
    isScrolling = false;
    stopScrollLoop();
    removeIndicator();
  }
});