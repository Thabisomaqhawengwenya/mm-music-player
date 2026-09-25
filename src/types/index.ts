export interface Track {
  id: string;
  uri: string;
  filename: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artwork?: string;
  genre?: string;
  year?: string;
  folder?: string;
  size?: number; // in bytes
  isFavorite?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // in seconds
  duration: number; // in seconds
  playbackSpeed: number;
  isBuffering: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  volume: number;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  coverUri?: string;
}

export interface EqualizerPreset {
  name: string;
  bands: number[]; // dB gains for [-10 to +10]
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100
}

export interface AppTheme {
  id: string;
  name: string;
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;
  accent: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  playerBarBg: string;
  cardBg: string;
  danger: string;
  success: string;
}
