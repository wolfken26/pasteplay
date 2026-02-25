const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ppapi', {
    // Invoke: Renderer expects a promise back
    invoke: (channel, ...args) => {
        const allowed = [
            'store-get', 'store-set', 'register-hotkey',
            'get-current-hotkey', 'tts-speak', 'tts-stop',
            'tts-get-voices', 'get-window-bounds', 'check-robotjs'
        ];
        if (allowed.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
    },

    // Send: One-way trigger
    send: (channel, ...args) => {
        const allowed = [
            'set-always-on-top', 'hide-window', 'open-settings',
            'app-relaunch', 'show-in-widget', 'resize-window-bounds',
            'test-hotkey-trigger', 'install-update'
        ];
        if (allowed.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },

    // Listen: Handle events from main process
    on: (channel, callback) => {
        const allowed = [
            'store-updated', 'deep-link', 'show-and-read',
            'show-widget-empty', 'show-error', 'stop-speaking-request',
            'cycle-history', 'update-available', 'update-downloading',
            'update-downloaded'
        ];
        if (allowed.includes(channel)) {
            const subscription = (event, ...args) => callback(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    }
});

// Backward compatibility or diagnostic log (optional)
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Preload] Secure API (ppapi) initialized');
});
