(function () {
    let styleElement = document.getElementById('universal-dark-mode-style');

    // CSS to invert page but fix images/videos
    const css = `
      html {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      /* Re-invert media to make them look normal */
      img, video, iframe, canvas, svg, :not(object):not(body)>embed, [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      /* Exclude full screen elements if handled poorly? Not for now. */
    `;

    function enableDarkMode() {
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'universal-dark-mode-style';
            styleElement.textContent = css;
            document.documentElement.appendChild(styleElement);
        }
    }

    function disableDarkMode() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
    }

    // Check initial state
    chrome.storage.local.get('darkModeEnabled', (data) => {
        if (data.darkModeEnabled) {
            enableDarkMode();
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_DARK_MODE') {
            if (message.enabled) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    });
})();

