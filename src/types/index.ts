export type AudioFormatType =
  | 'MP3'
  | 'FLAC'
  | 'AAC'
  | 'OGG'
  | 'WAV'
  | 'M4A'
  | 'OPUS'
  | 'ALAC'
  | 'AIFF'
  | 'WMA'
  | 'OTHER';

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
  format?: AudioFormatType;
  isLossless?: boolean;
  sampleRate?: number; // in Hz, e.g. 44100, 48000, 96000, 192000
  bitDepth?: number; // in bits, e.g. 16, 24, 32
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
  isDark?: boolean;
  borderRadius?: {
    sm: number;
    md: number;
    lg: number;
    card: number;
    pill: number;
  };
  isMaterialYou?: boolean;
  primaryContainer?: string;
  onPrimaryContainer?: string;
  surfaceContainer?: string;
  surfaceContainerHigh?: string;
  outlineVariant?: string;
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
  cornerRadius?: number; // 12, 18, 24, 32
  materialYouDynamic?: boolean;
  artistDelimiters?: string[];
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

export interface TrackPlayStat {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  genre?: string;
  duration?: number;
  playCount: number;
  totalDurationSeconds: number;
  lastPlayed: number;
}

export interface ListeningStats {
  totalPlays: number;
  totalSeconds: number;
  trackPlays: Record<string, TrackPlayStat>;
  artistPlays: Record<string, number>;
  genrePlays: Record<string, number>;
  dailyMinutes: Record<string, number>;
  hourlyPlays: number[];
  firstRecordedDate?: string;
}

