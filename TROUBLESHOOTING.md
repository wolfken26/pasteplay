# PastePlay - Troubleshooting Guide

## robotjs Build Failures

### Symptoms
- `npm install` shows errors like "node-gyp rebuild failed"
- App shows "Auto-copy unavailable" in settings
- Console warns "robotjs could not be loaded"

### Solutions

#### 1. Install Windows Build Tools (Easiest)
Open PowerShell **as Administrator**:
```powershell
npm install --global windows-build-tools
```

This installs:
- Python 2.7
- Visual Studio Build Tools
- Windows SDK

After installation completes (may take 10-15 minutes):
```bash
cd c:\Users\kenny\Downloads\audiosnip
npm run rebuild:robotjs
```

#### 2. Manual Visual Studio Installation
If the automated installer fails:

1. Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run installer and select:
   - ✅ Desktop development with C++
   - ✅ MSVC v143 build tools
   - ✅ Windows 10 SDK (or 11)
3. Restart your terminal
4. Run `npm install` again

#### 3. Use Without robotjs
The app is designed to work without robotjs:
- Auto-copy will be disabled
- You'll need to manually copy text before pressing `Ctrl+Alt+R`
- All other features work normally

### Verification
After rebuilding, check if robotjs works:
```bash
node -e "const robot = require('robotjs'); console.log('robotjs loaded successfully');"
```

## Other Common Issues

### Electron Installation Failed
```bash
npm cache clean --force
npm install electron --force
```

### Vite Dev Server Won't Start
Check if port 3000 is already in use:
```bash
netstat -ano | findstr :3000
```

Kill the process or change the port in `vite.config.js`:
```javascript
server: {
  port: 3001, // Change this
}
```

### Build Fails with "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### NSIS Installer Not Created
Ensure you're running on Windows and have write permissions:
```bash
npm run build:electron -- --win --x64
```

Check `dist/build/` for the `.exe` file.

### App Won't Launch After Build
The built app requires the `say` module to be unpacked. Verify `package.json` includes:
```json
"asarUnpack": [
  "node_modules/say/**/*"
]
```

## Accessibility Permissions

On some Windows systems, robotjs may require accessibility permissions:

1. Open **Settings** → **Privacy & Security** → **Accessibility**
2. Enable accessibility for your terminal/IDE
3. Restart the app

## Getting Help

If issues persist:
1. Check the console logs in DevTools (`Ctrl+Shift+I` in dev mode)
2. Look for error messages in the terminal
3. Verify Node.js version: `node --version` (should be 16+)
4. Verify npm version: `npm --version` (should be 8+)
