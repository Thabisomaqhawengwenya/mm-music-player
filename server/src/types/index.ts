export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface SyncPlaylistItem {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

export interface SyncEqualizerSettings {
  name: string;
  bands: number[];
  bassBoost: number;
  virtualizer: number;
  updatedAt: number;
}

export interface UserLibraryData {
  userId: string;
  playlists: Record<string, SyncPlaylistItem>;
  favorites: {
    trackIds: string[];
    updatedAt: number;
  };
  metadataOverrides: Record<string, {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
    updatedAt: number;
  }>;
  eqSettings: SyncEqualizerSettings;
  lastSyncedAt: number;
}

export interface SyncPushPayload {
  lastSyncTimestamp: number;
  playlists?: SyncPlaylistItem[];
  favorites?: {
    trackIds: string[];
    updatedAt: number;
  };
  metadataOverrides?: Record<string, {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
    updatedAt: number;
  }>;
  eqSettings?: SyncEqualizerSettings;
}

export interface SyncPullResponse {
  serverTimestamp: number;
  playlists: SyncPlaylistItem[];
  favorites: {
    trackIds: string[];
    updatedAt: number;
  };
  metadataOverrides: Record<string, {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
    updatedAt: number;
  }>;
  eqSettings: SyncEqualizerSettings;
}
