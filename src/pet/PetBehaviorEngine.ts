import { Track, PlaybackState } from '../types';
import {
  PetState,
  PetAutonomousAction,
  MusicEnergyTier,
  PetMusicAnalysis,
  PetEngineState,
} from './types';

export class PetBehaviorEngine {
  private currentState: PetState = 'idle';
  private currentAction: PetAutonomousAction = 'none';
  private speechText: string | null = null;
  private moodEmoji: string = '🎧';

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
        speechText: this.speechText,
        moodEmoji: this.moodEmoji,
        isSleeping: this.currentState === 'inactive',
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

    // Slow detection
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
    const { isPlaying, currentTrack, position, duration } = playbackState;

    // 1. Detect Track Change
    if (currentTrack && currentTrack.id !== this.lastTrackId) {
      if (this.lastTrackId !== null) {
        this.triggerSongChanged(currentTrack);
      }
      this.lastTrackId = currentTrack.id;
      this.lastInteractionTime = Date.now();
      return;
    }

    // 2. Detect Song Finished
    if (isPlaying && duration > 5 && position >= duration - 1.2) {
      this.triggerSongFinished();
      return;
    }

    // If currently playing a temporary reaction (song changed, tap, finished), wait for it to conclude
    if (this.isTransientState) {
      return;
    }

    // 3. React to Playback state
    if (isPlaying) {
      this.lastInteractionTime = Date.now();
      const analysis = this.analyzeMusic(currentTrack);

      if (analysis.energy === 'high') {
        this.setPetState('high_energy', 'none', '🔥 Vibing hard!', '🤘');
      } else if (analysis.energy === 'slow') {
        this.setPetState('slow_music', 'none', '✨ Swaying to the rhythm...', '🎵');
      } else {
        this.setPetState('playing', 'none', '🎶 Loving this groove!', '🎧');
      }
    } else {
      // Paused or stopped
      if (this.currentState === 'playing' || this.currentState === 'high_energy' || this.currentState === 'slow_music') {
        this.setPetState('paused', 'none', '⏸️ Chilling for a moment.', '💤');
        // Transition to idle after 1.5 seconds
        this.setTransientTimeout(1500, () => {
          this.setPetState('idle', 'none', null, '✨');
        });
      } else if (this.currentState !== 'inactive' && this.currentState !== 'paused') {
        // Check prolonged inactivity
        const idleDuration = Date.now() - this.lastInteractionTime;
        if (idleDuration > 45000) {
          // Inactive for > 45 seconds -> fall asleep
          this.setPetState('inactive', 'sleep', 'Zzz... Sleeping soundly', '😴');
        } else {
          this.setPetState('idle', this.currentAction, null, '✨');
        }
      }
    }
  }

  // --- User Interaction Trigger (Tap Pet) ---
  public handleUserTap() {
    this.lastInteractionTime = Date.now();

    const phrases = [
      '❤️ Yay! Music friend!',
      '✨ You have great taste!',
      '🎶 Turn up the beat!',
      '⭐ Grooving with you!',
      '🐾 Purr... so cozy!',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    this.isTransientState = true;
    this.setPetState('happy_tap', 'bounce', phrase, '💖');

    this.setTransientTimeout(2400, () => {
      this.isTransientState = false;
      this.setPetState('idle', 'none', null, '✨');
    });
  }

  // --- Transient State Handlers ---
  private triggerSongChanged(track: Track) {
    this.isTransientState = true;
    this.setPetState('song_changed', 'spin', `🎵 New track: "${track.title.slice(0, 18)}"`, '🌟');

    this.setTransientTimeout(2600, () => {
      this.isTransientState = false;
      this.emitState();
    });
  }

  private triggerSongFinished() {
    if (this.currentState === 'song_finished') return;

    this.isTransientState = true;
    this.setPetState('song_finished', 'celebrate', '🎉 What a track! Bravo!', '🎊');

    this.setTransientTimeout(3000, () => {
      this.isTransientState = false;
      this.setPetState('idle', 'none', null, '✨');
    });
  }

  private setPetState(
    state: PetState,
    action: PetAutonomousAction,
    speechText: string | null,
    moodEmoji: string
  ) {
    this.currentState = state;
    this.currentAction = action;
    this.speechText = speechText;
    this.moodEmoji = moodEmoji;
    this.emitState();
  }

  private setTransientTimeout(ms: number, onComplete: () => void) {
    if (this.transientTimer) clearTimeout(this.transientTimer);
    this.transientTimer = setTimeout(() => {
      onComplete();
    }, ms);
  }

  // --- Autonomous Random Behaviors (Cooldown & Randomized intervals) ---
  private startAutonomousLoop() {
    // Check every 4 seconds for a potential autonomous reaction
    this.autonomousLoopTimer = setInterval(() => {
      if (this.isTransientState) return;

      const now = Date.now();
      if (now - this.lastActionTime < this.actionCooldownMs) return;

      // Only perform subtle idle actions when idle or inactive
      if (this.currentState === 'idle') {
        const rand = Math.random();

        if (rand < 0.35) {
          // Blink (high frequency, subtle)
          this.triggerAutonomousAction('blink', 1200);
        } else if (rand < 0.6) {
          // Look around
          this.triggerAutonomousAction('look_around', 2000);
        } else if (rand < 0.78) {
          // Stretch
          this.triggerAutonomousAction('stretch', 2200);
        } else if (rand < 0.9) {
          // Yawn
          this.triggerAutonomousAction('yawn', 2400);
        } else {
          // Wave
          this.triggerAutonomousAction('wave', 2000);
        }
      }
    }, 4500);
  }

  private triggerAutonomousAction(action: PetAutonomousAction, durationMs: number) {
    this.lastActionTime = Date.now();
    this.currentAction = action;
    this.emitState();

    setTimeout(() => {
      if (this.currentAction === action) {
        this.currentAction = 'none';
        this.emitState();
      }
    }, durationMs);
  }
}
