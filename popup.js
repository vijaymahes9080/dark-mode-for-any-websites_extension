document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('darkModeToggle');
    const statusText = document.getElementById('statusText');
    const statusDiv = document.querySelector('.status');
  
    // Load saved state
    chrome.storage.local.get('darkModeEnabled', (data) => {
      const isEnabled = data.darkModeEnabled ?? false; // Default false
      toggle.checked = isEnabled;
      updateStatus(isEnabled);
    });
  
    toggle.addEventListener('change', () => {
      const isEnabled = toggle.checked;
      updateStatus(isEnabled);
  
      // Save state
      chrome.storage.local.set({ darkModeEnabled: isEnabled });
  
      // Send message to current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // We can't always inject if restricted (like chrome:// URLs), but we assume normal web pages.
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_DARK_MODE',
            enabled: isEnabled
          }).catch(err => console.log("Could not send message (tab might be restricted or loading):", err));
        }
      });
    });
  
    function updateStatus(enabled) {
      statusText.textContent = enabled ? 'Dark Mode: Active' : 'Dark Mode: Inactive';
      statusDiv.setAttribute('data-enabled', enabled);
    }
  });
  
