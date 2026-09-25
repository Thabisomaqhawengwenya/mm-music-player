import { Router, Response } from 'express';
import { z } from 'zod';
import { Database } from '../db/storage';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { SyncPlaylistItem } from '../types';

const router = Router();
const db = Database.getInstance();

const SyncPushSchema = z.object({
  lastSyncTimestamp: z.number().nonnegative(),
  playlists: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        trackIds: z.array(z.string()),
        createdAt: z.number(),
        updatedAt: z.number(),
        isDeleted: z.boolean().optional(),
      })
    )
    .optional(),
  favorites: z
    .object({
      trackIds: z.array(z.string()),
      updatedAt: z.number(),
    })
    .optional(),
  metadataOverrides: z
    .record(
      z.object({
        title: z.string().optional(),
        artist: z.string().optional(),
        album: z.string().optional(),
        genre: z.string().optional(),
        year: z.string().optional(),
        updatedAt: z.number(),
      })
    )
    .optional(),
  eqSettings: z
    .object({
      name: z.string(),
      bands: z.array(z.number()),
      bassBoost: z.number(),
      virtualizer: z.number(),
      updatedAt: z.number(),
    })
    .optional(),
});

// POST /api/sync/push — Push offline local changes up to cloud
router.post('/push', requireAuth, apiRateLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const parsed = SyncPushSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.id;
    const library = db.getUserLibrary(userId);
    const { playlists, favorites, metadataOverrides, eqSettings } = parsed.data;

    const currentServerTime = Date.now();

    // 1. Resolve Playlists with Last-Write-Wins (LWW)
    if (playlists && playlists.length > 0) {
      playlists.forEach((incoming) => {
        const existing = library.playlists[incoming.id];
        if (!existing || incoming.updatedAt >= existing.updatedAt) {
          library.playlists[incoming.id] = {
            ...incoming,
            updatedAt: incoming.updatedAt || currentServerTime,
          };
        }
      });
    }

    // 2. Resolve Favorites with Last-Write-Wins
    if (favorites) {
      if (!library.favorites || favorites.updatedAt >= library.favorites.updatedAt) {
        library.favorites = {
          trackIds: favorites.trackIds,
          updatedAt: favorites.updatedAt || currentServerTime,
        };
      }
    }

    // 3. Resolve Metadata Overrides
    if (metadataOverrides) {
      Object.entries(metadataOverrides).forEach(([trackId, incoming]) => {
        const existing = library.metadataOverrides[trackId];
        if (!existing || incoming.updatedAt >= existing.updatedAt) {
          library.metadataOverrides[trackId] = {
            ...incoming,
            updatedAt: incoming.updatedAt || currentServerTime,
          };
        }
      });
    }

    // 4. Resolve EQ Settings
    if (eqSettings) {
      if (!library.eqSettings || eqSettings.updatedAt >= library.eqSettings.updatedAt) {
        library.eqSettings = {
          ...eqSettings,
          updatedAt: eqSettings.updatedAt || currentServerTime,
        };
      }
    }

    library.lastSyncedAt = currentServerTime;
    db.saveUserLibrary(library);

    res.json({
      success: true,
      serverTimestamp: currentServerTime,
      message: 'Offline changes synced successfully.',
    });
  } catch (err) {
    console.error('Sync push error:', err);
    res.status(500).json({ error: 'Internal server error during sync push.' });
  }
});

// GET /api/sync/pull — Pull latest changes since last local sync
router.get('/pull', requireAuth, apiRateLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;
    const library = db.getUserLibrary(userId);
    const serverTimestamp = Date.now();

    // Filter playlists updated since timestamp
    const changedPlaylists = Object.values(library.playlists).filter(
      (p) => p.updatedAt > since
    );

    // Filter metadata overrides updated since timestamp
    const changedMetadata: Record<string, any> = {};
    Object.entries(library.metadataOverrides).forEach(([trackId, meta]) => {
      if (meta.updatedAt > since) {
        changedMetadata[trackId] = meta;
      }
    });

    res.json({
      serverTimestamp,
      playlists: changedPlaylists,
      favorites: library.favorites.updatedAt > since ? library.favorites : null,
      metadataOverrides: changedMetadata,
      eqSettings: library.eqSettings && library.eqSettings.updatedAt > since ? library.eqSettings : null,
    });
  } catch (err) {
    console.error('Sync pull error:', err);
    res.status(500).json({ error: 'Internal server error during sync pull.' });
  }
});

export default router;
