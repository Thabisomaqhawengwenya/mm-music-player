import { Track, PlaybackState } from '../types';
import {
  PetState,
  PetAutonomousAction,
  MusicEnergyTier,
  PetMusicAnalysis,
  PetEngineState,
  MascotEmotion,
} from './types';

export class PetBehaviorEngine {
  private currentState: PetState = 'idle';
  private currentAction: PetAutonomousAction = 'none';
  private currentEmotion: MascotEmotion = 'happy';
  private emoteIcon: string | null = '🎧';

  private lastInteractionTime: number = Date.now();
  private lastTrackId: string | null = null;
  private lastActionTime: number = 0;
  private actionCooldownMs: number = 4000;

  private isTransientState: boolean = false;
  private transientTimer: ReturnType<typeof setTimeout> | null = null;
  private autonomousLoopTimer: ReturnType<typeof setInterval> | null = null;

  private onStateChangeCallback: ((state: PetEngineState) => void) | null = null;

  constructor(onStateChange?: (state: PetEngineState) => void) {
    if (onStateChange) {
      this.onStateChangeCallback = onStateChange;
    }
    this.startAutonomousLoop();
  }

  public setListener(callback: (state: PetEngineState) => void) {
    this.onStateChangeCallback = callback;
    this.emitState();
  }

  public cleanup() {
    if (this.transientTimer) {
      clearTimeout(this.transientTimer);
      this.transientTimer = null;
    }
    if (this.autonomousLoopTimer) {
      clearInterval(this.autonomousLoopTimer);
      this.autonomousLoopTimer = null;
    }
  }

  private emitState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        state: this.currentState,
        action: this.currentAction,
        emotion: this.currentEmotion,
        emoteIcon: this.emoteIcon,
        speechText: null, // No dialogue or speech text
        isSleeping: this.currentState === 'inactive' || this.currentEmotion === 'sleepy',
      });
    }
  }

  // --- Music Analysis & Processing ---
  public analyzeMusic(track: Track | null): PetMusicAnalysis {
    if (!track) {
      return { energy: 'medium', tempoBpmEstimate: 110, label: 'Balanced' };
    }

    const title = (track.title || '').toLowerCase();
    const artist = (track.artist || '').toLowerCase();
    const genre = (track.genre || '').toLowerCase();
    const combined = `${title} ${artist} ${genre}`;

    // Slow / chill detection
    const isSlow =
      combined.includes('acoustic') ||
      combined.includes('chill') ||
      combined.includes('ambient') ||
      combined.includes('slow') ||
      combined.includes('ballad') ||
      combined.includes('piano') ||
      combined.includes('lo-fi') ||
      combined.includes('lofi') ||
      combined.includes('sleep') ||
      combined.includes('classical') ||
      combined.includes('folk') ||
      combined.includes('calm') ||
      combined.includes('meditation') ||
      (track.duration && track.duration > 360);

    if (isSlow) {
      return { energy: 'slow', tempoBpmEstimate: 75, label: 'Gentle & Mellow' };
    }

    // High energy detection
    const isHighEnergy =
      combined.includes('rock') ||
      combined.includes('metal') ||
      combined.includes('electronic') ||
      combined.includes('edm') ||
      combined.includes('dance') ||
      combined.includes('techno') ||
      combined.includes('house') ||
      combined.includes('drum and bass') ||
      combined.includes('dnb') ||
      combined.includes('trap') ||
      combined.includes('fast') ||
      combined.includes('hype') ||
      combined.includes('remix') ||
      combined.includes('drill') ||
      combined.includes('punk') ||
      combined.includes('party');

    if (isHighEnergy) {
      return { energy: 'high', tempoBpmEstimate: 135, label: 'High Energy Banger!' };
    }

    return { energy: 'medium', tempoBpmEstimate: 110, label: 'Groovy Beat' };
  }

  // --- Main Update Loop Driven by Player State ---
  public updatePlayerState(playbackState: PlaybackState) {
    const { isPlaying, currentTrack, position, duration, volume } = playbackState;

    // Volume 0 reaction -> sad
    if (volume === 0) {
      this.setMascotState('paused', 'none', 'sad', '💧');
      return;
    }

    // 1. Detect Track Change -> surprised
    if (currentTrack && currentTrack.id !== this.lastTrackId) {
      if (this.lastTrackId !== null) {
        this.triggerSongChanged();
      }
      this.lastTrackId = currentTrack.id;
      this.lastInteractionTime = Date.now();
      return;
    }

    // 2. Detect Song Finished -> excited celebration
    if (isPlaying && duration > 5 && position >= duration - 1.2) {
      this.triggerSongFinished();
      return;
    }

    // If currently displaying a temporary transient reaction, let it finish
    if (this.isTransientState) {
      return;
    }

    // 3. React to Playback state
    if (isPlaying) {
      this.lastInteractionTime = Date.now();
      const analysis = this.analyzeMusic(currentTrack);

      if (analysis.energy === 'high') {
        this.setMascotState('high_energy', 'none', 'dancing', '⚡');
      } else if (analysis.energy === 'slow') {
        this.setMascotState('slow_music', 'none', 'relaxed', '✨');
      } else {
        this.setMascotState('playing', 'none', 'happy', '🎵');
      }
    } else {
      // Paused or stopped
      if (
        this.currentState === 'playing' ||
        this.currentState === 'high_energy' ||
        this.currentState === 'slow_music'
      ) {
        this.setMascotState('paused', 'none', 'relaxed', null);
        this.setTransientTimeout(1800, () => {
          this.setMascotState('idle', 'none', 'relaxed', null);
        });
      } else if (this.currentState !== 'inactive' && this.currentState !== 'paused') {
        // Prolonged inactivity -> sleepy
        const idleDuration = Date.now() - this.lastInteractionTime;
        if (idleDuration > 35000) {
          this.setMascotState('inactive', 'sleep', 'sleepy', '💤');
        } else {
          this.setMascotState('idle', this.currentAction, 'relaxed', null);
        }
      }
    }
  }

  // --- User Interaction Trigger (Tap Pet) ---
  public handleUserTap() {
    this.lastInteractionTime = Date.now();
    this.isTransientState = true;
    this.setMascotState('happy_tap', 'bounce', 'excited', '❤️');

    this.setTransientTimeout(2200, () => {
      this.isTransientState = false;
      this.setMascotState('idle', 'none', 'happy', null);
    });
  }

  // --- Focused Action Trigger (e.g. Scrubber, EQ, DJ FX) ---
  public triggerFocused() {
    this.lastInteractionTime = Date.now();
    this.isTransientState = true;
    this.setMascotState('idle', 'none', 'focused', '🎧');

    this.setTransientTimeout(2000, () => {
      this.isTransientState = false;
      this.emitState();
    });
  }

  // --- Custom Visual Emote Reaction Trigger ---
  public triggerEmoteReaction(emotion: MascotEmotion, emote: string) {
    this.lastInteractionTime = Date.now();
    this.isTransientState = true;
    this.setMascotState('happy_tap', 'bounce', emotion, emote);

    this.setTransientTimeout(2400, () => {
      this.isTransientState = false;
      this.setMascotState('idle', 'none', 'happy', null);
    });
  }

  // --- Transient State Handlers ---
  private triggerSongChanged() {
    this.isTransientState = true;
    this.setMascotState('song_changed', 'spin', 'surprised', '❗');

    this.setTransientTimeout(2200, () => {
      this.isTransientState = false;
      this.emitState();
    });
  }

  private triggerSongFinished() {
    if (this.currentState === 'song_finished') return;

    this.isTransientState = true;
    this.setMascotState('song_finished', 'celebrate', 'excited', '✨');

    this.setTransientTimeout(2800, () => {
      this.isTransientState = false;
      this.setMascotState('idle', 'none', 'happy', null);
    });
  }

  private setMascotState(
    state: PetState,
    action: PetAutonomousAction,
    emotion: MascotEmotion,
    emoteIcon: string | null
  ) {
    this.currentState = state;
    this.currentAction = action;
    this.currentEmotion = emotion;
    this.emoteIcon = emoteIcon;
    this.emitState();
  }

  private setTransientTimeout(ms: number, onComplete: () => void) {
    if (this.transientTimer) clearTimeout(this.transientTimer);
    this.transientTimer = setTimeout(() => {
      onComplete();
    }, ms);
  }

  // --- Autonomous Micro-Behaviors ---
  private startAutonomousLoop() {
    this.autonomousLoopTimer = setInterval(() => {
      if (this.isTransientState) return;

      const now = Date.now();
      if (now - this.lastActionTime < this.actionCooldownMs) return;

      if (this.currentState === 'idle') {
        const rand = Math.random();

        if (rand < 0.35) {
          this.triggerAutonomousAction('blink', 'happy', 900);
        } else if (rand < 0.6) {
          this.triggerAutonomousAction('look_around', 'focused', 1800);
        } else if (rand < 0.8) {
          this.triggerAutonomousAction('stretch', 'relaxed', 2000);
        } else if (rand < 0.92) {
          this.triggerAutonomousAction('wave', 'happy', 1800);
        } else {
          this.triggerAutonomousAction('yawn', 'sleepy', 2000);
        }
      }
    }, 4500);
  }

  private triggerAutonomousAction(
    action: PetAutonomousAction,
    emotion: MascotEmotion,
    durationMs: number
  ) {
    this.lastActionTime = Date.now();
    this.currentAction = action;
    this.currentEmotion = emotion;
    this.emitState();

    setTimeout(() => {
      if (this.currentAction === action) {
        this.currentAction = 'none';
        this.emitState();
      }
    }, durationMs);
  }
}
