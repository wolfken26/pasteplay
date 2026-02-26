const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// FIX: Enable audio without user gesture (Required for global hotkeys)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const isDev = process.env.NODE_ENV === 'development';

// Register Deep Link Protocol
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('pasteplay', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('pasteplay');
}

const store = new Store();
let mainWindow;
let tray;
let robot;
let robotAvailable = false;
let isSpeaking = false;
let currentHotkey = null;

try {
    robot = require('robotjs');
    robotAvailable = true;
    console.log('[Main] robotjs loaded successfully');
} catch (e) {
    console.warn('[Main] robotjs could not be loaded. Auto-copy will be disabled.');
    robotAvailable = false; // Corrected incomplete line
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }

        // Handle Deep Link on Windows
        const url = commandLine.find((arg) => arg.startsWith('pasteplay://'));
        if (url) {
            handleDeepLink(url);
        }
    });

    // Handle Deep Link on Mac
    app.on('open-url', (event, url) => {
        event.preventDefault();
        handleDeepLink(url);
    });

    function handleDeepLink(url) {
        console.log('[Main] Received deep link:', url);
        if (mainWindow) {
            mainWindow.webContents.send('deep-link', url);
        }
    }

    function createWindow() {
        const alwaysOnTop = store.get('alwaysOnTop', true);

        mainWindow = new BrowserWindow({
            width: 450,
            height: 250,
            minWidth: 40,
            minHeight: 40,
            show: true, // Show by default on launch for visibility
            frame: false,
            alwaysOnTop: alwaysOnTop,
            resizable: true,
            transparent: true,
            icon: path.join(__dirname, '../assets/icon.png'),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                preload: path.join(__dirname, 'preload.js'),
                backgroundThrottling: false,
                autoplayPolicy: 'no-user-gesture-required',
            },
            skipTaskbar: false,
            backgroundColor: '#00000000',
        });

        // Force alwaysOnTop on startup as requested
        mainWindow.setAlwaysOnTop(true);
        store.set('alwaysOnTop', true);

        ipcMain.on('set-always-on-top', (event, value) => {
            if (mainWindow) {
                mainWindow.setAlwaysOnTop(value, 'screen-saver');
                store.set('alwaysOnTop', value);
                // Broadcast to sync UI in other windows
                mainWindow.webContents.send('store-updated', 'alwaysOnTop', value);
                if (settingsWindow) settingsWindow.webContents.send('store-updated', 'alwaysOnTop', value);
            }
        });

        if (isDev) {
            mainWindow.loadURL('http://localhost:3000');
        } else {
            mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
        }

        // mainWindow.on('blur') listener removed to allow background playback.

        // Remove savedSize restoration to enforce compact start every time
        // store.set('windowSize', ...) is still called on resize for future use if needed,
        // but we prioritize a fresh compact look on launch.
    }

    function createTray() {
        // Resolve icon path for both dev and packaged builds
        let iconPath = path.join(__dirname, '../assets/icon.png');

        if (app.isPackaged) {
            // Packaged: check resources folder first, then fallback to __dirname
            const resourcesIcon = path.join(process.resourcesPath, 'assets', 'icon.png');
            if (fs.existsSync(resourcesIcon)) {
                iconPath = resourcesIcon;
            }
        }

        console.log('[Main] Tray icon path:', iconPath, 'exists:', fs.existsSync(iconPath));
        let icon = nativeImage.createFromPath(iconPath);

        // Resize for tray (16x16 or 32x32 is ideal for system tray)
        if (!icon.isEmpty()) {
            icon = icon.resize({ width: 32, height: 32 });
        }

        if (icon.isEmpty()) {
            console.log('[Main] Custom icon not found. Falling back to system default.');
            try {
                tray = new Tray(process.execPath);
            } catch (e) {
                console.log('[Main] Could not load tray icon. Creating dummy.');
                tray = new Tray(nativeImage.createEmpty());
            }
        } else {
            tray = new Tray(icon);
            if (mainWindow) mainWindow.setIcon(icon);
        }

        tray.setToolTip('pasteplay.app beta');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: '⏹ Stop Speaking',
                click: () => {
                    if (mainWindow) mainWindow.webContents.send('stop-speaking-request');
                }
            },
            { type: 'separator' },
            {
                label: '📖 Show History',
                click: () => {
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.setAlwaysOnTop(true);
                        mainWindow.moveTop();
                    }
                }
            },
            {
                label: '⚙️ Settings',
                click: () => {
                    createSettingsWindow();
                }
            },
            { type: 'separator' },
            {
                label: '❌ Quit',
                click: () => {
                    app.isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setContextMenu(contextMenu);
        tray.on('click', () => toggleWindow());
    }

    function toggleWindow() {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    }

    let settingsWindow;
    // ... existing variables ...

    // ... createWindow ...

    function createSettingsWindow() {
        if (settingsWindow) {
            settingsWindow.focus();
            return;
        }

        settingsWindow = new BrowserWindow({
            width: 600,
            height: 700,
            show: false,
            frame: true, // Settings should have a frame/close button
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'preload.js'),
                backgroundThrottling: false,
                autoplayPolicy: 'no-user-gesture-required',
            },
        });

        if (isDev) {
            settingsWindow.loadURL('http://localhost:3000?mode=settings');
        } else {
            settingsWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'), { search: 'mode=settings' });
        }

        settingsWindow.once('ready-to-show', () => {
            settingsWindow.show();
        });

        settingsWindow.on('closed', () => {
            settingsWindow = null;
        });
    }

    // ... toggleWindow ...

    // IPC Store Handlers (Hardened)
    const STORE_ALLOWLIST = ['alwaysOnTop', 'speed', 'voice', 'storeHistory', 'rewindDuration', 'captureHotkey', 'history', 'windowSize'];

    ipcMain.handle('store-get', (event, key) => {
        if (!STORE_ALLOWLIST.includes(key)) return null;
        return store.get(key);
    });

    ipcMain.handle('store-set', (event, key, value) => {
        if (!STORE_ALLOWLIST.includes(key)) return;
        store.set(key, value);
        // Broadcast update to all windows
        if (mainWindow) mainWindow.webContents.send('store-updated', key, value);
        if (settingsWindow) settingsWindow.webContents.send('store-updated', key, value);
    });
    ipcMain.handle('check-robotjs', () => robotAvailable);
    ipcMain.on('hide-window', () => {
        if (mainWindow) {
            mainWindow.hide();
            // Also stop talking when hidden as requested
            mainWindow.webContents.send('stop-speaking-request');
            if (activePiperProcess) {
                activePiperProcess.kill();
                activePiperProcess = null;
            }
        }
    });
    ipcMain.on('open-settings', () => createSettingsWindow());
    ipcMain.on('app-relaunch', () => {
        app.relaunch();
        app.exit(0);
    });
    ipcMain.on('show-in-widget', (event, text) => {
        if (mainWindow) {
            mainWindow.webContents.send('show-and-read', text);
            mainWindow.show();
            // Also ensure it's focused and on top
            mainWindow.setAlwaysOnTop(true);
            mainWindow.moveTop();
        }
    });
    ipcMain.handle('get-window-bounds', () => {
        if (mainWindow) return mainWindow.getBounds();
        return { x: 0, y: 0, width: 0, height: 0 };
    });

    ipcMain.on('resize-window-bounds', (event, { x, y, width, height }) => {
        if (mainWindow) {
            mainWindow.setBounds({
                x: Math.round(x),
                y: Math.round(y),
                width: Math.round(width),
                height: Math.round(height)
            });
        }
    });

    ipcMain.on('test-hotkey-trigger', () => {
        handleHotkeyTrigger();
    });

    // --- Piper TTS Engine ---
    const { spawn } = require('child_process');
    const os = require('os');
    let activePiperProcess = null;

    // Resolve piper binary path (works in dev and packaged)
    function getPiperPath() {
        if (isDev) {
            return path.join(__dirname, '..', 'piper', 'piper.exe');
        }
        // In packaged app, piper is in resources/piper
        return path.join(process.resourcesPath, 'piper', 'piper.exe');
    }

    function getPiperVoicesDir() {
        if (isDev) {
            return path.join(__dirname, '..', 'piper', 'voices');
        }
        return path.join(process.resourcesPath, 'piper', 'voices');
    }

    // --- Performance Optimization: Pre-warming systems ---
    let persistentPS = null;
    function ensurePSAlive() {
        if (persistentPS && !persistentPS.killed) return;

        console.log('[Main] Initializing persistent PowerShell stream...');
        persistentPS = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', '-'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true
        });

        persistentPS.on('error', (err) => {
            console.error('[Main] Persistent PowerShell Error:', err);
            persistentPS = null;
        });

        persistentPS.on('exit', (code) => {
            console.log(`[Main] Persistent PowerShell exited with code ${code}`);
            persistentPS = null;
        });

        persistentPS.stdin.write(`
            Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class WinApi { [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); }'
        \n`);
    }

    async function getForegroundWindowSync() {
        if (process.platform !== 'win32') return null;

        try {
            ensurePSAlive();
            return await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    persistentPS?.stdout.removeListener('data', onData);
                    resolve(null); // Resolve with null on timeout to avoid hanging
                }, 1500);

                const onData = (data) => {
                    clearTimeout(timeout);
                    persistentPS?.stdout.removeListener('data', onData);
                    const handle = data.toString().trim();
                    resolve(handle === '0' ? null : handle);
                };

                persistentPS.stdout.on('data', onData);
                persistentPS.stdin.write('[WinApi]::GetForegroundWindow()\n');
            });
        } catch (err) {
            console.error('[Main] getForegroundWindowSync failed:', err);
            return null;
        }
    }

    let preWarmedPiper = null;
    async function preWarmPiper(voiceId = 'af_bella', speed = 1.0) {
        if (preWarmedPiper) return;

        const piperExe = getPiperPath();
        const piperVoicesPath = getPiperVoicesDir();
        const modelName = VOICE_MAP[voiceId] || 'en_US-amy-medium';
        const modelPath = path.join(piperVoicesPath, `${modelName}.onnx`);

        if (!fs.existsSync(modelPath) || !fs.existsSync(piperExe)) return;

        console.log(`[Piper] Pre-warming engine with ${modelName}...`);
        const tempWav = path.join(os.tmpdir(), `piper_prewarm_${Date.now()}.wav`);
        const args = [
            '--model', modelPath,
            '--output_file', tempWav,
            '--length_scale', String(1.0 / (speed || 1.0)),
        ];

        const proc = spawn(piperExe, args, { cwd: path.dirname(piperExe) });
        // We don't write to it yet, just keep it ready
        preWarmedPiper = { proc, tempWav, voiceId, speed };
    }

    // Voice name mapping: app brand name → piper model filename
    const VOICE_MAP = {
        'af_bella': 'en_US-amy-medium',
    };

    ipcMain.handle('tts-speak', async (event, text, voiceId, speed) => {
        const piperExe = getPiperPath();
        const piperVoicesPath = getPiperVoicesDir();

        console.log(`[Piper] Debug Paths: exe=${piperExe}, voices=${piperVoicesPath}`);

        // Map voice ID to model file
        let modelName = VOICE_MAP[voiceId] || 'en_US-amy-medium';
        let modelPath = path.join(piperVoicesPath, `${modelName}.onnx`);

        // FALLBACK: If requested model is missing, use the default Amy model
        if (!fs.existsSync(modelPath)) {
            console.warn(`[Piper] Model ${modelName} missing at ${modelPath}, falling back to Amy.`);
            modelName = 'en_US-amy-medium';
            modelPath = path.join(piperVoicesPath, `${modelName}.onnx`);
        }

        // Final check for the fallback model
        if (!fs.existsSync(modelPath)) {
            console.error(`[Piper] Model NOT found even after fallback: ${modelPath}`);
            return { error: 'No voice models found. Please download one from the Voice Library.' };
        }

        // Check if piper.exe exists
        if (!fs.existsSync(piperExe)) {
            console.error(`[Piper] piper.exe not found: ${piperExe}`);
            return { error: 'Piper TTS engine not found.' };
        }

        // Check if we have a pre-warmed process matching our needs
        let piperProc;
        let tempWav;

        if (preWarmedPiper && preWarmedPiper.voiceId === voiceId && Math.abs(preWarmedPiper.speed - speed) < 0.01) {
            console.log('[Piper] Using pre-warmed process');
            piperProc = preWarmedPiper.proc;
            tempWav = preWarmedPiper.tempWav;
            preWarmedPiper = null;
        } else {
            console.log('[Piper] Spawning fresh process (no match)');
            if (preWarmedPiper) {
                preWarmedPiper.proc.kill();
                preWarmedPiper = null;
            }
            tempWav = path.join(os.tmpdir(), `piper_${Date.now()}.wav`);
            const args = [
                '--model', modelPath,
                '--output_file', tempWav,
                '--length_scale', String(1.0 / (speed || 1.0)),
            ];
            piperProc = spawn(piperExe, args, { cwd: path.dirname(piperExe) });
        }

        return new Promise((resolve) => {
            activePiperProcess = piperProc;

            let stderr = '';
            piperProc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            // Pipe text to stdin and end it to trigger generation
            piperProc.stdin.write(text);
            piperProc.stdin.end();

            piperProc.on('close', (code) => {
                activePiperProcess = null;
                // Immediately pre-warm the next one
                preWarmPiper(voiceId, speed);

                if ((code === 0 || fs.existsSync(tempWav)) && fs.existsSync(tempWav)) {
                    try {
                        const wavBuffer = fs.readFileSync(tempWav);
                        const base64 = wavBuffer.toString('base64');
                        const dataUrl = `data:audio/wav;base64,${base64}`;
                        if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
                        resolve({ audioDataUrl: dataUrl });
                    } catch (readErr) {
                        resolve({ error: 'Failed to read audio.' });
                    }
                } else {
                    resolve({ error: `TTS failed: ${stderr.substring(0, 100)}` });
                }
            });

            piperProc.on('error', (err) => {
                activePiperProcess = null;
                resolve({ error: `Engine error: ${err.message}` });
            });
        });
    });

    ipcMain.handle('tts-stop', () => {
        if (activePiperProcess) {
            activePiperProcess.kill();
            activePiperProcess = null;
            console.log('[Piper] Stopped active process');
        }
        return true;
    });

    ipcMain.handle('tts-get-voices', () => {
        const piperVoicesPath = getPiperVoicesDir();
        try {
            const models = fs.readdirSync(piperVoicesPath).filter(f => f.endsWith('.onnx') && !f.endsWith('.onnx.json'));
            return models.map(f => ({
                modelFile: f,
                name: f.replace('.onnx', ''),
                available: true,
            }));
        } catch {
            return [];
        }
    });

    // Track the previously focused window handle before hotkey fires
    let previousWindowHandle = null;

    async function handleHotkeyTrigger() {
        console.log(`[Main] Hotkey triggered`);
        if (mainWindow) mainWindow.webContents.send('stop-speaking-request');

        // On Windows, capture the currently focused window handle IMMEDIATELY
        // before Electron steals focus from the browser
        // On Windows, capture the currently focused window handle
        if (process.platform === 'win32') {
            previousWindowHandle = await getForegroundWindowSync();
            console.log('[Main] Fast-captured window handle:', previousWindowHandle);
        }

        // ALWAYS use auto-copy logic for hotkey trigger regardless of the setting, 
        // as the hotkey IS the intent to capture selection.
        const text = await captureClipboard(true);

        if (text && text.trim().length > 0) {
            mainWindow.show();
            mainWindow.setAlwaysOnTop(true);
            mainWindow.moveTop();
            // Small extra delay to ensure the UI is ready to receive text
            setTimeout(() => {
                mainWindow.webContents.send('show-and-read', text);
            }, 100);
        } else {
            mainWindow.show();
            mainWindow.setAlwaysOnTop(true);
            mainWindow.moveTop();
            mainWindow.webContents.send('show-widget-empty');
            mainWindow.webContents.send('show-error', 'No text found. Try selecting text first.');
        }
    }

    function registerHotkey(hotkey) {
        if (!hotkey) return { success: false, message: 'Hotkey is empty' };

        // Save old hotkey for rollback
        const oldHotkey = currentHotkey;

        if (currentHotkey) {
            globalShortcut.unregister(currentHotkey);
        }

        try {
            const success = globalShortcut.register(hotkey, handleHotkeyTrigger);

            if (success) {
                currentHotkey = hotkey;
                store.set('captureHotkey', hotkey);
                if (mainWindow) mainWindow.webContents.send('store-updated', 'captureHotkey', hotkey);
                if (settingsWindow) settingsWindow.webContents.send('store-updated', 'captureHotkey', hotkey);
                return { success: true };
            } else {
                // Rollback if possible
                if (oldHotkey) {
                    globalShortcut.register(oldHotkey, handleHotkeyTrigger);
                }
                return { success: false, message: `Hotkey ${hotkey} is already in use.` };
            }
        } catch (e) {
            if (oldHotkey) globalShortcut.register(oldHotkey, handleHotkeyTrigger);
            return { success: false, message: e.message };
        }
    }

    ipcMain.handle('register-hotkey', (event, hotkey) => {
        const result = registerHotkey(hotkey);
        // If it failed, don't update store, renderer will notify user.
        return result;
    });
    ipcMain.handle('get-current-hotkey', () => currentHotkey || store.get('captureHotkey', 'CommandOrControl+Alt+R'));

    async function captureClipboard(autoCopyEnabled) {
        if (!autoCopyEnabled) {
            return clipboard.readText();
        }

        // Help detect if copy actually occurred by clearing first
        clipboard.clear();

        // Method 1: RobotJS (Reliable for most GUI apps)
        if (robotAvailable) {
            try {
                // Ensure clipboard is clear
                clipboard.writeText('');

                // Small delay to ensure the OS has registered the hotkey release
                await new Promise(resolve => setTimeout(resolve, 150));

                // Attempt 1: Standard Ctrl+C via RobotJS (with retry)
                let text = '';
                for (let attempt = 0; attempt < 3; attempt++) {
                    robot.keyTap('c', process.platform === 'darwin' ? 'command' : 'control');

                    // Wait for clipboard to populate
                    for (let i = 0; i < 10; i++) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                        text = clipboard.readText();
                        if (text && text.trim().length > 0) break;
                    }
                    if (text && text.trim().length > 0) break;

                    console.log(`[Main] Copy attempt ${attempt + 1} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                // If RobotJS failed (focus was stolen by Electron), try restoring the previous window
                if ((!text || text.trim().length === 0) && process.platform === 'win32' && previousWindowHandle) {
                    // SECURITY: Strictly validate handle is numeric before interpolating into PowerShell
                    if (!/^\d+$/.test(String(previousWindowHandle))) {
                        console.warn('[Main] Invalid window handle detected, skipping PS fallback');
                        return text;
                    }

                    console.log('[Main] RobotJS copy failed. Trying PowerShell SetForegroundWindow + SendKeys...');
                    clipboard.writeText('');

                    await new Promise((resolve) => {
                        const hwnd = String(previousWindowHandle);
                        const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command',
                            `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class WinHelper {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
'@;
$hwnd = [IntPtr]::Parse("${hwnd}");
[WinHelper]::ShowWindow($hwnd, 9); # SW_RESTORE
[WinHelper]::SetForegroundWindow($hwnd);
Start-Sleep -Milliseconds 200;
Add-Type -AssemblyName System.Windows.Forms;
[System.Windows.Forms.SendKeys]::SendWait('^c');
Start-Sleep -Milliseconds 300;`
                        ], { windowsHide: true });
                        ps.on('close', () => resolve());
                        ps.on('error', (err) => { console.error('PS Error:', err); resolve(); });
                    });

                    text = clipboard.readText();
                }

                return text;
            } catch (err) {
                console.error('Copy error:', err);
                return clipboard.readText();
            }
        }

        // Method 2: PowerShell Force (Windows only fallback)
        if (process.platform === 'win32') {
            return new Promise((resolve) => {
                const ps = spawn('powershell', [
                    '-c',
                    'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^c")'
                ]);

                ps.on('close', () => {
                    setTimeout(() => {
                        resolve(clipboard.readText());
                    }, 400); // Increased delay for PowerShell
                });

                ps.on('error', (err) => {
                    console.error('PowerShell Copy Error:', err);
                    resolve(clipboard.readText());
                });
            });
        }

        // Fallback: Just read clipboard
        return clipboard.readText();
    }

    function registerHotkeys() {
        const savedHotkey = store.get('captureHotkey', 'CommandOrControl+Alt+R');
        registerHotkey(savedHotkey);

        // Emergency Reset Hotkey (CommandOrControl+Alt+Shift+R)
        globalShortcut.register('CommandOrControl+Alt+Shift+R', () => {
            console.log('[Main] Emergency hotkey reset triggered');
            const defaultHotkey = 'CommandOrControl+Alt+R';
            registerHotkey(defaultHotkey);
            if (mainWindow) {
                mainWindow.webContents.send('store-updated', 'captureHotkey', 'Ctrl+Alt+R');
                mainWindow.webContents.send('show-error', 'Hotkey reset to default (Ctrl+Alt+R)');
            }
        });

        globalShortcut.register('CommandOrControl+Alt+N', () => {
            if (mainWindow) mainWindow.webContents.send('stop-speaking-request');
            mainWindow.show();
            mainWindow.setAlwaysOnTop(true);
            mainWindow.moveTop();
            mainWindow.webContents.send('cycle-history');
        });
    }

    // Server-side TTS Removed. Client-side SpeechSynthesis used now.

    app.whenReady().then(() => {
        createWindow();
        createTray();
        registerHotkeys();
        // Pre-warm the AI engine and PowerShell process for instant response
        ensurePSAlive();
        preWarmPiper();
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

    // --- Auto Updater Logic ---
    autoUpdater.on('update-available', () => {
        if (mainWindow) mainWindow.webContents.send('update-available');
    });

    autoUpdater.on('download-progress', (progress) => {
        if (mainWindow) mainWindow.webContents.send('update-downloading', progress.percent);
    });

    autoUpdater.on('update-downloaded', () => {
        if (mainWindow) mainWindow.webContents.send('update-downloaded');
    });

    ipcMain.on('install-update', () => {
        autoUpdater.quitAndInstall();
    });

    app.whenReady().then(() => {
        if (!isDev) autoUpdater.checkForUpdatesAndNotify();
    });
}
