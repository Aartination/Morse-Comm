[README.md](https://github.com/user-attachments/files/33003726/README.md)
# 🔴 MORSE COMM — Encrypted Morse Translator

> *"Your mission, should you choose to accept it..."*

A **Mission Impossible**–themed Chrome extension that translates between English and Morse code in real time, with audio playback and a built-in **English ↔ Hindi** translator side panel.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-red?style=flat-square&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 🔐 Morse Code Translation
- **Auto-detect** — type English or paste Morse code, the extension figures out which way to translate
- **Real-time conversion** — results appear instantly as you type
- **On-screen keypad** — tap `•` `—` `SPC` `WRD` `⌫` to build Morse without a keyboard
- **Audio playback** — hear the Morse code played back at configurable speed and pitch
- **Page selection** — select text on any webpage, right-click → **Morse Translator** (or press `Alt+Shift+M`) to get an on-page translation card

### 🌐 English ↔ Hindi Translator
- Floating **side panel** at the bottom-right corner
- Powered by the **MyMemory Translation API** (free, no API key needed)
- **Auto-translate** as you type (with debounce)
- **Swap direction** between English→Hindi and Hindi→English
- Copy translated text to clipboard

### 🎬 Mission Impossible UI Theme
- **Scanline overlay** — CRT monitor effect with animated drift
- **Vignette** — dark edges like a surveillance display
- **Burning fuse icon** — the iconic MI fuse with a pulsing red spark
- **"CLASSIFIED" badge** — animated pulsing border
- **Glitch effect** — hover the title for a tactical glitch shake
- **Live clock** — ticking timestamp in the status bar
- **Terminal-style interface** — dark panels, red accents, monospace fonts (Orbitron + Share Tech Mono)

---

## 📸 Preview

| Main Terminal | Hindi Side Panel |
|:---:|:---:|
| Morse encoder/decoder with playback controls | Floating English ↔ Hindi translator |

---

## 🚀 Installation

### Developer Mode (Recommended)

1. **Clone** this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/morse-extension.git
   ```

2. Open your Chromium-based browser (Chrome, Edge, Brave, etc.)

3. Navigate to `chrome://extensions`

4. Enable **Developer mode** (toggle in the top-right corner)

5. Click **Load unpacked** and select the `morse-extension` folder

6. Pin the extension from the puzzle-piece icon in the toolbar

---

## 🎮 Usage

### Popup Translator
1. Click the extension icon in your toolbar
2. Type English text or paste Morse code — translation is **auto-detected**
3. Use the on-screen keypad (`•` `—` `SPC` `WRD`) to tap out Morse
4. Click **▶ TRANSMIT** to hear the audio playback
5. Click **◫ EXTRACT** to copy the result
6. Adjust **Speed** (5–35 WPM) and **Pitch** (300–1000 Hz) with the sliders

### On-Page Translation
1. **Select text** on any webpage
2. Right-click → **Morse Translator**, or press `Alt` + `Shift` + `M`
3. A floating card appears with the translation, Play and Copy buttons
4. Press `Escape` to dismiss

### Hindi Translator
1. Click the **glowing red button** (हि) at the bottom-right corner
2. Type English text — it auto-translates to Hindi
3. Click **⇄** to swap direction (Hindi → English)
4. Click **◫ EXTRACT** to copy the translation

---

## 📁 Project Structure

```
morse-extension/
├── manifest.json       # Chrome Extension manifest (V3)
├── background.js       # Service worker — context menu & keyboard shortcut
├── morse.js            # Core Morse engine (encode/decode/timeline)
├── player.js           # Web Audio API Morse playback
├── popup.html          # Extension popup — MI themed UI
├── popup.css           # Styles — MI theme, scanlines, animations
├── popup.js            # Popup logic — translation, Hindi panel, clock
├── overlay.js          # On-page floating translation card
├── icons/              # Extension icons
└── README.md           # You are here
```

---

## 🔧 Morse Format

| Feature | Detail |
|---|---|
| **Letter separator** | Single space |
| **Word separator** | ` / ` (space-slash-space) |
| **Word break (input)** | `/`, 3+ spaces, or newline |
| **Supported characters** | A–Z, 0–9, `. , ? ' ! / ( ) & : ; = + - _ " $ @` |
| **Unicode support** | Dots `• · ∙` and dashes `‒ – — ―` are auto-normalized |

---

## 🛠️ Tech Stack

- **Vanilla JavaScript** — no frameworks, no build step
- **Web Audio API** — for Morse code audio generation
- **Shadow DOM** — overlay card is isolated from page styles
- **Chrome Extension Manifest V3** — modern extension architecture
- **MyMemory API** — free translation service for Hindi
- **Google Fonts** — Orbitron & Share Tech Mono

---

## ⚠️ Limitations

- Browser-internal pages (`chrome://`, Chrome Web Store) block extensions — use the popup instead
- The extension only touches a page **when you ask it to** (no always-on content scripts)
- Hindi translation requires an internet connection (uses the MyMemory API)
- MyMemory free tier has a daily limit (~5000 characters/day)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <b>· – · · –– ··· ·</b><br>
  <sub>Built with ❤️ and a burning fuse</sub><br>
  <sub><i>"This README will self-destruct in 5 seconds..."</i></sub>
</p>
