import * as FileSystem from 'expo-file-system/legacy';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

export type DjSoundEffect = 'airhorn' | 'vinyl_brake' | 'tape_rewind' | 'sub_drop_808' | 'scratch_chirp';

class SoundFxService {
  private static instance: SoundFxService;
  private cachedUris: Partial<Record<DjSoundEffect, string>> = {};
  private activePlayer: AudioPlayer | null = null;

  public static getInstance(): SoundFxService {
    if (!SoundFxService.instance) {
      SoundFxService.instance = new SoundFxService();
    }
    return SoundFxService.instance;
  }

  /**
   * Generates a 16-bit Mono PCM WAV base64 string from audio sample generator function
   */
  private generateWavBase64(
    durationSec: number,
    sampleRate: number,
    sampleFn: (t: number, totalDuration: number) => number
  ): string {
    const numSamples = Math.floor(durationSec * sampleRate);
    const dataSize = numSamples * 2;
    const bufferSize = 44 + dataSize;
    const buffer = new Uint8Array(bufferSize);
    const view = new DataView(buffer.buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = sampleFn(t, durationSec);
      // Soft-clip limiter
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = Math.floor(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    // Convert Uint8Array to base64
    let binary = '';
    const len = buffer.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const slice = buffer.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, slice as unknown as number[]);
    }

    return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Pre-generates or retrieves cached offline WAV URI for the effect
   */
  private async getSfxUri(effect: DjSoundEffect): Promise<string> {
    if (this.cachedUris[effect]) {
      return this.cachedUris[effect]!;
    }

    const sampleRate = 22050;
    let base64 = '';

    switch (effect) {
      case 'airhorn': {
        // Classic DJ Dancehall Horn fanfare
        base64 = this.generateWavBase64(1.1, sampleRate, (t) => {
          // Triple rhythmic bursts at 0.0 - 0.22, 0.28 - 0.50, 0.56 - 1.05
          const inBurst =
            (t >= 0.0 && t <= 0.22) ||
            (t >= 0.28 && t <= 0.5) ||
            (t >= 0.56 && t <= 1.05);
          if (!inBurst) return 0;

          // Multi-tone fanfare: Root + Fifth + Octave (D5 587Hz + A5 880Hz + D6 1174Hz)
          const f1 = 587;
          const f2 = 880;
          const f3 = 1174;
          const osc =
            Math.sin(2 * Math.PI * f1 * t) * 0.45 +
            Math.sin(2 * Math.PI * f2 * t) * 0.35 +
            Math.sin(2 * Math.PI * f3 * t) * 0.2;

          // Distortion saturation
          return Math.tanh(osc * 1.8) * 0.85;
        });
        break;
      }

      case 'vinyl_brake': {
        // Turntable power-off motor slowdown
        base64 = this.generateWavBase64(1.4, sampleRate, (t, dur) => {
          const progress = t / dur;
          // Exponential pitch drop from 600Hz down to 25Hz
          const freq = 600 * Math.pow(1 - progress, 2.5) + 20;
          const env = Math.pow(1 - progress, 1.2);
          const tone = Math.sin(2 * Math.PI * freq * t);
          // Add turntable vinyl surface grit/friction
          const noise = (Math.random() * 2 - 1) * 0.08 * (1 - progress);
          return (tone * 0.8 + noise) * env;
        });
        break;
      }

      case 'tape_rewind': {
        // High-speed motorized tape spool rewind
        base64 = this.generateWavBase64(0.85, sampleRate, (t, dur) => {
          const progress = t / dur;
          // Fast upward pitch slide with tape flutter
          const freq = 180 + 1400 * Math.pow(progress, 1.8) + Math.sin(t * 80) * 40;
          const env = progress < 0.1 ? progress * 10 : Math.pow(1 - (progress - 0.1) / 0.9, 0.6);
          const tone = Math.sin(2 * Math.PI * freq * t);
          const chirps = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3;
          return (tone + chirps) * 0.6 * env;
        });
        break;
      }

      case 'sub_drop_808': {
        // Deep hip-hop 808 sub bass drop
        base64 = this.generateWavBase64(1.5, sampleRate, (t, dur) => {
          const progress = t / dur;
          // Sweep from 110Hz down to 34Hz
          const freq = 110 * Math.exp(-progress * 2.8) + 34;
          const env = Math.exp(-progress * 2.2);
          const wave = Math.sin(2 * Math.PI * freq * t);
          // Add subtle second harmonic for small speaker audibility
          const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.25;
          return (wave + harmonic) * env * 0.95;
        });
        break;
      }

      case 'scratch_chirp': {
        // Turntable needle forward-backward chirp scratch
        base64 = this.generateWavBase64(0.45, sampleRate, (t, dur) => {
          const progress = t / dur;
          // Bidirectional pitch sweep: up then down
          const sweep = Math.sin(progress * Math.PI);
          const freq = 200 + 1100 * sweep;
          const tone = Math.sin(2 * Math.PI * freq * t);
          const scratchNoise = (Math.random() * 2 - 1) * 0.18;
          const env = Math.sin(progress * Math.PI);
          return (tone * 0.75 + scratchNoise) * env;
        });
        break;
      }
    }

    const dir = FileSystem.cacheDirectory || '';
    const fileUri = `${dir}mm_sfx_${effect}.wav`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      this.cachedUris[effect] = fileUri;
      return fileUri;
    } catch (e) {
      console.warn('Failed to write sfx wav to cache, fallback:', e);
      return `data:audio/wav;base64,${base64}`;
    }
  }

  /**
   * Plays the designated DJ Sound Effect immediately with 0 latency
   */
  public async playSoundEffect(effect: DjSoundEffect, volume: number = 0.9): Promise<void> {
    try {
      const uri = await this.getSfxUri(effect);
      const player = createAudioPlayer(uri);
      player.volume = Math.max(0, Math.min(1, volume));
      player.play();
      this.activePlayer = player;
    } catch (err) {
      console.warn('Could not play sound effect:', err);
    }
  }
}

export const soundFxService = SoundFxService.getInstance();
