import { AudioFormatType } from '../types';

export interface AudioFormatDetails {
  format: AudioFormatType;
  isLossless: boolean;
  extension: string;
  badgeLabel: string;
  badgeColor: string;
  badgeTextColor: string;
  description: string;
  typicalBitrate: string;
  mimeType: string;
}

/**
 * Supported audio MIME types for Android & iOS DocumentPicker
 */
export const AUDIO_FORMAT_MIME_TYPES: string[] = [
  'audio/*',
  'audio/mpeg',
  'audio/mp3',
  'audio/flac',
  'audio/x-flac',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/x-pn-wav',
  'audio/aac',
  'audio/x-aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/ogg',
  'application/ogg',
  'audio/opus',
  'audio/alac',
  'audio/x-alac',
  'audio/aiff',
  'audio/x-aiff',
  'audio/x-ms-wma',
  'audio/webm',
];

/**
 * Supported file extensions for local audio playback
 */
export const AUDIO_FILE_EXTENSIONS = [
  '.mp3',
  '.flac',
  '.wav',
  '.wave',
  '.aac',
  '.m4a',
  '.m4b',
  '.ogg',
  '.oga',
  '.opus',
  '.alac',
  '.aif',
  '.aiff',
  '.wma',
  '.webm',
  '.amr',
  '.mid',
  '.midi',
] as const;

/**
 * Format profile definitions
 */
const FORMAT_PROFILES: Record<AudioFormatType, Omit<AudioFormatDetails, 'extension'>> = {
  FLAC: {
    format: 'FLAC',
    isLossless: true,
    badgeLabel: 'HI-RES FLAC',
    badgeColor: '#10B981', // Emerald
    badgeTextColor: '#FFFFFF',
    description: 'Free Lossless Audio Codec (24-bit / 192kHz Master)',
    typicalBitrate: '900-1411 kbps',
    mimeType: 'audio/flac',
  },
  WAV: {
    format: 'WAV',
    isLossless: true,
    badgeLabel: 'LOSSLESS PCM',
    badgeColor: '#06B6D4', // Cyan
    badgeTextColor: '#FFFFFF',
    description: 'Waveform Audio PCM (Uncompressed Studio Master)',
    typicalBitrate: '1411 kbps',
    mimeType: 'audio/wav',
  },
  ALAC: {
    format: 'ALAC',
    isLossless: true,
    badgeLabel: 'ALAC LOSSLESS',
    badgeColor: '#10B981',
    badgeTextColor: '#FFFFFF',
    description: 'Apple Lossless Audio Codec (Bit-for-Bit Accurate)',
    typicalBitrate: '900-1200 kbps',
    mimeType: 'audio/alac',
  },
  AIFF: {
    format: 'AIFF',
    isLossless: true,
    badgeLabel: 'AIFF PCM',
    badgeColor: '#06B6D4',
    badgeTextColor: '#FFFFFF',
    description: 'Audio Interchange File Format (Uncompressed PCM)',
    typicalBitrate: '1411 kbps',
    mimeType: 'audio/aiff',
  },
  AAC: {
    format: 'AAC',
    isLossless: false,
    badgeLabel: 'AAC HQ',
    badgeColor: '#8B5CF6', // Purple
    badgeTextColor: '#FFFFFF',
    description: 'Advanced Audio Coding (High Efficiency Compression)',
    typicalBitrate: '256-320 kbps',
    mimeType: 'audio/aac',
  },
  M4A: {
    format: 'M4A',
    isLossless: false,
    badgeLabel: 'M4A',
    badgeColor: '#8B5CF6',
    badgeTextColor: '#FFFFFF',
    description: 'MPEG-4 Audio Container (AAC / ALAC Encoded)',
    typicalBitrate: '256-320 kbps',
    mimeType: 'audio/m4a',
  },
  OGG: {
    format: 'OGG',
    isLossless: false,
    badgeLabel: 'OGG VORBIS',
    badgeColor: '#F59E0B', // Amber
    badgeTextColor: '#000000',
    description: 'Ogg Vorbis Open Container Audio',
    typicalBitrate: '192-320 kbps',
    mimeType: 'audio/ogg',
  },
  OPUS: {
    format: 'OPUS',
    isLossless: false,
    badgeLabel: 'OPUS',
    badgeColor: '#F59E0B',
    badgeTextColor: '#000000',
    description: 'Opus Modern Ultra-Low Latency Interactive Codec',
    typicalBitrate: '128-192 kbps',
    mimeType: 'audio/opus',
  },
  WMA: {
    format: 'WMA',
    isLossless: false,
    badgeLabel: 'WMA',
    badgeColor: '#3B82F6', // Blue
    badgeTextColor: '#FFFFFF',
    description: 'Windows Media Audio',
    typicalBitrate: '192-320 kbps',
    mimeType: 'audio/x-ms-wma',
  },
  MP3: {
    format: 'MP3',
    isLossless: false,
    badgeLabel: 'MP3',
    badgeColor: '#64748B', // Slate
    badgeTextColor: '#FFFFFF',
    description: 'MPEG-1 Audio Layer III Standard',
    typicalBitrate: '320 kbps',
    mimeType: 'audio/mpeg',
  },
  OTHER: {
    format: 'OTHER',
    isLossless: false,
    badgeLabel: 'AUDIO',
    badgeColor: '#475569',
    badgeTextColor: '#FFFFFF',
    description: 'Universal Audio Stream',
    typicalBitrate: 'Variable',
    mimeType: 'audio/*',
  },
};

/**
 * Detects the audio format, lossless status, and badge details from a filename or URI
 */
export function detectAudioFormat(filenameOrUri?: string): AudioFormatDetails {
  if (!filenameOrUri) {
    return { ...FORMAT_PROFILES.MP3, extension: '.mp3' };
  }

  const clean = filenameOrUri.split('?')[0].toLowerCase();

  if (clean.endsWith('.flac')) {
    return { ...FORMAT_PROFILES.FLAC, extension: '.flac' };
  }
  if (clean.endsWith('.wav') || clean.endsWith('.wave')) {
    return { ...FORMAT_PROFILES.WAV, extension: '.wav' };
  }
  if (clean.endsWith('.alac')) {
    return { ...FORMAT_PROFILES.ALAC, extension: '.alac' };
  }
  if (clean.endsWith('.aif') || clean.endsWith('.aiff')) {
    return { ...FORMAT_PROFILES.AIFF, extension: '.aiff' };
  }
  if (clean.endsWith('.aac')) {
    return { ...FORMAT_PROFILES.AAC, extension: '.aac' };
  }
  if (clean.endsWith('.m4a') || clean.endsWith('.m4b')) {
    return { ...FORMAT_PROFILES.M4A, extension: '.m4a' };
  }
  if (clean.endsWith('.ogg') || clean.endsWith('.oga')) {
    return { ...FORMAT_PROFILES.OGG, extension: '.ogg' };
  }
  if (clean.endsWith('.opus')) {
    return { ...FORMAT_PROFILES.OPUS, extension: '.opus' };
  }
  if (clean.endsWith('.wma')) {
    return { ...FORMAT_PROFILES.WMA, extension: '.wma' };
  }
  if (clean.endsWith('.mp3')) {
    return { ...FORMAT_PROFILES.MP3, extension: '.mp3' };
  }

  return { ...FORMAT_PROFILES.OTHER, extension: '.audio' };
}

/**
 * Check if a filename or URI is a supported audio file
 */
export function isAudioFile(filenameOrUri?: string): boolean {
  if (!filenameOrUri) return false;
  const clean = filenameOrUri.split('?')[0].toLowerCase();
  return AUDIO_FILE_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/**
 * Format sample rate in kHz (e.g. 44100 -> "44.1 kHz", 96000 -> "96 kHz")
 */
export function formatSampleRate(hz?: number): string {
  if (!hz || hz <= 0) return '44.1 kHz';
  if (hz >= 1000) {
    const khz = hz / 1000;
    return `${khz % 1 === 0 ? khz : khz.toFixed(1)} kHz`;
  }
  return `${hz} Hz`;
}

/**
 * Format bit depth in bits (e.g. 16 -> "16-bit", 24 -> "24-bit Hi-Res")
 */
export function formatBitDepth(bits?: number): string {
  if (!bits || bits <= 0) return '16-bit';
  if (bits >= 24) return `${bits}-bit Hi-Res`;
  return `${bits}-bit`;
}

/**
 * Get a formatted human-readable audio spec description
 */
export function getAudioSpecString(track: {
  filename?: string;
  uri?: string;
  format?: AudioFormatType;
  isLossless?: boolean;
  bitrate?: number;
  sampleRate?: number;
  bitDepth?: number;
}): string {
  const details = detectAudioFormat(track.filename || track.uri);
  const formatName = track.format || details.format;
  const isLossless = track.isLossless ?? details.isLossless;

  if (isLossless) {
    return `${formatName} • Lossless Studio Master`;
  }
  return `${formatName} • High Efficiency Audio`;
}
