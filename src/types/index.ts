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
  trackNumber?: number;
  lyrics?: string;
  bitrate?: number;
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

export interface Album {
  id: string;
  name: string;
  artist: string;
  artwork?: string;
  year?: string;
  trackCount: number;
  totalDuration: number;
  tracks: Track[];
}

export interface Artist {
  name: string;
  trackCount: number;
  albumCount: number;
  artwork?: string;
  tracks: Track[];
}

export interface Genre {
  name: string;
  trackCount: number;
  color?: string;
  icon?: string;
  tracks: Track[];
}

export interface AudioSettings {
  crossfadeDuration: number; // 0 to 12s
  minDurationSeconds: number; // ignore short clips (e.g. 30s)
  excludeFolders: string[];
  gaplessPlayback: boolean;
  normalizeVolume: boolean;
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

export interface HeadsetSettings {
  pauseOnUnplug: boolean;
  resumeOnBluetooth: boolean;
  duckAudioOnNotification: boolean;
  headsetButtonActions: boolean;
}

export interface NotificationSettings {
  showArtwork: boolean;
  compactStyle: boolean;
  showSeekButtons: boolean;
}

export interface LockscreenSettings {
  enableLockscreenPlayer: boolean;
  showFullScreenArtwork: boolean;
  swipeToSkip: boolean;
}

export interface AdvancedSettings {
  bufferSize: 'low' | 'normal' | 'high';
  autoRescanOnLaunch: boolean;
  cacheWaveforms: boolean;
  logLevel: 'error' | 'debug' | 'none';
}

export interface WidgetSettings {
  style: 'compact' | 'standard' | 'expanded';
  transparentBg: boolean;
  showArtwork: boolean;
}

export type CharacterEmotion =
  | 'happy'
  | 'excited'
  | 'sad'
  | 'relaxed'
  | 'surprised'
  | 'focused'
  | 'sleepy'
  | 'dancing';

export type PetAvatarType = 'human_aria' | 'human_kai' | 'human_nova' | 'cat' | 'bunny' | 'kaomoji';

export type PetAccessory = 'none' | 'sunglasses' | 'gold_headphones' | 'crown' | 'boombox';

export type PetTreat = 'cookie' | 'donut' | 'fish';

export type VisualizerMode = 'spectrum' | 'lava_blob' | 'oscilloscope' | 'particle_starfield';

export type PlayerBackgroundType =
  | 'default'
  | 'aurora'
  | 'sunset'
  | 'cyber'
  | 'tokyo_rain'
  | 'custom';

export interface PlayerCustomizationSettings {
  backgroundType: PlayerBackgroundType;
  customImageUri?: string;
  backgroundBlur: number;
  backgroundDim: number;
  enableCharacter: boolean;
  enableCharacterMotion: boolean;
  enableVisualizer: boolean;
  enableArtworkAnimation: boolean;
  enableBackgroundAmbiance: boolean;
}

export interface PetSettings {
  enabled: boolean;
  avatar: PetAvatarType;
  showOnNowPlaying: boolean;
  showFloatingMini: boolean;
  accessory?: PetAccessory;
  affection?: number; // 0 to 100
  treatsCount?: number;
  emotionOverride?: CharacterEmotion | null;
}

