import {
  createAudioPlayer,
  AudioModule,
  AudioPlayer,
  AudioStatus,
} from 'expo-audio';
import { Track, PlaybackState, RepeatMode } from '../types';

type PlaybackListener = (state: PlaybackState) => void;

export class AudioPlayerService {
  private static instance: AudioPlayerService;
  private player: AudioPlayer | null = null;
  private listeners: Set<PlaybackListener> = new Set();

  private queue: Track[] = [];
  private currentIndex: number = -1;
  private originalQueue: Track[] = [];

  private state: PlaybackState = {
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    playbackSpeed: 1.0,
    isBuffering: false,
    repeatMode: 'all',
    isShuffled: false,
    volume: 1.0,
  };

  private sleepTimerId: ReturnType<typeof setTimeout> | null = null;
  private sleepTimerExpiresAt: number | null = null;
  private pausedDueToZeroVolume: boolean = false;

  private constructor() {
    this.initAudioMode();
  }

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  private async initAudioMode() {
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
        allowsRecording: false,
      });
    } catch (e) {
      console.warn('Error setting audio mode:', e);
    }
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public getState(): PlaybackState {
    return { ...this.state };
  }

  public getQueue(): Track[] {
    return [...this.queue];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public updateTrackFavorite(trackId: string, isFavorite: boolean) {
    if (this.state.currentTrack && this.state.currentTrack.id === trackId) {
      this.state.currentTrack = { ...this.state.currentTrack, isFavorite };
    }
    this.queue = this.queue.map((t) => (t.id === trackId ? { ...t, isFavorite } : t));
    this.originalQueue = this.originalQueue.map((t) => (t.id === trackId ? { ...t, isFavorite } : t));
    this.notify();
  }

  public setQueue(tracks: Track[], startIndex: number = 0) {
    this.originalQueue = [...tracks];
    if (this.state.isShuffled) {
      const current = tracks[startIndex];
      const rest = tracks.filter((_, i) => i !== startIndex);
      const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
      this.queue = current ? [current, ...shuffledRest] : shuffledRest;
      this.currentIndex = 0;
    } else {
      this.queue = [...tracks];
      this.currentIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    }
  }

  public async playTrack(track: Track, queueContext?: Track[]) {
    if (queueContext && queueContext.length > 0) {
      const idx = queueContext.findIndex((t) => t.id === track.id);
      this.setQueue(queueContext, idx >= 0 ? idx : 0);
    } else if (!this.queue.some((t) => t.id === track.id)) {
      this.queue.unshift(track);
      this.currentIndex = 0;
    } else {
      this.currentIndex = this.queue.findIndex((t) => t.id === track.id);
    }

    await this.loadAndPlayCurrent();
  }

  public async playAtIndex(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.currentIndex = index;
    await this.loadAndPlayCurrent();
  }

  private async loadAndPlayCurrent() {
    if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) return;

    const track = this.queue[this.currentIndex];

    try {
      if (this.player) {
        this.player.pause();
        this.player.remove();
        this.player = null;
      }

      this.state.currentTrack = track;
      this.state.position = 0;
      this.state.duration = track.duration || 0;
      this.state.isBuffering = true;
      this.notify();

      const newPlayer = createAudioPlayer(track.uri, {
        updateInterval: 500,
      });

      newPlayer.playbackRate = this.state.playbackSpeed;
      newPlayer.volume = this.state.volume;
      newPlayer.loop = this.state.repeatMode === 'one';

      try {
        newPlayer.setActiveForLockScreen(true, {
          title: track.title,
          artist: track.artist,
          albumTitle: track.album,
          artworkUrl: track.artwork,
        });
      } catch (lockErr) {
        // Lock screen controls optional fallback
      }

      (newPlayer as any).addListener('playbackStatusUpdate', (status: AudioStatus) => {
        this.onPlaybackStatusUpdate(status);
      });

      this.player = newPlayer;
      if (this.state.volume === 0) {
        this.pausedDueToZeroVolume = true;
        this.state.isPlaying = false;
        this.notify();
      } else {
        newPlayer.play();
      }
    } catch (error) {
      console.warn('Failed to load track audio:', error);
      this.state.isPlaying = false;
      this.state.isBuffering = false;
      this.notify();
    }
  }

  private onPlaybackStatusUpdate = (status: AudioStatus) => {
    this.state.isPlaying = status.playing;
    this.state.isBuffering = status.isBuffering;
    this.state.position = Math.floor(status.currentTime);
    if (status.duration > 0) {
      this.state.duration = Math.floor(status.duration);
    }

    if (status.didJustFinish && !status.loop) {
      this.handleTrackFinished();
    }

    this.notify();
  };

  private async handleTrackFinished() {
    if (this.state.repeatMode === 'one') {
      await this.seekTo(0);
      await this.resume();
      return;
    }

    if (this.currentIndex < this.queue.length - 1) {
      await this.next();
    } else if (this.state.repeatMode === 'all') {
      this.currentIndex = 0;
      await this.loadAndPlayCurrent();
    } else {
      this.state.isPlaying = false;
      this.state.position = 0;
      this.notify();
    }
  }

  public async togglePlayPause() {
    if (!this.player) {
      if (this.state.currentTrack) {
        await this.loadAndPlayCurrent();
      } else if (this.queue.length > 0) {
        this.currentIndex = 0;
        await this.loadAndPlayCurrent();
      }
      return;
    }

    this.pausedDueToZeroVolume = false;
    if (this.state.isPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  public async resume() {
    this.pausedDueToZeroVolume = false;
    if (this.player) {
      this.player.play();
    }
  }

  public async pause() {
    this.pausedDueToZeroVolume = false;
    if (this.player) {
      this.player.pause();
    }
  }

  public async seekTo(seconds: number) {
    if (this.player) {
      const targetSec = Math.max(0, seconds);
      await this.player.seekTo(targetSec);
      this.state.position = Math.floor(targetSec);
      this.notify();
    }
  }

  public async next() {
    if (this.queue.length === 0) return;
    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex += 1;
      await this.loadAndPlayCurrent();
    } else if (this.state.repeatMode === 'all') {
      this.currentIndex = 0;
      await this.loadAndPlayCurrent();
    }
  }

  public async previous() {
    if (this.queue.length === 0) return;
    if (this.state.position > 3) {
      await this.seekTo(0);
      return;
    }

    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      await this.loadAndPlayCurrent();
    } else if (this.state.repeatMode === 'all') {
      this.currentIndex = this.queue.length - 1;
      await this.loadAndPlayCurrent();
    }
  }

  public setPlaybackSpeed(speed: number) {
    this.state.playbackSpeed = speed;
    if (this.player) {
      this.player.playbackRate = speed;
    }
    this.notify();
  }

  public toggleRepeatMode() {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(this.state.repeatMode) + 1) % modes.length;
    this.state.repeatMode = modes[nextIdx];
    if (this.player) {
      this.player.loop = this.state.repeatMode === 'one';
    }
    this.notify();
  }

  public toggleShuffle() {
    const shouldShuffle = !this.state.isShuffled;
    this.state.isShuffled = shouldShuffle;

    if (shouldShuffle) {
      const currentTrack = this.queue[this.currentIndex];
      const rest = this.queue.filter((_, i) => i !== this.currentIndex);
      const shuffled = [...rest].sort(() => Math.random() - 0.5);
      this.queue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
      this.currentIndex = 0;
    } else {
      const currentTrack = this.queue[this.currentIndex];
      this.queue = [...this.originalQueue];
      this.currentIndex = this.queue.findIndex((t) => t.id === currentTrack?.id);
      if (this.currentIndex === -1) this.currentIndex = 0;
    }

    this.notify();
  }

  public addToQueue(track: Track) {
    this.queue.push(track);
    this.originalQueue.push(track);
    this.notify();
  }

  public playNext(track: Track) {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      this.queue.splice(this.currentIndex + 1, 0, track);
      this.originalQueue.push(track);
    } else {
      this.addToQueue(track);
    }
    this.notify();
  }

  public removeFromQueue(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
    if (index < this.currentIndex) {
      this.currentIndex -= 1;
    }
    this.notify();
  }

  public moveQueueItem(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const currentTrack = this.queue[this.currentIndex];
    const [moved] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, moved);
    if (currentTrack) {
      this.currentIndex = this.queue.findIndex(t => t.id === currentTrack.id);
    }
    this.notify();
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.state.volume = clamped;
    if (this.player) {
      this.player.volume = clamped;
    }

    if (clamped === 0) {
      // If volume is reduced all the way to 0, automatically pause currently playing song
      if (this.state.isPlaying) {
        this.pausedDueToZeroVolume = true;
        this.state.isPlaying = false;
        if (this.player) {
          this.player.pause();
        }
      }
    } else {
      // When user increases volume above 0, automatically resume from where it was paused
      if (this.pausedDueToZeroVolume && !this.state.isPlaying) {
        this.pausedDueToZeroVolume = false;
        this.state.isPlaying = true;
        if (this.player) {
          this.player.play();
        }
      }
    }

    this.notify();
  }

  // --- Sleep Timer ---
  public setSleepTimer(minutes: number | null) {
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
      this.sleepTimerExpiresAt = null;
    }

    if (minutes !== null && minutes > 0) {
      this.sleepTimerExpiresAt = Date.now() + minutes * 60 * 1000;
      this.sleepTimerId = setTimeout(async () => {
        await this.pause();
        this.sleepTimerExpiresAt = null;
        this.sleepTimerId = null;
        this.notify();
      }, minutes * 60 * 1000);
    }

    this.notify();
  }

  public getSleepTimerRemaining(): number | null {
    if (!this.sleepTimerExpiresAt) return null;
    const remainingMs = this.sleepTimerExpiresAt - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : null;
  }
}
