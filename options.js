// options.js

const holdToScrollCheckbox = document.getElementById('holdToScroll');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get({ holdToScroll: false }, (items) => {
  holdToScrollCheckbox.checked = items.holdToScroll;
});

// Save settings when changed
holdToScrollCheckbox.addEventListener('change', () => {
  const isEnabled = holdToScrollCheckbox.checked;
  chrome.storage.local.set({ holdToScroll: isEnabled }, () => {
    statusDiv.textContent = 'Settings saved.';
    setTimeout(() => { statusDiv.textContent = ''; }, 1500);
  });
});