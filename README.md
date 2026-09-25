# Offline Local Music Player (Expo / React Native)

A high-fidelity, offline-first mobile music player engineered for playing local audio stored on Android & iOS devices with background playback, full library scanning, custom playlist creation, interactive 5-band equalizer, sleep timer, playback speed control, ID3 metadata editing, and a theme switcher.

---

## ✨ Features Implemented

1. **Offline & Local Storage Engine**:
   - **Auto-Scan Device Storage**: Automatically searches and loads audio files (`.mp3`, `.wav`, `.flac`, `.m4a`, `.aac`, `.ogg`) from Android MediaStore / device folders (`Download/`, `Music/`, SD cards) with `expo-media-library`.
   - **Manual Document/Folder Picker**: Tap the document icon to import audio files or custom folders directly from local storage with `expo-document-picker`.
   - **Bundled Hi-Fi Demo Audio**: Pre-configured with sample offline tracks so the app is instantly testable even on emulators without manual file transfers.

2. **Full Playback & Background Audio**:
   - Background audio playback enabled on Android (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`) and iOS (`UIBackgroundModes: ["audio"]`).
   - Seamless loop modes: Repeat All, Repeat One, Repeat Off.
   - Shuffle queue with random distribution.
   - Variable playback speed: `0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`.
   - Responsive touch scrubber with time calculation and smooth scrubbing.

3. **Audio Equalizer (EQ) & DSP**:
   - **5-Band Frequency Sliders**: 60 Hz (Sub-Bass), 230 Hz (Bass), 910 Hz (Mids), 3.6 kHz (High-Mids), 14 kHz (Treble) with dB readouts (`-10dB` to `+10dB`).
   - **Presets**: Flat, Bass Boost, Vocal Clarity, Electronic, Rock Punch, and Acoustic / Warm.
   - **Sound Effects**: Dedicated Bass Boost (0–100%) and 3D Virtualizer (0–100%) dials.

4. **Queue & Playlists**:
   - View currently playing track, reorder or remove tracks from the active queue.
   - "Save Queue as Playlist" with one tap.
   - Create and organize unlimited custom offline playlists.
   - Favorites library (one-tap heart toggle).

5. **Sleep Timer**:
   - Preset durations: 15m, 30m, 45m, 60m, 90m, or Turn Off.
   - Live countdown display in Now Playing modal.
   - Automatically pauses playback when time expires.

6. **Embedded ID3 Tag Editor**:
   - View and edit Song Title, Artist Name, Album Name, Genre, and Release Year.
   - Persisted locally with `AsyncStorage`.

7. **Modular & Switchable Design System**:
   - **OLED Cyber Cyan** (Default): Pure OLED black background (`#07080B`), frosted translucent surfaces, vibrant cyber-cyan accents (`#00E5FF`).
   - **Midnight Emerald**: Deep obsidian with jade/emerald accents (`#10B981`).
   - **Analog Hi-Fi Amber**: Classic tape deck & studio hardware aesthetic (`#F59E0B`).
   - **Cold Slate Titanium**: Refined minimalist monochrome with ice-blue tones (`#93C5FD`).
   - Tactile spring physics buttons with light haptic feedback (`expo-haptics`).

8. **Cloud Sync & Backup Engine (Optional Offline-First Backend)**:
   - Delta synchronization of custom playlists, favorites, EQ presets, and edited ID3 metadata.
   - Built-in secure Node.js/Express server with JWT authentication, bcrypt hashing, rate limiting, and Helmet headers.
   - Configurable server endpoint (Android emulator `10.0.2.2:4000`, local network IP, or production cloud domain).
   - Offline resilience: works 100% disconnected; syncs seamlessly when connected.

9. **Multi-View Library & Detail Navigation**:
   - **4-Tab Bottom Navigation Bar**: Library, Playlists, Search, and Settings with tactile tab switching.
   - **Library Sub-Views**: Tracks, Albums (2-column square art grid), Artists, Folders, Genres (colored category tiles), and Favorites.
   - **Album Detail Screen**: Full album hero cover, release year, total runtime, Play All & Shuffle buttons, and numbered tracklist.
   - **Artist Profile Screen**: Artist avatar, discography album carousel, song counter, and complete song catalog.
   - **Genre Detail Screen**: Filtered tracks by genre with instant playback.
   - **Playlist Detail Screen**: Full playlist inspector with track removal, playlist renaming, total duration, and playback.

10. **Enhanced Now Playing & Audio DSP**:
    - **Live Audio Spectrum Visualizer**: 14 animated dancing bars that react dynamically during active playback.
    - **Software Volume Slider**: In-player touch volume bar with one-tap mute toggle.
    - **Lyrics Flip View**: Instant flip between Album Art and an embedded / scrolling lyrics sheet.
    - **Audio DSP Filters in Settings**: Configurable short-audio filter (e.g. ignore notifications & voice memos <30s), crossfade durations (0s to 8s), and gapless playback toggles.

11. **Dedicated Search & Discovery Hub**:
    - Instant multi-category query filtering across Tracks, Albums, Artists, and Genres.
    - Smart quick filters: "Favorites Only", "Long Tracks (>3 mins)", and scope chips ("All", "Tracks", "Albums", "Artists").

---

## 🚀 How to Run the App & Sync Server

### 1. Start the Mobile Dev Server
```bash
npm start
# or
npx expo start
```

### Run on Android
```bash
npm run android
```
*You can also scan the QR code generated by `npx expo start` using the **Expo Go** app on your physical Android phone.*

### Run on Web (Browser Preview)
```bash
npm run web
```

---

### 2. Start the Cloud Sync Server (Optional)
In a separate terminal:
```bash
cd server
npm install
npm run dev
```
The server will start listening at `http://localhost:4000` (or `http://10.0.2.2:4000` from Android emulator). Check health at `http://localhost:4000/health`.

---

## 📁 Project Architecture

- `App.tsx`: Main entry point orchestrating 4-tab bottom navigation, library sub-views, modal controllers, and mini player.
- `src/types/index.ts`: TypeScript interfaces for tracks, albums, artists, genres, audio settings, playback states, playlists, equalizer presets, and themes.
- `src/constants/theme.ts`: Design system tokens and multiple aesthetic themes.
- `src/services/audioPlayer.ts`: Singleton audio playback engine managing `expo-audio`, background mode, queue, volume, and sleep timer.
- `src/services/storageScanner.ts`: Media library scanner, document picker, album/artist/genre groupers, and audio settings filters.
- `src/services/playlistStorage.ts`: Local persistent storage for playlists, favorites, metadata overrides, EQ settings, and audio preferences.
- `src/services/syncClient.ts`: Offline-first delta synchronization and cloud backup client.
- `src/components/`:
  - `MiniPlayer.tsx`: Bottom floating glassmorphic player with rotating vinyl art and progress bar.
  - `NowPlayingModal.tsx`: Full-screen player with live audio spectrum visualizer, volume bar, lyrics flip sheet, interactive scrubber, and playback controls.
  - `AlbumsView.tsx`: 2-column album art grid with track badges.
  - `AlbumDetailModal.tsx`: Album hero header, tracklist, and Play All / Shuffle actions.
  - `ArtistDetailModal.tsx`: Artist profile with discography carousel and all songs.
  - `GenresView.tsx`: Category cards with genre icons and distinct tints.
  - `GenreDetailModal.tsx`: Genre tracklist view with playback controls.
  - `PlaylistDetailModal.tsx`: Custom playlist manager with track removal, song count, and playlist renaming.
  - `SearchHubView.tsx`: Global search hub with scope chips and smart filters.
  - `SettingsView.tsx`: Audio DSP options, min duration filter, theme switcher, storage scanner, and cloud sync trigger.
  - `EqualizerModal.tsx`: 5-band interactive EQ sliders, DSP bass boost, and presets.
  - `SleepTimerModal.tsx`: Sleep timer selector with live countdown.
  - `QueueModal.tsx`: Real-time playback queue with "Save as Playlist".
  - `PlaylistModal.tsx`: Playlist creator and track assigner.
  - `TagEditorModal.tsx`: ID3 metadata viewer and editor.
  - `ThemeSwitcherModal.tsx`: Theme switcher modal.
  - `CloudSyncModal.tsx`: Account authentication, server endpoint configuration, and delta sync dashboard.
  - `TrackListItem.tsx`: High-performance track row with action menu.
  - `TactileButton.tsx`: Spring-pressable button with haptics.
- `server/`: Standalone Express & TypeScript synchronization server.
