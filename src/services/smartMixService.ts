import { Track, ListeningStats } from '../types';

export interface SmartDailyMix {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  tracks: Track[];
}

/**
 * Offline algorithmic mix engine (Daily Mix) inspired by PixelPlayer.
 * Computes personalized playlists based on offline listening stats and local tags.
 */
export class SmartMixService {
  /**
   * Generates dynamic daily mixes from the offline library and listening history.
   */
  static generateDailyMixes(allTracks: Track[], stats?: ListeningStats): SmartDailyMix[] {
    if (allTracks.length === 0) return [];

    const mixes: SmartDailyMix[] = [];

    // 1. Daily Mix 1: Heavy Rotation / Most Loved
    const statEntries = Object.values(stats?.trackPlays || {});
    const sortedByPlays = [...statEntries].sort((a, b) => b.playCount - a.playCount);
    const heavyRotationTrackIds = new Set(sortedByPlays.slice(0, 25).map((s) => s.trackId));

    const heavyRotationTracks = allTracks.filter(
      (t) => heavyRotationTrackIds.has(t.id) || t.isFavorite
    );

    mixes.push({
      id: 'daily_mix_heavy',
      title: 'Daily Mix 1: Heavy Rotation',
      subtitle: 'Your most played and favorite tracks on repeat',
      icon: 'sparkles',
      color: '#A8C7FA',
      tracks: heavyRotationTracks.length > 0 ? heavyRotationTracks.slice(0, 30) : allTracks.slice(0, 20),
    });

    // 2. Daily Mix 2: Forgotten Gems / Discovery
    const playedTrackIds = new Set(statEntries.map((s) => s.trackId));
    const unplayedTracks = allTracks.filter((t) => !playedTrackIds.has(t.id));
    const forgottenTracks = unplayedTracks.length >= 5 ? unplayedTracks : allTracks.slice().reverse();

    mixes.push({
      id: 'daily_mix_rediscover',
      title: 'Daily Mix 2: Forgotten Gems',
      subtitle: 'Rediscover tracks in your library waiting for a listen',
      icon: 'time-outline',
      color: '#87D7A0',
      tracks: forgottenTracks.slice(0, 25),
    });

    // 3. Daily Mix 3: High-Res Studio Master
    const losslessTracks = allTracks.filter((t) => {
      const name = (t.filename || t.uri || '').toLowerCase();
      return name.endsWith('.flac') || name.endsWith('.wav') || name.endsWith('.alac');
    });

    if (losslessTracks.length >= 3) {
      mixes.push({
        id: 'daily_mix_hires',
        title: 'Studio Master Mix',
        subtitle: `${losslessTracks.length} lossless FLAC & WAV audiophile tracks`,
        icon: 'hardware-chip-outline',
        color: '#D0BCFF',
        tracks: losslessTracks.slice(0, 30),
      });
    }

    // 4. Daily Mix 4: Upbeat & High Energy
    const upbeatGenres = ['dance', 'electronic', 'rock', 'pop', 'hip hop', 'rap', 'amapiano', 'house'];
    const upbeatTracks = allTracks.filter((t) => {
      const g = (t.genre || '').toLowerCase();
      return upbeatGenres.some((up) => g.includes(up));
    });

    if (upbeatTracks.length >= 4) {
      mixes.push({
        id: 'daily_mix_upbeat',
        title: 'Daily Mix 3: Workout & Energy',
        subtitle: 'Uptempo beats and driving rhythms',
        icon: 'flash-outline',
        color: '#FFB5A0',
        tracks: upbeatTracks.slice(0, 25),
      });
    }

    // 5. Daily Mix 5: Acoustic & Night Chill
    const chillGenres = ['acoustic', 'ambient', 'chill', 'lo-fi', 'classical', 'jazz', 'r&b', 'soul'];
    const chillTracks = allTracks.filter((t) => {
      const g = (t.genre || '').toLowerCase();
      return chillGenres.some((ch) => g.includes(ch));
    });

    if (chillTracks.length >= 4) {
      mixes.push({
        id: 'daily_mix_chill',
        title: 'Daily Mix 4: Evening Chill',
        subtitle: 'Gentle melodies for relaxing and unwinding',
        icon: 'moon-outline',
        color: '#93C5FD',
        tracks: chillTracks.slice(0, 25),
      });
    }

    return mixes;
  }

  /**
   * Smart Multi-Artist Parser inspired by PixelPlayer.
   * Splits tracks by configurable artist delimiters (;, ,, &, feat., ft., vs.).
   */
  static parseArtists(artistString: string, delimiters: string[] = [',', ';', '&', 'feat.', 'ft.', 'vs.', '/']): string[] {
    if (!artistString || !artistString.trim()) return ['Unknown Artist'];

    let parts = [artistString.trim()];
    delimiters.forEach((delim) => {
      const nextParts: string[] = [];
      parts.forEach((p) => {
        p.split(new RegExp(`\\s*${delim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i')).forEach((sub) => {
          const cleaned = sub.trim();
          if (cleaned.length > 0) nextParts.push(cleaned);
        });
      });
      parts = nextParts;
    });

    return parts.length > 0 ? parts : [artistString.trim()];
  }
}
