# PastePlay

**Windows-first clipboard-to-speech app** — Select text anywhere, press `Ctrl+Alt+R`, and hear it read aloud.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

This starts the Vite dev server and launches Electron in development mode.

### Production Build
```bash
npm run build
```

Creates a Windows x64 NSIS installer in `dist/build/`.

## ⚙️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode (Vite + Electron) |
| `npm run build` | Build renderer and create Windows installer |
| `npm run rebuild:robotjs` | Rebuild robotjs native module if needed |

## 🔧 Troubleshooting

### robotjs Build Issues

**robotjs** is an optional dependency that enables auto-copy (simulating `Ctrl+C`). If it fails to build:

#### Option 1: Install Windows Build Tools (Recommended)
```bash
npm install --global windows-build-tools
```

Then rebuild robotjs:
```bash
npm run rebuild:robotjs
```

#### Option 2: Manual Visual Studio Setup
1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Select "Desktop development with C++"
3. Run `npm install` again

#### Option 3: Skip robotjs
The app works without robotjs — it will just read the clipboard directly instead of auto-copying. The UI will show a warning badge and disable the auto-copy toggle.

### Common Issues

**"Cannot find module 'robotjs'"**
- This is expected if robotjs failed to build
- The app gracefully falls back to clipboard-only mode

**"Electron failed to install correctly"**
```bash
npm install electron --force
```

**NSIS installer not created**
- Ensure you're on Windows
- Check `dist/build/` for the `.exe` file

## 📦 Build Configuration

The `electron-builder` config in `package.json` includes:

- **Target**: Windows x64 NSIS installer
- **ASAR**: Enabled for performance
- **Unpacked**: `say` module (required for TTS)
- **Shortcuts**: Desktop + Start Menu

## 🎯 Features

- **Resizable Widget**: Drag corners to resize (300x180 minimum)
- **Global Hotkeys**:
  - `Ctrl+Alt+R`: Capture and read selection (customizable)
  - `Ctrl+Alt+N`: Cycle through history
- **Hotkey Customization**: Click to record new hotkey combinations
- **TTS Engine**: Windows SAPI voices with speed control (0.7x-1.6x)
- **History Management**: 
  - Last 10 snippets with timestamps
  - Pin/delete individual items
  - Optional storage (can be disabled for privacy)
- **Security Features**:
  - Text sanitization (prevents XSS)
  - Sensitive content detection (passwords, API keys, credit cards)
  - Sensitive content never stored in history
  - Optional history storage toggle
- **Settings**: 
  - Auto-copy toggle
  - Voice selection
  - Speed control
  - History storage control
  - Custom hotkey configuration

## 🔒 Security & Privacy

PastePlay includes built-in security features:
- **HTML Sanitization**: All clipboard content is sanitized before display
- **Sensitive Content Detection**: Automatically detects and excludes passwords, API keys, SSNs, and credit card numbers from history
- **Optional History**: Disable history storage entirely in settings
- **No Network Access**: All processing happens locally

## 📝 Notes

- The app runs as a frameless, always-on-top widget (350x160)
- History and preferences are saved via `electron-store`
- The widget auto-hides when it loses focus
