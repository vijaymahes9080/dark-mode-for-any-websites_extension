/**
 * Universal Dark Mode - Chrome Extension API Mock for Web Hosting / Standalone Demo
 * Automatically detects if running outside an extension and polyfills chrome.* APIs.
 */
(function() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
        console.log("Universal Dark Mode: Running in Standalone Web Mode. Polyfilling Chrome APIs.");
        
        window.chrome = window.chrome || {};
        
        // Mock Storage API using localStorage
        chrome.storage = {
            local: {
                get: function(keys, callback) {
                    let result = {};
                    if (typeof keys === 'string') {
                        result[keys] = localStorage.getItem('udm_' + keys) === 'true';
                    } else if (Array.isArray(keys)) {
                        keys.forEach(k => {
                            result[k] = localStorage.getItem('udm_' + k) === 'true';
                        });
                    } else if (typeof keys === 'object') {
                        Object.keys(keys).forEach(k => {
                            let val = localStorage.getItem('udm_' + k);
                            result[k] = val !== null ? val === 'true' : keys[k];
                        });
                    }
                    setTimeout(() => callback(result), 0);
                },
                set: function(items, callback) {
                    Object.keys(items).forEach(k => {
                        localStorage.setItem('udm_' + k, items[k]);
                    });
                    if (callback) setTimeout(callback, 0);
                }
            }
        };

        // Mock Tabs API
        chrome.tabs = {
            query: function(queryInfo, callback) {
                // Return a mock tab
                const mockTabs = [{ id: 1, url: window.location.href, title: document.title }];
                setTimeout(() => callback(mockTabs), 0);
            },
            sendMessage: function(tabId, message, options, responseCallback) {
                // Send postMessage so that index.html or other frames can listen and toggle dark mode
                window.parent.postMessage({
                    source: 'chrome-api-mock',
                    type: 'TAB_MESSAGE',
                    tabId: tabId,
                    message: message
                }, '*');
                
                // Also trigger local event listener in case content script runs in same frame
                const event = new CustomEvent('chrome-message', { detail: message });
                window.dispatchEvent(event);
                
                if (responseCallback) setTimeout(() => responseCallback({ success: true }), 0);
                return Promise.resolve({ success: true });
            }
        };

        // Mock Runtime API
        const messageListeners = [];
        chrome.runtime = {
            onMessage: {
                addListener: function(listener) {
                    messageListeners.push(listener);
                },
                removeListener: function(listener) {
                    const index = messageListeners.indexOf(listener);
                    if (index > -1) messageListeners.splice(index, 1);
                }
            }
        };

        // Listen for custom chrome-message event and dispatch to listeners
        window.addEventListener('chrome-message', (event) => {
            messageListeners.forEach(listener => {
                try {
                    listener(event.detail, {}, () => {});
                } catch(e) {
                    console.error("Error in chrome.runtime.onMessage listener:", e);
                }
            });
        });

        // Listen for postMessage from parent or popup frame
        window.addEventListener('message', (event) => {
            if (event.data && event.data.source === 'chrome-api-mock' && event.data.type === 'TAB_MESSAGE') {
                const customEvent = new CustomEvent('chrome-message', { detail: event.data.message });
                window.dispatchEvent(customEvent);
            }
        });
    }
})();
