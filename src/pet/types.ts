import { Track, PlaybackState, PetAvatarType } from '../types';

export type PetState =
  | 'idle'
  | 'playing'
  | 'slow_music'
  | 'high_energy'
  | 'paused'
  | 'song_changed'
  | 'song_finished'
  | 'inactive'
  | 'happy_tap';

export type PetAutonomousAction =
  | 'none'
  | 'blink'
  | 'look_around'
  | 'stretch'
  | 'yawn'
  | 'wave'
  | 'sleep'
  | 'bounce'
  | 'spin'
  | 'celebrate';

export type MusicEnergyTier = 'slow' | 'medium' | 'high';

export interface PetMusicAnalysis {
  energy: MusicEnergyTier;
  tempoBpmEstimate: number;
  label: string;
}

export interface PetEngineState {
  state: PetState;
  action: PetAutonomousAction;
  speechText: string | null;
  moodEmoji: string;
  isSleeping: boolean;
}

export interface PetAvatarProfile {
  id: PetAvatarType;
  name: string;
  species: string;
  personality: string;
  accentColor: string;
}

export const PET_PROFILES: Record<PetAvatarType, PetAvatarProfile> = {
  cat: {
    id: 'cat',
    name: 'Cadence',
    species: 'Audio Kitty',
    personality: 'Loves deep bass, lo-fi beats, and warm headphones.',
    accentColor: '#FF6584',
  },
  fox: {
    id: 'fox',
    name: 'Tempo',
    species: 'Groove Fox',
    personality: 'Energetic dancer who rocks out to synthwave and electric guitar.',
    accentColor: '#FF9F43',
  },
  bunny: {
    id: 'bunny',
    name: 'Beat',
    species: 'Cyber Bunny',
    personality: 'Fast-paced hopper who syncs ear wiggles to EDM drops.',
    accentColor: '#00D2D3',
  },
};
