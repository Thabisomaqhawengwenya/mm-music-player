import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './playlistStorage';
import { Playlist, EqualizerPreset, Track } from '../types';

const SYNC_KEYS = {
  TOKEN: '@mm_auth_token',
  USER: '@mm_auth_user',
  SERVER_URL: '@mm_sync_server_url',
  LAST_SYNC_TIME: '@mm_last_sync_time',
};

// Default server url (Android emulator maps 10.0.2.2 to host machine, localhost for web/iOS)
export const DEFAULT_SERVER_URL = 'http://10.0.2.2:4000';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export class SyncClientService {
  static async getServerUrl(): Promise<string> {
    const saved = await AsyncStorage.getItem(SYNC_KEYS.SERVER_URL);
    return saved || DEFAULT_SERVER_URL;
  }

  static async setServerUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(SYNC_KEYS.SERVER_URL, url.trim().replace(/\/+$/, ''));
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(SYNC_KEYS.TOKEN);
  }

  static async getAuthUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(SYNC_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  }

  static async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const serverUrl = await this.getServerUrl();
      const res = await fetch(`${serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      await AsyncStorage.setItem(SYNC_KEYS.TOKEN, data.token);
      await AsyncStorage.setItem(SYNC_KEYS.USER, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Could not connect to backend server. Make sure server is running.' };
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const serverUrl = await this.getServerUrl();
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      await AsyncStorage.setItem(SYNC_KEYS.TOKEN, data.token);
      await AsyncStorage.setItem(SYNC_KEYS.USER, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error or server unreachable.' };
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_KEYS.TOKEN);
    await AsyncStorage.removeItem(SYNC_KEYS.USER);
  }

  /**
   * Bidirectional delta sync: Pushes offline changes and pulls server updates
   */
  static async syncNow(): Promise<{ success: boolean; offline?: boolean; message?: string }> {
    const token = await this.getToken();
    if (!token) {
      return { success: false, message: 'Please sign in to sync with cloud.' };
    }

    try {
      const serverUrl = await this.getServerUrl();
      const lastSyncRaw = await AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC_TIME);
      const lastSyncTimestamp = lastSyncRaw ? parseInt(lastSyncRaw, 10) : 0;

      // 1. Gather local offline data
      const localPlaylists = await StorageService.getPlaylists();
      const localFavorites = await StorageService.getFavorites();
      const localOverrides = await StorageService.getCustomMetadataOverrides();
      const localEq = await StorageService.getEqSettings();

      const pushPayload = {
        lastSyncTimestamp,
        playlists: localPlaylists.map(p => ({
          ...p,
          updatedAt: p.createdAt || Date.now(),
        })),
        favorites: {
          trackIds: localFavorites,
          updatedAt: Date.now(),
        },
        metadataOverrides: Object.entries(localOverrides).reduce((acc, [k, v]) => {
          acc[k] = { ...v, updatedAt: Date.now() };
          return acc;
        }, {} as any),
        eqSettings: {
          ...localEq,
          updatedAt: Date.now(),
        },
      };

      // 2. Push local changes
      const pushRes = await fetch(`${serverUrl}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pushPayload),
      });

      if (!pushRes.ok) {
        const errData = await pushRes.json();
        return { success: false, message: errData.error || 'Sync push failed.' };
      }

      // 3. Pull latest changes
      const pullRes = await fetch(`${serverUrl}/api/sync/pull?since=${lastSyncTimestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (pullRes.ok) {
        const pullData = await pullRes.json();

        // Merge incoming server playlists
        if (pullData.playlists && pullData.playlists.length > 0) {
          const merged = [...localPlaylists];
          pullData.playlists.forEach((incoming: any) => {
            const idx = merged.findIndex(p => p.id === incoming.id);
            if (idx >= 0) {
              merged[idx] = incoming;
            } else {
              merged.push(incoming);
            }
          });
          await StorageService.savePlaylists(merged);
        }

        // Merge favorites
        if (pullData.favorites && pullData.favorites.trackIds) {
          await AsyncStorage.setItem('@mm_music_favorites', JSON.stringify(pullData.favorites.trackIds));
        }

        // Merge EQ settings
        if (pullData.eqSettings) {
          await StorageService.saveEqSettings(pullData.eqSettings);
        }

        await AsyncStorage.setItem(SYNC_KEYS.LAST_SYNC_TIME, pullData.serverTimestamp.toString());
      }

      return { success: true, message: 'Offline music library synchronized successfully.' };
    } catch (e) {
      // Offline fallback: graceful failure, never block audio playback
      return { success: false, offline: true, message: 'Running in offline mode. Changes saved locally.' };
    }
  }

  /**
   * Export full cloud backup
   */
  static async exportCloudBackup(): Promise<any> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated.');

    const serverUrl = await this.getServerUrl();
    const res = await fetch(`${serverUrl}/api/backup/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to export backup.');
    return res.json();
  }
}
