# 🎵 MM Music Player — Offline Audio Player & Screen Companion

[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A modern, high-fidelity, **100% offline-first mobile music player** for Android & iOS engineered with Expo, React Native, and TypeScript. Featuring an autonomous **interactive Music Pet companion** that dances, listens, and interacts on your screen while your tracks play.

---

## 🌟 Highlight Features

### 🐾 1. Interactive Music Pet Screen Companion
An adorable, animated offline pet widget that floats on your screen or inside the Now Playing view, reacting in real-time to your music:
- **3 Unique Pet Personalities**:
  - 🐱 **Cadence** (*The Audio Kitty*): Loves deep bass, lo-fi beats, and warm headphones (`#FF6584`).
  - 🦊 **Tempo** (*The Groove Fox*): Energetic dancer rocking out to synthwave and electric guitar (`#FF9F43`).
  - 🐰 **Beat** (*The Cyber Bunny*): Fast-paced hopper syncing ear wiggles to EDM drops (`#00D2D3`).
- **Autonomous Reactions**: Blinking, stretching, yawning, spinning, bouncing, celebrating drops, and sleeping when the music stops.
- **Audio Energy Sync**: Automatically detects music tempo tiers (*Slow*, *Medium*, *High Energy*) and dynamically syncs dance animations and speech bubbles.
- **Interactive Touch**: Tap to pet, drag around the screen, or customize visibility in settings.

### 📱 2. Offline-First Audio Engine & Storage Scanner
- **Zero Internet Required**: Play your entire local audio library without tracking, subscriptions, or data usage.
- **Auto-Scan Device Storage**: Automatically indexes `.mp3`, `.wav`, `.flac`, `.m4a`, `.aac`, and `.ogg` files via `expo-media-library` across device directories (`Download/`, `Music/`, SD cards).
- **Document & Folder Import**: Tap the document picker to load individual tracks or external folders via `expo-document-picker`.
- **Bundled Hi-Fi Demo Tracks**: Ready to test immediately upon launch even on emulators without manual file transfers.

### 🎧 3. High-Fidelity Playback & Background Audio
- **True Background Playback**:
  - Android: `FOREGROUND_SERVICE_MEDIA_PLAYBACK` with notification controls.
  - iOS: Native audio background mode (`UIBackgroundModes: ["audio"]`).
- **Playback Controls**: Seamless repeat modes (*Off*, *Repeat All*, *Repeat One*), shuffle queue, variable speed playback (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`), and responsive touch scrubber.
- **Floating Mini Player**: Glassmorphic bottom player with spinning vinyl disk artwork and quick controls.

### 🎚️ 4. 5-Band Interactive Equalizer & DSP
- **5 Precision Frequency Sliders**: 60 Hz (Sub-Bass), 230 Hz (Bass), 910 Hz (Mids), 3.6 kHz (High-Mids), and 14 kHz (Treble) with ±10 dB adjustments.
- **Built-In Presets**: Flat, Bass Boost, Vocal Clarity, Electronic, Rock Punch, Acoustic / Warm.
- **Sound Enhancement Dials**: Dedicated Bass Boost (0–100%) and 3D Virtualizer (0–100%) sliders.

### 📊 5. Dynamic Visualizer & Lyrics Sheet
- **Live Spectrum Visualizer**: 14 animated audio spectrum bars pulsating rhythmically with track tempo.
- **Lyrics Flip View**: One-tap flip between full album artwork and embedded scrolling song lyrics.
- **In-App Volume Scrubber**: Fine-grained software volume control with instant mute toggle.

### 📂 6. Multi-View Library Organization
- **Tracks**: Full searchable track list with duration and file info.
- **Albums**: 2-column square cover art grid with dedicated album inspector modal.
- **Artists**: Artist catalog with discography carousel and track counts.
- **Genres**: Distinct genre cards with filtered instant-play lists.
- **Folders**: Browse songs hierarchically by physical device folder paths.
- **Playlists & Favorites**: Create and edit unlimited custom playlists with one-tap favorite toggling.

### 🏷️ 7. Embedded ID3 Tag Editor
- Edit Song Title, Artist Name, Album Name, Genre, and Release Year directly inside the app.
- Persisted locally with `@react-native-async-storage/async-storage`.

### ⏱️ 8. Sleep Timer
- Presets for 15m, 30m, 45m, 60m, 90m, or custom off.
- Live countdown badge in the Now Playing screen that smoothly pauses playback upon expiry.

### 🎨 9. Premium Theme Switcher
- **OLED Cyber Cyan** (Default): Pure OLED black (`#07080B`) with neon cyan accents (`#00E5FF`).
- **Midnight Emerald**: Deep obsidian with rich jade/emerald tones (`#10B981`).
- **Analog Hi-Fi Amber**: Classic warm tape deck & vintage hardware aesthetic (`#F59E0B`).
- **Cold Slate Titanium**: Clean minimalist slate with ice-blue accents (`#93C5FD`).

### ☁️ 10. Optional Cloud Backup Server
- Lightweight Node.js + Express + TypeScript server in `server/`.
- Secure JWT authentication, bcrypt password hashing, and rate limiting.
- Offline-first delta sync for playlists, favorites, EQ settings, and metadata backups.

---

## 🏗️ Project Architecture

```
mm-music-player/
├── assets/                  # Icons, splash screens, and bundled audio assets
├── src/
│   ├── components/          # Reusable UI modals and screen components
│   │   ├── AlbumDetailModal.tsx
│   │   ├── AlbumsView.tsx
│   │   ├── ArtistDetailModal.tsx
│   │   ├── CloudSyncModal.tsx
│   │   ├── EqualizerModal.tsx
│   │   ├── GenreDetailModal.tsx
│   │   ├── GenresView.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── NowPlayingModal.tsx
│   │   ├── PlaylistDetailModal.tsx
│   │   ├── PlaylistModal.tsx
│   │   ├── PrivacyModal.tsx
│   │   ├── QueueModal.tsx
│   │   ├── SearchHubView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── SleepTimerModal.tsx
│   │   ├── TactileButton.tsx
│   │   ├── TagEditorModal.tsx
│   │   ├── TermsModal.tsx
│   │   ├── ThemeSwitcherModal.tsx
│   │   └── TrackListItem.tsx
│   ├── constants/           # Color palettes, theme tokens, and typography
│   ├── pet/                 # Interactive Music Pet screen companion
│   │   ├── FloatingPetOverlay.tsx
│   │   ├── MusicPet.tsx
│   │   ├── PetBehaviorEngine.ts
│   │   └── types.ts
│   ├── services/            # Audio engine, scanner, storage & cloud sync
│   │   ├── audioPlayer.ts
│   │   ├── playlistStorage.ts
│   │   ├── storageScanner.ts
│   │   └── syncClient.ts
│   └── types/               # TypeScript models & state interfaces
├── server/                  # Optional standalone Express sync server
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   └── package.json
├── App.tsx                  # App root, navigation controllers & tab router
├── app.json                 # Expo project configuration & native permissions
├── package.json             # App dependencies and run scripts
├── PRIVACY_POLICY.md        # Comprehensive 27-section privacy policy
├── TERMS_AND_CONDITIONS.md  # Complete in-app terms & conditions
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your physical iOS/Android device or an Android/iOS emulator

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Thabisomaqhawengwenya/mm-music-player.git
   cd mm-music-player
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

4. **Launch on your device**:
   - **Android Emulator / Device**: Press `a` or run `npm run android`
   - **iOS Simulator**: Press `i` or run `npm run ios`
   - **Expo Go App**: Scan the terminal QR code with your phone camera (iOS) or the Expo Go app (Android).
   - **Web Browser Preview**: Press `w` or run `npm run web`

---

## 🌐 Running the Cloud Sync Server (Optional)

If you wish to host the companion delta-sync server:

```bash
cd server
npm install
npm run dev
```
The server will start listening at `http://localhost:4000` (or `http://10.0.2.2:4000` from Android Emulator). Test health at `http://localhost:4000/health`.

---

## 📜 Permissions Used

- **`READ_MEDIA_AUDIO` / `READ_EXTERNAL_STORAGE`**: To scan and load audio files from local device storage.
- **`FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_MEDIA_PLAYBACK`**: For seamless audio playback when the app is minimized or the screen is locked.
- **`VIBRATE`**: For subtle tactile haptic responses during user interactions.

---

## 📄 License & Legal

- **Code License**: [MIT License](LICENSE)
- **Privacy Policy**: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Terms & Conditions**: [TERMS_AND_CONDITIONS.md](TERMS_AND_CONDITIONS.md)
