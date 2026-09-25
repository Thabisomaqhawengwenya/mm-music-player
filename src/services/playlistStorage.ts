import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Playlist,
  Track,
  EqualizerPreset,
  HeadsetSettings,
  NotificationSettings,
  LockscreenSettings,
  AdvancedSettings,
  WidgetSettings,
} from '../types';

const STORAGE_KEYS = {
  PLAYLISTS: '@mm_music_playlists',
  FAVORITES: '@mm_music_favorites',
  THEME_ID: '@mm_music_theme_id',
  EQ_SETTINGS: '@mm_music_eq_settings',
  METADATA_OVERRIDES: '@mm_music_metadata_overrides',
  RECENTLY_PLAYED: '@mm_music_recently_played',
  CUSTOM_TRACKS: '@mm_music_custom_tracks',
  AUDIO_SETTINGS: '@mm_music_audio_settings',
  LANGUAGE: '@mm_music_language',
  HEADSET_SETTINGS: '@mm_music_headset_settings',
  NOTIFICATION_SETTINGS: '@mm_music_notification_settings',
  LOCKSCREEN_SETTINGS: '@mm_music_lockscreen_settings',
  ADVANCED_SETTINGS: '@mm_music_advanced_settings',
  WIDGET_SETTINGS: '@mm_music_widget_settings',
};

export const defaultAudioSettings = {
  crossfadeDuration: 3,
  minDurationSeconds: 30, // ignore notifications/voice notes under 30s
  excludeFolders: ['WhatsApp Audio', 'Notifications', 'Ringtones'],
  gaplessPlayback: true,
  normalizeVolume: false,
};

export const defaultHeadsetSettings: HeadsetSettings = {
  pauseOnUnplug: true,
  resumeOnBluetooth: true,
  duckAudioOnNotification: true,
  headsetButtonActions: true,
};

export const defaultNotificationSettings: NotificationSettings = {
  showArtwork: true,
  compactStyle: false,
  showSeekButtons: true,
};

export const defaultLockscreenSettings: LockscreenSettings = {
  enableLockscreenPlayer: true,
  showFullScreenArtwork: true,
  swipeToSkip: true,
};

export const defaultAdvancedSettings: AdvancedSettings = {
  bufferSize: 'normal',
  autoRescanOnLaunch: true,
  cacheWaveforms: true,
  logLevel: 'error',
};

export const defaultWidgetSettings: WidgetSettings = {
  style: 'standard',
  transparentBg: true,
  showArtwork: true,
};

export const defaultEqPreset: EqualizerPreset = {
  name: 'Balanced Clean',
  bands: [2, 1, 0, 1, 3], // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  bassBoost: 20,
  virtualizer: 15,
};

export const EQ_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0], bassBoost: 0, virtualizer: 0 },
  { name: 'Bass Boost', bands: [6, 4, 1, 0, -1], bassBoost: 75, virtualizer: 20 },
  { name: 'Vocal Clarity', bands: [-2, 1, 5, 4, 1], bassBoost: 10, virtualizer: 30 },
  { name: 'Electronic', bands: [5, 3, -1, 2, 5], bassBoost: 50, virtualizer: 40 },
  { name: 'Rock Punch', bands: [4, 2, -2, 3, 4], bassBoost: 40, virtualizer: 25 },
  { name: 'Acoustic / Warm', bands: [3, 2, 1, 2, 2], bassBoost: 15, virtualizer: 10 },
];

export class StorageService {
  static async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists', e);
    }
  }

  static async createPlaylist(name: string, initialTrackIds: string[] = []): Promise<Playlist> {
    const playlists = await this.getPlaylists();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Playlist',
      trackIds: initialTrackIds,
      createdAt: Date.now(),
    };
    playlists.push(newPlaylist);
    await this.savePlaylists(playlists);
    return newPlaylist;
  }

  static async renamePlaylist(playlistId: string, newName: string): Promise<boolean> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    playlist.name = newName.trim() || 'Untitled Playlist';
    await this.savePlaylists(playlists);
    return true;
  }

  static async reorderPlaylistTracks(playlistId: string, trackIds: string[]): Promise<boolean> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    playlist.trackIds = trackIds;
    await this.savePlaylists(playlists);
    return true;
  }

  static async addTrackToPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      await this.savePlaylists(playlists);
    }
    return true;
  }

  static async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
    await this.savePlaylists(playlists);
    return true;
  }

  static async deletePlaylist(playlistId: string): Promise<void> {
    const playlists = await this.getPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    await this.savePlaylists(filtered);
  }

  static async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async toggleFavorite(trackId: string): Promise<boolean> {
    const favs = await this.getFavorites();
    const exists = favs.includes(trackId);
    const updated = exists ? favs.filter(id => id !== trackId) : [...favs, trackId];
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return !exists;
  }

  static async getCustomMetadataOverrides(): Promise<Record<string, Partial<Track>>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.METADATA_OVERRIDES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static async saveTrackMetadataOverride(trackId: string, metadata: Partial<Track>): Promise<void> {
    try {
      const all = await this.getCustomMetadataOverrides();
      all[trackId] = { ...(all[trackId] || {}), ...metadata };
      await AsyncStorage.setItem(STORAGE_KEYS.METADATA_OVERRIDES, JSON.stringify(all));
    } catch (e) {
      console.warn('Failed to save metadata override', e);
    }
  }

  static async getCustomTracks(): Promise<Track[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_TRACKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async saveCustomTracks(tracks: Track[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_TRACKS, JSON.stringify(tracks));
    } catch (e) {
      console.warn('Failed to save custom tracks', e);
    }
  }

  static async getEqSettings(): Promise<EqualizerPreset> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EQ_SETTINGS);
      return data ? JSON.parse(data) : defaultEqPreset;
    } catch {
      return defaultEqPreset;
    }
  }

  static async saveEqSettings(settings: EqualizerPreset): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EQ_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save EQ settings', e);
    }
  }

  static async getThemeId(): Promise<string> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME_ID);
      return data || 'oled';
    } catch {
      return 'oled';
    }
  }

  static async saveThemeId(themeId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
    } catch (e) {
      console.warn('Failed to save theme id', e);
    }
  }

  static async getAudioSettings(): Promise<typeof defaultAudioSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
      return data ? { ...defaultAudioSettings, ...JSON.parse(data) } : defaultAudioSettings;
    } catch {
      return defaultAudioSettings;
    }
  }

  static async saveAudioSettings(settings: Partial<typeof defaultAudioSettings>): Promise<void> {
    try {
      const current = await this.getAudioSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
  }

  static async getRecentlyPlayed(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async addRecentlyPlayed(trackId: string): Promise<void> {
    try {
      const list = await this.getRecentlyPlayed();
      const filtered = list.filter(id => id !== trackId);
      const updated = [trackId, ...filtered].slice(0, 50); // Keep last 50
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recently played', e);
    }
  }

  // --- Language ---
  static async getLanguage(): Promise<string> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return lang || 'en';
    } catch {
      return 'en';
    }
  }

  static async saveLanguage(lang: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  }

  // --- Headset, Bluetooth & Speakers ---
  static async getHeadsetSettings(): Promise<HeadsetSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HEADSET_SETTINGS);
      return data ? { ...defaultHeadsetSettings, ...JSON.parse(data) } : defaultHeadsetSettings;
    } catch {
      return defaultHeadsetSettings;
    }
  }

  static async saveHeadsetSettings(settings: Partial<HeadsetSettings>): Promise<void> {
    try {
      const current = await this.getHeadsetSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.HEADSET_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save headset settings', e);
    }
  }

  // --- Notifications ---
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return data ? { ...defaultNotificationSettings, ...JSON.parse(data) } : defaultNotificationSettings;
    } catch {
      return defaultNotificationSettings;
    }
  }

  static async saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getNotificationSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save notification settings', e);
    }
  }

  // --- MM Lockscreen ---
  static async getLockscreenSettings(): Promise<LockscreenSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCKSCREEN_SETTINGS);
      return data ? { ...defaultLockscreenSettings, ...JSON.parse(data) } : defaultLockscreenSettings;
    } catch {
      return defaultLockscreenSettings;
    }
  }

  static async saveLockscreenSettings(settings: Partial<LockscreenSettings>): Promise<void> {
    try {
      const current = await this.getLockscreenSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.LOCKSCREEN_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save lockscreen settings', e);
    }
  }

  // --- Advanced Settings ---
  static async getAdvancedSettings(): Promise<AdvancedSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVANCED_SETTINGS);
      return data ? { ...defaultAdvancedSettings, ...JSON.parse(data) } : defaultAdvancedSettings;
    } catch {
      return defaultAdvancedSettings;
    }
  }

  static async saveAdvancedSettings(settings: Partial<AdvancedSettings>): Promise<void> {
    try {
      const current = await this.getAdvancedSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.ADVANCED_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save advanced settings', e);
    }
  }

  // --- Widgets ---
  static async getWidgetSettings(): Promise<WidgetSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_SETTINGS);
      return data ? { ...defaultWidgetSettings, ...JSON.parse(data) } : defaultWidgetSettings;
    } catch {
      return defaultWidgetSettings;
    }
  }

  static async saveWidgetSettings(settings: Partial<WidgetSettings>): Promise<void> {
    try {
      const current = await this.getWidgetSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.WIDGET_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save widget settings', e);
    }
  }

  // --- Backup & Restore ---
  static async exportBackupData(): Promise<string> {
    const playlists = await this.getPlaylists();
    const favorites = await this.getFavorites();
    const themeId = await this.getThemeId();
    const audioSettings = await this.getAudioSettings();
    const headsetSettings = await this.getHeadsetSettings();
    const lockscreenSettings = await this.getLockscreenSettings();
    const advancedSettings = await this.getAdvancedSettings();

    const backup = {
      app: 'MM Music Player',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      playlists,
      favorites,
      themeId,
      audioSettings,
      headsetSettings,
      lockscreenSettings,
      advancedSettings,
    };
    return JSON.stringify(backup, null, 2);
  }

  static async importBackupData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || typeof backup !== 'object') {
        return { success: false, message: 'Invalid JSON backup format' };
      }
      if (backup.playlists && Array.isArray(backup.playlists)) {
        await this.savePlaylists(backup.playlists);
      }
      if (backup.favorites && Array.isArray(backup.favorites)) {
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(backup.favorites));
      }
      if (backup.themeId) {
        await this.saveThemeId(backup.themeId);
      }
      if (backup.audioSettings) {
        await this.saveAudioSettings(backup.audioSettings);
      }
      if (backup.headsetSettings) {
        await this.saveHeadsetSettings(backup.headsetSettings);
      }
      if (backup.lockscreenSettings) {
        await this.saveLockscreenSettings(backup.lockscreenSettings);
      }
      if (backup.advancedSettings) {
        await this.saveAdvancedSettings(backup.advancedSettings);
      }
      return { success: true, message: 'Backup successfully restored!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Corrupted backup file' };
    }
  }

  static async resetAllSettings(): Promise<void> {
    await this.saveAudioSettings(defaultAudioSettings);
    await this.saveHeadsetSettings(defaultHeadsetSettings);
    await this.saveNotificationSettings(defaultNotificationSettings);
    await this.saveLockscreenSettings(defaultLockscreenSettings);
    await this.saveAdvancedSettings(defaultAdvancedSettings);
    await this.saveWidgetSettings(defaultWidgetSettings);
  }
}
