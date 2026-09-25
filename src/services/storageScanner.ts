import * as MediaLibrary from 'expo-media-library/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Track } from '../types';
import { StorageService } from './playlistStorage';

// High quality offline demo audio samples for instant playback in emulator, Expo Go, or test environments
export const DEMO_TRACKS: Track[] = [
  {
    id: 'demo_1',
    uri: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    filename: 'lofi-study-112191.mp3',
    title: 'Neon Midnight Chill',
    artist: 'Antigravity Sound Lab',
    album: 'Cyber Horizon Vol. 1',
    duration: 145,
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    genre: 'Lo-Fi / Synthwave',
    year: '2026',
    folder: 'Internal / Demo Music',
    size: 3420000,
  },
  {
    id: 'demo_2',
    uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    filename: 'electronic-future-beats.mp3',
    title: 'Deep Horizon Odyssey',
    artist: 'Kowalski Modular Collective',
    album: 'Pulse Code',
    duration: 168,
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Electronic / Ambient',
    year: '2025',
    folder: 'Internal / Demo Music',
    size: 4120000,
  },
  {
    id: 'demo_3',
    uri: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    filename: 'chill-abstract-intention.mp3',
    title: 'Velvet Groove & Bassline',
    artist: 'Analog Resonators',
    album: 'Tapes & Transistors',
    duration: 124,
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Neo-Soul / Jazz',
    year: '2026',
    folder: 'Internal / Demo Music',
    size: 2980000,
  }
];

export class StorageScannerService {
  /**
   * Request media permissions on Android/iOS
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Failed to request media permissions', e);
      return false;
    }
  }

  /**
   * Scan local storage for audio files (MP3, WAV, FLAC, M4A, AAC, OGG)
   */
  static async scanLocalStorage(): Promise<{ tracks: Track[]; permissionGranted: boolean }> {
    const hasPermission = await this.requestPermissions();
    const overrides = await StorageService.getCustomMetadataOverrides();
    const favorites = await StorageService.getFavorites();
    const customUserTracks = await StorageService.getCustomTracks();

    let scannedTracks: Track[] = [];

    if (hasPermission) {
      try {
        // Query local audio assets via Android MediaStore / iOS iPod library
        let pagedInfo = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 500,
          sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
        });

        const assets = pagedInfo.assets || [];

        scannedTracks = assets.map((asset) => {
          const rawFilename = asset.filename || 'Unknown Track';
          const cleanTitle = rawFilename.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[_\s.-]*/, '');
          const folderName = asset.uri.includes('/')
            ? asset.uri.substring(0, asset.uri.lastIndexOf('/')).split('/').pop() || 'Music'
            : 'Device Storage';

          return {
            id: asset.id,
            uri: asset.uri,
            filename: rawFilename,
            title: cleanTitle,
            artist: 'Local Artist',
            album: folderName,
            duration: Math.round(asset.duration || 0),
            folder: folderName,
            artwork: undefined,
            genre: 'Local Audio',
            year: new Date(asset.creationTime || Date.now()).getFullYear().toString(),
            size: undefined,
            isFavorite: favorites.includes(asset.id),
          };
        });
      } catch (err) {
        console.warn('Error reading device audio assets:', err);
      }
    }

    // Merge custom picked tracks, scanned device tracks, and demo tracks
    const allFound = [...customUserTracks, ...scannedTracks];

    // If no tracks found locally yet, provide rich demo tracks so the user can immediately play
    const baseList = allFound.length > 0 ? allFound : DEMO_TRACKS;

    // Apply metadata overrides and favorite states
    const finalTracks = baseList.map(track => {
      const override = overrides[track.id] || {};
      return {
        ...track,
        ...override,
        isFavorite: favorites.includes(track.id),
      };
    });

    return {
      tracks: finalTracks,
      permissionGranted: hasPermission,
    };
  }

  /**
   * Pick individual audio files or documents from device storage (e.g. Downloads, SD card, WhatsApp Audio)
   */
  static async pickAudioFiles(): Promise<Track[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        multiple: true,
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      const newTracks: Track[] = result.assets.map((file) => {
        const rawFilename = file.name || 'Picked Audio Track';
        const cleanTitle = rawFilename.replace(/\.[^/.]+$/, '');

        return {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          uri: file.uri,
          filename: rawFilename,
          title: cleanTitle,
          artist: 'Imported Track',
          album: 'Imported Audio',
          duration: 0, // Will be measured on load
          folder: 'Selected Files',
          size: file.size,
          year: new Date().getFullYear().toString(),
          genre: 'Local File',
          isFavorite: false,
        };
      });

      // Save to custom user tracks
      const current = await StorageService.getCustomTracks();
      const merged = [...newTracks, ...current];
      await StorageService.saveCustomTracks(merged);

      return newTracks;
    } catch (err) {
      console.warn('Document picker error:', err);
      return [];
    }
  }
}
