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

export type MascotEmotion =
  | 'happy'
  | 'excited'
  | 'sad'
  | 'relaxed'
  | 'surprised'
  | 'focused'
  | 'sleepy'
  | 'dancing';

export interface PetEngineState {
  state: PetState;
  action: PetAutonomousAction;
  emotion: MascotEmotion;
  emoteIcon: string | null; // visual emote icon only (e.g. '🎵', '❤️', '✨', '💤', '💧', '❗', '🎧', '⚡'), no dialogue text!
  speechText?: string | null;
  moodEmoji?: string;
  isSleeping: boolean;
}

export interface PetAvatarProfile {
  id: PetAvatarType;
  name: string;
  species: string;
  personality: string;
  accentColor: string;
  hairColor?: string;
  skinColor?: string;
}

export const PET_PROFILES: Record<PetAvatarType, PetAvatarProfile> = {
  human_aria: {
    id: 'human_aria',
    name: 'Aria',
    species: 'Lo-Fi Girl',
    personality: 'Warm, expressive anime music lover with studio cans and cozy hoodie.',
    accentColor: '#00E5FF',
    hairColor: '#4A3728',
    skinColor: '#FFDFBA',
  },
  human_kai: {
    id: 'human_kai',
    name: 'Kai',
    species: 'Hi-Fi Beatmaker',
    personality: 'Chill audiophile with wireless DJ headphones and sleek collar.',
    accentColor: '#10B981',
    hairColor: '#1E293B',
    skinColor: '#F7D0B2',
  },
  human_nova: {
    id: 'human_nova',
    name: 'Nova',
    species: 'Cyber Producer',
    personality: 'Vibrant rhythm dancer with illuminated cans and neon jacket.',
    accentColor: '#FF6584',
    hairColor: '#8B5CF6',
    skinColor: '#FDE0D9',
  },
  cat: {
    id: 'cat',
    name: 'Cadence',
    species: 'Audio Kitty',
    personality: 'Loves deep bass, lo-fi beats, and warm headphones.',
    accentColor: '#FF6584',
  },
  bunny: {
    id: 'bunny',
    name: 'Beat',
    species: 'Cyber Bunny',
    personality: 'Fast-paced hopper who syncs ear wiggles to EDM drops.',
    accentColor: '#00D2D3',
  },
  kaomoji: {
    id: 'kaomoji',
    name: 'Moji',
    species: 'Kaomoji Cloud',
    personality: 'Expressive ASCII beat-hopper with living text faces and emotions.',
    accentColor: '#A29BFE',
  },
};

export interface KaomojiReactionItem {
  id: string;
  kaomoji: string;
  label: string;
  vibe: string;
}

export const KAOMOJI_REACTIONS: KaomojiReactionItem[] = [
  { id: 'groove', kaomoji: '(ﾉ^_^)ﾉ', label: "Groovin'", vibe: 'Loving the rhythm' },
  { id: 'vibing', kaomoji: '( ＾◡＾)っ♫', label: 'Vibing', vibe: 'Playing the jams' },
  { id: 'hype', kaomoji: '٩(ˊᗜˋ*)و', label: 'Hype!', vibe: 'Pure energy' },
  { id: 'rock', kaomoji: '(ง •̀_•́)ง', label: 'Rock Out', vibe: 'Banging beat' },
  { id: 'love', kaomoji: '(≧◡≦) ♡', label: 'In Love', vibe: 'Total masterpiece' },
  { id: 'chill', kaomoji: '(˘ᵕ˘ )♪', label: 'Chill', vibe: 'Soft & mellow' },
  { id: 'sparkle', kaomoji: '(✧ω✧)', label: 'Sparkle', vibe: 'Golden melody' },
  { id: 'hug', kaomoji: '(づ｡◕‿‿◕｡)づ', label: 'Cozy Hug', vibe: 'Warm comfort' },
  { id: 'sleepy', kaomoji: '( ˘ω˘ )zzZ', label: 'Sleepy', vibe: 'Lullaby dreams' },
  { id: 'encore', kaomoji: '(*^▽^*)', label: 'Encore!', vibe: 'Bravo encore' },
  { id: 'fire', kaomoji: 'ദ്ദി(˵•̀ᴗ-˵)', label: '10/10', vibe: 'Certified classic' },
  { id: 'drop', kaomoji: '(╯°□°)╯', label: 'Bass Drop', vibe: 'Unreal drop' },
];

